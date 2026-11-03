# Plan prac i changelog

> **Jak korzystać z tego pliku:** to punkt wznowienia pracy. Na początku każdej sesji przeczytaj
> „Stan bieżący” i „Następne kroki”; na końcu zaktualizuj stan, odhacz wykonane punkty planu i dodaj
> wpis w changelogu. Decyzje zapisuj w „Decyzjach”, wątpliwości — w „Otwartych pytaniach”.

**Ostatnia aktualizacja:** 2026-11-03

## 1. Stan bieżący

| | |
|---|---|
| Etap | **2, 3 i 5 — zakończone; aplikacja opublikowana** (2026-11-02): `https://cutelittlegoat.github.io/GryParagrafowe/`; App Check działa (2026-11-03) — czeka na obserwację i wymuszenie |
| Aplikacja | **działa na GitHub Pages z Firebase** (repozytorium publiczne): logowanie loginem i hasłem, katalog, gra z automatyczną mechaniką, „Cofnij”, notatki, historia, 3 zapisy w chmurze, zakończenia, „O książce”. Próba agenta na stronie (2026-11-02): strona, reguły, konfiguracja i odrzucenie złego loginu — OK; testy: przeglądarka 43/43, emulator 15/15, reguły 17/17, silnik 12/12 |
| Książki | „Vae Victis” — zgoda ✅, treść w JSON zweryfikowana (W1–W8: 8/8), mechanika zwalidowana (M1–M5: 5/5) |
| Firebase | projekt **`gryparagrafowe-e1fb3`**: logowanie anonimowe ✅, reguły docelowe opublikowane ✅, konta `Player1` (właściciel, administrator), `Player2` (Wydawnictwo), `Player3` … `Player5` (gracze) ✅, `appConfig/public.playerCount` = 5 ✅, `admins/Player1` ✅ (właściciel, 2026-11-02); App Check ✅ — klucz „GryParagrafowe” z projektu `gryparagrafowe-e1fb3`, ważność tokenu 7 dni, wymiana tokenu działa (2026-11-03); wymuszenie (*Enforce*) — po obserwacji |
| Instrukcje agentów | `AGENTS.md` — wersja uniwersalna (właściciel, 2026-11-01), doprecyzowanie wzmianek o tytułach z odmową (właściciel, 2026-11-02) |
| Pytania do Wydawcy | [`Analizy/Pytania_Do_Wydawcy_2026-10-29.md`](Analizy/Pytania_Do_Wydawcy_2026-10-29.md) — PW1–PW2 przygotowane (**tylko sprawy licencyjne** — decyzja właściciela 2026-11-02; PW3 usunięte); właściciel wyśle je razem z odnośnikiem do aplikacji i kontem dla Wydawnictwa |
| Blokery | brak |

## 2. Następne kroki

1. **App Check — obserwacja i wymuszenie** (właściciel): przez kilka dni sprawdzać w Firebase → *App
   Check* → *APIs* → *Cloud Firestore*, czy żądania są „Verified”; potem **Enforce** (hamulec:
   *Unenforce*). Przy okazji usunąć stary klucz `gryparagrafowe-e1fb3` z projektu AudioRPG (tylko ten!).
2. **Właściciel**: sprawdzenie logowania prawdziwymi kontami (w tym kontem Wydawnictwa `Player2`).
3. **Na końcu — właściciel**: wysłanie Wydawcy odnośnika, loginu i hasła oraz pytań PW1–PW2.
4. **Etap 6** (agent): panel administratora — kopie zapasowe i odtwarzanie (konto `Player1` ma już
   uprawnienia administratora).

## 3. Plan prac (etapy)

### Etap 0 — Fundamenty ✅ (2026-10-29)
- [x] Analiza zgody Wydawcy (PDF) i sekcji „LICENCJA” w publikacji
- [x] Analiza pliku EPUB „Vae Victis” (struktura, mechanika, stopka, grafiki) i strony publikacji
- [x] Struktura katalogów z `.gitkeep`, usunięcie `Placeholder.md`, `.gitignore`
- [x] Dokumentacja: LICENCJA_I_ZGODA, ARCHITEKTURA, FIREBASE, FORMAT_KSIAZKI, KONWERSJA, karta „Vae Victis”
- [x] `AGENTS.md`, `CLAUDE.md`, `README.md`, ten plik
- [x] Folder `Analizy/` na raporty z analiz (2026-10-29)

### Etap 1 — Konwersja „Vae Victis” do JSON ✅ (2026-11-01)
- [x] Skrypt `narzedzia/konwersja/epub_do_json.py` (Python 3, biblioteka standardowa) + konfiguracja książki
- [x] Mapowanie klas CSS → kursywa / pogrubienie / wyrównanie; zachowanie twardych spacji
- [x] Węzły: 9 stron wstępnych, 372 paragrafy, 35 części (A/B/C), ciąg dalszy §98 (`p98-2`)
- [x] 625 odnośników wewnętrznych i zewnętrznych ze stabilnymi identyfikatorami
- [x] Pola pochodne: 48 oznaczeń `(U#n)`, 21 tytułów zakończeń, rozdziały
- [x] Grafiki → `ksiazki/vae-victis/grafiki/` (kopie bajt w bajt; ewentualne zmniejszenie okładki — później)
- [x] `ksiazki/vae-victis/ksiazka.json` (manifest) i `ksiazki/katalog.json`
- [x] Weryfikacja W1–W8 (`narzedzia/weryfikacja/weryfikuj_tresc.py`) — 8/8; test negatywny wykrywa zmianę litery
- [x] Aktualizacja karty książki — błędów w treści nie wykryto

