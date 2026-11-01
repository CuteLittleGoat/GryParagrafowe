# Format danych książki (JSON)

> Status: **wersja robocza** — do zatwierdzenia i doprecyzowania w Etapie 1 (konwersja) i Etapie 3
> (mechanika). Format musi obsłużyć książki o **różnej strukturze i wymaganiach** — nie każda
> książka ma HP, kości czy ekwipunek.

## 1. Pliki

```
ksiazki/
├── katalog.json             lista książek widocznych w aplikacji
└── <bookId>/                np. vae-victis (bookId = nazwa katalogu, niezmienna)
    ├── README.md            karta książki: status zgody, wyniki analizy, uwagi do konwersji
    ├── ksiazka.json         manifest: metadane, atrybucja, źródło, zgoda, lista modułów
    ├── tresc.json           treść 1:1 — GENEROWANA skryptem, nie edytować ręcznie
    ├── stopka.json          stopka redakcyjna 1:1 — GENEROWANA skryptem, nie edytować ręcznie
    ├── mechanika.json       warstwa mechaniki — bez tekstu książki
    ├── modul.js             (opcjonalnie) logika specyficzna dla książki
    └── grafiki/             okładka i grafiki z publikacji (tylko skalowanie/kompresja)
```

| Plik | Kto tworzy | Może zawierać tekst książki? |
|---|---|---|
| `tresc.json`, `stopka.json` | **wyłącznie skrypt konwersji** | tak — dosłownie, 1:1 |
| `ksiazka.json` | człowiek/agent | tylko dane bibliograficzne zgodne ze stopką (weryfikowane automatycznie) |
| `mechanika.json` | człowiek/agent (półautomatycznie) | **nie** — tylko identyfikatory, liczby i etykiety techniczne |
| `katalog.json` | człowiek/agent | nie |

Wszystkie pliki: UTF-8, znaki końca linii LF, JSON z wcięciem 2 spacji (czytelne diffy).

## 2. `katalog.json`

```json
{
  "formatVersion": 1,
  "books": [
    { "id": "vae-victis", "status": "active", "order": 1 }
  ]
}
```

`status`: `active` (widoczna), `hidden` (ukryta, np. w przygotowaniu), `withdrawn` (wycofana — np.
wycofanie zgody; treść musi zostać usunięta z repozytorium, patrz N9).

## 3. `ksiazka.json` — manifest

```json
{
  "formatVersion": 1,
  "id": "vae-victis",
  "title": "Vae Victis",
  "authors": ["Beniamin Muszyński"],
  "language": "pl",
  "publisher": {
    "name": "Wydawnictwo Wielokrotnego Wyboru",
    "portal": "Masz Wybór",
    "website": "https://masz-wybor.com.pl/"
  },
  "officialPage": "https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/",
  "isbn": "978-83-951564-0-3",
  "cover": {
    "file": "grafiki/okladka.jpg",
    "illustrator": "Justyna Bzdoń"
  },
  "source": {
    "file": "Pliki/Vae-Victis-15-to-lecie-MW.epub",
    "sha256": "89547ec8e80e1bd4aa21eabd142bb90bdfdcec101aa6e92a123593c2d1581cd7",
    "downloadPage": "https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/"
  },
  "originals": [
    { "format": "PDF",  "url": "https://masz-wybor.com.pl/wp-content/uploads/2025/11/Vae-Victis-15-to-lecie-MW.pdf" },
    { "format": "EPUB", "url": "https://masz-wybor.com.pl/wp-content/uploads/2025/11/Vae-Victis-15-to-lecie-MW.epub" },
    { "format": "MOBI", "url": "https://masz-wybor.com.pl/wp-content/uploads/2025/11/Vae-Victis-15-to-lecie-MW.mobi" }
  ],
  "contentWarning": {
    "text": "Trigger warning: #Środki psychoaktywne",
    "source": "https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/",
    "checked": "2026-10-29"
  },
  "consent": {
    "document": "Pliki/Zgoda Vae Victis.pdf",
    "date": "2026-10-29"
  },
  "contentVersion": "1.0.0",
  "modules": ["codewords", "visits", "endings", "notes"],
  "startNode": "wprowadzenie"
}
```

- `originals` — odnośniki do oryginałów na stronie Wydawnictwa, wyświetlane w aplikacji (decyzja
  właściciela P2); adresy sprawdzone 2026-10-29 — weryfikować przy wdrożeniu.
- `contentWarning` — ostrzeżenie o treści **dosłownie** ze strony Wydawnictwa, wyświetlane na ekranie
  głównym przy karcie książki z informacją o źródle i odnośnikiem (decyzja właściciela P7).

