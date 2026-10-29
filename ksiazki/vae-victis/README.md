# Vae Victis — karta książki

> Status w projekcie: **Etap 0** — przeanalizowano plik źródłowy; konwersja do JSON w Etapie 1.
> Zasady licencyjne: [`dokumentacja/LICENCJA_I_ZGODA.md`](../../dokumentacja/LICENCJA_I_ZGODA.md).

## 1. Status licencyjny

| | |
|---|---|
| Zgoda | ✅ Wydawca, 29.10.2026 — „na ten moment” |
| Dokument | [`Pliki/Zgoda Vae Victis.pdf`](../../Pliki/Zgoda%20Vae%20Victis.pdf) |
| Warunki | pełna stopka (od copyrightu po ISBN), wszystkie informacje o źródle, okładka **z informacją o autorce** (Justyna Bzdoń), bez grafik AI, projekt wewnętrzny i niekomercyjny, treść bez zmian |

## 2. Dane bibliograficzne (wg stopki EPUB)

| Pole | Wartość |
|---|---|
| Tytuł | Vae Victis |
| Autor | Beniamin Muszyński |
| Wydawca | Wydawnictwo Wielokrotnego Wyboru, działające w ramach portalu Masz Wybór |
| ISBN | 978-83-951564-0-3 |
| Okładka | Justyna Bzdoń („Grafiki: Justyna Bzdoń [okładka]”) |
| Strona publikacji | <https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/> |
| Strona Wydawnictwa | <https://masz-wybor.com.pl/> (w stopce: www.masz-wybor.com.pl) |

Informacje ze strony Wydawnictwa (stan na 29.10.2026, do wiadomości — **w aplikacji obowiązuje
stopka z EPUB**):
- „Objętość: 217 stron, 372 paragrafy” — zgodne z analizą pliku (372 paragrafy).
- „Wydanie I || 978-83-951564-0-3 || 2019” — stopka EPUB podaje: „Copyright © by Beniamin
  Muszyński, 2018.”, „Copyright © for this edition by Masz Wybór, 2025.” i „Wydanie (poprawione)”.
- Wersje do pobrania: PDF, EPUB, MOBI (pliki `Vae-Victis-15-to-lecie-MW.*` na stronie publikacji).
- **Errata** „do wersji sprzed 24 listopada 2025”: paragraf 2 powinien prowadzić do 23, nie do 10.
  ✅ W pliku w repozytorium §2 prowadzi do §23 — to wersja poprawiona.
- Strona Wydawnictwa podaje ostrzeżenie o treści („Trigger warning: #Środki psychoaktywne”) —
  czy pokazywać je w aplikacji: decyzja właściciela (patrz LICENCJA_I_ZGODA.md, rozdz. 9).

## 3. Plik źródłowy

| | |
|---|---|
| Plik | `Pliki/Vae-Victis-15-to-lecie-MW.epub` |
| SHA-256 | `89547ec8e80e1bd4aa21eabd142bb90bdfdcec101aa6e92a123593c2d1581cd7` |
| Format | EPUB 2.0 (wygenerowany w calibre 8.3.0), język `pl` |
| Zawartość | `titlepage.xhtml` + 416 dokumentów `index_split_000…415.xhtml` w `spine`, 4 grafiki, `stylesheet.css`, `toc.ncx` |

## 4. Struktura publikacji

| Dokument(y) | Zawartość | Proponowane ID węzła |
|---|---|---|
| `titlepage.xhtml`, `index_split_000` | okładka (obie strony pokazują tę samą grafikę) | `okladka` |
| `index_split_001` | **stopka redakcyjna** (Copyright … ISBN) | `stopka` |
| `index_split_002` | strona „od Wydawnictwa”: lista publikacji, zachęta do wsparcia (Patronite) | `wydawnictwo` |
| `index_split_003` | strona tytułowa (autor, tytuł) | `tytul` |
| `index_split_004` | dedykacja | `dedykacja` |
| `index_split_005` | spis treści | `spis-tresci` |
| `index_split_006` | Wprowadzenie (zasady gry) — kończy się odnośnikiem do Prologu | `wprowadzenie` (**start**) |
| `index_split_007` | Prolog — kończy się odnośnikiem do §1 | `prolog` |
| `index_split_008…415` | 408 dokumentów: 372 paragrafy + 35 części + 1 ciąg dalszy | `p1`…`p372`, `p9A`…, `p98-2` |

**Rozdziały** (wg spisu treści): „Ogień podsycany przeszłością” (od §1), „Vae Victis” (od §108),
„Ubi concordia, ibi victoria” (od §222), „Terra incognita” (od §296). Numer paragrafu otwierającego
rozdział i tytuł rozdziału są w tym samym wierszu (np. „1 Ogień podsycany przeszłością”).

**Części paragrafów (35)** — rodzic = ostatni numerowany paragraf przed częścią:
9A, 37A, 37B, 79A, 87A, 87B, 91A, 91B, 91C, 111A, 118A, 135A, 161A, 170A, 170B, 177A, 177B, 188A,
221A, 221B, 224A, 253A, 253B, 258A, 258B, 260A, 261A, 273A, 273B, 273C, 308A, 321A, 341A, 341B, 341C.

**Ciąg dalszy (1)**: §98 kończy się rozgałęzieniem „#7 – 90 / Brak #7 – Czytaj dalej ten paragraf.”;
dalszy ciąg jest osobnym dokumentem bez nagłówka (`index_split_115`) → węzeł `p98-2`.

## 5. Mechanika (wg „Wprowadzenia” i analizy tekstu)

- **Brak** kości, statystyk, walki i ekwipunku. Wprowadzenie zaleca tylko: „uzbrój się w kawałek
  kartki i coś do pisania”.
- **Informacje** — zapis `(U#n)` oznacza zdobycie Informacji nr n:
  - przy wejściu do paragrafu (oznaczenie w treści paragrafu) albo
  - przy wybraniu konkretnej linii dialogowej (oznaczenie przy tej linii, obok odnośnika).
  - W tekście występują Informacje **#1–#43** (48 oznaczeń `(U#n)` w paragrafach; część Informacji
    można zdobyć w dwóch miejscach) — Wprowadzenie wspomina też o oznaczeniach literowych, ale w
    tekście ich nie znaleziono.