### Etap 2 — Szkielet aplikacji i czytnik
- [x] `index.html`, style (motyw jasny/ciemny, mobile-first), router ekranów (2026-11-02)
- [x] Ekran główny: logowanie (lokalny adapter — tylko rozwój), katalog, karta książki (okładka z podpisem autorki, atrybucja, linki, **odnośniki do oryginałów** na stronie Wydawnictwa — P2), **ostrzeżenie o treści ze strony Wydawnictwa** (P7), **pełna stopka**, stopka aplikacji
- [x] Ekran gry: węzeł 1:1, klikalne odnośniki w tekście, panel przejść, „Menu główne” (2026-11-02)
- [x] „O książce”: strony wstępne, stopka, okładka z podpisem, linki, informacja o zgodzie (2026-11-02)
- [x] Tekst: krój jak w oryginale (Old Standard TT, z plikiem licencji OFL), **dwa przyciski zmiany rozmiaru tekstu** (P11); motyw jasny/ciemny (2026-11-02)
- [x] Autozapis lokalny (`LocalAdapter`), kilku graczy lokalnie (tryb deweloperski) (2026-11-02)
- [x] Przegląd zgodności z checklistą [LICENCJA_I_ZGODA.md](dokumentacja/LICENCJA_I_ZGODA.md), rozdz. 6 (2026-11-02; ponownie po wdrożeniu Firebase)

### Etap 3 — Silnik mechaniki i „Vae Victis”
- [x] Silnik (`aplikacja/js/core/`): warunki, efekty, odwiedziny, zakończenia; tryb automatyczny i ręczny; zasada neutralności (2026-11-01)
- [x] Moduły: `codewords` („Informacje”), `visits`, `endings`, `notes` (2026-11-02)
- [x] Karta postaci (Informacje + ręczna edycja), notatki, historia, „Odkryte zakończenia” (2026-11-02)
- [x] Przycisk **„Cofnij”** — krok po kroku, do początku bieżącej rozgrywki — z dopiskiem „To Twoja gra :) Graj jak lubisz!” (P5) (2026-11-02)
- [x] `ksiazki/vae-victis/mechanika.json` — generator `narzedzia/konwersja/generuj_mechanike.py` (odczyt dosłowny) + przegląd ręczny; 48 zdobyć Informacji, 88 warunków, przypadek opisany prozą (§85) w konfiguracji (2026-11-01)
- [x] Walidacja M1–M5 (`narzedzia/weryfikacja/weryfikuj_mechanike.py`) — 5/5; niejednoznaczne warunki (§170, §259, §286, §289) oznaczone flagą `ambiguous`: wszystkie drogi dostępne, wybiera gracz (P8; Wydawcy o treść nie pytamy — opis problemu w `Analizy/Niejednoznaczne_Wskazowki_Vae_Victis_2026-11-02.md`) (2026-11-01, aktualizacja 2026-11-02)
- [x] 3 miejsca na ręczny zapis w każdej książce (lokalnie) (P6) (2026-11-02)
- [x] „Nowa gra”: pytanie, czy zostawić dotychczasowe notatki, czy je wyczyścić (P9) (2026-11-02)
- [x] Testy jednostkowe silnika na prawdziwych danych (`node --test 'testy/**/*.test.mjs'`, 12/12): §9, §57, §91, §98, §161, §170, zakończenia, „Cofnij”, „Nowa gra”, tryb ręczny (2026-11-01)
- [x] Scenariusze w przeglądarce (Playwright): `testy/e2e/test-dymny.cjs` — 43/43 (2026-11-02)

### Etap 4 — Moduły ogólne (dla kolejnych książek)
- [ ] `stats` — statystyki (np. HP/Wytrzymałość) z wartościami początkowymi i limitami
- [ ] `dice` — wyrażenia `XkY+Z`, animacja (CSS/SVG w kodzie, bez grafik AI), historia rzutów, testy
- [ ] `inventory`, `counters`, `combat` — wg potrzeb przyszłych książek
- [ ] Mechanizm `custom` (logika specyficzna dla książki)
- [ ] Fikcyjna książka testowa (**własna treść**) w `testy/dane/` do testów modułów

### Etap 5 — Firebase: konta i zapis postępu
- [x] Porównanie z instrukcją App Check z projektu „Karty” (P1) — wnioski w FIREBASE.md, rozdz. 7 (2026-10-29)
- [x] Projekt Firebase `gryparagrafowe-e1fb3`, konfiguracja webowa w `firebase/firebase-config.js`, Firestore z tymczasowymi regułami blokującymi cały dostęp — właściciel, 2026-10-29
- [x] **Właściciel**: Authentication — dostawca anonimowy (2026-11-02; próba agenta: działa, baza odpowiada, reguły tymczasowe blokują odczyt i zapis)
- [ ] Odnotowanie regionu bazy w FIREBASE.md
- [x] Format `firebase/firebase-config.js` (moduł ES) i pole klucza App Check `appCheckSiteKey` — za zgodą właściciela (P13) (2026-11-02)
- [x] `firebase/firestore.rules` + testy reguł w emulatorze (`testy/reguly/test-regul.mjs`, 17/17) i test aplikacji z emulatorem (15/15) (2026-11-02)
- [x] **Właściciel**: publikacja reguł w konsoli (2026-11-02; sprawdzone próbą agenta)
- [x] App Check: klucz reCAPTCHA Enterprise „GryParagrafowe” z projektu `gryparagrafowe-e1fb3` (domena `cutelittlegoat.github.io`), rejestracja w Firebase (TTL 7 dni) — właściciel; klucz w `firebase/firebase-config.js` — agent; wymiana tokenu na stronie: kod 200 (2026-11-03; pierwszy klucz z projektu AudioRPG zastąpiony)
- [ ] App Check: obserwacja → **Enforce** dla Cloud Firestore (właściciel, FIREBASE.md rozdz. 7.2); opcjonalnie ograniczenia klucza API
- [x] `FirestoreAdapter`: logowanie loginem i hasłem (sesje ważne 30 dni, w sesji tylko skrót hasła), profil, autozapis w transakcji z kontrolą `revision`, ręczne zapisy, `appConfig` (liczba kont, przerwa techniczna, wyłączone książki); bez pamięci offline (D40) (2026-11-02)
- [x] **Właściciel**: konta `Player1` (właściciel, administrator), `Player2` (Wydawnictwo), `Player3` … `Player5` (gracze) w kolekcji `secrets`; `appConfig/public.playerCount` = 5 (int64); `admins/Player1` (2026-11-02)

### Etap 6 — Kopie zapasowe i odtwarzanie
- [ ] Panel administratora (lista graczy, ostatnia aktywność)
- [ ] Backup wszystkich / jednego gracza (JSON — bez haseł i bez treści książek)
- [ ] Eksport własnego postępu przez gracza
- [ ] Odtwarzanie gracza z pliku: walidacja, podgląd, tryb „Zastąp”, potwierdzenie, raport
- [ ] Test „backup → odtworzenie → porównanie” dla każdego gracza

