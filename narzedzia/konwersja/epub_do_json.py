#!/usr/bin/env python3
"""Konwersja publikacji EPUB do danych aplikacji: tresc.json, stopka.json i grafiki.

Zasady (dokumentacja/KONWERSJA.md, dokumentacja/LICENCJA_I_ZGODA.md):
- tekst przenoszony 1:1 — jedyna normalizacja to zwinięcie białych znaków ASCII, tak jak robi to HTML;
  twarde spacje, cudzysłowy, półpauzy, wielokropki i literówki oryginału zostają bez zmian,
- grafiki kopiowane bajt w bajt (bez żadnej obróbki),
- wynik deterministyczny: ten sam plik źródłowy daje identyczne pliki wynikowe,
- każdy przypadek niepasujący do reguł przerywa konwersję błędem (bez zgadywania),
- tylko biblioteka standardowa Pythona.

Użycie (z katalogu głównego repozytorium):
    python3 narzedzia/konwersja/epub_do_json.py narzedzia/konwersja/konfiguracja_vae-victis.json
    python3 narzedzia/konwersja/epub_do_json.py <konfiguracja> --wyjscie <katalog>
"""

import argparse
import hashlib
import json
import posixpath
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

GENERATOR_SCRIPT = "narzedzia/konwersja/epub_do_json.py"
GENERATOR_VERSION = "1.1.0"
REPO_ROOT = Path(__file__).resolve().parents[2]

ASCII_WS = re.compile(r"[ \t\n\r\f]+")
BLOCK_TAGS = {"p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"}
LIST_TAGS = {"ol", "ul"}
VOID_TAGS = {"img", "image", "br", "hr", "meta", "link", "input", "col", "area", "source"}
EXTERNAL_PREFIXES = ("http://", "https://", "mailto:")
OPF_NS = "{http://www.idpf.org/2007/opf}"
CONTAINER_NS = "{urn:oasis:names:tc:opendocument:xmlns:container}"


class ConversionError(Exception):
    """Przypadek, którego konwerter nie potrafi jednoznacznie obsłużyć."""


# ---------------------------------------------------------------------------
# Odczyt paczki EPUB
# ---------------------------------------------------------------------------

def find_opf(zf):
    root = ET.fromstring(zf.read("META-INF/container.xml"))
    rootfile = root.find(f".//{CONTAINER_NS}rootfile")
    if rootfile is None:
        raise ConversionError("Brak <rootfile> w META-INF/container.xml")
    return rootfile.get("full-path")


def read_package(zf, opf_path):
    """Zwraca (lista dokumentów spine, lista arkuszy CSS) — ścieżki względem korzenia paczki."""
    root = ET.fromstring(zf.read(opf_path))
    base = posixpath.dirname(opf_path)
    manifest = {}
    css_files = []
    for item in root.iter(f"{OPF_NS}item"):
        href = posixpath.normpath(posixpath.join(base, item.get("href")))
        manifest[item.get("id")] = href
        if item.get("media-type") == "text/css":
            css_files.append(href)
    spine = [manifest[ref.get("idref")] for ref in root.iter(f"{OPF_NS}itemref")]
    return spine, sorted(css_files)


def parse_css(css_text):
    """Zwraca {klasa: {'weight': 'bold'|'normal', 'style': 'italic'|'normal', 'align': ...}}."""
    styles = {}
    css_text = re.sub(r"/\*.*?\*/", "", css_text, flags=re.S)
    for selectors, body in re.findall(r"([^{}]+)\{([^}]*)\}", css_text):
        props = {}
        for declaration in body.split(";"):
            if ":" in declaration:
                name, value = declaration.split(":", 1)
                props[name.strip().lower()] = value.strip().lower()
        info = {}
        weight = props.get("font-weight")
        if weight is not None:
            bold = weight in ("bold", "bolder") or (weight.isdigit() and int(weight) >= 600)
            info["weight"] = "bold" if bold else "normal"
        font_style = props.get("font-style")
        if font_style is not None:
            info["style"] = "italic" if font_style in ("italic", "oblique") else "normal"
        if "text-align" in props:
            info["align"] = props["text-align"]
        for selector in selectors.split(","):
            match = re.fullmatch(r"\.([A-Za-z0-9_-]+)", selector.strip())
            if match:
                styles.setdefault(match.group(1), {}).update(info)
    return styles


# ---------------------------------------------------------------------------
# Parser dokumentu XHTML → bloki
# ---------------------------------------------------------------------------