Weryfikacja automatyczna: `title`, każdy z `authors`, `isbn` i `cover.illustrator` muszą występować
dosłownie w `stopka.json`; pliki `cover.file`, `source.file`, `consent.document` muszą istnieć;
`source.sha256` musi odpowiadać plikowi źródłowemu.

## 4. `tresc.json` — treść 1:1

```json
{
  "formatVersion": 1,
  "bookId": "vae-victis",
  "generator": { "script": "narzedzia/konwersja/<skrypt>", "version": "1.0.0" },
  "source": { "file": "Pliki/Vae-Victis-15-to-lecie-MW.epub", "sha256": "89547ec8…" },
  "order": ["okladka", "stopka", "wydawnictwo", "tytul", "dedykacja", "spis-tresci",
            "wprowadzenie", "prolog", "p1", "p2", "…"],
  "nodes": {
    "p1": {
      "kind": "paragraph",
      "label": "1",
      "chapter": "Ogień podsycany przeszłością",
      "sourceFile": "index_split_008.xhtml",
      "blocks": [
        { "type": "p", "inline": [
          { "text": "Mieszkałem z ojcem w Dobrym Adresie (" },
          { "link": { "id": "p1-l1", "to": "p22" }, "inline": [ { "text": "22" } ] },
          { "text": "), tak nazywała się wielka karczma, którą prowadził." }
        ] }
      ]
    }
  }
}
```

> Przykład jest **schematyczny** (skrócony fragment akapitu) — tylko ilustruje strukturę danych.
> Faktyczna zawartość powstaje wyłącznie ze skryptu i jest pełna.

### 4.1. Węzły (`nodes`)

| `kind` | Znaczenie | Przykładowe ID |
|---|---|---|
| `front` | strony wstępne: okładka, stopka, strona „od Wydawnictwa”, strona tytułowa, dedykacja, spis treści, wprowadzenie (zasady), prolog | `okladka`, `stopka`, `wydawnictwo`, `tytul`, `dedykacja`, `spis-tresci`, `wprowadzenie`, `prolog` |
| `paragraph` | numerowany paragraf | `p1` … `p372` |
| `part` | część paragrafu oznaczona literą (A, B, C) | `p9A`, `p91B` |
| `continuation` | dalszy ciąg paragrafu dostępny osobnym odnośnikiem (np. „Czytaj dalej ten paragraf.”) | `p98-2` |

Zasady identyfikatorów: wyłącznie `[A-Za-z0-9-]` — **bez kropek i ukośników** (są kluczami map w
Firestore, np. w `visits`). Identyfikatory są stabilne między wersjami treści.

Pola węzła: `kind`, `label` (tekst numeru/litery, jak w książce), `parent` (dla `part` i
`continuation`), `chapter` (tytuł rozdziału, jeśli węzeł go otwiera lub do niego należy),
`sourceFile` (plik w EPUB), `blocks`, opcjonalnie `ending` (pole pochodne — patrz 4.4).

### 4.2. Bloki (`blocks`)

| `type` | Pola | Uwagi |
|---|---|---|
| `p` | `inline`, opcjonalnie `align` (`left`/`center`/`right`/`justify`), `marks` | akapit |
| `heading` | `inline`, `level` | np. numer paragrafu z tytułem rozdziału |
| `list` | `ordered`, `items` (lista bloków) | np. lista publikacji na stronie „od Wydawnictwa” |
| `image` | `src` (`grafiki/…`), `alt` | okładka, logotypy w stopce |

### 4.3. Elementy w wierszu (`inline`)

| Element | Postać | Uwagi |
|---|---|---|
| tekst | `{ "text": "…", "marks": ["i", "b"] }` | `marks` opcjonalne: `i` kursywa, `b` pogrubienie |
| odnośnik wewnętrzny | `{ "link": { "id": "p1-l1", "to": "p22" }, "inline": [ … ] }` | `id` stabilny — używany przez mechanikę |
| odnośnik zewnętrzny | `{ "link": { "id": "…", "href": "https://…" }, "inline": [ … ] }` | otwierany w nowej karcie |
| grafika w wierszu | `{ "image": "grafiki/…", "alt": "" }` | |
| złamanie wiersza | `{ "br": true }` | |

Wierność: pola `text` zawierają znaki dokładnie tak, jak w pliku źródłowym; jedyna dopuszczalna
normalizacja to zwinięcie sekwencji białych znaków ASCII do jednej spacji (tak jak robi to HTML).
Twarde spacje, cudzysłowy „”, półpauzy, wielokropki itd. — bez zmian.

### 4.4. Pola pochodne (generowane automatycznie)

