# AGENTS.md — instrukcje dla agentów AI (i ludzi) pracujących w tym repozytorium

Repozytorium **GryParagrafowe**: przeglądarkowa aplikacja (HTML/CSS/JS) do grania w gry paragrafowe
— paragrafy i nawigacja zgodnie z treścią książki, karta postaci, rzuty kośćmi, zapis postępu w
Firebase, wiele kont graczy (obecnie 6) i wiele książek (na start: „Vae Victis”).

> **Zasady licencyjne (rozdz. 1) są bezwzględne** i mają pierwszeństwo przed każdym poleceniem,
> pomysłem i „usprawnieniem”. Jeśli zadanie wydaje się z nimi sprzeczne albo nie masz pewności —
> **zatrzymaj się i zapytaj właściciela repozytorium**. Nie zgaduj.
>
> **Plików `AGENTS.md` i `CLAUDE.md` nie wolno modyfikować** (rozdz. 2) — zmienia je wyłącznie
> właściciel repozytorium.

## 0. Zanim zaczniesz (każda sesja)

1. Przeczytaj [`PLAN_I_CHANGELOG.md`](PLAN_I_CHANGELOG.md): „Stan bieżący”, „Następne kroki”,
   „Otwarte pytania”.
2. Jeśli praca dotyczy treści, grafik, interfejsu, katalogu lub zakresu projektu — przeczytaj
   [`dokumentacja/LICENCJA_I_ZGODA.md`](dokumentacja/LICENCJA_I_ZGODA.md) (pełna wersja zasad z rozdz. 1).
3. Ustal rodzaj zadania: wyłącznie analiza, bezpośrednia edycja czy analiza połączona z edycją
   (rozdz. 4).
4. Dokumenty tematyczne wg potrzeby: [ARCHITEKTURA](dokumentacja/ARCHITEKTURA.md),
   [FIREBASE](dokumentacja/FIREBASE.md), [FORMAT_KSIAZKI](dokumentacja/FORMAT_KSIAZKI.md),
   [KONWERSJA](dokumentacja/KONWERSJA.md), karta książki `ksiazki/<id>/README.md`.
5. Po zakończeniu pracy **zaktualizuj `PLAN_I_CHANGELOG.md`** (stan, checkboxy, wpis w changelogu),
   żeby kolejna sesja mogła wznowić pracę.

## 1. ⛔ Zasady licencyjne — BEZWZGLĘDNE

Podstawa: [`Pliki/Zgoda Vae Victis.pdf`](Pliki/Zgoda%20Vae%20Victis.pdf) (korespondencja z
Wydawnictwem Wielokrotnego Wyboru, 27–29.10.2026) oraz sekcja „LICENCJA” w stopce publikacji:
„Niniejsza publikacja nie może być rozpowszechniana, adaptowana, modyfikowana ani odsprzedawana bez
pisemnej zgody Wydawcy.”

### 1.1. Zakres zgody

- ✅ **Wyłącznie „Vae Victis”** (Beniamin Muszyński) — zgoda Wydawcy z 29.10.2026, **„na ten moment”**.
- ✅ Konwersja EPUB/PDF → JSON, publicznie w repozytorium; podział na paragrafy, przejścia, technika
  mechaniki; karta postaci, ekwipunek, statystyki, rzuty kośćmi, zapis postępu; kod i animacje
  tworzone z pomocą AI (ujawnione Wydawcy).
- ✅ Okładka — **tylko z informacją o autorce ilustracji (Justyna Bzdoń)**.
- ✅ Ikony/piktogramy funkcji interfejsu (kość, karta postaci itp.).
- ⛔ **„Wagabunda”** (Krzysztof Firkowski) — **odmowa** (tytuł z dzieloną licencją).
- ⛔ **Każdy inny tytuł** — tylko po osobnej, pisemnej zgodzie Wydawcy, zarchiwizowanej w `Pliki/`.
- Projekt **wewnętrzny**: wąskie grono (w prośbie „ok. 5 osób”, obecnie 6 graczy), **niekomercyjny**.