class XhtmlParser(HTMLParser):
    """Zamienia <body> dokumentu XHTML na listę bloków (akapity, listy, grafiki).

    Ramki z grafiką zakotwiczone w akapicie z tekstem (klasy pasujące do `frame_pattern`, np. `g-fr1`)
    trafiają ZA tekst tego akapitu — tak jak w układzie strony publikacji (PDF), gdzie ramka stoi pod
    wierszem, do którego jest zakotwiczona; w pliku EPUB ramka jest zapisana przed tekstem akapitu.
    W akapicie bez tekstu (np. sama twarda spacja) kolejność z EPUB zostaje bez zmian.
    """

    def __init__(self, css, frame_pattern=None):
        super().__init__(convert_charrefs=True)
        self.css = css
        self.frame_pattern = re.compile(frame_pattern) if frame_pattern else None
        self.blocks = []
        self.containers = [self.blocks]
        self.ctx = []
        self.lists = []
        self.current = None
        self.link = None
        self.ids = []
        self.in_body = False

    # -- style --------------------------------------------------------------
    def _element_style(self, tag, attrs):
        info = {}
        for cls in (attrs.get("class") or "").split():
            info.update(self.css.get(cls, {}))
        if tag in ("b", "strong"):
            info["weight"] = "bold"
        if tag in ("i", "em"):
            info["style"] = "italic"
        return info

    def _effective(self, key):
        for context in reversed(self.ctx):
            if context.get(key) is not None:
                return context[key]
        return None

    # -- bloki --------------------------------------------------------------
    def _open_block(self):
        self.current = {"type": "p", "inline": []}
        align = self._effective("align")
        if align in ("center", "right"):
            self.current["align"] = align

    def _ensure_block(self):
        if self.current is None:
            self._open_block()

    def _flush(self, into=None):
        if self.current is not None:
            block = finalize_block(self.current)
            if block is not None:
                (self.containers[-1] if into is None else into).append(block)
        self.current = None
        self.link = None

    def _current_has_text(self):
        return self.current is not None and bool(inline_text(self.current["inline"]).strip())

    def _is_frame(self, attrs):
        if self.frame_pattern is None:
            return False
        return any(self.frame_pattern.fullmatch(cls) for cls in (attrs.get("class") or "").split())

    def _append(self, item):
        self._ensure_block()
        target = self.link["inline"] if self.link is not None else self.current["inline"]
        target.append(item)

    # -- zdarzenia parsera --------------------------------------------------
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "body":
            self.in_body = True
            return
        if not self.in_body:
            return
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        style = self._element_style(tag, attrs)

        if tag in LIST_TAGS:
            self._flush()
            new_list = {"type": "list", "ordered": tag == "ol", "items": []}
            self.containers[-1].append(new_list)
            self.lists.append(new_list)
            self.ctx.append({"tag": tag, **style})
        elif tag == "li":
            self._flush()
            if not self.lists:
                raise ConversionError("Element <li> poza listą")
            item = []
            self.lists[-1]["items"].append(item)
            self.containers.append(item)
            self.ctx.append({"tag": tag, **style})
        elif tag in BLOCK_TAGS:
            self._flush()
            if self._is_frame(attrs):
                self.ctx.append({"tag": tag, "frame": True, **style})
            else:
                # Bloki z ramkami do wstawienia za tekstem tego bloku (patrz opis klasy).
                self.ctx.append({"tag": tag, "pending": [], **style})
        elif tag in ("img", "image"):
            src = attrs.get("src") or attrs.get("xlink:href") or attrs.get("href")
            if not src:
                raise ConversionError(f"Grafika bez źródła: {attrs}")
            self._append({"image": src, "alt": attrs.get("alt", "")})
        elif tag == "br":
            self._append({"br": True})
        elif tag == "a":
            self._ensure_block()
            link = {"link": {"href": attrs.get("href", "")}, "inline": []}
            self.current["inline"].append(link)
            self.link = link
            self.ctx.append({"tag": tag, **style})
        elif tag not in VOID_TAGS:
            self.ctx.append({"tag": tag, **style})

    def handle_endtag(self, tag):
        if tag == "body":
            self._flush()
            self.in_body = False
            return
        if not self.in_body or tag in VOID_TAGS:
            return
        if not any(context["tag"] == tag for context in self.ctx):
            raise ConversionError(f"Niesparowany znacznik zamykający </{tag}>")
        closed = []
        while self.ctx:
            closed.append(self.ctx.pop())
            if closed[-1]["tag"] == tag:
                break
        if tag in LIST_TAGS:
            self._flush()
            self.lists.pop()
        elif tag == "li":
            self._flush()
            self.containers.pop()
        elif tag in BLOCK_TAGS:
            if closed[-1].get("frame"):
                host = next((context for context in reversed(self.ctx) if "pending" in context), None)
                self._flush(into=host["pending"] if host is not None else None)
            else:
                pending = [block for context in closed for block in context.get("pending", [])]
                if pending and not self._current_has_text():
                    # Akapit bez tekstu (np. sama twarda spacja) — ramka zostaje przed nim, jak w EPUB.
                    self.containers[-1].extend(pending)
                    self._flush()
                else:
                    self._flush()
                    self.containers[-1].extend(pending)
        elif tag == "a":
            self.link = None

    def handle_data(self, data):
        if not self.in_body or not data:
            return
        if self.current is None and ASCII_WS.fullmatch(data):
            return
        run = {"text": data}
        marks = []
        if self._effective("weight") == "bold":
            marks.append("b")
        if self._effective("style") == "italic":
            marks.append("i")
        if marks:
            run["marks"] = marks
        self._append(run)


