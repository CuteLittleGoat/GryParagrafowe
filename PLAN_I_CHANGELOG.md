# Plan prac i changelog

> **Jak korzystać z tego pliku:** to punkt wznowienia pracy. Na początku każdej sesji przeczytaj
> „Stan bieżący” i „Następne kroki”; na końcu zaktualizuj stan, odhacz wykonane punkty planu i dodaj
> wpis w changelogu. Decyzje zapisuj w „Decyzjach”, wątpliwości — w „Otwartych pytaniach”.

**Ostatnia aktualizacja:** 2026-11-01

## 1. Stan bieżący

| | |
|---|---|
| Etap | **0 — Fundamenty: zakończony** (struktura repozytorium + dokumentacja) |
| Aplikacja | jeszcze nie istnieje |
| Książki | „Vae Victis” — zgoda ✅, plik źródłowy przeanalizowany, konwersja nierozpoczęta |
| Firebase | projekt **`gryparagrafowe-e1fb3`** utworzony przez właściciela (2026-10-29); konfiguracja webowa w `firebase/firebase-config.js`; reguły w konsoli tymczasowo blokują cały dostęp; logowanie, App Check i reguły docelowe — Etap 5 ([dokumentacja/FIREBASE.md](dokumentacja/FIREBASE.md)) |
| Instrukcje agentów | nowa treść `AGENTS.md` (zasady tworzenia analiz, zakaz modyfikacji `AGENTS.md` i `CLAUDE.md`) przekazana właścicielowi w czacie 2026-11-01 — **do podmiany przez właściciela** |
| Pytania do Wydawcy | [`Analizy/Pytania_Do_Wydawcy_2026-10-29.md`](Analizy/Pytania_Do_Wydawcy_2026-10-29.md) — PW1 (zmiana kroju pisma) i PW2 (ustawienia wyświetlania) przygotowane, **niewysłane** |
| Blokery | brak |

## 2. Następne kroki

1. **Właściciel**: podmienić `AGENTS.md` na nową treść przekazaną w czacie (2026-11-01) — agenci
   nie modyfikują tego pliku.
2. **Właściciel**: odpowiedzi na pytania P4, P6, P8 i P9 (rozdz. 5.1 — zapisane prostym językiem).
   Nie blokują Etapu 1.
3. **Właściciel**: wysłać Wydawcy pytania PW1–PW2 (szkic wiadomości w
   [`Analizy/Pytania_Do_Wydawcy_2026-10-29.md`](Analizy/Pytania_Do_Wydawcy_2026-10-29.md));
   najlepiej przed Etapem 2 (wyświetlanie tekstu).
4. **Etap 1**: skrypt konwersji EPUB → `tresc.json` + `stopka.json` i weryfikacja integralności
   (W1–W8) — wg [dokumentacja/KONWERSJA.md](dokumentacja/KONWERSJA.md) i karty
   [ksiazki/vae-victis/README.md](ksiazki/vae-victis/README.md) (pułapki konwersji, rozdz. 8).

## 3. Plan prac (etapy)

### Etap 0 — Fundamenty ✅ (2026-10-29)
- [x] Analiza zgody Wydawcy (PDF) i sekcji „LICENCJA” w publikacji
- [x] Analiza pliku EPUB „Vae Victis” (struktura, mechanika, stopka, grafiki) i strony publikacji
- [x] Struktura katalogów z `.gitkeep`, usunięcie `Placeholder.md`, `.gitignore`
- [x] Dokumentacja: LICENCJA_I_ZGODA, ARCHITEKTURA, FIREBASE, FORMAT_KSIAZKI, KONWERSJA, karta „Vae Victis”
- [x] `AGENTS.md`, `CLAUDE.md`, `README.md`, ten plik
- [x] Folder `Analizy/` na raporty z analiz (2026-10-29)