### Etap 7 — Jakość i wdrożenie
- [ ] Dostępność (klawiatura, ARIA, kontrast), testy na telefonach
- [ ] CI (GitHub Actions): weryfikacja treści i mechaniki, testy
- [x] Hosting: **GitHub Pages** (P3) — włączone przez właściciela 2026-11-02 (repozytorium publiczne, gałąź `main`): `https://cutelittlegoat.github.io/GryParagrafowe/`
- [ ] Polityka CSP (znacznik w `index.html`) — po sprawdzeniu działania na GitHub Pages, żeby nie zablokować Firebase ani App Check
- [ ] Instrukcje dla graczy i dla administratora
- [ ] Opcjonalnie: zmiana kroju pisma przez gracza (np. krój przyjazny dla osób z dysleksją — licencja kroju do sprawdzenia) — **tylko po zgodzie Wydawcy** (pytanie PW1) (P11); przełącznik **czcionki** w oknie „Ustawienia” — dopiero po potwierdzeniu Wydawcy (właściciel 2026-11-03: „Przełącznik będzie dotyczyć zmiany fontu a nie języka - ale to po potwierdzeniu z wydawcą”)
- [ ] Do decyzji właściciela **na koniec prac nad książką** (pytanie P15): tekst gry złożony jak w PDF — akapity z wcięciem pierwszego wiersza, bez odstępów, wyjustowane (teraz: odstępy między akapitami, bez wcięć — zostaje do tego czasu)
- [x] Test E2E (Playwright) — `testy/e2e/test-dymny.cjs` (2026-11-02)
- [ ] Lżejsza wersja okładki dla telefonów (oryginał PNG 3,5 MB) — tylko proporcjonalne zmniejszenie i kompresja (Z6), jako opisany krok
- [ ] Opcjonalnie: PWA / tryb offline

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
| D14 | 2026-10-29 | App Check: reCAPTCHA Enterprise (plan Spark), domena `cutelittlegoat.github.io`, TTL 1 dzień (zmienione na 7 dni — D50), obserwacja → *Enforce*, hamulec *Unenforce* | doświadczenia z projektu „Karty” |
| D15 | 2026-10-29 | Raporty z analiz w folderze `Analizy/`, wg zasad z `AGENTS.md` | wymóg właściciela (jak w innym projekcie) |
| D16 | 2026-10-29 | `AGENTS.md` i `CLAUDE.md` zmienia wyłącznie właściciel; agenci proponują pełną treść w bloku kodu w czacie | wymóg właściciela |
| D17 | 2026-10-29 | Oryginalny EPUB zostaje w repozytorium; w aplikacji odnośniki do oryginałów na stronie Wydawnictwa | decyzja właściciela (P2) |
| D18 | 2026-10-29 | Hosting: GitHub Pages | decyzja właściciela (P3) |
| D19 | 2026-10-29 | Przycisk „Cofnij” (krok po kroku) z dopiskiem „To Twoja gra :) Graj jak lubisz!” | decyzja właściciela (P5) |
| D20 | 2026-10-29 | Ostrzeżenie o treści ze strony Wydawnictwa — na ekranie głównym przy książce, dosłownie i z informacją o źródle | decyzja właściciela (P7) |
| D21 | 2026-10-29 | Odtwarzanie danych gracza z kopii zapasowej — tylko administrator | decyzja właściciela (P10) |
| D22 | 2026-10-29 | Krój pisma jak w oryginale (Old Standard TT); dwa przyciski rozmiaru tekstu; wybór innego kroju (np. dla osób z dysleksją) — dopiero po zgodzie Wydawcy (pytanie PW1) | decyzja właściciela (P11) |
| D23 | 2026-10-29 | Pytania do właściciela — prostym językiem: bez żargonu, z przykładem, wariantami i rekomendacją | wymóg właściciela |
| D24 | 2026-10-29 | Pytania do Wydawcy zbieramy w `Analizy/Pytania_Do_Wydawcy_2026-10-29.md` (plik uzupełniany na bieżąco; o wysłaniu decyduje właściciel) | wymóg właściciela |
| D25 | 2026-11-01 | Logowanie loginem i hasłem: konta `Player1` … `Player6`; w `secrets/PlayerN` pola `PlayerName` (login) i `PlayerPassword` (hasło); liczba kont w `appConfig/public.playerCount`; postęp przypisany do konta, nie do loginu | decyzja właściciela (P4) |
| D26 | 2026-11-01 | 3 miejsca na ręczny zapis w każdej książce (`save1` … `save3`); logowanie pamiętane 30 dni | decyzja właściciela (P6) |
| D27 | 2026-11-01 | Niejednoznaczne warunki (§170, §286, §289; §259 dopisany przy przygotowaniu mechaniki): obie drogi dostępne, wybiera gracz; ~~pytanie do Wydawcy (PW3)~~ — usunięte 2026-11-02 (D46) | decyzja właściciela (P8) |
| D32 | 2026-11-01 | Warunki w `mechanika.json` odczytywane z tekstu **dosłownie** (generator); węzły, w których wskazówki pasują do kilku dróg, mają flagę `ambiguous` — aplikacja nie oznacza w nich dróg, tylko informuje, że wybiera gracz, i pokazuje jego Informacje związane z tym miejscem | neutralność silnika; realizacja D27 bez wybierania za gracza jednej z interpretacji |
| D33 | 2026-11-01 | Tryb automatyczny oznacza drogi (warunek spełniony / niespełniony), ale niczego nie blokuje — wybór drogi z niespełnionym warunkiem wymaga potwierdzenia | „To Twoja gra” (P5); zasada „W razie niejednoznaczności opcji nie blokuj” |
| D34 | 2026-11-01 | Krój Old Standard TT dołączony do aplikacji (pliki z repozytorium Google Fonts, licencja OFL — `aplikacja/assets/fonts/`), bez pobierania fontów z zewnętrznych serwerów | wierność wyglądu (P11); brak zewnętrznych zapytań i śledzenia |
| D35 | 2026-11-02 | Przed zalogowaniem ekran główny pokazuje tylko opis aplikacji i formularz logowania; katalog (okładki, stopki, ostrzeżenia, gra) — dopiero po zalogowaniu | wąskie grono, projekt wewnętrzny (N7) |
| D36 | 2026-11-02 | Tryb lokalny (`LocalAdapter`, bez sprawdzania hasła) działa wyłącznie pod adresem `localhost`; pod innymi adresami logowanie jest niedostępne do czasu wdrożenia Firebase | nie da się grać bez logowania, nawet gdyby strona została opublikowana wcześniej |
| D37 | 2026-11-02 | Grafiki z publikacji z przezroczystym tłem (logotypy w stopce) wyświetlane na białym tle, bez zmian samych grafik; okładka na środku, pozostałe grafiki wyrównane jak w pliku źródłowym | widoczność w motywie ciemnym bez filtrów i przeróbek (Z6) |
| D38 | 2026-11-02 | Autozapis po każdym ruchu z kontrolą wersji — przy konflikcie (dwa okna / urządzenia) gracz wybiera: wczytać nowszy stan albo zastąpić; przy wczytaniu ręcznego zapisu gracz decyduje, czy przywrócić notatki z zapisu | brak cichej utraty postępu; spójnie z P9 |
| D39 | 2026-11-02 | W dokumencie sesji zamiast hasła — jego skrót SHA-256 (liczony w przeglądarce); reguły liczą skrót `PlayerPassword` i porównują | hasło jawnym tekstem tylko w `secrets` (wymóg ręcznej edycji); realizacja „utwardzenia” z FIREBASE.md rozdz. 5 |
| D40 | 2026-11-02 | Firestore bez trwałej pamięci podręcznej (tylko w pamięci karty); w pamięci przeglądarki tylko identyfikator konta i login | żadnych danych logowania ani kopii danych na dysku urządzenia |
| D41 | 2026-11-02 | ~~Konto dla Wydawcy = `Player7`; `appConfig/public.playerCount` = 7~~ — zastąpione przez D45 | zapowiedź właściciela (konto i hasło dla Wydawcy) |
| D42 | 2026-11-02 | `firebase/firebase-config.js` jako moduł ES z polem `appCheckSiteKey`; biblioteka Firebase JS SDK **12.19.0** z `www.gstatic.com` (przypięta wersja); emulator tylko pod `localhost?emulator` | zgoda właściciela (P13); stabilna wersja sprzed 2 miesięcy |
| D43 | 2026-11-02 | Strona „od Wydawnictwa” w „Vae Victis” pozostaje bez skrótów — także linijka o „Wagabundzie” (lista publikacji Wydawcy jest częścią tekstu książki); w aplikacji jest odnośnik do strony Wydawcy | decyzja właściciela (P14): „nie skracaj. To, że nie mamy zgody na Wagabundę nie oznacza, że nie możemy o niej pisać.” |
| D46 | 2026-11-02 | Wydawcę pytamy **wyłącznie o sprawy licencyjne**, nie o treść ani zasady gry w poszczególnych książkach; pytanie PW3 usunięte; wątpliwości dotyczące treści — w analizach w `Analizy/` | decyzja właściciela |
| D47 | 2026-11-02 | Przejścia między paragrafami **identyczne jak w oryginale** — potwierdzone porównaniem z PDF Wydawnictwa (408/408 części gry, 559 odnośników z numerem, 54 do części); w czterech niejednoznacznych miejscach aplikacja nie podpowiada drogi, wybiera gracz | polecenie właściciela („zrób identycznie jak w oryginalnym pliku PDF”) |
| D48 | 2026-11-02 | Układ stopki i stron wstępnych jak w PDF: grafika zakotwiczona w akapicie z tekstem — za tym tekstem (generator 1.1.0, `frameClassPattern`); stopka i strony spisowe bez odstępów między akapitami; numeracja list „1)” | zgłoszenie właściciela (logo nad podpisem) |
| D49 | 2026-11-02 | Logo aplikacji i ikona karty przeglądarki: piktogram kozy z Game Icons (autor Skoll, CC BY 3.0) — gotowa ikona, nie grafika AI; podpis autora w stopce aplikacji | polecenie właściciela |
| D53 | 2026-11-03 | „Vae Victis”: przycisk **„Informacja”** i okno **„Zdobyte Informacje”** zamiast „Karta postaci” (pola `buttonLabel` i `panelTitle` modułu `codewords`, generator mechaniki 1.1.0); inne książki — domyślnie „Karta postaci”; komunikaty i opisy trybów bez odwołań do „karty postaci” | decyzja właściciela — książka nie ma klasycznej karty postaci ze statystykami |
| D52 | 2026-11-03 | Stopka aplikacji (projekt nieoficjalny i niekomercyjny, zgoda wydawców, autor piktogramu kozy) **tylko na ekranie głównym** — bez niej przy czytaniu książki i w „O książce” | decyzja właściciela; zgoda Wydawcy nie wymaga stopki aplikacji, zasada N10 i licencja CC BY 3.0 spełnione na ekranie głównym |
| D51 | 2026-11-03 | **Zwijane karty książek** na ekranie głównym: zwinięta = okładka z podpisem autorki ilustracji, tytuł, autor, wydawca + belka „Rozwiń” (z dopiskiem „szczegóły, ostrzeżenie o treści, stopka redakcyjna”); rozwinięta = ostrzeżenie o treści, stan gry, przyciski, atrybucja i odnośniki, pełna stopka; kliknięcie nagłówka lub belki rozwija i zwija; stan pamiętany do końca sesji przeglądarki | polecenie właściciela — czytelność ekranu głównego przy wielu książkach; zgodne z N1, N3, N4 i Z7 (LICENCJA_I_ZGODA.md) |
| D50 | 2026-11-03 | App Check: ważność tokenu **7 dni** (zamiast 1 dnia); klucz reCAPTCHA w projekcie `gryparagrafowe-e1fb3` | decyzja właściciela — rzadsze sprawdzenia reCAPTCHA; mały, zamknięty krąg graczy |
| D45 | 2026-11-02 | Konta: `Player1` — właściciel (administrator), `Player2` — Wydawnictwo, `Player3` … `Player5` — gracze; `playerCount` = 5 (typ *int64* w obecnej konsoli); kolejne konta później | decyzja i konfiguracja właściciela |
| D44 | 2026-11-02 | Dokument `appConfig/public` opcjonalny — bez niego aplikacja sprawdza konta `Player1` … `Player10`; kolekcje `players` i `sessions` tworzy aplikacja; konta (`secrets`) zakłada wyłącznie administrator w konsoli | mniej pracy w konsoli; bezpieczeństwo — aplikacja nie może zakładać kont |
| D28 | 2026-11-01 | „Nowa gra”: aplikacja pyta, czy zostawić dotychczasowe notatki, czy je wyczyścić | decyzja właściciela (P9) |
| D29 | 2026-11-01 | `AGENTS.md` jest uniwersalny — zawiera tylko zasady stałe; tytuły i warunki zgód są w rejestrze zgód (`dokumentacja/LICENCJA_I_ZGODA.md`), stan Firebase w `FIREBASE.md`, etapy i decyzje w tym pliku | wymóg właściciela |
| D30 | 2026-11-01 | Oryginały zgód i korespondencji z wydawcą mogą zostać usunięte z repozytorium; wiążącym zapisem warunków jest rejestr zgód z dosłownymi cytatami kluczowych zdań | informacja właściciela |
| D31 | 2026-11-01 | Pytania PW1–PW2 do Wydawcy (PW3 usunięte — D46) — na końcu prac, razem z odnośnikiem do gotowej aplikacji z jedną książką i kontem gracza dla Wydawcy | decyzja właściciela |