def finalize_block(block):
    """Normalizuje białe znaki ASCII jak HTML, scala sąsiednie fragmenty, usuwa puste bloki."""
    state = {"space_before": True}

    def normalize(items):
        out = []
        for item in items:
            if "text" in item:
                text = ASCII_WS.sub(" ", item["text"])
                if state["space_before"] and text.startswith(" "):
                    text = text[1:]
                if not text:
                    continue
                state["space_before"] = text.endswith(" ")
                run = {"text": text}
                if item.get("marks"):
                    run["marks"] = item["marks"]
                previous = out[-1] if out else None
                if previous is not None and "text" in previous and previous.get("marks") == run.get("marks"):
                    previous["text"] += text
                else:
                    out.append(run)
            elif "link" in item:
                out.append({"link": item["link"], "inline": normalize(item["inline"])})
            else:
                if "br" in item:
                    state["space_before"] = True
                out.append(item)
        return out

    def strip_trailing(items):
        while items:
            last = items[-1]
            if "text" in last:
                last["text"] = last["text"].rstrip(" ")
                if last["text"]:
                    return
                items.pop()
            elif "link" in last:
                strip_trailing(last["inline"])
                return
            else:
                return

    inline = normalize(block["inline"])
    strip_trailing(inline)
    if not inline:
        return None
    if len(inline) == 1 and "image" in inline[0]:
        return {"type": "image", "src": inline[0]["image"], "alt": inline[0]["alt"]}
    result = {"type": block["type"]}
    if "align" in block:
        result["align"] = block["align"]
    result["inline"] = inline
    return result


# ---------------------------------------------------------------------------
# Narzędzia do przeglądania bloków
# ---------------------------------------------------------------------------

def iter_blocks(blocks):
    """Wszystkie bloki w kolejności dokumentu, łącznie z blokami w elementach list."""
    for block in blocks:
        yield block
        if block["type"] == "list":
            for item in block["items"]:
                yield from iter_blocks(item)


def iter_inline(items):
    """Elementy w wierszu w kolejności, łącznie z zawartością odnośników."""
    for item in items:
        yield item
        if "link" in item:
            yield from iter_inline(item["inline"])


def inline_text(items):
    return "".join(item["text"] for item in iter_inline(items) if "text" in item)


def block_text(block):
    if block["type"] in ("p", "heading"):
        return inline_text(block["inline"])
    return ""


def node_text(blocks):
    return "\n".join(block_text(block) for block in iter_blocks(blocks) if block["type"] in ("p", "heading"))


# ---------------------------------------------------------------------------
# Konwersja
# ---------------------------------------------------------------------------

def assign_nodes(docs, front_matter):
    """Nadaje identyfikatory węzłom: strony wstępne wg konfiguracji, dalej paragrafy, części, ciąg dalszy."""
    last_paragraph = None
    continuation_counter = {}
    for doc in docs:
        name = posixpath.basename(doc["path"])
        doc["label"] = None
        doc["parent"] = None
        if name in front_matter:
            doc["id"], doc["kind"] = front_matter[name], "front"
            continue
        first_block = doc["blocks"][0] if doc["blocks"] else None
        first = block_text(first_block) if first_block else ""
        number = re.fullmatch(r"(\d+)(?: .+)?", first)
        letter = re.fullmatch(r"[A-Z]", first)
        if number:
            label = number.group(1)
            expected = 1 if last_paragraph is None else int(last_paragraph[1]) + 1
            if int(label) != expected:
                raise ConversionError(f"{name}: paragraf {label}, oczekiwano {expected}")
            doc["id"], doc["kind"], doc["label"] = f"p{label}", "paragraph", label
            first_block["type"] = "heading"
            last_paragraph = (doc["id"], label)
        elif letter:
            if last_paragraph is None:
                raise ConversionError(f"{name}: część {first} przed pierwszym paragrafem")
            doc["id"], doc["kind"], doc["label"] = f"p{last_paragraph[1]}{first}", "part", first
            doc["parent"] = last_paragraph[0]
            first_block["type"] = "heading"
        else:
            if last_paragraph is None:
                raise ConversionError(f"{name}: dokument bez nagłówka przed pierwszym paragrafem")
            parent = last_paragraph[0]
            index = continuation_counter.get(parent, 1) + 1
            continuation_counter[parent] = index
            doc["id"], doc["kind"] = f"{parent}-{index}", "continuation"
            doc["parent"] = parent