- **Warunki** w tekście:
  - rozgałęzienia zależne od Informacji: 81 wierszy w 39 węzłach (49 typu „#n – X”, 32 typu
    „Brak #n – Y”), w tym złożone: „#31 i #33”, „#34 lub #35”, „Brak #34 lub Brak #35”,
    „Brak #42 lub #43”,
  - zestawy: „Jak posiadasz przynajmniej po jednej z wymienionych poniżej Informacji jednocześnie z
    Zestawu I oraz Zestawu II…” (Zestaw I: #9, #10; Zestaw II: #12, #13),
  - blokada opcji: „(Jeśli posiadasz Informację #25 nie możesz wybrać tej opcji)”,
  - tabele wielu warunków (np. §161: #30, #31, #32, „#31 i #33”, „#11 (lub nieposiadanie żadnej z
    powyższych Informacji)”) — **tekst nie określa priorytetu** przy kilku pasujących wierszach →
    zasada neutralności (wybiera gracz),
  - ponowna wizyta (4 wystąpienia) → licznik odwiedzin: „[Jeśli jesteś w tym paragrafie po raz
    kolejny przejdź do cześci A]” (§9) oraz 3× „[Jeśli jesteś w tym paragrafie po raz drugi
    przejdź od razu do 335]” (raz z przecinkiem po „drugi”).
- **Zakończenia**: 21 fragmentów z formułą „Ukończyłeś grę książkową Vae Victis zdobywając jedno z
  zakończeń. To nosi tytuł: …” — 20 różnych tytułów („Twego trudu nastał kres.” występuje dwukrotnie).
- **Odnośniki zewnętrzne w treści**: strona Wydawnictwa i adresy e-mail (stopka), Patronite
  Wydawnictwa (strona „od Wydawnictwa”), odesłanie do gry „Jestem” na stronie Masz Wybór (jedno z
  zakończeń) — pozostają linkami zewnętrznymi; **„Jestem” nie jest objęte zgodą**.
- **Moduły aplikacji**: `codewords` (etykieta „Informacje”), `visits`, `endings`, `notes`.
  Bez `stats`, `dice`, `inventory`, `combat`.

## 6. Grafiki w EPUB

| Plik w EPUB | Wymiary | Zawartość | Użycie w aplikacji |
|---|---|---|---|
| `Pictures/10000000000005070000071E70297E9C.png` | 1287×1822 | okładka (autorka: Justyna Bzdoń) | karta książki, „O książce” — **zawsze z podpisem** |
| `Pictures/1000000100000941000002720F40A7B3.png` | 2369×626 | logo Masz Wybór | tylko w stopce |
| `Pictures/10000000000005D3000005095A2B5BD5.jpg` | 1491×1289 | logo Wydawnictwa Wielokrotnego Wyboru | tylko w stopce |
| `Pictures/1000000100000AA300000396016F193A.png` | 2723×918 | logo Patronite | tylko na stronie „od Wydawnictwa” |

Okładka ma 3,5 MB — do aplikacji trafi wersja przeskalowana/skompresowana (bez innych zmian, Z6).

## 7. Stopka redakcyjna — podgląd

Wyciąg automatyczny z `index_split_001.xhtml` (kolejność jak w pliku; twarde spacje na końcach
wierszy pominięte w podglądzie). **Źródłem prawdy jest plik EPUB i generowany `stopka.json`** —
tego podglądu nie używamy jako danych.

```text
Copyright © by Beniamin Muszyński, 2018.
Copyright © for this edition by Masz Wybór, 2025.

Autor: Beniamin Muszyński
Tytuł: Vae Victis
Grafiki: Justyna Bzdoń [okładka]
Korekta: Magdalena Górecka, Michał Ślużyński
Redaktor techniczny: Beniamin Muszyński (wersja PDF, MOBI, EPUB)
Testy: Mateusz Motyka, Michał Rosiński, Michał Ślużyński

W niniejszej publikacji wykorzystano czcionkę Old Standard zaprojektowaną przez Alexeya Kryukova. Czcionka użyta zgodnie z Open Source Licensee.

LICENCJA
Uwaga! Niniejsza publikacja nie może być rozpowszechniana, adaptowana, modyfikowana ani odsprzedawana bez pisemnej zgody Wydawcy. Dozwolone jest jej kopiowanie oraz dystrybucja bezpłatna na własny użytek.

WYDAWCA
Wydawnictwo Wielokrotnego Wyboru działające w ramach portalu Masz Wybór.
Redaktor Naczelny portalu Masz Wybór: Beniamin Muszyński
Adres korespondencyjny: ul. Agatowa 18/12, 30-798, Kraków
Poczta elektroniczna: magazyn.masz.wybor@gmail.com, wydawnictwo@wydawnictwoww.pl
Witryna internetowa: www.masz-wybor.com.pl
[grafika: logo Masz Wybór]
Logo Masz Wybór:
Logo Wydawnictwo Wielokrotnego Wyboru:
[grafika: logo Wydawnictwa Wielokrotnego Wyboru]

Wydanie (poprawione):
ISBN 978-83-951564-0-3
```

## 8. Pułapki konwersji (wykryte podczas analizy)

1. **Zagnieżdżone `<div>` w stopce**: tekst „Logo Masz Wybór:” stoi w tym samym bloku zewnętrznym
   co grafika, ale **po** zagnieżdżonym bloku z grafiką — naiwny parser go gubi (sprawdzone).
2. Formatowanie zapisane klasami CSS (`s-t…`, `p-p…`) — kursywa/pogrubienie/wyrównanie trzeba
   odczytać z `stylesheet.css`; np. podpis autora pod zakończeniami jest wyrównany do prawej.
3. Liczne **twarde spacje** (U+00A0), m.in. na końcach wierszy stopki — zachować.
4. Numer paragrafu i tytuł rozdziału w jednym wierszu (§1, §108, §222, §296).
5. Odnośniki „część A tego paragrafu”, „A”, „C”, „Czytaj dalej ten paragraf.” — prowadzą do części
   i ciągu dalszego; spis NCX zawiera też wpis „cześci A” (pisownia oryginalna).
6. Oznaczenia `(U#n)` stoją tuż przed odnośnikiem linii dialogowej — np. dwie linie dialogowe
   kończą się „(U#19)(54)” i „(U#17)(54)”: prowadzą do tego samego §54, ale dają różne Informacje.
   Efekt musi być więc przypięty do **odnośnika**, a nie do paragrafu docelowego.
7. Zapisy warunków bywają niejednoznaczne przy czytaniu dosłownym: §170 ma wiersze „#34 lub #35 –
   część B tego paragrafu” i „Brak #34 lub Brak #35 – część A tego paragrafu” — przy posiadaniu
   tylko jednej z tych Informacji pasują oba; podobnie §286 („#42 albo #43 – 277”, „Brak #42 lub
   #43 – 245”) i §289 („#42 albo #43 – 291”, „Brak #42 lub Brak #43 – 285”). Interpretację w
   `mechanika.json` trzeba świadomie ustalić i opisać; w razie wątpliwości opcji nie blokujemy
   (zasada neutralności), a przypadek zgłaszamy właścicielowi.
8. Uwagi autora w nawiasach kwadratowych nie zawsze są warunkami (np. „[Decyduj! Chcesz odczytać
   przygotowaną przeze mnie wizję (33), czy też…”) — to zwykły tekst z odnośnikiem.
9. Literówki i błędy oryginału **zostają bez zmian** (np. „cześci A” w §9, „Open Source Licensee” w
   stopce, „Po po kolejnym okresie” w jednym z paragrafów).

## 9. Wykryte błędy w treści (do zgłoszenia, NIE do poprawiania)

Brak zgłoszeń. (Literówki z pkt 8.9 nie wymagają zgłaszania — to wierne odwzorowanie oryginału.)