## 5. Otwarte pytania

> Pytania do właściciela piszemy **prostym językiem**, zrozumiałym bez wiedzy informatycznej: bez
> żargonu, z przykładem, z wariantami do wyboru i rekomendacją (wymóg właściciela, 2026-10-29).

### 5.1. Czekają na odpowiedź

| # | Pytanie | Warianty (★ = rekomendacja) |
|---|---|---|
| P15 | **Wygląd tekstu gry.** W pliku PDF akapity zaczynają się od wcięcia (pierwszy wiersz przesunięty w prawo), nie ma między nimi odstępów, a tekst jest wyrównany do obu krawędzi strony — jak w drukowanej książce. W aplikacji akapity są oddzielone pustym odstępem, bez wcięć, a tekst jest wyrównany do lewej (na wąskim ekranie telefonu czyta się to zwykle wygodniej). Treść jest w obu przypadkach identyczna — chodzi tylko o wygląd. | **A ★** zostawić jak teraz (wygodniej na telefonie); **B** jak w PDF na wszystkich ekranach; **C** jak w PDF tylko na dużych ekranach (komputer), na telefonie jak teraz. Właściciel (2026-11-03): „Na obecną chwilę zostaw jak jest” — **decyzja na koniec prac nad książką** |

### 5.2. Rozstrzygnięte