### 1.2. NAKAZY

1. **Atrybucja przy każdej grze**: tytuł, autor(zy), informacja o Wydawnictwie Wielokrotnego Wyboru /
   portalu Masz Wybór, odnośnik do oficjalnej strony publikacji i do strony Wydawnictwa.
2. **Wszystkie informacje o źródle tekstu** (wydawca, wydanie, ISBN, plik, strona do pobrania).
3. **Pełna stopka redakcyjna, dosłownie — „od copyrightingu po numer ISBN”** — na ekranie głównym
   przy danej książce i w „O książce”. Generowana skryptem z EPUB, nigdy przepisywana ręcznie.
4. **Okładka zawsze z podpisem autorki ilustracji** (Justyna Bzdoń).
5. **Treść 1:1** — konwersja służy wyłącznie podziałowi, przejściom i technicznej obsłudze mechaniki.
6. **Niekomercyjność** i **wąskie grono**: gra tylko dla zalogowanych graczy (konta zakłada
   administrator), bez trybu gościa, bez otwartej rejestracji.
7. Dokumenty zgód zostają w `Pliki/` (nie usuwać, nie zmieniać); rejestr zgód w
   `dokumentacja/LICENCJA_I_ZGODA.md`.
8. Zgoda jest „na ten moment” — przy jej wycofaniu: wyłączyć książkę i usunąć jej treść z repozytorium.
9. Stopka aplikacji: **projekt nieoficjalny, niekomercyjny; treść za zgodą Wydawcy**.
10. Odnośniki zewnętrzne z treści zostają linkami zewnętrznymi (np. gra „Jestem” — **nie ma zgody**).

### 1.3. ZAKAZY

1. **Żadnych zmian w treści książki** — nie poprawiaj literówek, ortografii, interpunkcji, stylu
   (nawet oczywistych błędów, np. „cześci A”), nie zmieniaj znaków typograficznych („”, –, …, twarde
   spacje), nie skracaj, nie łącz, nie przestawiaj, nie pomijaj fragmentów (także stron wstępnych),
   nie dopisuj, nie tłumacz, nie parafrazuj wyborów na przyciskach, nie „naprawiaj” odnośników.
2. **Żadnych grafik generowanych przez AI** (ilustracje, portrety, sceny, mapy, tła, warianty
   okładki, AI-upscaling). Ikony tylko jako piktogramy funkcji — nie przedstawiają treści książki.
3. **Żadnych treści generowanych przez AI z tekstu książki**: streszczeń, podpowiedzi fabularnych,
   tłumaczeń, lektora/TTS, czatów z postaciami, quizów.
4. **Żadnych nowych tytułów bez pisemnej zgody** — nawet roboczo; „Wagabunda” w żadnej formie.
5. **Żadnej komercjalizacji**: reklamy, płatności, subskrypcje, zbiórki/darowizny na projekt,
   afiliacja, analityka marketingowa (Google Analytics wyłączony).
6. **Żadnych modyfikacji okładki i logotypów** (kadrowanie, filtry, rozmycie, nakładki, użycie jako
   tła) — wolno tylko proporcjonalnie skalować i kompresować.
7. **Nie usuwaj, nie skracaj, nie ukrywaj** stopki i atrybucji.
8. Logotypów Wydawnictwa/portalu używamy **tylko w odwzorowaniu stopki** (nie jako logo aplikacji,
   favicon, ikona PWA).
9. **Żadnego eksportu treści** (pobierz/drukuj książkę, PDF/EPUB/TXT, publiczne API z treścią).
10. **Treść książek nie trafia do Firebase** ani do backupów — Firebase przechowuje tylko stan graczy.
11. **Bez zmiany zakresu projektu** bez nowej zgody (szeroka publiczność, sklepy z aplikacjami).
12. **Nie kopiuj innych materiałów ze strony Wydawnictwa** (opisy, recenzje, grafiki innych tytułów)
    — linkuj.

