#!/usr/bin/env python3
"""Sprawdzenie krojów pisma — kontrola K1: czy fonty mają wszystkie znaki tekstu książki.

Gracz może wybrać krój pisma tekstu książki (decyzja właściciela po zgodzie Wydawcy, 2026-11-08). Każdy
krój musi mieć znaki używane w tekście (polskie litery, „ ” – …, twarda spacja itd.) — inaczej
przeglądarka podstawi brakujący znak z innego kroju.

Skrypt zbiera wszystkie znaki z tekstu książki (tresc.json i stopka.json) i dokłada pełny polski alfabet.
Kroje i pliki fontów odczytuje z reguł @font-face w aplikacja/css/style.css. Dla każdego kroju i stylu
(zwykły, kursywa, pogrubiony…) łączy znaki ze wszystkich jego plików (np. podzbiory latin i latin-ext)
i zgłasza brakujące.

Obsługiwane formaty: TTF/OTF i WOFF 1.0 (tablica cmap, formaty 4 i 12) — tylko biblioteka standardowa.

Użycie (z katalogu głównego repozytorium):
    python3 narzedzia/weryfikacja/sprawdz_kroje.py ksiazki/vae-victis
    python3 narzedzia/weryfikacja/sprawdz_kroje.py ksiazki/vae-victis --pliki a.woff b.woff   # sprawdzenie
                                                                                             # dowolnych plików

Kod wyjścia: 0 — wszystkie znaki obecne, 1 — brakujące znaki albo błąd.
"""

import argparse
import json
import re
import struct
import sys
import unicodedata
import zlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
STYLE_CSS = REPO_ROOT / "aplikacja" / "css" / "style.css"
POLISH_LETTERS = "aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ"