| # | Pytanie | Odpowiedź właściciela |
|---|---|---|
| P1 | Analiza zabezpieczeń z innego projektu | (2026-10-29) dostarczona (instrukcja App Check z projektu „Karty”); wnioski w FIREBASE.md, rozdz. 7 |
| P2 | Czy oryginalny EPUB zostaje w repozytorium? | (2026-10-29) **zostaje**; w aplikacji będą odnośniki do oryginałów na stronie Wydawnictwa |
| P3 | Gdzie publikujemy stronę? | (2026-10-29) **GitHub Pages** |
| P4 | Jak gracz ma się logować? | (2026-11-01) **login i hasło** — oba ustawia administrator w Firebase jako dwa osobne pola; przyjęto konta `Player1` … `Player6` z polami `PlayerName` (login) i `PlayerPassword` (hasło) |
| P5 | Czy można cofać ruchy? | (2026-10-29) **tak** — przycisk „Cofnij” z dopiskiem w stylu „To Twoja gra :) Graj jak lubisz!” |
| P6 | Ręczne zapisy i pamiętanie logowania | (2026-11-01) zgodnie z rekomendacją: **3 miejsca na ręczny zapis** w każdej książce; logowanie pamiętane **30 dni** |
| P7 | Czy pokazywać ostrzeżenie o treści ze strony Wydawnictwa? | (2026-10-29) **tak** — na ekranie głównym, tam gdzie gracze wybierają książki |
| P8 | Niejasne wskazówki w §170, §286, §289 | (2026-11-01) **na razie wariant A** — obie drogi dostępne, wybiera gracz; dodatkowo pytanie do Wydawcy (PW3 — usunięte 2026-11-02: „Wystawcy będziemy pytać tylko o rzeczy związane z licencjami a nie treścią poszczególnych książek”) |
| P9 | „Nowa gra” a notatki | (2026-11-01) aplikacja **pyta gracza**, czy zostawić dotychczasowe notatki, czy je wyczyścić |
| P10 | Kto może odtwarzać dane gracza z kopii zapasowej? | (2026-10-29) **tylko administrator** |
| P11 | Krój pisma | (2026-10-29) **jak w oryginale** (Old Standard TT); **dwa przyciski zmiany rozmiaru tekstu**; później do rozważenia zmiana kroju (np. na przyjazny dla osób z dysleksją) — najpierw pytanie do Wydawcy (PW1) |
| P14 | Linijka o „Wagabundzie” na stronie „od Wydawnictwa” w „Vae Victis” | (2026-11-02) **nie skracać** — „To, że nie mamy zgody na Wagabundę nie oznacza, że nie możemy o niej pisać. W aplikacji będzie link do strony wydawcy i jak ktoś będzie zainteresowany to sam sobie pobierze bezpośrednio od wydawcy.” |
| P13 | Czy agent może zmienić plik z ustawieniami Firebase (dopisać klucz App Check)? | (2026-11-02) **tak** — zgoda właściciela na modyfikację pliku |
| P12 | 6 graczy wobec „ok. 5 osób” w prośbie do Wydawcy | (2026-10-29) po ukończeniu pierwszej książki i przygotowaniu kont dla 6 graczy właściciel poprosi Wydawcę o kolejne tytuły i poinformuje o planie zwiększenia liczby graczy |

## 6. Changelog