- `ending.title` — dla węzłów z formułą zakończenia („… To nosi tytuł: …”) skrypt zapisuje
  **dosłowny fragment** z tytułem zakończenia (do listy „Odkryte zakończenia”).
- `links` (indeks) — lista identyfikatorów odnośników węzła w kolejności występowania.
- `markers` — wykryte w tekście oznaczenia mechaniki (np. `(U#19)` z pozycją) — wyłącznie jako
  podpowiedź dla autora `mechanika.json` i dla walidatora.

## 5. `stopka.json` — stopka redakcyjna

Ten sam model bloków co w `tresc.json`, generowany z tego samego źródła (dla „Vae Victis”: plik
`index_split_001.xhtml`, od „Copyright ©…” do „ISBN …”, łącznie z logotypami). Osobny plik, żeby
ekran główny nie musiał wczytywać całej treści książki.

## 6. `mechanika.json` — warstwa mechaniki

```json
{
  "formatVersion": 1,
  "bookId": "vae-victis",
  "contentSha256": "<SHA-256 pliku tresc.json, dla którego przygotowano mechanikę>",
  "modules": {
    "codewords": { "label": "Informacje", "prefix": "#", "values": ["1", "2", "…", "43"] },
    "visits": {},
    "endings": {},
    "notes": {}
  },
  "startNode": "wprowadzenie",
  "nodes": {
    "p9":   { "links": { "p9-l1": { "if": { "visitsAtLeast": 2 } } } },
    "p91":  { "links": { "p91-l1": { "if": { "has": "18" } },
                         "p91-l2": { "if": { "notHas": "18" } } } },
    "pNN":  { "onEnter": [ { "gain": "19" } ] },
    "pMM":  { "links": { "pMM-l2": { "onChoose": [ { "gain": "17" } ] } } }
  }
}
```

> `pNN`/`pMM` to symbole zastępcze — rzeczywiste powiązania ustalamy w Etapie 3 na podstawie tekstu.

### 6.1. Warunki (`if`)

| Warunek | Moduł | Znaczenie |
|---|---|---|
| `{ "has": "18" }` / `{ "notHas": "18" }` | `codewords` | posiadanie / brak oznaczenia |
| `{ "all": [ … ] }`, `{ "any": [ … ] }`, `{ "not": { … } }` | rdzeń | łączenie warunków (np. „po jednej z Zestawu I oraz Zestawu II”) |
| `{ "visitsAtLeast": 2 }` | `visits` | liczba wejść w bieżący węzeł (np. „po raz kolejny”) |
| `{ "visited": "p12" }` | `visits` | czy węzeł był odwiedzony |
| `{ "stat": "hp", "op": "<=", "value": 0 }` | `stats` | porównanie statystyki |
| `{ "hasItem": "lina" }` | `inventory` | posiadanie przedmiotu |
| `{ "roll": "2k6", "op": "<=", "stat": "szczescie" }` | `dice` | test rzutem |

### 6.2. Efekty (`onEnter`, `onChoose`)

| Efekt | Moduł | Znaczenie |
|---|---|---|
| `{ "gain": "19" }` / `{ "lose": "19" }` | `codewords` | zdobycie / utrata oznaczenia |
| `{ "stat": "hp", "add": -2 }`, `{ "stat": "hp", "set": 10 }` | `stats` | zmiana statystyki |
| `{ "addItem": "lina", "qty": 1 }`, `{ "removeItem": "lina" }` | `inventory` | ekwipunek |
| `{ "counter": "zloto", "add": 5 }` | `counters` | liczniki |
| `{ "roll": "1k6", "as": "ostatniRzut" }` | `dice` | rzut z zapamiętaniem wyniku |

Nowe warunki i efekty dodajemy wraz z modułami, które je obsługują — zawsze z opisem w tym
dokumencie i testami.

### 6.3. Zasady

- `mechanika.json` **nie zawiera tekstu książki** (poza etykietami technicznymi, np. nazwą modułu
  „Informacje” użytą w zasadach gry).
- Każde oznaczenie mechaniki w tekście (np. `(U#n)`) musi mieć odpowiadający efekt — sprawdza to
  walidator.
- `contentSha256` wiąże mechanikę z konkretną wersją treści — zmiana treści wymaga przeglądu mechaniki.
- Gdy tekst nie rozstrzyga priorytetu między pasującymi opcjami — nie dodajemy priorytetu w
  mechanice (zasada neutralności, [LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md) rozdz. 5.3).

## 7. Wersjonowanie

- `formatVersion` — wersja formatu pliku (zmiana niezgodna wstecz → migracja w aplikacji).
- `contentVersion` (manifest) — wersja danych książki (treść + mechanika); zapisywana w stanie gracza,
  by zapisy można było migrować po poprawkach mechaniki.