def resolve_links(docs, image_map):
    anchors = {}
    files = {}
    for doc in docs:
        files[doc["path"]] = doc["id"]
        for anchor in doc["ids"]:
            anchors[(doc["path"], anchor)] = doc["id"]

    for doc in docs:
        counter = 0
        doc["links"] = []
        base = posixpath.dirname(doc["path"])
        for block in iter_blocks(doc["blocks"]):
            if block["type"] == "image":
                block["src"] = map_image(block["src"], base, image_map, doc)
                continue
            if block["type"] == "list":
                continue
            for item in iter_inline(block["inline"]):
                if "image" in item:
                    item["image"] = map_image(item["image"], base, image_map, doc)
                if "link" not in item:
                    continue
                counter += 1
                link_id = f"{doc['id']}-l{counter}"
                href = item["link"]["href"]
                if href.startswith(EXTERNAL_PREFIXES):
                    item["link"] = {"id": link_id, "href": href}
                    doc["links"].append({"id": link_id, "href": href})
                    continue
                path, _, fragment = href.partition("#")
                target_path = posixpath.normpath(posixpath.join(base, path)) if path else doc["path"]
                target = anchors.get((target_path, fragment)) if fragment else files.get(target_path)
                if target is None:
                    raise ConversionError(f"{doc['path']}: nierozpoznany odnośnik {href!r}")
                item["link"] = {"id": link_id, "to": target}
                doc["links"].append({"id": link_id, "to": target})


def map_image(src, base, image_map, doc):
    path = posixpath.normpath(posixpath.join(base, src))
    if path not in image_map:
        raise ConversionError(f"{doc['path']}: grafika {path} nie ma nazwy w konfiguracji")
    return f"grafiki/{image_map[path]}"


def find_markers(blocks, pattern):
    """Oznaczenia mechaniki w tekście (np. „(U#19)”) — z informacją, czy tuż za nimi stoi odnośnik."""
    markers = []
    for index, block in enumerate(iter_blocks(blocks)):
        if block["type"] not in ("p", "heading"):
            continue
        text = ""
        link_spans = []
        for item in block["inline"]:
            if "text" in item:
                text += item["text"]
            elif "link" in item:
                start = len(text)
                text += inline_text(item["inline"])
                link_spans.append((start, item["link"].get("id")))
        for match in pattern.finditer(text):
            next_link = None
            for start, link_id in link_spans:
                if start >= match.end():
                    if re.fullmatch(r"[\s(]*", text[match.end():start]):
                        next_link = link_id
                    break
            markers.append({"code": match.group(1), "block": index, "nextLink": next_link})
    return markers


def build_output(cfg, docs, sha256):
    ending_pattern = re.compile(cfg["endingPattern"])
    marker_pattern = re.compile(cfg["markerPattern"])
    by_id = {doc["id"]: doc for doc in docs}

    # Rozdziały: odnośniki ze spisu treści prowadzące do paragrafów.
    chapter_starts = {}
    toc = by_id.get(cfg["tocNode"])
    if toc is None:
        raise ConversionError("Brak węzła spisu treści")
    for block in iter_blocks(toc["blocks"]):
        if block["type"] != "p":
            continue
        for item in block["inline"]:
            if "link" in item and item["link"].get("to") in by_id:
                target = by_id[item["link"]["to"]]
                if target["kind"] == "paragraph":
                    chapter_starts[target["id"]] = inline_text(item["inline"])

    nodes = {}
    order = []
    chapter = None
    for doc in docs:
        if doc["id"] in chapter_starts:
            chapter = chapter_starts[doc["id"]]
        node = {"kind": doc["kind"]}
        if doc["label"] is not None:
            node["label"] = doc["label"]
        if doc["parent"] is not None:
            node["parent"] = doc["parent"]
        if doc["kind"] != "front" and chapter is not None:
            node["chapter"] = chapter
        node["sourceFile"] = posixpath.basename(doc["path"])
        node["blocks"] = doc["blocks"]
        node["links"] = doc["links"]
        markers = find_markers(doc["blocks"], marker_pattern)
        if markers and doc["kind"] != "front":
            node["markers"] = markers
        endings = ending_pattern.findall(node_text(doc["blocks"]))
        if len(endings) > 1:
            raise ConversionError(f"{doc['id']}: więcej niż jedna formuła zakończenia")
        if endings:
            node["ending"] = {"title": endings[0]}
        if doc["kind"] != "front" and not any("to" in link for link in doc["links"]):
            node["terminal"] = True
        nodes[doc["id"]] = node
        order.append(doc["id"])

    header = {
        "formatVersion": 1,
        "bookId": cfg["bookId"],
        "generator": {"script": GENERATOR_SCRIPT, "version": GENERATOR_VERSION},
        "source": {"file": cfg["source"], "sha256": sha256},
    }
    colophon = by_id.get(cfg["colophonNode"])
    if colophon is None:
        raise ConversionError("Brak węzła stopki redakcyjnej")
    return header, order, nodes, colophon["blocks"]