### Etap 1 — Konwersja „Vae Victis” do JSON
- [ ] Skrypt `narzedzia/konwersja/` (Python 3, biblioteka standardowa): EPUB → `tresc.json`, `stopka.json`
- [ ] Mapowanie klas CSS → kursywa / pogrubienie / wyrównanie; zachowanie twardych spacji
- [ ] Węzły: strony wstępne, 372 paragrafy, 35 części (A/B/C), ciąg dalszy §98 (`p98-2`)
- [ ] Odnośniki wewnętrzne i zewnętrzne ze stabilnymi identyfikatorami
- [ ] Pola pochodne: oznaczenia `(U#n)`, tytuły zakończeń (dosłowne fragmenty)
- [ ] Grafiki → `ksiazki/vae-victis/grafiki/` (okładka przeskalowana bez innych zmian, logotypy ze stopki)
- [ ] `ksiazki/vae-victis/ksiazka.json` (manifest) i `ksiazki/katalog.json`
- [ ] Weryfikacja W1–W8 (`narzedzia/weryfikacja/`)
- [ ] Aktualizacja karty książki (wyniki, ewentualne zgłoszenia błędów w treści)

### Etap 2 — Szkielet aplikacji i czytnik
- [ ] `index.html`, style (motyw jasny/ciemny, mobile-first), router ekranów
- [ ] Ekran główny: logowanie (lokalny adapter — tylko rozwój), katalog, karta książki (okładka z podpisem autorki, atrybucja, linki, **odnośniki do oryginałów** na stronie Wydawnictwa — P2), **ostrzeżenie o treści ze strony Wydawnictwa** (P7), **pełna stopka**, stopka aplikacji
- [ ] Ekran gry: węzeł 1:1, klikalne odnośniki w tekście, panel przejść, „Menu główne”
- [ ] „O książce”: strony wstępne, stopka, okładka z podpisem, linki, informacja o zgodzie
- [ ] Tekst: krój jak w oryginale (Old Standard TT, z plikiem licencji OFL), **dwa przyciski zmiany rozmiaru tekstu** (P11); motyw jasny/ciemny
- [ ] Autozapis lokalny (`LocalAdapter`), kilku graczy lokalnie (tryb deweloperski)
- [ ] Przegląd zgodności z checklistą [LICENCJA_I_ZGODA.md](dokumentacja/LICENCJA_I_ZGODA.md), rozdz. 6

### Etap 3 — Silnik mechaniki i „Vae Victis”
- [ ] Silnik: warunki, efekty, odwiedziny, zakończenia; tryb automatyczny i ręczny; zasada neutralności
- [ ] Moduły: `codewords` („Informacje”), `visits`, `endings`, `notes`
- [ ] Karta postaci (Informacje + ręczna edycja), notatki, historia, „Odkryte zakończenia”
- [ ] Przycisk **„Cofnij”** — krok po kroku, do początku bieżącej rozgrywki — z dopiskiem „To Twoja gra :) Graj jak lubisz!” (P5)
- [ ] `ksiazki/vae-victis/mechanika.json` — szkic automatyczny + przegląd ręczny każdego powiązania
- [ ] Walidacja M1–M5; decyzja w sprawie niejednoznacznych warunków (P8)
- [ ] Sloty zapisu (lokalnie)
- [ ] Testy jednostkowe silnika (`node --test`) i scenariusze ręczne (§9, §91, §98, §161, zakończenia)

### Etap 4 — Moduły ogólne (dla kolejnych książek)
- [ ] `stats` — statystyki (np. HP/Wytrzymałość) z wartościami początkowymi i limitami
- [ ] `dice` — wyrażenia `XkY+Z`, animacja (CSS/SVG w kodzie, bez grafik AI), historia rzutów, testy
- [ ] `inventory`, `counters`, `combat` — wg potrzeb przyszłych książek
- [ ] Mechanizm `custom` (logika specyficzna dla książki)
- [ ] Fikcyjna książka testowa (**własna treść**) w `testy/dane/` do testów modułów