Najnowsze wpisy na górze. Kategorie: Dodano / Zmieniono / Usunięto / Naprawiono.

### 2026-11-03 — „Informacja” zamiast „Karty postaci” w „Vae Victis”

**Zmieniono**
- Przycisk „Karta postaci” → **„Informacja”**, okno „Karta postaci — Informacje” → **„Zdobyte
  Informacje”** (D53) — nazwy z mechaniki książki (`buttonLabel`, `panelTitle`; generator mechaniki
  1.1.0, M1–M5: 5/5); dla książek bez własnych nazw zostaje „Karta postaci”.
- Komunikaty bez odwołań do karty postaci: „Zdobywasz Informację #19.”, „Ta droga nie spełnia
  warunku: …”, w miejscach niejednoznacznych — „Informacje wymienione w tym miejscu: …”; opisy trybów
  mechaniki w „Ustawieniach” — ogólne (bez nazw z konkretnej książki).
- FORMAT_KSIAZKI.md, ARCHITEKTURA.md, karta książki; test w przeglądarce.

### 2026-11-03 — Stopka aplikacji tylko na ekranie głównym

**Zmieniono**
- Stopka aplikacji (projekt nieoficjalny, zgoda wydawców, autor piktogramu kozy) widoczna tylko na
  ekranie głównym; przy czytaniu książki i w „O książce” ukryta (D52). Test w przeglądarce: nowe
  sprawdzenia widoczności stopki.
- LICENCJA_I_ZGODA.md (N10, checklista), ARCHITEKTURA.md, `aplikacja/assets/icons/README.md`.

### 2026-11-03 — Zwijane karty książek na ekranie głównym

**Zmieniono**
- Ekran główny: karta każdej książki jest zwijana (D51). Zwinięta — okładka z podpisem autorki
  ilustracji, tytuł, autor, wydawca i belka „Rozwiń” (z dopiskiem: szczegóły, ostrzeżenie o treści,
  stopka redakcyjna); rozwinięta — wszystko, co dotąd (ostrzeżenie o treści, stan gry, przyciski,
  atrybucja, odnośniki, pełna stopka) i przycisk „Zwiń kartę” na dole. Kliknięcie nagłówka lub belki
  rozwija i zwija kartę; dostępność: przycisk z `aria-expanded` i `aria-controls`; układ na telefon.
- Testy: test w przeglądarce 50/50 (nowe sprawdzenia zwijania), test z emulatorem 15/15.
- LICENCJA_I_ZGODA.md (N3, Z7) i ARCHITEKTURA.md — opis zwijanej karty i jej zgodności z zasadami.

### 2026-11-03 — App Check działa; P15

**Zmieniono**
- `firebase/firebase-config.js`: klucz reCAPTCHA „GryParagrafowe” z projektu `gryparagrafowe-e1fb3`
  (utworzony i zarejestrowany w App Check przez właściciela, ważność tokenu 7 dni). Sprawdzone na
  stronie: wymiana tokenu App Check — kod 200; zmyślony login odrzucony; brak błędów (D50).
- Dokumentacja App Check (FIREBASE.md rozdz. 7.2 i 9, FIREBASE_KONSOLA.md rozdz. 11–12): naprawione;
  dalej obserwacja i wymuszenie; stary klucz z projektu AudioRPG do usunięcia.
- Plan: przełącznik w „Ustawieniach” dotyczy **czcionki** (po zgodzie Wydawcy); nowe otwarte pytanie
  P15 (wygląd tekstu gry jak w PDF) — do decyzji na koniec prac nad książką.

### 2026-11-02 — Zgodność z PDF, piktogram kozy, PW3 usunięte

**Dodano**
- `Analizy/Niejednoznaczne_Wskazowki_Vae_Victis_2026-11-02.md` — opis problemu z czterema
  niejednoznacznymi wskazówkami (§170, §259, §286, §289) prostym językiem, dla osoby nieznającej
  książki; wynik porównania aplikacji z PDF Wydawnictwa (przejścia identyczne).
- Piktogram kozy (Game Icons, autor Skoll, CC BY 3.0) w nagłówku aplikacji i jako ikona karty
  przeglądarki (`aplikacja/assets/icons/` z opisem licencji; podpis autora w stopce aplikacji).

**Zmieniono**
- Generator treści 1.1.0: ramka z grafiką zakotwiczona w akapicie z tekstem trafia za ten tekst —
  w stopce „Logo Masz Wybór:” stoi nad logo, jak w PDF (zmiana tylko kolejności bloków w węźle
  `stopka`; W1–W8: 8/8, M1–M5: 5/5); `contentVersion` 1.0.1.
- Stopka i strony spisowe bez odstępów między akapitami; numeracja list „1)”, jak w PDF.
- Usunięto zdanie o wąskim gronie graczy z ekranu głównego i zdanie o kroju pisma z „Ustawień”.
- Pytanie PW3 usunięte z rejestru pytań do Wydawcy; zasada: Wydawcę pytamy tylko o licencje (D46).
- Karta książki: rozbieżność EPUB/PDF w tytule na liście publikacji („Hé-mu-ù-zu” / „Ḫé-mu-ù-zu”) —
  bez zmian w treści.
- Decyzje D46–D49.
- App Check: klucz z projektu AudioRPG usunięty z `firebase/firebase-config.js` (aplikacja działa bez
  App Check do czasu nowego klucza z projektu `gryparagrafowe-e1fb3`); instrukcja w FIREBASE_KONSOLA.md
  (rozdz. 12) i FIREBASE.md poprawione.

### 2026-11-02 — Aplikacja opublikowana; próba na prawdziwym projekcie; App Check do naprawy

**Sprawdzono** (próba agenta na `https://cutelittlegoat.github.io/GryParagrafowe/`, bez prawdziwych
haseł): strona i pliki dostępne; reguły docelowe opublikowane (konto anonimowe czyta tylko
`appConfig/public`); `playerCount` typu *int64* odczytywane poprawnie (5); zmyślony login odrzucony
komunikatem „Nieprawidłowy login lub hasło”. **App Check**: wymiana tokenu reCAPTCHA zwraca błąd 400
(„ensure that the reCAPTCHA Enterprise API is enabled and that the site key is from the same project”)
— instrukcja naprawy w FIREBASE_KONSOLA.md (rozdz. 12); wymuszenie wstrzymane.

