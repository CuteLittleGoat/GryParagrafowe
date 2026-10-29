# Konwersja publikacji do JSON i weryfikacja integralności

> Status: **procedura docelowa** — skrypty powstaną w Etapie 1 (`narzedzia/konwersja/`,
> `narzedzia/weryfikacja/`). Obowiązują zasady z [LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md),
> rozdz. 5: **żadnych zmian w treści**, tylko podział, przejścia i metadane mechaniki.

## 1. Zasady ogólne

1. **Źródło prawdy** = oryginalny plik od Wydawcy w `Pliki/` (dla „Vae Victis”:
   `Pliki/Vae-Victis-15-to-lecie-MW.epub`). Pliku źródłowego nie modyfikujemy.
2. Pliki treści (`tresc.json`, `stopka.json`) powstają **wyłącznie automatycznie** — skrypt jest
   deterministyczny (ten sam plik wejściowy → identyczny bajt po bajcie plik wyjściowy).
3. Każda zmiana plików treści przechodzi **weryfikację integralności** przed commitem.
4. Narzędzia: Python 3, **wyłącznie biblioteka standardowa** (`zipfile`, `html.parser`/`xml`,
   `hashlib`, `json`) — bez zewnętrznych zależności.
5. Wykryte błędy w treści (literówki, błędne odnośniki) **zgłaszamy**, nie poprawiamy.

## 2. Etapy konwersji EPUB → JSON

1. **Odczyt paczki**: `META-INF/container.xml` → plik OPF → kolejność `spine` (kolejność dokumentów
   w książce), `toc.ncx` (rozdziały), arkusze CSS.
2. **Suma kontrolna**: SHA-256 pliku źródłowego zapisywana w `tresc.json` i `ksiazka.json`.
3. **Parsowanie XHTML** każdego dokumentu w kolejności `spine`:
   - węzły tekstowe → elementy `text` (dekodowanie encji XML, zwinięcie białych znaków ASCII jak w
     HTML — nic więcej),
   - klasy CSS → znaczniki semantyczne na podstawie arkusza: `font-style: italic` → `i`,
     `font-weight: bold` → `b`, `text-align` → `align` bloku,
   - `<a href>` → odnośniki wewnętrzne (mapowanie `plik.xhtml#kotwica` → ID węzła) lub zewnętrzne,
   - `<img>` → bloki/elementy `image` (z kopiowaniem pliku grafiki),
   - `<ol>/<ul>/<li>` → bloki `list`.
4. **Granice węzłów**: każdy dokument XHTML w `spine` to jeden węzeł; rodzaj rozpoznawany po
   pierwszym wierszu (numer → `paragraph`, litera A/B/C → `part` z rodzicem = ostatni numerowany
   paragraf, brak nagłówka → `continuation`) oraz po pozycji (strony wstępne). Każdy przypadek
   niepasujący do reguł **zatrzymuje konwersję** z błędem (bez zgadywania).
5. **Rozdziały**: z `toc.ncx` / spisu treści — przypisanie tytułu rozdziału do węzła otwierającego.
6. **Pola pochodne**: indeks odnośników, wykryte oznaczenia mechaniki (np. `(U#n)`), tytuły zakończeń
   (dosłowne fragmenty) — patrz [FORMAT_KSIAZKI.md](FORMAT_KSIAZKI.md), rozdz. 4.4.
7. **Zapis**: `tresc.json`, `stopka.json` (UTF-8, LF, wcięcie 2 spacje, stała kolejność kluczy).
8. **Grafiki**: kopiowanie do `ksiazki/<id>/grafiki/` z czytelnymi nazwami (np. `okladka.jpg`,
   `logo-masz-wybor.png`); dozwolone wyłącznie proporcjonalne skalowanie i kompresja (Z6).

## 3. Weryfikacja integralności (obowiązkowa)