### Etap 5 — Firebase: konta i zapis postępu
- [x] Porównanie z instrukcją App Check z projektu „Karty” (P1) — wnioski w FIREBASE.md, rozdz. 7 (2026-10-29)
- [x] Projekt Firebase `gryparagrafowe-e1fb3`, konfiguracja webowa w `firebase/firebase-config.js`, Firestore z tymczasowymi regułami blokującymi cały dostęp — właściciel, 2026-10-29
- [ ] Authentication — dostawca anonimowy; odnotowanie regionu bazy w FIREBASE.md
- [ ] Format `firebase/firebase-config.js` i pole klucza App Check (P13)
- [ ] `firebase/firestore.rules` + testy reguł w emulatorze (wszystkie role i przypadki brzegowe)
- [ ] App Check wg FIREBASE.md, rozdz. 7.2 (reCAPTCHA Enterprise, TTL 1 dzień, obserwacja → Enforce); opcjonalnie ograniczenia klucza API
- [ ] `FirestoreAdapter`: logowanie hasłem (sesje), profil, autozapis z kontrolą `revision`, sloty, pamięć offline
- [ ] Konta 6 graczy + uprawnienia administratora (procedury z FIREBASE.md, rozdz. 9)

### Etap 6 — Kopie zapasowe i odtwarzanie
- [ ] Panel administratora (lista graczy, ostatnia aktywność)
- [ ] Backup wszystkich / jednego gracza (JSON — bez haseł i bez treści książek)
- [ ] Eksport własnego postępu przez gracza
- [ ] Odtwarzanie gracza z pliku: walidacja, podgląd, tryb „Zastąp”, potwierdzenie, raport
- [ ] Test „backup → odtworzenie → porównanie” dla każdego gracza

### Etap 7 — Jakość i wdrożenie
- [ ] Dostępność (klawiatura, ARIA, kontrast), testy na telefonach
- [ ] CI (GitHub Actions): weryfikacja treści i mechaniki, testy
- [ ] Hosting: **GitHub Pages** (P3) — publikacja dopiero z działającym logowaniem; nagłówek CSP
- [ ] Instrukcje dla graczy i dla administratora
- [ ] Opcjonalnie: zmiana kroju pisma przez gracza (np. krój przyjazny dla osób z dysleksją — licencja kroju do sprawdzenia) — **tylko po zgodzie Wydawcy** (pytanie PW1) (P11)
- [ ] Opcjonalnie: testy E2E (Playwright), PWA / tryb offline

### Etap 8+ — Kolejne książki
- [ ] **Właściciel**: po ukończeniu „Vae Victis” i przygotowaniu kont dla 6 graczy — prośba do Wydawcy o kolejne tytuły i informacja o planie zwiększenia liczby graczy (P12)
- [ ] Wyłącznie po pisemnej zgodzie Wydawcy — procedura: [LICENCJA_I_ZGODA.md](dokumentacja/LICENCJA_I_ZGODA.md), rozdz. 7

## 4. Decyzje projektowe