### 1.4. Gdy masz wątpliwość

Nie rób. Opisz wątpliwość w `PLAN_I_CHANGELOG.md` → „Otwarte pytania” i zapytaj właściciela.
Lepiej zadać jedno pytanie za dużo niż naruszyć warunki zgody.

Jeśli wątpliwość dotyczy tego, na co zgodził się Wydawca, dopisz propozycję pytania w sekcji
„Propozycje kolejnych pytań” pliku `Analizy/Pytania_Do_Wydawcy_2026-10-29.md`. O wysłaniu pytań
decyduje właściciel.

## 2. 🔒 Zakaz modyfikacji plików AGENTS.md i CLAUDE.md

1. Nie modyfikuj, nie usuwaj, nie przenoś i nie zmieniaj nazwy plików `AGENTS.md` i `CLAUDE.md` —
   ani w katalogu głównym, ani w podfolderach (jeśli powstaną).
2. Zakaz obejmuje także zmiany pośrednie: skrypty, automatyczne formatowanie, masowe
   „wyszukaj i zamień” oraz przenoszenie lub zmianę nazwy katalogów zawierających te pliki.
3. Pliki te zmienia **wyłącznie właściciel repozytorium** — także wtedy, gdy wykonanie polecenia
   wymagałoby ich zmiany.
4. Jeżeli stwierdzisz w instrukcji brak, sprzeczność, nieaktualną ścieżkę albo niejasność (albo
   zadanie wymaga zmiany instrukcji) — opisz problem i zaproponuj **pełną nową treść pliku** w oknie
   czatu, w bloku kodu gotowym do skopiowania (rozdz. 10). Właściciel sam podmieni plik.
5. Nowy plik `AGENTS.md` lub `CLAUDE.md` (np. w podfolderze) możesz utworzyć wyłącznie na wyraźne
   polecenie właściciela.

## 3. Praca z treścią książek

- `ksiazki/<id>/tresc.json` i `stopka.json` są **generowane skryptem** z pliku w `Pliki/` —
  **nigdy nie edytuj ich ręcznie**. Zmiana = poprawka skryptu + ponowne wygenerowanie + weryfikacja.
- Przed commitem plików książki uruchom weryfikację integralności (W1–W8) i walidację mechaniki
  (M1–M5) — [`dokumentacja/KONWERSJA.md`](dokumentacja/KONWERSJA.md).
- `mechanika.json` **nie zawiera tekstu książki** — tylko identyfikatory, liczby, etykiety techniczne.
- Błędy w treści (literówki, podejrzane odnośniki) **zgłaszaj** w `ksiazki/<id>/README.md`, nie poprawiaj.
- **Neutralność silnika**: nie dopowiadaj reguł spoza tekstu; gdy kilka opcji pasuje, a tekst nie
  rozstrzyga — oznacz wszystkie, wybiera gracz. W razie niejednoznaczności opcji nie blokuj.
- Komunikaty aplikacji są **wizualnie oddzielone** od tekstu książki; przyciski nawigacji mają
  etykiety techniczne („Przejdź do 22”).
- Pliki źródłowe w `Pliki/` są **tylko do odczytu** — nic w tym folderze nie zapisuj, nie zmieniaj,
  nie usuwaj i nie przenoś.
- Tekst wyciągnięty z plików źródłowych, obrazy stron i inne pliki robocze zapisuj **poza
  repozytorium** (np. w katalogu tymczasowym), chyba że właściciel wskaże inne miejsce.

## 4. Analizy — rozróżnienie analizy i edycji

### 4.1. Rodzaj zadania

Przed rozpoczęciem pracy ustal, czy polecenie dotyczy:
- wyłącznie analizy,
- bezpośredniej edycji wskazanego pliku,
- analizy połączonej z edycją.

### 4.2. Wyłącznie analiza

