#!/usr/bin/env python3
"""Generator warstwy mechaniki (mechanika.json) na podstawie tresc.json i konfiguracji książki.

Odczytuje zapisy mechaniki z tekstu DOSŁOWNIE (bez dopowiadania reguł — zasada neutralności):
- oznaczenia „(U#n)”: zdobycie Informacji przy wejściu do węzła albo przy wyborze odnośnika, który
  stoi tuż za oznaczeniem (linia dialogowa),
- wiersze warunków „#n – X”, „Brak #n – Y”, „#a i #b – …”, „#a lub #b – …”, „Brak #a lub #b – …”,
  „#n (lub nieposiadanie żadnej z powyższych Informacji) – …”,
- „[Jeśli jesteś w tym paragrafie po raz kolejny/drugi …]” → druga i kolejna wizyta,
- „(Jeśli posiadasz Informację #n nie możesz wybrać tej opcji)” → brak Informacji #n,
- przypadki opisane prozą — z konfiguracji (linkConditions).
Każdy wiersz warunku, którego nie da się odczytać, przerywa generowanie błędem.
Wynik nie zawiera tekstu książki — tylko identyfikatory, numery i etykiety techniczne.

Użycie (z katalogu głównego repozytorium):
    python3 narzedzia/konwersja/generuj_mechanike.py narzedzia/konwersja/mechanika_vae-victis.json
"""

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

GENERATOR_SCRIPT = "narzedzia/konwersja/generuj_mechanike.py"
GENERATOR_VERSION = "1.1.0"
REPO_ROOT = Path(__file__).resolve().parents[2]
EDGE_WS = "  \t\n"

MARKER = re.compile(r"\(U#(\d+)\)")
REVISIT = re.compile(r"^\[Jeśli jesteś w tym paragrafie po raz (kolejny|drugi)")
FORBIDDEN_OPTION = re.compile(r"\(Jeśli posiadasz Informację #(\d+) nie możesz wybrać tej opcji\)")
NONE_OF_ABOVE = re.compile(r"#(\d+) \(lub nieposiadanie żadnej z powyższych Informacji\)")
TERM = re.compile(r"(Brak )?#(\d+)")


class MechanicsError(Exception):
    """Zapis mechaniki, którego nie da się odczytać jednoznacznie."""


def inline_items(block):
    """Spłaszczona lista elementów bloku: ("text", tekst) albo ("link", id, cel, tekst)."""
    items = []
    for item in block.get("inline", []):
        if "text" in item:
            items.append(("text", item["text"]))
        elif "link" in item:
            text = "".join(part.get("text", "") for part in item["inline"])
            items.append(("link", item["link"]["id"], item["link"].get("to"), text))
    return items


def block_text(block):
    return "".join(item[1] if item[0] == "text" else item[3] for item in inline_items(block))


def term(text):
    match = TERM.fullmatch(text)
    if not match:
        raise MechanicsError(f"nieczytelny człon warunku: {text!r}")
    return {"notHas": match.group(2)} if match.group(1) else {"has": match.group(2)}


def parse_row_condition(text, codes_above):
    """Warunek z wiersza tabeli (tekst przed odnośnikiem, bez końcowego „–”)."""
    none_of_above = NONE_OF_ABOVE.fullmatch(text)
    if none_of_above:
        if not codes_above:
            raise MechanicsError(f"„żadnej z powyższych” bez wcześniejszych wierszy: {text!r}")
        return {"any": [{"has": none_of_above.group(1)},
                        {"all": [{"notHas": code} for code in codes_above]}]}
    parts = re.split(r" (lub|albo|i) ", text)
    if len(parts) == 1:
        return term(parts[0])
    if len(parts) == 3:
        left, operator, right = parts
        key = "all" if operator == "i" else "any"
        return {key: [term(left), term(right)]}
    raise MechanicsError(f"nieczytelny wiersz warunku: {text!r}")


def codes_in(condition):
    found = []
    if isinstance(condition, dict):
        for key, value in condition.items():
            if key in ("has", "notHas"):
                found.append(value)
            else:
                found.extend(codes_in(value))
    elif isinstance(condition, list):
        for value in condition:
            found.extend(codes_in(value))
    return found


def add_link_condition(result, node_id, link_id, condition):
    links = result.setdefault(node_id, {}).setdefault("links", {})
    entry = links.setdefault(link_id, {})
    if "if" in entry:
        raise MechanicsError(f"{link_id}: dwa różne źródła warunku")
    entry["if"] = condition


