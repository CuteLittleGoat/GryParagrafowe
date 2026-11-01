#!/usr/bin/env python3
"""Walidacja warstwy mechaniki książki — kontrole M1–M5 z dokumentacja/KONWERSJA.md.

Użycie (z katalogu głównego repozytorium):
    python3 narzedzia/weryfikacja/weryfikuj_mechanike.py ksiazki/vae-victis

Kod wyjścia: 0 — kontrole M1–M4 zaliczone (M5 ma charakter informacyjny), 1 — błąd.
"""

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CONDITION_KEYS = {"all", "any", "not", "has", "notHas", "visitsAtLeast", "visited"}
EFFECT_KEYS = {"gain", "lose"}
MODULE_FOR_KEY = {"has": "codewords", "notHas": "codewords", "gain": "codewords", "lose": "codewords",
                  "visitsAtLeast": "visits", "visited": "visits"}


def check_condition(condition, codes, nodes, problems, where, modules):
    if not isinstance(condition, dict) or len(condition) != 1:
        problems.append(f"{where}: warunek musi mieć dokładnie jeden klucz: {condition}")
        return
    key, value = next(iter(condition.items()))
    if key not in CONDITION_KEYS:
        problems.append(f"{where}: nieznany warunek {key!r}")
    elif key in ("all", "any"):
        if not isinstance(value, list) or len(value) < 2:
            problems.append(f"{where}: {key} wymaga listy co najmniej dwóch warunków")
        else:
            for item in value:
                check_condition(item, codes, nodes, problems, where, modules)
    elif key == "not":
        check_condition(value, codes, nodes, problems, where, modules)
    elif key in ("has", "notHas") and value not in codes:
        problems.append(f"{where}: Informacja #{value} spoza listy modułu")
    elif key == "visitsAtLeast" and (not isinstance(value, int) or value < 1):
        problems.append(f"{where}: visitsAtLeast musi być liczbą ≥ 1")
    elif key == "visited" and value not in nodes:
        problems.append(f"{where}: visited wskazuje nieistniejący węzeł {value}")
    if key in MODULE_FOR_KEY and MODULE_FOR_KEY[key] not in modules:
        problems.append(f"{where}: warunek {key} wymaga modułu {MODULE_FOR_KEY[key]}")


def check_effects(effects, codes, problems, where, modules):
    if not isinstance(effects, list):
        problems.append(f"{where}: efekty muszą być listą")
        return
    for effect in effects:
        if not isinstance(effect, dict) or len(effect) != 1 or next(iter(effect)) not in EFFECT_KEYS:
            problems.append(f"{where}: nieznany efekt {effect}")
            continue
        key, value = next(iter(effect.items()))
        if value not in codes:
            problems.append(f"{where}: efekt {key} dla Informacji #{value} spoza listy modułu")
        if MODULE_FOR_KEY[key] not in modules:
            problems.append(f"{where}: efekt {key} wymaga modułu {MODULE_FOR_KEY[key]}")


def block_text(block):
    text = ""
    for item in block.get("inline", []):
        if "text" in item:
            text += item["text"]
        elif "link" in item:
            text += "".join(part.get("text", "") for part in item["inline"])
    return text