Za zadanie analityczne uznaje się m.in.:
- sprawdzenie zgodności aplikacji, danych lub planów z warunkami zgody Wydawcy i licencją,
- porównanie treści JSON z plikiem źródłowym (EPUB/PDF) albo dwóch wersji danych książki,
- analizę pliku źródłowego (EPUB, PDF) lub innego materiału,
- analizę mechaniki książki (np. przed przygotowaniem `mechanika.json`),
- analizę bezpieczeństwa, kosztów i limitów (reguły Firebase, App Check, logowanie),
- porównanie wariantów rozwiązań i przygotowanie rekomendacji,
- wskazanie błędów bez nanoszenia zmian w analizowanym pliku.

Jeżeli użytkownik prosi wyłącznie o analizę i nie poleca zmiany konkretnego pliku, zapisz wyniki w
nowym pliku w folderze `Analizy/`, np. `Analizy/Zgodnosc_Ekranu_Glownego_Ze_Zgoda_Wydawcy_2026-11-05.md`.

### 4.3. Bezpośrednia edycja

Jeżeli użytkownik wyraźnie poleca poprawić, uzupełnić, przekształcić albo zaktualizować konkretny
plik, wprowadź zmiany bezpośrednio w tym pliku (w plikach generowanych — w ich źródle, czyli
skrypcie; rozdz. 3). Nie twórz wtedy dodatkowego raportu w `Analizy/`, chyba że:
- użytkownik wyraźnie o niego poprosi,
- analiza stanowi osobny rezultat zadania.

### 4.4. Analiza połączona z edycją

Jeżeli użytkownik poleca np. „sprawdź i popraw”, przeprowadź analizę potrzebną do wykonania zadania,
a następnie nanieś uzasadnione zmiany w odpowiednim pliku. Nie zapisuj osobnego raportu w
`Analizy/`, jeżeli użytkownik nie poprosił o osobne przedstawienie wniosków.

### 4.5. Zawartość pliku analizy

Każdy nowy plik w folderze `Analizy/` musi zawierać:
1. tytuł opisujący przedmiot analizy,
2. treść polecenia użytkownika — w osobnej sekcji „Polecenie użytkownika”, jako cytat,
3. wskazanie analizowanych plików lub źródeł wraz z ich wersją (np. ścieżka i suma SHA-256 pliku
   źródłowego, commit, adres strony z datą sprawdzenia),
4. ustalenia i wykryte problemy,
5. rekomendacje albo proponowane poprawki,
6. informacje o niepewnościach, brakujących danych lub sprzecznościach między źródłami.

### 4.6. Zasady dodatkowe

- Nazwa pliku jasno wskazuje zawartość i zawiera datę: `Temat_Analizy_RRRR-MM-DD.md` (bez polskich
  znaków, słowa oddzielone podkreślnikiem). Nie używaj nazw ogólnych, takich jak `Analiza.md`.
- Analiza nie jest źródłem obowiązujących zasad. Ustalenia, które mają obowiązywać, przenosi się (na
  polecenie właściciela) do `dokumentacja/` lub `PLAN_I_CHANGELOG.md`.
- Nie przedstawiaj przypuszczeń jako faktów; jeżeli źródła są niepełne lub sprzeczne, opisz to i
  wskaż, na którym źródle oparto wynik.
- Analizy podlegają zasadom licencyjnym (rozdz. 1): fragmenty treści książki cytuj dosłownie i tylko
  w zakresie potrzebnym do wskazania miejsca (z numerem paragrafu); nie zapisuj „poprawionych” wersji
  tekstu książki — błędy w treści opisuj jako zgłoszenia (rozdz. 3).
- Wyjątek: `Analizy/Pytania_Do_Wydawcy_2026-10-29.md` to plik prowadzony na bieżąco — rejestr pytań
  do Wydawcy, uzupełniany wraz z postępem prac (zasady w samym pliku).

## 5. Struktura repozytorium

