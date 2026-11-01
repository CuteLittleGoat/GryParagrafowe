#!/usr/bin/env python3
"""Weryfikacja integralności treści książki — kontrole W1–W8 z dokumentacja/KONWERSJA.md.

Sprawdza pliki wygenerowane przez narzedzia/konwersja/epub_do_json.py. Tekst z pliku źródłowego
odczytuje NIEZALEŻNĄ metodą (xml.etree.ElementTree zamiast html.parser używanego w konwerterze),
żeby błąd konwertera nie mógł „potwierdzić sam siebie”.

Użycie (z katalogu głównego repozytorium):
    python3 narzedzia/weryfikacja/weryfikuj_tresc.py narzedzia/konwersja/konfiguracja_vae-victis.json

Kod wyjścia: 0 — wszystkie kontrole zaliczone, 1 — co najmniej jedna kontrola nie przeszła.
"""

import argparse
import hashlib
import json
import posixpath
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

REPO_ROOT = Path(__file__).resolve().parents[2]
CONVERTER = REPO_ROOT / "narzedzia" / "konwersja" / "epub_do_json.py"
XHTML = "{http://www.w3.org/1999/xhtml}"
SVG = "{http://www.w3.org/2000/svg}"
OPF = "{http://www.idpf.org/2007/opf}"
CONTAINER = "{urn:oasis:names:tc:opendocument:xmlns:container}"
ASCII_WS = re.compile(r"[ \t\n\r\f]+")


def strip_ascii_ws(text):
    return ASCII_WS.sub("", text)


def json_inline_text(items):
    text = ""
    for item in items:
        if "text" in item:
            text += item["text"]
        elif "link" in item:
            text += json_inline_text(item["inline"])
    return text


def json_blocks(blocks):
    for block in blocks:
        yield block
        if block["type"] == "list":
            for item in block["items"]:
                yield from json_blocks(item)


def json_node_text(blocks):
    return "\n".join(json_inline_text(b["inline"]) for b in json_blocks(blocks) if "inline" in b)


def json_images(blocks):
    found = []
    for block in json_blocks(blocks):
        if block["type"] == "image":
            found.append(block["src"])
        elif "inline" in block:
            stack = list(block["inline"])
            while stack:
                item = stack.pop()
                if "image" in item:
                    found.append(item["image"])
                elif "link" in item:
                    stack.extend(item["inline"])
    return found


def json_links(blocks):
    found = []
    for block in json_blocks(blocks):
        for item in block.get("inline", []):
            if "link" in item:
                found.append(item["link"])
    return found


def epub_documents(epub_path):
    """Niezależny odczyt EPUB: {nazwa pliku: (tekst bez białych znaków ASCII, liczba grafik)}."""
    result = {}
    with zipfile.ZipFile(epub_path) as zf:
        container = ET.fromstring(zf.read("META-INF/container.xml"))
        opf_path = container.find(f".//{CONTAINER}rootfile").get("full-path")
        opf = ET.fromstring(zf.read(opf_path))
        base = posixpath.dirname(opf_path)
        manifest = {item.get("id"): posixpath.join(base, item.get("href")) for item in opf.iter(f"{OPF}item")}
        for ref in opf.iter(f"{OPF}itemref"):
            path = manifest[ref.get("idref")]
            body = ET.fromstring(zf.read(path)).find(f"{XHTML}body")
            text = strip_ascii_ws("".join(body.itertext()))
            images = len(list(body.iter(f"{XHTML}img"))) + len(list(body.iter(f"{SVG}image")))
            result[posixpath.basename(path)] = (text, images)
    return result


class Report:
    def __init__(self):
        self.rows = []

    def add(self, code, ok, message):
        self.rows.append((code, ok, message))

    def print_and_status(self):
        for code, ok, message in self.rows:
            print(f"[{'OK ' if ok else 'BŁĄD'}] {code}: {message}")
        failed = [row for row in self.rows if not row[1]]
        print(f"\nWynik: {len(self.rows) - len(failed)}/{len(self.rows)} kontroli zaliczonych.")
        return 0 if not failed else 1


def first_difference(a, b):
    for index, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return index
    return min(len(a), len(b))