| # | Data | Decyzja | Uzasadnienie |
|---|---|---|---|
| D1 | 2026-10-29 | Statyczna aplikacja: HTML + CSS + JavaScript (moduły ES), bez frameworków i bundlera | prostota, hosting statyczny, łatwe utrzymanie |
| D2 | 2026-10-29 | Treść książek w repozytorium (JSON), nie w Firebase | zgodnie z opisem projektu przedstawionym Wydawcy; wersjonowanie i weryfikowalność |
| D3 | 2026-10-29 | Trzy warstwy: treść (generowana 1:1) / mechanika (metadane bez tekstu) / stan gracza | nienaruszalność tekstu możliwa do sprawdzenia automatycznie |
| D4 | 2026-10-29 | Mechanika modułowa deklarowana przez każdą książkę | książki mają różne wymagania (nie każda ma HP czy ekwipunek) |
| D5 | 2026-10-29 | Firestore: `players/{id}/books/{bookId}/saves/{slot}` + `secrets`, `admins`, `sessions` | wielu graczy i książek; hasła poza zakresem backupu |
| D6 | 2026-10-29 | Logowanie: Auth anonimowy + dokument sesji weryfikowany w regułach z `PlayerPassword` (plan Spark) | ręczna zmiana hasła w konsoli, brak kosztów, natychmiastowe unieważnianie sesji |
| D7 | 2026-10-29 | Ochrona przed dostępem spoza aplikacji: App Check (wymuszony) + reguły + sesje | wymóg właściciela; podejście potwierdzone instrukcją App Check z projektu „Karty” |
| D8 | 2026-10-29 | Do czasu wdrożenia Firebase: `LocalAdapter` (localStorage) z tym samym interfejsem | Firebase w późniejszym etapie |
| D9 | 2026-10-29 | Narzędzia: Python 3 (biblioteka standardowa); testy silnika: `node --test` | brak zewnętrznych zależności |
| D10 | 2026-10-29 | Katalogi po polsku (bez diakrytyków), kod i Firebase po angielsku; wyjątek `PlayerPassword` | czytelność dla właściciela + konwencje JS |
| D11 | 2026-10-29 | Gra tylko po zalogowaniu; publikacja strony dopiero z działającym logowaniem | „wąskie grono”, „projekt wewnętrzny” |
| D12 | 2026-10-29 | Neutralność silnika + tryb ręczny „jak na papierze” | brak ingerencji w zasady gry |
| D13 | 2026-10-29 | Projekt Firebase `gryparagrafowe-e1fb3`; konfiguracja webowa w `firebase/firebase-config.js` (decyzja właściciela) | plik jest jawny; zmienia go właściciel |
| D14 | 2026-10-29 | App Check: reCAPTCHA Enterprise (plan Spark), domena `cutelittlegoat.github.io`, TTL 1 dzień, obserwacja → *Enforce*, hamulec *Unenforce* | doświadczenia z projektu „Karty” |
| D15 | 2026-10-29 | Raporty z analiz w folderze `Analizy/`, wg zasad z `AGENTS.md` | wymóg właściciela (jak w innym projekcie) |
| D16 | 2026-10-29 | `AGENTS.md` i `CLAUDE.md` zmienia wyłącznie właściciel; agenci proponują pełną treść w bloku kodu w czacie | wymóg właściciela |
| D17 | 2026-10-29 | Oryginalny EPUB zostaje w repozytorium; w aplikacji odnośniki do oryginałów na stronie Wydawnictwa | decyzja właściciela (P2) |
| D18 | 2026-10-29 | Hosting: GitHub Pages | decyzja właściciela (P3) |
| D19 | 2026-10-29 | Przycisk „Cofnij” (krok po kroku) z dopiskiem „To Twoja gra :) Graj jak lubisz!” | decyzja właściciela (P5) |
| D20 | 2026-10-29 | Ostrzeżenie o treści ze strony Wydawnictwa — na ekranie głównym przy książce, dosłownie i z informacją o źródle | decyzja właściciela (P7) |
| D21 | 2026-10-29 | Odtwarzanie danych gracza z kopii zapasowej — tylko administrator | decyzja właściciela (P10) |
| D22 | 2026-10-29 | Krój pisma jak w oryginale (Old Standard TT); dwa przyciski rozmiaru tekstu; wybór innego kroju (np. dla osób z dysleksją) — dopiero po zgodzie Wydawcy (pytanie PW1) | decyzja właściciela (P11) |
| D24 | 2026-10-29 | Pytania do Wydawcy zbieramy w `Analizy/Pytania_Do_Wydawcy_2026-10-29.md` (plik uzupełniany na bieżąco; o wysłaniu decyduje właściciel) | wymóg właściciela |
| D23 | 2026-10-29 | Pytania do właściciela — prostym językiem: bez żargonu, z przykładem, wariantami i rekomendacją | wymóg właściciela |

## 5. Otwarte pytania

> Pytania do właściciela piszemy **prostym językiem**, zrozumiałym bez wiedzy informatycznej: bez
> żargonu, z przykładem, z wariantami do wyboru i rekomendacją (wymóg właściciela, 2026-10-29).

### 5.1. Czekają na odpowiedź