| Ścieżka | Zawartość |
|---|---|
| `AGENTS.md`, `CLAUDE.md` | instrukcje dla agentów — **zmienia wyłącznie właściciel** (rozdz. 2); `CLAUDE.md` odsyła Claude Code do `AGENTS.md` |
| `README.md` | opis projektu, atrybucja, spis dokumentacji |
| `PLAN_I_CHANGELOG.md` | plan prac, stan bieżący, decyzje, otwarte pytania, changelog |
| `.gitignore` | m.in. sekrety, backupy danych graczy |
| `index.html` | (Etap 2) punkt wejścia aplikacji — ekran główny |
| `Pliki/` | materiały źródłowe: oryginał EPUB od Wydawcy, dokument zgody — **tylko do odczytu** |
| `Analizy/` | raporty z analiz (rozdz. 4); `Pytania_Do_Wydawcy_2026-10-29.md` — bieżący rejestr pytań do Wydawcy |
| `dokumentacja/` | dokumentacja projektu: LICENCJA_I_ZGODA, ARCHITEKTURA, FIREBASE, FORMAT_KSIAZKI, KONWERSJA |
| `aplikacja/css/` | style (motyw jasny/ciemny, responsywność) |
| `aplikacja/js/core/` | silnik gry: ładowanie książki, nawigacja, warunki, efekty, zakończenia |
| `aplikacja/js/modules/` | moduły mechaniki: codewords, stats, dice, inventory, counters, combat… |
| `aplikacja/js/ui/` | ekrany i komponenty interfejsu, router |
| `aplikacja/js/data/` | adaptery zapisu (localStorage → Firestore), logowanie, backup |
| `aplikacja/js/utils/` | funkcje pomocnicze |
| `aplikacja/assets/icons/` | piktogramy funkcji (z odnotowaną licencją) — **nie ilustracje AI** |
| `aplikacja/assets/fonts/` | fonty (z plikami licencji, np. OFL) |
| `ksiazki/katalog.json` | (Etap 1) lista książek w aplikacji |
| `ksiazki/<bookId>/` | karta książki (`README.md`); od Etapu 1 także `ksiazka.json`, `tresc.json`, `stopka.json`, `mechanika.json` |
| `ksiazki/<bookId>/grafiki/` | okładka i logotypy ze stopki (tylko skalowanie/kompresja) |
| `firebase/firebase-config.js` | konfiguracja webowa Firebase (jawna, nie jest sekretem) — zmiany tylko na polecenie właściciela |
| `firebase/` | (Etap 5) także `firestore.rules`, `firebase.json`, testy reguł |
| `narzedzia/konwersja/` | skrypty EPUB → JSON (Python, biblioteka standardowa) |
| `narzedzia/weryfikacja/` | weryfikacja integralności treści i walidacja mechaniki |
| `testy/` | testy silnika, reguł, E2E |
| `testy/dane/` | dane testowe (np. fikcyjna książka testowa — własna treść) |

- **Każdy katalog zawiera plik `.gitkeep`** (wymóg właściciela) — tworząc nowy katalog, dodaj go.
- Nie twórz nowych katalogów najwyższego poziomu bez polecenia właściciela.
- `bookId` = nazwa katalogu w `ksiazki/` (kebab-case, ASCII) — **niezmienny** (klucz zapisów graczy).

## 6. Architektura w skrócie

- Statyczna aplikacja: HTML + CSS + JavaScript (moduły ES), **bez frameworków i bundlera**;
  hosting: GitHub Pages (decyzja właściciela; publikacja dopiero z działającym logowaniem).
- Trzy warstwy: **treść** (1:1, generowana) → **mechanika** (metadane bez tekstu) → **stan gracza**
  (Firebase; do czasu wdrożenia — localStorage przez ten sam interfejs adaptera).
- **Mechanika modułowa**: każda książka deklaruje moduły w `mechanika.json` (np. „Vae Victis”: tylko
  Informacje + odwiedziny + zakończenia + notatki; inne książki mogą mieć HP, kości, ekwipunek).
  Interfejs pokazuje tylko włączone moduły.