def book_characters(book_dir):
    """Wszystkie znaki pól „text” w tresc.json i stopka.json (bez znaków sterujących) + polski alfabet."""
    chars = set(POLISH_LETTERS)

    def walk(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key == "text" and isinstance(item, str):
                    chars.update(item)
                else:
                    walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    for name in ("tresc.json", "stopka.json"):
        walk(json.loads((book_dir / name).read_text(encoding="utf-8")))
    return {char for char in chars if unicodedata.category(char) not in ("Cc", "Cf")}


def font_tables(data):
    """Słownik tablic fontu (tag → bajty) dla TTF/OTF i WOFF 1.0."""
    signature = data[:4]
    tables = {}
    if signature == b"wOFF":
        num_tables = struct.unpack(">H", data[12:14])[0]
        for index in range(num_tables):
            tag, offset, comp_length, orig_length, _ = struct.unpack(">4sIIII", data[44 + 20 * index:64 + 20 * index])
            raw = data[offset:offset + comp_length]
            tables[tag.decode("latin-1")] = zlib.decompress(raw) if comp_length < orig_length else raw
        return tables
    if signature in (b"\x00\x01\x00\x00", b"OTTO", b"true"):
        num_tables = struct.unpack(">H", data[4:6])[0]
        for index in range(num_tables):
            tag, _, offset, length = struct.unpack(">4sIII", data[12 + 16 * index:28 + 16 * index])
            tables[tag.decode("latin-1")] = data[offset:offset + length]
        return tables
    if signature == b"wOF2":
        raise ValueError("WOFF2 wymaga dekompresji Brotli (spoza biblioteki standardowej) — użyj TTF/OTF/WOFF")
    raise ValueError(f"nieznany format fontu (sygnatura {signature!r})")


def cmap_codepoints(cmap):
    """Zbiór kodów znaków z tablicy cmap (podtablice formatu 4 i 12, platformy Unicode/Windows)."""
    codepoints = set()
    num_subtables = struct.unpack(">H", cmap[2:4])[0]
    for index in range(num_subtables):
        platform, encoding, offset = struct.unpack(">HHI", cmap[4 + 8 * index:12 + 8 * index])
        if not (platform == 0 or (platform == 3 and encoding in (1, 10))):
            continue
        fmt = struct.unpack(">H", cmap[offset:offset + 2])[0]
        if fmt == 4:
            seg_count = struct.unpack(">H", cmap[offset + 6:offset + 8])[0] // 2
            ends_at = offset + 14
            starts_at = ends_at + 2 * seg_count + 2
            deltas_at = starts_at + 2 * seg_count
            ranges_at = deltas_at + 2 * seg_count
            for seg in range(seg_count):
                end = struct.unpack(">H", cmap[ends_at + 2 * seg:ends_at + 2 * seg + 2])[0]
                start = struct.unpack(">H", cmap[starts_at + 2 * seg:starts_at + 2 * seg + 2])[0]
                delta = struct.unpack(">h", cmap[deltas_at + 2 * seg:deltas_at + 2 * seg + 2])[0]
                range_offset = struct.unpack(">H", cmap[ranges_at + 2 * seg:ranges_at + 2 * seg + 2])[0]
                for code in range(start, end + 1):
                    if code == 0xFFFF:
                        continue
                    if range_offset == 0:
                        glyph = (code + delta) & 0xFFFF
                    else:
                        glyph_at = ranges_at + 2 * seg + range_offset + 2 * (code - start)
                        glyph = struct.unpack(">H", cmap[glyph_at:glyph_at + 2])[0]
                        if glyph:
                            glyph = (glyph + delta) & 0xFFFF
                    if glyph:
                        codepoints.add(code)
        elif fmt == 12:
            num_groups = struct.unpack(">I", cmap[offset + 12:offset + 16])[0]
            for group in range(num_groups):
                start, end, glyph = struct.unpack(">III", cmap[offset + 16 + 12 * group:offset + 28 + 12 * group])
                for code in range(start, end + 1):
                    if glyph + (code - start):
                        codepoints.add(code)
    return codepoints


def font_codepoints(path):
    return cmap_codepoints(font_tables(path.read_bytes())["cmap"])


def font_faces_from_css(css_path):
    """Reguły @font-face z arkusza: (krój, styl, grubość) → lista plików."""
    css = css_path.read_text(encoding="utf-8")
    faces = {}
    for block in re.findall(r"@font-face\s*{([^}]*)}", css):
        family = re.search(r"font-family:\s*['\"]?([^;'\"]+)", block).group(1).strip()
        style = (re.search(r"font-style:\s*([a-z]+)", block) or [None, "normal"])[1]
        weight = (re.search(r"font-weight:\s*(\d+)", block) or [None, "400"])[1]
        for url in re.findall(r"url\(['\"]?([^'\")]+)['\"]?\)", block):
            faces.setdefault((family, style, weight), []).append((css_path.parent / url).resolve())
    return faces


def describe(chars):
    return ", ".join(f"U+{ord(char):04X} {char!r} ({unicodedata.name(char, '?')})" for char in sorted(chars))


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("ksiazka", type=Path, help="katalog książki, np. ksiazki/vae-victis")
    parser.add_argument("--pliki", nargs="+", type=Path, help="zamiast arkusza: sprawdź łącznie podane pliki")
    args = parser.parse_args()

    needed = book_characters(args.ksiazka)
    print(f"Znaki tekstu książki (z polskim alfabetem): {len(needed)}, spoza ASCII: "
          f"{sum(1 for char in needed if ord(char) > 0x7E)}")
    faces = {("(podane pliki)", "-", "-"): args.pliki} if args.pliki else font_faces_from_css(STYLE_CSS)
    if not faces:
        print("BŁĄD: nie znaleziono reguł @font-face")
        return 1
    failed = False
    for (family, style, weight), files in sorted(faces.items()):
        covered = set()
        for path in files:
            covered |= font_codepoints(path)
        missing = {char for char in needed if ord(char) not in covered}
        label = f"{family} ({style}, {weight})"
        if missing:
            failed = True
            print(f"BRAK  {label}: {describe(missing)}")
        else:
            print(f"OK    {label}: wszystkie znaki ({len(files)} plik(i))")
    print("K1:", "BŁĄD — brakujące znaki" if failed else "zaliczona")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
