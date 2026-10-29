# Plan prac i changelog

> **Jak korzystać z tego pliku:** to punkt wznowienia pracy. Na początku każdej sesji przeczytaj
> „Stan bieżący” i „Następne kroki”; na końcu zaktualizuj stan, odhacz wykonane punkty planu i dodaj
> wpis w changelogu. Decyzje zapisuj w „Decyzjach”, wątpliwości — w „Otwartych pytaniach”.

**Ostatnia aktualizacja:** 2026-10-29

## 1. Stan bieżący

| | |
|---|---|
| Etap | **0 — Fundamenty: zakończony** (struktura repozytorium + dokumentacja) |
| Aplikacja | jeszcze nie istnieje |
| Książki | „Vae Victis” — zgoda ✅, plik źródłowy przeanalizowany, konwersja nierozpoczęta |
| Firebase | zaprojektowany ([dokumentacja/FIREBASE.md](dokumentacja/FIREBASE.md)), niewdrożony |
| Blokery | brak dla Etapów 1–4; Etap 5 czeka na analizę zabezpieczeń z innego projektu (P1) |

## 2. Następne kroki

1. **Właściciel**: odpowiedzi na otwarte pytania (rozdz. 5) — w pierwszej kolejności P1, P2, P3.
2. **Etap 1**: skrypt konwersji EPUB → `tresc.json` + `stopka.json` i weryfikacja integralności
   (W1–W8) — wg [dokumentacja/KONWERSJA.md](dokumentacja/KONWERSJA.md) i karty
   [ksiazki/vae-victis/README.md](ksiazki/vae-victis/README.md) (pułapki konwersji, rozdz. 8).

## 3. Plan prac (etapy)

### Etap 0 — Fundamenty ✅ (2026-10-29)
- [x] Analiza zgody Wydawcy (PDF) i sekcji „LICENCJA” w publikacji
- [x] Analiza pliku EPUB „Vae Victis” (struktura, mechanika, stopka, grafiki) i strony publikacji
- [x] Struktura katalogów z `.gitkeep`, usunięcie `Placeholder.md`, `.gitignore`
- [x] Dokumentacja: LICENCJA_I_ZGODA, ARCHITEKTURA, FIREBASE, FORMAT_KSIAZKI, KONWERSJA, karta „Vae Victis”
- [x] `AGENTS.md`, `CLAUDE.md`, `README.md`, ten plik

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
- [ ] Ekran główny: logowanie (lokalny adapter — tylko rozwój), katalog, karta książki (okładka z podpisem autorki, atrybucja, linki), **pełna stopka**, stopka aplikacji
- [ ] Ekran gry: węzeł 1:1, klikalne odnośniki w tekście, panel przejść, „Menu główne”
- [ ] „O książce”: strony wstępne, stopka, okładka z podpisem, linki, informacja o zgodzie
- [ ] Ustawienia: rozmiar tekstu, motyw
- [ ] Autozapis lokalny (`LocalAdapter`), kilku graczy lokalnie (tryb deweloperski)
- [ ] Przegląd zgodności z checklistą [LICENCJA_I_ZGODA.md](dokumentacja/LICENCJA_I_ZGODA.md), rozdz. 6

### Etap 3 — Silnik mechaniki i „Vae Victis”
- [ ] Silnik: warunki, efekty, odwiedziny, zakończenia; tryb automatyczny i ręczny; zasada neutralności
- [ ] Moduły: `codewords` („Informacje”), `visits`, `endings`, `notes`
- [ ] Karta postaci (Informacje + ręczna edycja), notatki, historia, „Odkryte zakończenia”
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
- [ ] Porównanie projektu z analizą zabezpieczeń z innego projektu (P1)
- [ ] Projekt Firebase (bez Analytics), Firestore (region), Authentication — dostawca anonimowy
- [ ] `firebase/firestore.rules` + testy reguł w emulatorze (wszystkie role i przypadki brzegowe)
- [ ] App Check (wymuszony dla Firestore), ograniczenia klucza API
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
- [ ] Hosting (P3) — publikacja dopiero z działającym logowaniem; nagłówek CSP
- [ ] Instrukcje dla graczy i dla administratora
- [ ] Opcjonalnie: testy E2E (Playwright), PWA / tryb offline

### Etap 8+ — Kolejne książki
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
| D7 | 2026-10-29 | Ochrona przed dostępem spoza aplikacji: App Check (wymuszony) + reguły + sesje | wymóg właściciela; do porównania z analizą z innego projektu (P1) |
| D8 | 2026-10-29 | Do czasu wdrożenia Firebase: `LocalAdapter` (localStorage) z tym samym interfejsem | Firebase w późniejszym etapie |
| D9 | 2026-10-29 | Narzędzia: Python 3 (biblioteka standardowa); testy silnika: `node --test` | brak zewnętrznych zależności |
| D10 | 2026-10-29 | Katalogi po polsku (bez diakrytyków), kod i Firebase po angielsku; wyjątek `PlayerPassword` | czytelność dla właściciela + konwencje JS |
| D11 | 2026-10-29 | Gra tylko po zalogowaniu; publikacja strony dopiero z działającym logowaniem | „wąskie grono”, „projekt wewnętrzny” |
| D12 | 2026-10-29 | Neutralność silnika + tryb ręczny „jak na papierze” | brak ingerencji w zasady gry |

## 5. Otwarte pytania

| # | Pytanie | Propozycja | Status |
|---|---|---|---|
| P1 | Analiza zabezpieczeń Firebase z innego projektu — wspomniana, ale **nie została dołączona** | dołączyć (wkleić w wiadomości lub dodać do `dokumentacja/`); porównamy przed Etapem 5 | otwarte |
| P2 | Czy oryginalny EPUB ma zostać w publicznym repozytorium? | zostawić z pełną informacją o źródle **albo** trzymać lokalnie i zostawić w repo SHA-256 + link do pobrania | otwarte |
| P3 | Hosting: GitHub Pages czy Firebase Hosting? | GitHub Pages | otwarte |
| P4 | Logowanie: wpisywany login czy lista profili do wyboru? | wpisywany login (nie ujawnia listy graczy) | otwarte |
| P5 | Czy pozwalać na cofanie ruchu? | tylko jako opcja w ustawieniach / w trybie ręcznym | otwarte |
| P6 | Liczba slotów zapisu i czas ważności sesji | 5 slotów, 30 dni | otwarte |
| P7 | Czy pokazywać ostrzeżenie o treści podawane na stronie Wydawnictwa? | do decyzji właściciela | otwarte |
| P8 | Interpretacja niejednoznacznych warunków (§170, §286, §289) | ustalić w Etapie 3; w razie wątpliwości nie blokować opcji | otwarte |
| P9 | „Nowa gra”: czy zachowywać notatki? | zachowywać (zakończenia — zawsze) | otwarte |
| P10 | Czy gracz może sam odtwarzać swój backup? | nie — tylko administrator | otwarte |
| P11 | Krój pisma: Old Standard TT (jak w oryginale, licencja OFL) czy systemowy? | Old Standard TT hostowany lokalnie z plikiem licencji | otwarte |
| P12 | 6 graczy wobec „ok. 5 osób” w prośbie do Wydawcy | mieści się w „wąskim gronie”; przy dalszym powiększaniu — poinformować Wydawcę | otwarte |

## 6. Changelog

Najnowsze wpisy na górze. Kategorie: Dodano / Zmieniono / Usunięto / Naprawiono.

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