def verify(book_dir):
    book = REPO_ROOT / book_dir
    raw_content = (book / "tresc.json").read_bytes()
    content = json.loads(raw_content.decode("utf-8"))
    mechanics = json.loads((book / "mechanika.json").read_text(encoding="utf-8"))
    manifest = json.loads((book / "ksiazka.json").read_text(encoding="utf-8"))
    nodes = content["nodes"]
    modules = set(mechanics["modules"])
    codes = set(mechanics["modules"].get("codewords", {}).get("values", []))
    rows = []

    # M1 — mechanika przygotowana dla bieżącej wersji treści
    sha = hashlib.sha256(raw_content).hexdigest()
    rows.append(("M1", mechanics["contentSha256"] == sha, f"contentSha256 zgodny z tresc.json ({sha[:12]}…)"))

    # M2 — odwołania do istniejących węzłów i odnośników
    problems = []
    if mechanics["startNode"] not in nodes:
        problems.append(f"startNode {mechanics['startNode']} nie istnieje")
    for node_id, entry in mechanics["nodes"].items():
        if node_id not in nodes:
            problems.append(f"nieistniejący węzeł {node_id}")
            continue
        link_ids = {link["id"] for link in nodes[node_id]["links"]}
        for link_id in entry.get("links", {}):
            if link_id not in link_ids:
                problems.append(f"{node_id}: odnośnik {link_id} nie należy do węzła")
    rows.append(("M2", not problems, "wszystkie odwołania istnieją" if not problems else "; ".join(problems[:5])))

    # M3 — każde oznaczenie z tekstu ma odpowiadający efekt; każdy wiersz warunku ma warunek
    problems = []
    for node_id, node in nodes.items():
        entry = mechanics["nodes"].get(node_id, {})
        for marker in node.get("markers", []):
            effect = {"gain": marker["code"]}
            if marker["nextLink"]:
                if effect not in entry.get("links", {}).get(marker["nextLink"], {}).get("onChoose", []):
                    problems.append(f"{node_id}: brak zdobycia #{marker['code']} przy {marker['nextLink']}")
            elif effect not in entry.get("onEnter", []):
                problems.append(f"{node_id}: brak zdobycia #{marker['code']} przy wejściu")
        for block in node["blocks"]:
            text = block_text(block).strip("  ")
            if block["type"] == "p" and re.match(r"^(#\d|Brak #)", text):
                link_ids = [item["link"]["id"] for item in block["inline"] if "link" in item]
                if not link_ids or "if" not in entry.get("links", {}).get(link_ids[0], {}):
                    problems.append(f"{node_id}: wiersz warunku bez warunku w mechanice: {text[:40]!r}")
    rows.append(("M3", not problems, "każde oznaczenie (U#n) i każdy wiersz warunku ma odpowiednik w mechanice"
                 if not problems else "; ".join(problems[:5])))

    # M4 — składnia warunków i efektów; zgodność modułów z manifestem
    problems = []
    for node_id, entry in mechanics["nodes"].items():
        check_effects(entry.get("onEnter", []), codes, problems, f"{node_id}.onEnter", modules)
        for link_id, link in entry.get("links", {}).items():
            if "if" in link:
                check_condition(link["if"], codes, nodes, problems, link_id, modules)
            check_effects(link.get("onChoose", []), codes, problems, f"{link_id}.onChoose", modules)
    if set(manifest["modules"]) != modules:
        problems.append(f"moduły manifestu {sorted(manifest['modules'])} ≠ moduły mechaniki {sorted(modules)}")
    rows.append(("M4", not problems, "składnia warunków i efektów poprawna; moduły zgodne z manifestem"
                 if not problems else "; ".join(problems[:5])))

    # M5 — osiągalność (informacyjnie, bez uwzględniania warunków)
    reachable = set()
    stack = [mechanics["startNode"]]
    while stack:
        node_id = stack.pop()
        if node_id in reachable:
            continue
        reachable.add(node_id)
        stack.extend(link["to"] for link in nodes[node_id]["links"] if "to" in link)
    game_nodes = [node_id for node_id, node in nodes.items() if node["kind"] != "front"]
    unreachable = [node_id for node_id in game_nodes if node_id not in reachable]
    endings = [node_id for node_id in game_nodes if "ending" in nodes[node_id]]
    rows.append(("M5", True, f"osiągalne {len(game_nodes) - len(unreachable)}/{len(game_nodes)} węzłów gry"
                 f" (nieosiągalne: {unreachable or 'brak'}); zakończeń osiągalnych: "
                 f"{sum(1 for e in endings if e in reachable)}/{len(endings)}"))

    for code, ok, message in rows:
        print(f"[{'OK ' if ok else 'BŁĄD'}] {code}: {message}")
    failed = [row for row in rows if not row[1]]
    print(f"\nWynik: {len(rows) - len(failed)}/{len(rows)} kontroli zaliczonych.")
    return 0 if not failed else 1


def main():
    parser = argparse.ArgumentParser(description="Walidacja mechanika.json (M1–M5)")
    parser.add_argument("katalog_ksiazki", help="np. ksiazki/vae-victis")
    args = parser.parse_args()
    return verify(args.katalog_ksiazki)


if __name__ == "__main__":
    sys.exit(main())