| # | Pytanie | Warianty (★ = rekomendacja) |
|---|---|---|
| P4 | **Jak gracz ma się logować?** (doprecyzowanie odpowiedzi z 2026-10-29: „wpisywany login”) | ★ A) dwa pola: login (np. „ania”) i hasło — jak na większości stron; B) jedno pole: tajny kod, jak PIN — aplikacja sama rozpozna gracza; prościej, ale każdy kod musi być inny i trudny do zgadnięcia (kto zgadnie cudzy kod, zagra jako ta osoba) |
| P6 | **a) Ręczne zapisy.** Gra zapisuje się sama po każdym ruchu, a „Cofnij” pozwala wracać. Czy gracz ma mieć dodatkowo miejsca na ręczny zapis „na boku” (np. przed ważną decyzją, żeby wrócić tam nawet po wielu ruchach)? Ile takich miejsc w jednej książce? **b) Pamiętanie logowania.** Jak długo aplikacja ma pamiętać zalogowanie na danym telefonie lub komputerze, żeby nie trzeba było za każdym razem wpisywać hasła? | a) ★ tak, 3 miejsca; b) ★ 30 dni — gracz może się wylogować sam, a zmiana hasła przez administratora wylogowuje od razu |
| P8 | **Niejasne wskazówki w trzech paragrafach** (§170, §286, §289). Przy dosłownym czytaniu gracz pasuje do dwóch dróg naraz. Przykład z §170: „Brak #34 lub Brak #35 – część A tego paragrafu” oraz „#34 lub #35 – część B tego paragrafu” — kto ma tylko Informację #34, pasuje do obu linijek. Co ma zrobić aplikacja? (Tekst książki zawsze zostaje bez zmian.) | ★ A) pokazać obie drogi jako dostępne — wybiera gracz; B) podpowiadać jedną, najbardziej prawdopodobną drogę (tu: masz którąkolwiek z tych Informacji → część B, nie masz żadnej → część A); C) zapytać autora i zrobić tak, jak wyjaśni |
| P9 | **„Nowa gra” a notatki.** Gdy gracz zaczyna książkę od nowa, aplikacja czyści jego postęp: miejsce w książce, zebrane Informacje i historię ruchów. Lista odkrytych zakończeń zostaje. Co z notatkami, które gracz sam sobie zapisał (jak na kartce)? | ★ A) zostają; B) są czyszczone razem z postępem; C) aplikacja za każdym razem pyta gracza |
| P13 | **Plik z ustawieniami Firebase** (będzie potrzebne w Etapie 5). Trzeba będzie dopisać do niego jeden dodatkowy klucz zabezpieczenia (App Check) — jest jawny, to nie hasło. Czy agent może wtedy sam zmienić ten plik, czy wolisz zrobić to ręcznie według instrukcji? | odpowiedź potrzebna dopiero przed Etapem 5 |

### 5.2. Rozstrzygnięte

| # | Pytanie | Odpowiedź właściciela (2026-10-29) |
|---|---|---|
| P1 | Analiza zabezpieczeń z innego projektu | dostarczona (instrukcja App Check z projektu „Karty”); wnioski w FIREBASE.md, rozdz. 7 |
| P2 | Czy oryginalny EPUB zostaje w repozytorium? | **zostaje**; w aplikacji będą odnośniki do oryginałów na stronie Wydawnictwa |
| P3 | Gdzie publikujemy stronę? | **GitHub Pages** |
| P5 | Czy można cofać ruchy? | **tak** — przycisk „Cofnij” z dopiskiem w stylu „To Twoja gra :) Graj jak lubisz!” |
| P7 | Czy pokazywać ostrzeżenie o treści ze strony Wydawnictwa? | **tak** — na ekranie głównym, tam gdzie gracze wybierają książki |
| P10 | Kto może odtwarzać dane gracza z kopii zapasowej? | **tylko administrator** |
| P11 | Krój pisma | **jak w oryginale** (Old Standard TT); **dwa przyciski zmiany rozmiaru tekstu**; później do rozważenia zmiana kroju (np. na przyjazny dla osób z dysleksją) — najpierw pytanie do Wydawcy (PW1) |
| P12 | 6 graczy wobec „ok. 5 osób” w prośbie do Wydawcy | po ukończeniu pierwszej książki i przygotowaniu kont dla 6 graczy właściciel poprosi Wydawcę o kolejne tytuły i poinformuje o planie zwiększenia liczby graczy |

## 6. Changelog

Najnowsze wpisy na górze. Kategorie: Dodano / Zmieniono / Usunięto / Naprawiono.

### 2026-11-01 — Firebase: projekt i konfiguracja; zasady analiz; odpowiedzi właściciela