- Tryby mechaniki: automatyczny i ręczny („jak na papierze”).
- Szczegóły: [`dokumentacja/ARCHITEKTURA.md`](dokumentacja/ARCHITEKTURA.md).

## 7. Firebase i bezpieczeństwo

- Projekt Firebase: **`gryparagrafowe-e1fb3`**; konfiguracja webowa: `firebase/firebase-config.js`
  (jawna — nie jest sekretem). Zmiany w tym pliku tylko na polecenie właściciela; **nigdy** nie
  dopisuj do niego tokenu debug App Check.
- Reguły Firestore w konsoli: obecnie **tymczasowa blokada całego dostępu** (od 2026-10-29).
  Docelowe reguły przygotowujemy, gdy aplikacja zacznie tworzyć dokumenty (Etap 5); publikuje je
  właściciel.
- Struktura: `players/{playerId}` → `books/{bookId}` → `saves/{slotId}`; hasła w
  `secrets/{playerId}.PlayerPassword` (edytuje tylko administrator w konsoli); `admins/{playerId}`;
  `sessions/{authUid}`. Szczegóły: [`dokumentacja/FIREBASE.md`](dokumentacja/FIREBASE.md).
- Dostęp do bazy **wyłącznie przez aplikację**: App Check (reCAPTCHA Enterprise na bezpłatnym planie
  Spark, domena `cutelittlegoat.github.io`, TTL 1 dzień, wymuszenie po okresie obserwacji) + reguły
  bezpieczeństwa + sesje weryfikowane hasłem. Zmiana reguł = aktualizacja dokumentacji i testów
  reguł; wdrożenie wykonuje właściciel.
- **Hasła nigdy** nie trafiają do backupu, logów, localStorage ani do kodu.
- **Nigdy nie commituj**: kluczy kont serwisowych, tokenów debug App Check, plików `.env`,
  backupów z danymi graczy (patrz `.gitignore`). Konfiguracja webowa Firebase (`apiKey` itd.) i klucz
  witryny reCAPTCHA Enterprise nie są sekretami.
- Backup obejmuje tylko dane graczy (bez `secrets`, `sessions`, `admins` i bez treści książek);
  odtwarzanie gracza z pliku — w panelu administratora.
- Renderuj tekst książki przez `createElement`/`textContent` — **bez `innerHTML` dla treści**.
- Bez analityki, reklam i trackerów; dane graczy = pseudonimy i stan gry.

## 8. Konwencje

| Obszar | Konwencja |
|---|---|
| Język | interfejs, dokumentacja, analizy, komentarze w kodzie i opisy commitów — **po polsku** |
| Identyfikatory w kodzie | po angielsku, `camelCase` (funkcje, zmienne), `PascalCase` (klasy) |
| Firebase | kolekcje i pola po angielsku (`camelCase`); **wyjątek: `PlayerPassword`** (nazwa ustalona przez administratora) |
| Katalogi | po polsku bez znaków diakrytycznych (`ksiazki`, `narzedzia`, `dokumentacja`); katalogi techniczne kodu po angielsku (`css`, `js/core`); wielką literą — `Pliki/` i `Analizy/` (konwencja właściciela) |
| Pliki analiz | `Analizy/Temat_Analizy_RRRR-MM-DD.md` (rozdz. 4.6) |
| ID węzłów | `p1`…`p372`, części `p9A`, ciąg dalszy `p98-2`, strony wstępne słownie (`stopka`, `prolog`); bez kropek i ukośników |
| Pliki | UTF-8, LF; wcięcia: 2 spacje (HTML/CSS/JS/JSON), 4 spacje (Python) |
| Zależności | brak frameworków; skrypty z CDN tylko z **przypiętą wersją** (Firebase: `www.gstatic.com/firebasejs/<wersja>/…`); narzędzia Python — tylko biblioteka standardowa |
| Dostępność | obsługa klawiaturą, etykiety ARIA, kontrast, skalowanie tekstu, układ mobilny |

## 9. Git i dokumentowanie pracy