def dumps(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def write_content(path, header, order, nodes):
    """tresc.json: nagłówek czytelny, każdy węzeł w osobnym wierszu (zwięźle, ale z czytelnymi diffami)."""
    lines = ["{"]
    for key, value in header.items():
        lines.append(f"  {dumps(key)}: {dumps(value)},")
    lines.append(f"  \"order\": {dumps(order)},")
    lines.append("  \"nodes\": {")
    for index, node_id in enumerate(order):
        comma = "," if index < len(order) - 1 else ""
        lines.append(f"    {dumps(node_id)}: {dumps(nodes[node_id])}{comma}")
    lines.append("  }")
    lines.append("}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_colophon(path, header, blocks):
    data = dict(header)
    data["blocks"] = blocks
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def convert(config_path, output_dir=None):
    cfg = json.loads(Path(config_path).read_text(encoding="utf-8"))
    source = REPO_ROOT / cfg["source"]
    raw = source.read_bytes()
    sha256 = hashlib.sha256(raw).hexdigest()
    out_dir = Path(output_dir) if output_dir else REPO_ROOT / cfg["outputDir"]
    graphics_dir = out_dir / "grafiki"
    graphics_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(source) as zf:
        opf_path = find_opf(zf)
        spine, css_files = read_package(zf, opf_path)
        css = {}
        for css_file in css_files:
            css.update(parse_css(zf.read(css_file).decode("utf-8")))
        docs = []
        for path in spine:
            parser = XhtmlParser(css, cfg.get("frameClassPattern"))
            parser.feed(zf.read(path).decode("utf-8"))
            parser.close()
            docs.append({"path": path, "blocks": parser.blocks, "ids": parser.ids})
        for zip_path, name in sorted(cfg["images"].items()):
            (graphics_dir / name).write_bytes(zf.read(zip_path))

    assign_nodes(docs, cfg["frontMatter"])
    seen = set()
    for doc in docs:
        if doc["id"] in seen:
            raise ConversionError(f"Powtórzony identyfikator węzła {doc['id']}")
        seen.add(doc["id"])
    resolve_links(docs, cfg["images"])
    header, order, nodes, colophon_blocks = build_output(cfg, docs, sha256)
    write_content(out_dir / "tresc.json", header, order, nodes)
    write_colophon(out_dir / "stopka.json", header, colophon_blocks)
    return nodes


def main():
    parser = argparse.ArgumentParser(description="Konwersja EPUB → tresc.json, stopka.json, grafiki")
    parser.add_argument("konfiguracja", help="plik konfiguracji książki (JSON)")
    parser.add_argument("--wyjscie", help="katalog wyjściowy (domyślnie outputDir z konfiguracji)")
    args = parser.parse_args()
    try:
        nodes = convert(args.konfiguracja, args.wyjscie)
    except ConversionError as error:
        print(f"BŁĄD KONWERSJI: {error}", file=sys.stderr)
        return 1
    kinds = {}
    for node in nodes.values():
        kinds[node["kind"]] = kinds.get(node["kind"], 0) + 1
    links = sum(len(node["links"]) for node in nodes.values())
    markers = sum(len(node.get("markers", [])) for node in nodes.values())
    endings = sum(1 for node in nodes.values() if "ending" in node)
    terminal = sum(1 for node in nodes.values() if node.get("terminal"))
    print(f"Węzły: {kinds}; odnośniki: {links}; oznaczenia: {markers}; "
          f"zakończenia z tytułem: {endings}; węzły bez przejść: {terminal}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