def generate(cfg):
    content_path = REPO_ROOT / cfg["content"]
    raw = content_path.read_bytes()
    content = json.loads(raw.decode("utf-8"))
    nodes = content["nodes"]
    result = {}
    codewords = set()

    # 1. Oznaczenia „(U#n)” → zdobycie Informacji
    for node_id in content["order"]:
        for marker in nodes[node_id].get("markers", []):
            effect = {"gain": marker["code"]}
            codewords.add(marker["code"])
            if marker["nextLink"]:
                entry = result.setdefault(node_id, {}).setdefault("links", {}).setdefault(marker["nextLink"], {})
                entry.setdefault("onChoose", []).append(effect)
            else:
                result.setdefault(node_id, {}).setdefault("onEnter", []).append(effect)

    # 2. Warunki zapisane w tekście
    for node_id in content["order"]:
        codes_above = []
        for block in nodes[node_id]["blocks"]:
            if block["type"] != "p":
                continue
            items = inline_items(block)
            text = block_text(block).strip(EDGE_WS)
            links = [item for item in items if item[0] == "link" and item[2]]

            if re.match(r"^(#\d|Brak #)", text):
                if len(links) != 1:
                    raise MechanicsError(f"{node_id}: wiersz warunku bez jednego odnośnika: {text!r}")
                position = items.index(links[0])
                before = "".join(item[1] for item in items[:position] if item[0] == "text").strip(EDGE_WS)
                after = "".join(item[1] for item in items[position + 1:] if item[0] == "text").strip(EDGE_WS)
                if not before.endswith("–") or after:
                    raise MechanicsError(f"{node_id}: nietypowy wiersz warunku: {text!r}")
                condition = parse_row_condition(before[:-1].strip(EDGE_WS), sorted(set(codes_above), key=int))
                add_link_condition(result, node_id, links[0][1], condition)
                codes_above.extend(code for code in codes_in(condition) if code not in codes_above)
                continue

            if REVISIT.match(text):
                if len(links) != 1:
                    raise MechanicsError(f"{node_id}: warunek ponownej wizyty bez jednego odnośnika")
                add_link_condition(result, node_id, links[0][1], {"visitsAtLeast": 2})
                continue

            full_text = block_text(block)
            forbidden = FORBIDDEN_OPTION.search(full_text)
            if forbidden:
                offset = 0
                preceding = None
                for item in items:
                    if item[0] == "link" and offset < forbidden.start():
                        preceding = item
                    offset += len(item[1] if item[0] == "text" else item[3])
                if preceding is None:
                    raise MechanicsError(f"{node_id}: nie znaleziono opcji objętej zakazem")
                add_link_condition(result, node_id, preceding[1], {"notHas": forbidden.group(1)})

    # 3. Przypadki opisane prozą (z konfiguracji)
    for rule in cfg.get("linkConditions", []):
        matching = [link for link in nodes[rule["node"]]["links"] if link.get("to") == rule["linkTo"]]
        if len(matching) != 1:
            raise MechanicsError(f"{rule['node']} → {rule['linkTo']}: oczekiwano dokładnie jednego odnośnika")
        add_link_condition(result, rule["node"], matching[0]["id"], rule["if"])

    # 4. Węzły z niejednoznacznymi zapisami (decyzja właściciela: obie drogi dostępne, wybiera gracz)
    for node_id in cfg.get("ambiguousNodes", []):
        if node_id not in nodes:
            raise MechanicsError(f"nieznany węzeł niejednoznaczny {node_id}")
        result.setdefault(node_id, {})["ambiguous"] = True

    for entry in result.values():
        for link in entry.get("links", {}).values():
            codewords.update(codes_in(link.get("if", {})))

    ordered = {node_id: order_entry(result[node_id]) for node_id in content["order"] if node_id in result}
    header = {
        "formatVersion": 1,
        "bookId": cfg["bookId"],
        "contentSha256": hashlib.sha256(raw).hexdigest(),
        "generator": {"script": GENERATOR_SCRIPT, "version": GENERATOR_VERSION},
        "startNode": cfg["startNode"],
        "modules": {
            "codewords": {"label": cfg["codewords"]["label"], "prefix": cfg["codewords"]["prefix"],
                          **{key: cfg["codewords"][key] for key in ("buttonLabel", "panelTitle")
                             if key in cfg["codewords"]},
                          "values": sorted(codewords, key=int)},
            "visits": {},
            "endings": {},
            "notes": {},
        },
    }
    return header, ordered


def order_entry(entry):
    ordered = {}
    for key in ("ambiguous", "onEnter", "links"):
        if key in entry:
            ordered[key] = entry[key]
    if "links" in ordered:
        ordered["links"] = {
            link_id: {key: link[key] for key in ("if", "onChoose") if key in link}
            for link_id, link in sorted(ordered["links"].items(), key=lambda pair: int(pair[0].rsplit("-l", 1)[1]))
        }
    return ordered


def write(path, header, nodes):
    dumps = lambda value: json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    lines = ["{"]
    for key, value in header.items():
        lines.append(f"  {dumps(key)}: {dumps(value)},")
    lines.append("  \"nodes\": {")
    ids = list(nodes)
    for index, node_id in enumerate(ids):
        comma = "," if index < len(ids) - 1 else ""
        lines.append(f"    {dumps(node_id)}: {dumps(nodes[node_id])}{comma}")
    lines.append("  }")
    lines.append("}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Generowanie mechanika.json z tresc.json")
    parser.add_argument("konfiguracja", help="konfiguracja mechaniki książki (JSON)")
    args = parser.parse_args()
    cfg = json.loads(Path(args.konfiguracja).read_text(encoding="utf-8"))
    try:
        header, nodes = generate(cfg)
    except MechanicsError as error:
        print(f"BŁĄD MECHANIKI: {error}", file=sys.stderr)
        return 1
    write(REPO_ROOT / cfg["output"], header, nodes)
    gains = sum(len(n.get("onEnter", [])) + sum(len(l.get("onChoose", [])) for l in n.get("links", {}).values())
                for n in nodes.values())
    conditions = sum(1 for n in nodes.values() for l in n.get("links", {}).values() if "if" in l)
    print(f"Węzły z mechaniką: {len(nodes)}; zdobycia Informacji: {gains}; odnośniki z warunkiem: {conditions}; "
          f"Informacje: {len(header['modules']['codewords']['values'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