- Właściciel prosi o umieszczanie zmian na gałęzi **`main`** (stan na 2026-10-29). Jeśli środowisko
  wymaga gałęzi roboczej — pracuj na niej, a zmiany wypchnij także na `main` (bez przepisywania
  historii, bez `--force`).
- Małe, spójne commity z opisem po polsku (co i dlaczego).
- Nie commituj zmian w `AGENTS.md` ani `CLAUDE.md` (rozdz. 2).
- Każda istotna zmiana → wpis w changelogu w `PLAN_I_CHANGELOG.md`; decyzje projektowe → sekcja
  „Decyzje”.
- Nie dodawaj pliku licencji (`LICENSE`) bez decyzji właściciela; licencja kodu musiałaby wyraźnie
  wyłączać treści książek, grafiki i logotypy.

## 10. Teksty przeznaczone do skopiowania

Jeżeli w odpowiedzi podajesz właścicielowi tekst, który ma on skopiować i wkleić gdzie indziej —
proponowaną treść pliku (np. `AGENTS.md`), polecenie do nowego okna czatu, prompt, komendę, fragment
konfiguracji lub reguł — podaj go w bloku kodu, gotowy do skopiowania w całości jednym ruchem.

1. Cały tekst do skopiowania mieści się w jednym bloku (przy kilku plikach — osobny blok na każdy plik).
2. W bloku nie umieszczaj niczego, czego właściciel nie ma wkleić.
3. Nie stosuj w bloku formatowania, które trzeba ręcznie czyścić po wklejeniu.
4. Komentarze i wyjaśnienia umieść przed blokiem albo po nim, nie w środku.
5. Proponowana treść pliku to zawsze **pełna treść** pliku (nie fragment ani lista zmian), chyba że
   właściciel poprosi inaczej.

## 11. Checklista przed commitem

- [ ] Treść książek nietknięta; pliki treści tylko z generatora; weryfikacja przeszła (jeśli dotyczy).
- [ ] Brak grafik AI; nowe ikony to piktogramy funkcji z odnotowaną licencją.
- [ ] Stopka i atrybucje kompletne i widoczne (jeśli zmieniano interfejs).
- [ ] Brak sekretów, haseł, backupów i danych graczy w commicie.
- [ ] `AGENTS.md` i `CLAUDE.md` nietknięte (rozdz. 2); nic nie zapisano w `Pliki/`.
- [ ] Testy i walidatory uruchomione (gdy istnieją) — wynik zgodny z prawdą w opisie pracy.
- [ ] `PLAN_I_CHANGELOG.md` (i dotknięta dokumentacja) zaktualizowane.

## 12. Kiedy i jak pytać właściciela

**Jak pytać.** Właściciel prosi, żeby pytania były zrozumiałe dla osoby bez wiedzy informatycznej.
Każde pytanie pisz prostym językiem:
- bez żargonu i skrótów; jeśli termin techniczny jest konieczny — wyjaśnij go w jednym zdaniu,
- z przykładem z gry lub z codziennego życia,
- z wariantami do wyboru (A, B, C), krótkim opisem skutków każdego i z rekomendacją,
- jedno zagadnienie w jednym pytaniu.

Pytania zapisuj też w `PLAN_I_CHANGELOG.md` → „Otwarte pytania”, w tej samej prostej formie.

**Kiedy pytać:**
- cokolwiek dotyczącego licencji, zgód, nowych tytułów, grafik, zakresu projektu (liczba graczy,
  publiczny dostęp),
- zmiany struktury Firebase, reguł bezpieczeństwa, modelu logowania, pliku `firebase/firebase-config.js`,
- usuwanie danych graczy, operacje nieodwracalne,
- potrzeba zmiany `AGENTS.md` lub `CLAUDE.md` — opisz problem i podaj pełną nową treść w bloku kodu
  (rozdz. 2 i 10),
- punkty z listy „Otwarte pytania” w `PLAN_I_CHANGELOG.md`.