**Zmieniono**
- Puste elementy listy `disabledBooks` są pomijane.
- Dokumentacja (FIREBASE.md, FIREBASE_KONSOLA.md, plan): konta założone przez właściciela (`Player2` —
  Wydawnictwo, 5 kont), typ *int64*, GitHub Pages włączone, repozytorium publiczne; D45 zastępuje D41.

### 2026-11-02 — Instrukcja zakładania struktury w konsoli Firebase

**Dodano**
- `dokumentacja/FIREBASE_KONSOLA.md` — instrukcja krok po kroku dla administratora: mapa bazy (co
  zakłada administrator, a co aplikacja), kolekcje `secrets` (konta `Player1` … `Player7`, pola
  `PlayerName` i `PlayerPassword` typu string), `appConfig/public` (`playerCount`, `maintenance`,
  `disabledBooks`), `admins`, publikacja reguł, sprawdzenie, najczęstsze pomyłki, późniejsze zmiany,
  App Check i GitHub Pages (polecenie właściciela). Odnośniki w FIREBASE.md (rozdz. 9) i README.

### 2026-11-02 — App Check: klucz reCAPTCHA Enterprise w aplikacji

**Dodano**
- Klucz witryny reCAPTCHA Enterprise (utworzony przez właściciela dla domeny
  `cutelittlegoat.github.io`, zarejestrowany w Firebase App Check z TTL 1 dzień) w
  `firebase/firebase-config.js` (`appCheckSiteKey`). Sprawdzono: aplikacja pod adresem innym niż
  `localhost` wczytuje App Check i reCAPTCHA bez błędów. Wymuszenie (*Enforce*) — po obserwacji.

### 2026-11-02 — Próba na projekcie Firebase; P14; `appConfig` opcjonalny

**Sprawdzono** (próba agenta na projekcie `gryparagrafowe-e1fb3`): logowanie anonimowe działa (włączone
przez właściciela; próba utworzyła jedno anonimowe konto testowe), baza odpowiada, a reguły tymczasowe
odrzucają każdy odczyt i zapis (403) — przy nich aplikacja nie może założyć żadnych dokumentów.

**Zmieniono**
- Dokument `appConfig/public` jest opcjonalny — bez niego aplikacja sprawdza konta `Player1` …
  `Player10` (D44). Instrukcja w FIREBASE.md (rozdz. 9) uporządkowana: reguły → konta w `secrets` →
  GitHub Pages; `appConfig` i `admins` — opcjonalnie / później.
- P14 rozstrzygnięte: strona „od Wydawnictwa” bez skrótów (D43; LICENCJA_I_ZGODA rozdz. 9 pkt 7,
  karta książki pkt 10).

### 2026-11-02 — Etap 5: Firebase — logowanie hasłem, zapis w chmurze, reguły

**Dodano**
- `aplikacja/js/data/firestore-adapter.js`: logowanie anonimowe + sesja ze skrótem SHA-256 hasła
  (sprawdzana przez reguły dla kont `Player1` … `PlayerN`), profil i ustawienia gracza, autozapis w
  transakcji z kontrolą wersji, 3 zapisy ręczne, `appConfig/public` (liczba kont, przerwa techniczna,
  awaryjne wyłączenie książki), czytelne komunikaty przy niedokończonej konfiguracji konsoli.
- `firebase/firestore.rules` — reguły docelowe z walidacją dokumentów; `firebase/firebase.json` —
  konfiguracja emulatorów.
- `testy/reguly/`: testy reguł w emulatorze (17/17), test aplikacji w przeglądarce z emulatorem
  (15/15), `package.json` z narzędziami testowymi i instrukcja.
- `.nojekyll` — GitHub Pages serwuje pliki bez przetwarzania.

**Zmieniono**
- `firebase/firebase-config.js` — moduł ES i puste pole `appCheckSiteKey` (zgoda właściciela, P13);
  wartości konfiguracji bez zmian.
- Wybór sposobu zapisu: adres w internecie → Firebase; `localhost` → tryb lokalny;
  `localhost?emulator` → emulator.
- „Zapisano” pojawia się dopiero, gdy wszystkie ruchy są zapisane (wcześniej mogło pojawić się po
  zapisaniu przedostatniego ruchu).
- FIREBASE.md: przepływ logowania ze skrótem hasła, opis reguł, kroki właściciela (konta `Player1` …
  `Player7`, Player7 — Wydawca), App Check; decyzje D39–D42; P13 rozstrzygnięte.

### 2026-11-02 — Etap 2 i 3: aplikacja działa lokalnie

**Dodano**
- `index.html` i style (`aplikacja/css/style.css`): krój Old Standard TT dla tekstu książki, krój
  systemowy dla komunikatów aplikacji, motyw jasny / ciemny / automatyczny, rozmiar tekstu (A− / A+),
  układ na telefon.
- Ekran główny: opis aplikacji i logowanie; po zalogowaniu katalog z kartą książki (okładka z podpisem
  autorki ilustracji, atrybucja, odnośniki, oryginały do pobrania, źródło tekstu, ISBN, informacja o
  zgodzie, ostrzeżenie o treści ze strony Wydawnictwa, pełna stopka redakcyjna) i stan gry.