Skrypt w `narzedzia/weryfikacja/` kończy się błędem, jeśli którykolwiek warunek nie jest spełniony:

| # | Sprawdzenie |
|---|---|
| W1 | SHA-256 pliku źródłowego = wartość zapisana w `tresc.json` i `ksiazka.json` |
| W2 | ponowne uruchomienie konwersji daje **identyczny** `tresc.json` i `stopka.json` (determinizm) |
| W3 | **tekst zgodny 1:1**: pełny tekst wyciągnięty niezależną metodą z EPUB = tekst złożony z `tresc.json` (po tej samej, jedynej dopuszczalnej normalizacji białych znaków) |
| W4 | liczba węzłów zgodna z oczekiwaną (dla „Vae Victis”: 372 paragrafy, 35 części, 1 ciąg dalszy + strony wstępne) |
| W5 | każdy odnośnik wewnętrzny wskazuje istniejący węzeł; brak kotwic bez węzła |
| W6 | grafiki: każdy plik z treści istnieje; okładka ma podpis autorki w manifeście |
| W7 | `stopka.json` zawiera pełną stopkę (dla „Vae Victis”: od „Copyright ©” do „ISBN 978-83-951564-0-3”) |
| W8 | manifest: tytuł, autorzy, ISBN, autorka ilustracji występują dosłownie w stopce |

Walidacja mechaniki (`mechanika.json`) — osobny krok:

| # | Sprawdzenie |
|---|---|
| M1 | `contentSha256` = SHA-256 aktualnego `tresc.json` |
| M2 | wszystkie odwołania do węzłów i odnośników istnieją |
| M3 | każde oznaczenie mechaniki wykryte w tekście (np. `(U#n)`) ma odpowiadający efekt |
| M4 | składnia warunków i efektów zgodna z modułami włączonymi w książce |
| M5 | (informacyjnie) osiągalność: wszystkie węzły osiągalne ze startu, lista zakończeń |

W przyszłości: uruchamianie W1–W8 i M1–M5 automatycznie w GitHub Actions przy każdym pushu.

## 4. Przygotowanie mechaniki (półautomatyczne)

1. Skrypt generuje **szkic** `mechanika.json` z wykrytych wzorców tekstu, np.:
   - `(U#n)` w akapicie paragrafu → `onEnter: gain n`; przy linii dialogowej z odnośnikiem → `onChoose`,
   - wiersze „#n – X” / „Brak #n – Y” → warunki `has` / `notHas` na odnośnikach,
   - „Jeśli posiadasz Informację #n nie możesz wybrać tej opcji” → `notHas` na danym odnośniku,
   - „Jeśli jesteś w tym paragrafie po raz kolejny / po raz drugi…” → `visitsAtLeast: 2`,
   - zapisy złożone („#31 i #33”, „Brak #34 lub Brak #35”) → `all` / `any` / `notHas`,
   - zestawy Informacji (np. „Zestaw I”, „Zestaw II”) → `all`/`any`.
2. **Przegląd ręczny** każdego powiązania z tekstem (człowiek lub agent) — szkic nie jest wiarygodny
   sam w sobie.
3. Walidacja M1–M5 + scenariusze testowe (np. ścieżki do kilku zakończeń).

## 5. Checklista przed commitem plików książki

- [ ] Plik źródłowy nietknięty (W1).
- [ ] `tresc.json`/`stopka.json` wygenerowane skryptem, bez ręcznych poprawek (W2).
- [ ] Tekst zgodny 1:1 (W3), struktura i odnośniki poprawne (W4, W5).
- [ ] Pełna stopka (W7), metadane zgodne ze stopką (W8), okładka z podpisem autorki (W6).
- [ ] Mechanika zwalidowana (M1–M4), bez tekstu książki.
- [ ] Wykryte w treści błędy zgłoszone w `ksiazki/<id>/README.md` (a nie poprawione).
- [ ] Wpis w `PLAN_I_CHANGELOG.md`.