**Dodano**
- (właściciel) `firebase/firebase-config.js` — konfiguracja webowa projektu `gryparagrafowe-e1fb3`;
  w konsoli tymczasowe reguły Firestore blokujące cały dostęp.
- Folder `Analizy/` (z `.gitkeep`) na raporty z analiz.
- `Analizy/Pytania_Do_Wydawcy_2026-10-29.md` — rejestr pytań do Wydawcy (PW1: zmiana kroju pisma,
  PW2: ustawienia wyświetlania), szkic wiadomości, propozycje kolejnych pytań (K1–K4).
- Odpowiedzi właściciela na pytania P1–P12 → decyzje D17–D24; pytania P4, P6, P8, P9 i P13
  przeformułowane prostym językiem.

**Zmieniono**
- `dokumentacja/FIREBASE.md`: stan projektu Firebase, reguły tymczasowe, App Check wg instrukcji z
  projektu „Karty” (reCAPTCHA Enterprise na planie Spark, TTL 1 dzień, kroki wdrożenia), status
  kroków konfiguracji, lokalizacja konfiguracji.
- `dokumentacja/LICENCJA_I_ZGODA.md`: rozdz. 9 — rozstrzygnięcia właściciela (EPUB zostaje,
  ostrzeżenie o treści na ekranie głównym, plan rozmowy z Wydawcą o kolejnych tytułach i liczbie
  graczy); krój pisma tylko oryginalny do czasu zgody Wydawcy (rozdz. 5.1); checklista rozdz. 6.
- `dokumentacja/ARCHITEKTURA.md`, `FIREBASE.md`, `FORMAT_KSIAZKI.md`, karta „Vae Victis”: przycisk
  „Cofnij”, przyciski wielkości liter, ostrzeżenie o treści, odnośniki do oryginałów, GitHub Pages.
- `README.md`: struktura repozytorium (`Analizy/`, opis `firebase/`).
- Ten plik: stan bieżący, następne kroki, Etap 5, decyzje D13–D16, P1 rozwiązane, nowe P13.
- Nowa treść `AGENTS.md` (zasady tworzenia analiz, zakaz modyfikacji `AGENTS.md` i `CLAUDE.md`)
  przekazana właścicielowi w czacie — plik w repozytorium podmienia właściciel.

### 2026-10-29 — Etap 0: struktura repozytorium i dokumentacja

**Dodano**
- Strukturę katalogów: `dokumentacja/`, `aplikacja/` (`css/`, `js/core|modules|ui|data|utils/`,
  `assets/icons|fonts/`), `ksiazki/vae-victis/grafiki/`, `firebase/`, `narzedzia/konwersja|weryfikacja/`,
  `testy/dane/` — w każdym katalogu (także `Pliki/`) plik `.gitkeep`.
- `AGENTS.md` (instrukcje dla agentów, w tym streszczenie nakazów i zakazów licencyjnych),
  `CLAUDE.md` (odsyła do `AGENTS.md`), `README.md`, `PLAN_I_CHANGELOG.md`, `.gitignore`.
- Dokumentację: `LICENCJA_I_ZGODA.md` (nakazy i zakazy wynikające ze zgody Wydawcy, rejestr zgód),
  `ARCHITEKTURA.md`, `FIREBASE.md` (struktura bazy, logowanie hasłem, reguły, App Check, backup i
  odtwarzanie), `FORMAT_KSIAZKI.md`, `KONWERSJA.md`.
- Kartę książki `ksiazki/vae-victis/README.md` z wynikami analizy EPUB (struktura, mechanika
  „Informacji”, warunki, zakończenia, grafiki, stopka, pułapki konwersji).

**Usunięto**
- `Placeholder.md` (plik tymczasowy — zastąpiony strukturą katalogów).

### 2026-10-29 — Materiały źródłowe (właściciel)

**Dodano**
- `Pliki/Vae-Victis-15-to-lecie-MW.epub` — oryginał „Vae Victis” od Wydawcy.
- `Pliki/Zgoda Vae Victis.pdf` — korespondencja z Wydawcą (zgoda na „Vae Victis”, odmowa dla „Wagabundy”).
- `Placeholder.md`.