- Ekran gry: tekst węzła 1:1 z klikalnymi odnośnikami, przyciski przejść (etykiety techniczne, numerowane
  duplikaty), oznaczenia warunków i potwierdzenie drogi z niespełnionym warunkiem, komunikat w miejscach
  niejednoznacznych, komunikaty o zdobytych Informacjach, zakończenia z licznikiem odkrytych, „Cofnij” z
  dopiskiem, panele: karta postaci (Informacje #1–#43, ręczna edycja), notatki, historia i odkryte
  zakończenia, 3 miejsca zapisu, ustawienia (motyw, rozmiar tekstu, tryb mechaniki), „Nowa gra” z
  pytaniem o notatki.
- „O książce”: okładka z podpisem, atrybucja, ostrzeżenie o treści i strony wstępne 1:1 (stopka, „od
  Wydawnictwa”, strona tytułowa, dedykacja, spis treści, wprowadzenie, prolog).
- Warstwa danych `aplikacja/js/data/`: `LocalAdapter` (tylko `localhost`, bez haseł), autozapis z kontrolą
  wersji, wczytywanie książek z kontrolą sumy SHA-256 treści względem mechaniki.
- `testy/e2e/test-dymny.cjs` — test w przeglądarce (Playwright): 43/43.

**Zmieniono**
- README (stan, uruchomienie, testy), ARCHITEKTURA (warstwa danych, ekran główny), FIREBASE (format listy
  „Cofnij” i zapisów ręcznych), LICENCJA_I_ZGODA (checklista rozdz. 6 — przegląd 2026-11-02).
- Decyzje D35–D38; otwarte pytanie P14 („Wagabunda” na stronie „od Wydawnictwa”).

### 2026-11-01 — Etap 3 (część 1): mechanika „Vae Victis” i silnik gry

**Dodano**
- `narzedzia/konwersja/generuj_mechanike.py` + `mechanika_vae-victis.json` — generator warstwy mechaniki
  odczytujący zapisy z tekstu dosłownie (oznaczenia `(U#n)`, wiersze warunków, „po raz kolejny/drugi”,
  „nie możesz wybrać tej opcji”); przypadek opisany prozą (§85, zestawy Informacji) w konfiguracji.
- `ksiazki/vae-victis/mechanika.json` — 90 węzłów z mechaniką: 48 zdobyć Informacji, 88 warunków,
  43 Informacje; flagi `ambiguous` dla §170, §259, §286, §289.
- `narzedzia/weryfikacja/weryfikuj_mechanike.py` — walidacja M1–M5: 5/5 (408/408 węzłów gry i 21/21
  zakończeń osiągalnych ze startu).
- Silnik gry `aplikacja/js/core/` (`conditions.js`, `state.js`, `engine.js`): warunki, efekty przy
  wejściu i przy wyborze, odwiedziny, zakończenia, „Cofnij” krok po kroku, „Nowa gra” z zachowaniem
  odkrytych zakończeń, tryb ręczny.
- `testy/silnik.test.mjs` — 12 testów na prawdziwych danych książki (`node --test 'testy/**/*.test.mjs'`).
- Krój Old Standard TT (Regular, Italic, Bold) z licencją OFL i opisem źródła w `aplikacja/assets/fonts/`.

**Zmieniono**
- Pytanie PW3 do Wydawcy: dopisany §259 („#40 – 235”, „#41 – 278”, „Brak #40 lub Brak #41 – 242”).
- KONWERSJA.md (rozdz. 4 — generator i walidator mechaniki), FORMAT_KSIAZKI.md (rozdz. 6 — pola
  `generator`, `ambiguous`), ARCHITEKTURA.md (oznaczenia dróg, niejednoznaczne warunki), karta książki.
- Decyzje D32–D34.

### 2026-11-01 — Etap 1: „Vae Victis” w JSON

**Dodano**
- `narzedzia/konwersja/epub_do_json.py` i `konfiguracja_vae-victis.json` — konwersja EPUB → JSON
  (biblioteka standardowa, wynik deterministyczny).
- `narzedzia/weryfikacja/weryfikuj_tresc.py` — kontrole W1–W8 z niezależnym odczytem tekstu (8/8).
- `ksiazki/vae-victis/tresc.json`, `stopka.json`, `grafiki/` (wygenerowane), `ksiazka.json`
  (manifest), `ksiazki/katalog.json`.

**Zmieniono**
- `dokumentacja/KONWERSJA.md` (status i polecenia), karta „Vae Victis” (pliki danych, wyniki), ten
  plik (stan, następne kroki, Etap 1, decyzja D31).

### 2026-11-01 — Uniwersalny AGENTS.md; dokumenty zgód poza repozytorium

**Zmieniono**
- `dokumentacja/LICENCJA_I_ZGODA.md`: rejestr zgód (z cytatami w rozdz. 1) jako wiążący zapis
  warunków; „brak wpisu = brak zgody”; N8 — oryginały zgód przechowuje właściciel (mogą zniknąć z
  repozytorium); procedura dodania książki i checklista bez wymogu PDF w `Pliki/`.
- `dokumentacja/FORMAT_KSIAZKI.md`: manifest wskazuje rejestr zgód (`consent.register`) zamiast
  pliku PDF; weryfikacja sprawdza wpis w rejestrze.
- Karta „Vae Victis”, `README.md`, `Analizy/Pytania_Do_Wydawcy_2026-10-29.md`: bez odnośników do
  PDF ze zgodą (oryginał u właściciela).
- Ten plik: decyzje D29–D30, stan bieżący, następne kroki.
- Uniwersalna treść `AGENTS.md` przekazana właścicielowi w czacie (plik podmienia właściciel).

### 2026-11-01 — Logowanie loginem i hasłem; odpowiedzi P4, P6, P8, P9; pytanie PW3

**Zmieniono**
- (właściciel) `AGENTS.md` — nowa treść: zasady tworzenia analiz, zakaz modyfikacji `AGENTS.md` i
  `CLAUDE.md`, pytania prostym językiem.
- `dokumentacja/FIREBASE.md`: konta `Player1` … `Player6` z polami `PlayerName` i `PlayerPassword`,
  logowanie przez kolejne sprawdzanie kont, `appConfig/public.playerCount`, sesje z loginem, szkic
  reguł, 3 miejsca na ręczny zapis (`save1` … `save3`), kopie zapasowe, procedury administratora.
- `dokumentacja/ARCHITEKTURA.md`: logowanie loginem i hasłem, 3 ręczne zapisy, „Nowa gra” z
  pytaniem o notatki, niejednoznaczne warunki (obie drogi dostępne).
- `Analizy/Pytania_Do_Wydawcy_2026-10-29.md`: nowe pytanie PW3 (§170, §286, §289), szkic wiadomości
  z trzema pytaniami.
- Karta „Vae Victis” (pułapki konwersji, pkt 7) i ten plik: decyzje D25–D28, pytania P4, P6, P8, P9
  rozstrzygnięte.
- Propozycja poprawionej treści `AGENTS.md` (nazwy pól logowania) przekazana właścicielowi w czacie.

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