def verify(config_path):
    report = Report()
    cfg = json.loads(Path(config_path).read_text(encoding="utf-8"))
    out_dir = REPO_ROOT / cfg["outputDir"]
    source = REPO_ROOT / cfg["source"]
    content = json.loads((out_dir / "tresc.json").read_text(encoding="utf-8"))
    colophon = json.loads((out_dir / "stopka.json").read_text(encoding="utf-8"))
    manifest = json.loads((out_dir / "ksiazka.json").read_text(encoding="utf-8"))
    nodes = content["nodes"]

    # W1 — suma kontrolna pliku źródłowego
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    recorded = {content["source"]["sha256"], colophon["source"]["sha256"], manifest["source"]["sha256"]}
    report.add("W1", recorded == {sha} and manifest["source"]["file"] == cfg["source"],
               f"SHA-256 źródła {sha[:12]}… zgodna z tresc.json, stopka.json i ksiazka.json")

    # W2 — determinizm konwersji
    with tempfile.TemporaryDirectory() as tmp:
        run = subprocess.run([sys.executable, "-I", str(CONVERTER), str(config_path), "--wyjscie", tmp],
                             capture_output=True, text=True)
        same = run.returncode == 0
        compared = ["tresc.json", "stopka.json"] + [f"grafiki/{name}" for name in cfg["images"].values()]
        differing = [name for name in compared
                     if not same or (Path(tmp) / name).read_bytes() != (out_dir / name).read_bytes()]
        report.add("W2", same and not differing,
                   "ponowna konwersja daje identyczne pliki" if same and not differing
                   else f"różnice po ponownej konwersji: {differing or run.stderr.strip()}")

    # W3 — tekst 1:1 (niezależny odczyt EPUB) + liczba grafik w każdym dokumencie
    documents = epub_documents(source)
    by_file = {node["sourceFile"]: (node_id, node) for node_id, node in nodes.items()}
    problems = []
    if set(documents) != set(by_file):
        problems.append(f"dokumenty bez węzła: {sorted(set(documents) - set(by_file))}, "
                        f"węzły bez dokumentu: {sorted(set(by_file) - set(documents))}")
    for name, (expected_text, expected_images) in documents.items():
        if name not in by_file:
            continue
        node_id, node = by_file[name]
        actual = strip_ascii_ws(json_node_text(node["blocks"]))
        if actual != expected_text:
            at = first_difference(actual, expected_text)
            problems.append(f"{node_id}: tekst różni się od pozycji {at}: "
                            f"JSON={actual[max(0, at - 20):at + 20]!r} EPUB={expected_text[max(0, at - 20):at + 20]!r}")
        if len(json_images(node["blocks"])) != expected_images:
            problems.append(f"{node_id}: liczba grafik {len(json_images(node['blocks']))} ≠ {expected_images}")
    total_chars = sum(len(text) for text, _ in documents.values())
    report.add("W3", not problems,
               f"tekst 1:1 we wszystkich {len(documents)} dokumentach ({total_chars} znaków bez białych znaków ASCII)"
               if not problems else "; ".join(problems[:5]))

    # W4 — liczba węzłów
    kinds = {}
    for node in nodes.values():
        kinds[node["kind"]] = kinds.get(node["kind"], 0) + 1
    expected = {key: cfg["expected"][key] for key in ("front", "paragraph", "part", "continuation")}
    report.add("W4", kinds == expected, f"węzły {kinds} (oczekiwane {expected})")

    # W5 — odnośniki
    link_problems = []
    seen_ids = set()
    for node_id, node in nodes.items():
        in_blocks = json_links(node["blocks"])
        if in_blocks != node["links"]:
            link_problems.append(f"{node_id}: indeks odnośników niezgodny z treścią")
        for link in in_blocks:
            if link["id"] in seen_ids:
                link_problems.append(f"powtórzony identyfikator {link['id']}")
            seen_ids.add(link["id"])
            if "to" in link and link["to"] not in nodes:
                link_problems.append(f"{link['id']} → nieistniejący węzeł {link['to']}")
            if "to" not in link and not link.get("href", "").startswith(("http://", "https://", "mailto:")):
                link_problems.append(f"{link['id']}: odnośnik bez celu")
    report.add("W5", not link_problems,
               f"{len(seen_ids)} odnośników, wszystkie wskazują istniejące węzły lub adresy zewnętrzne"
               if not link_problems else "; ".join(link_problems[:5]))

    # W6 — grafiki i podpis autorki/autora okładki
    referenced = set()
    for node in nodes.values():
        referenced.update(json_images(node["blocks"]))
    referenced.update(json_images(colophon["blocks"]))
    referenced.add(manifest["cover"]["file"])
    missing = sorted(path for path in referenced if not (out_dir / path).is_file())
    illustrator = manifest["cover"].get("illustrator", "").strip()
    report.add("W6", not missing and bool(illustrator),
               f"{len(referenced)} plików grafik istnieje; okładka z podpisem: {illustrator}"
               if not missing and illustrator else f"brak plików: {missing}; podpis okładki: {illustrator!r}")

    # W7 — pełna stopka redakcyjna
    colophon_text = json_node_text(colophon["blocks"]).strip("  \n")
    starts = colophon_text.startswith(cfg["expected"]["colophonStartsWith"])
    ends = colophon_text.endswith(cfg["expected"]["colophonEndsWith"])
    same_as_node = colophon["blocks"] == nodes[cfg["colophonNode"]]["blocks"]
    report.add("W7", starts and ends and same_as_node,
               "stopka kompletna (od „Copyright” po ISBN) i zgodna z węzłem stopki"
               if starts and ends and same_as_node
               else f"początek OK: {starts}, koniec OK: {ends}, zgodna z węzłem: {same_as_node}")

    # W8 — metadane manifestu zgodne ze stopką
    required = [manifest["title"], manifest["isbn"], illustrator] + list(manifest["authors"])
    absent = [value for value in required if value not in colophon_text]
    catalog = json.loads((REPO_ROOT / "ksiazki" / "katalog.json").read_text(encoding="utf-8"))
    in_catalog = any(book["id"] == manifest["id"] for book in catalog["books"])
    report.add("W8", not absent and in_catalog and manifest["id"] == cfg["bookId"],
               "tytuł, autorzy, ISBN i autorka/autor okładki występują dosłownie w stopce; książka w katalogu"
               if not absent and in_catalog else f"brak w stopce: {absent}; w katalogu: {in_catalog}")

    return report.print_and_status()


def main():
    parser = argparse.ArgumentParser(description="Weryfikacja integralności treści książki (W1–W8)")
    parser.add_argument("konfiguracja", help="plik konfiguracji książki (JSON)")
    args = parser.parse_args()
    return verify(args.konfiguracja)


if __name__ == "__main__":
    sys.exit(main())
