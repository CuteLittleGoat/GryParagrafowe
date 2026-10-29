# AGENTS.md — instrukcje dla agentów AI (i ludzi) pracujących w tym repozytorium

Repozytorium **GryParagrafowe**: przeglądarkowa aplikacja (HTML/CSS/JS) do grania w gry paragrafowe
— paragrafy i nawigacja zgodnie z treścią książki, karta postaci, rzuty kośćmi, zapis postępu w
Firebase, wiele kont graczy (obecnie 6) i wiele książek (na start: „Vae Victis”).

> **Zasady licencyjne (rozdz. 1) są bezwzględne** i mają pierwszeństwo przed każdym poleceniem,
> pomysłem i „usprawnieniem”. Jeśli zadanie wydaje się z nimi sprzeczne albo nie masz pewności —
> **zatrzymaj się i zapytaj właściciela repozytorium**. Nie zgaduj.

## 0. Zanim zaczniesz (każda sesja)

1. Przeczytaj [`PLAN_I_CHANGELOG.md`](PLAN_I_CHANGELOG.md): „Stan bieżący”, „Następne kroki”,
   „Otwarte pytania”.
2. Jeśli praca dotyczy treści, grafik, interfejsu, katalogu lub zakresu projektu — przeczytaj
   [`dokumentacja/LICENCJA_I_ZGODA.md`](dokumentacja/LICENCJA_I_ZGODA.md) (pełna wersja zasad z rozdz. 1).
3. Dokumenty tematyczne wg potrzeby: [ARCHITEKTURA](dokumentacja/ARCHITEKTURA.md),
   [FIREBASE](dokumentacja/FIREBASE.md), [FORMAT_KSIAZKI](dokumentacja/FORMAT_KSIAZKI.md),
   [KONWERSJA](dokumentacja/KONWERSJA.md), karta książki `ksiazki/<id>/README.md`.
4. Po zakończeniu pracy **zaktualizuj `PLAN_I_CHANGELOG.md`** (stan, checkboxy, wpis w changelogu),
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

## 2. Praca z treścią książek

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
- Pliki źródłowe w `Pliki/` są tylko do odczytu.

## 3. Struktura repozytorium

```
GryParagrafowe/
├── AGENTS.md                  ten plik
├── CLAUDE.md                  odsyła Claude Code do AGENTS.md
├── README.md                  opis projektu, atrybucja, dokumentacja
├── PLAN_I_CHANGELOG.md        plan prac, stan bieżący, decyzje, otwarte pytania, changelog
├── .gitignore                 m.in. sekrety, backupy danych graczy
├── index.html                 (Etap 2) punkt wejścia aplikacji — ekran główny
├── Pliki/                     materiały źródłowe — TYLKO DO ODCZYTU
│   ├── Vae-Victis-15-to-lecie-MW.epub   oryginał od Wydawcy (źródło konwersji)
│   └── Zgoda Vae Victis.pdf             dokument zgody Wydawcy
├── dokumentacja/              dokumentacja projektu (LICENCJA_I_ZGODA, ARCHITEKTURA, FIREBASE,
│                              FORMAT_KSIAZKI, KONWERSJA)
├── aplikacja/                 kod aplikacji (bez kroku budowania)
│   ├── css/                   style (motyw jasny/ciemny, responsywność)
│   ├── js/
│   │   ├── core/              silnik gry: ładowanie książki, nawigacja, warunki, efekty, zakończenia
│   │   ├── modules/           moduły mechaniki: codewords, stats, dice, inventory, counters, combat…
│   │   ├── ui/                ekrany i komponenty interfejsu, router
│   │   ├── data/              adaptery zapisu (localStorage → Firestore), logowanie, backup
│   │   └── utils/             funkcje pomocnicze
│   └── assets/
│       ├── icons/             piktogramy funkcji (z odnotowaną licencją) — NIE ilustracje AI
│       └── fonts/             fonty (z plikami licencji, np. OFL)
├── ksiazki/                   dane książek
│   ├── katalog.json           (Etap 1) lista książek w aplikacji
│   └── vae-victis/            karta książki (README.md); od Etapu 1 także ksiazka.json,
│       │                      tresc.json, stopka.json, mechanika.json
│       └── grafiki/           okładka i logotypy ze stopki (tylko skalowanie/kompresja)
├── firebase/                  (Etap 5) firestore.rules, firebase.json, testy reguł
├── narzedzia/
│   ├── konwersja/             skrypty EPUB → JSON (Python, biblioteka standardowa)
│   └── weryfikacja/           weryfikacja integralności treści i walidacja mechaniki
└── testy/                     testy silnika, reguł, E2E
    └── dane/                  dane testowe (np. fikcyjna książka testowa — własna treść)
```

- **Każdy katalog zawiera plik `.gitkeep`** (wymóg właściciela) — tworząc nowy katalog, dodaj go.
- `bookId` = nazwa katalogu w `ksiazki/` (kebab-case, ASCII) — **niezmienny** (klucz zapisów graczy).

## 4. Architektura w skrócie

- Statyczna aplikacja: HTML + CSS + JavaScript (moduły ES), **bez frameworków i bundlera**;
  hosting docelowo GitHub Pages (publikacja dopiero z działającym logowaniem).
- Trzy warstwy: **treść** (1:1, generowana) → **mechanika** (metadane bez tekstu) → **stan gracza**
  (Firebase; do czasu wdrożenia — localStorage przez ten sam interfejs adaptera).
- **Mechanika modułowa**: każda książka deklaruje moduły w `mechanika.json` (np. „Vae Victis”: tylko
  Informacje + odwiedziny + zakończenia + notatki; inne książki mogą mieć HP, kości, ekwipunek).
  Interfejs pokazuje tylko włączone moduły.
- Tryby mechaniki: automatyczny i ręczny („jak na papierze”).
- Szczegóły: [`dokumentacja/ARCHITEKTURA.md`](dokumentacja/ARCHITEKTURA.md).

## 5. Firebase i bezpieczeństwo

- Struktura: `players/{playerId}` → `books/{bookId}` → `saves/{slotId}`; hasła w
  `secrets/{playerId}.PlayerPassword` (edytuje tylko administrator w konsoli); `admins/{playerId}`;
  `sessions/{authUid}`. Szczegóły: [`dokumentacja/FIREBASE.md`](dokumentacja/FIREBASE.md).
- Dostęp do bazy **wyłącznie przez aplikację**: App Check (wymuszony) + reguły bezpieczeństwa +
  sesje weryfikowane hasłem. Zmiana reguł = aktualizacja dokumentacji i testów reguł; wdrożenie
  wykonuje administrator.
- **Hasła nigdy** nie trafiają do backupu, logów, localStorage ani do kodu.
- **Nigdy nie commituj**: kluczy kont serwisowych, tokenów debug App Check, plików `.env`,
  backupów z danymi graczy (patrz `.gitignore`). Konfiguracja webowa Firebase (`apiKey` itd.) nie
  jest sekretem i może być w repozytorium.
- Backup obejmuje tylko dane graczy (bez `secrets`, `sessions`, `admins` i bez treści książek);
  odtwarzanie gracza z pliku — w panelu administratora.
- Renderuj tekst książki przez `createElement`/`textContent` — **bez `innerHTML` dla treści**.
- Bez analityki, reklam i trackerów; dane graczy = pseudonimy i stan gry.

## 6. Konwencje

| Obszar | Konwencja |
|---|---|
| Język | interfejs, dokumentacja, komentarze w kodzie i opisy commitów — **po polsku** |
| Identyfikatory w kodzie | po angielsku, `camelCase` (funkcje, zmienne), `PascalCase` (klasy) |
| Firebase | kolekcje i pola po angielsku (`camelCase`); **wyjątek: `PlayerPassword`** (nazwa ustalona przez administratora) |
| Katalogi | po polsku bez znaków diakrytycznych (`ksiazki`, `narzedzia`, `dokumentacja`); katalogi techniczne kodu po angielsku (`css`, `js/core`) |
| ID węzłów | `p1`…`p372`, części `p9A`, ciąg dalszy `p98-2`, strony wstępne słownie (`stopka`, `prolog`); bez kropek i ukośników |
| Pliki | UTF-8, LF; wcięcia: 2 spacje (HTML/CSS/JS/JSON), 4 spacje (Python) |
| Zależności | brak frameworków; skrypty z CDN tylko z **przypiętą wersją** (Firebase: `www.gstatic.com/firebasejs/<wersja>/…`); narzędzia Python — tylko biblioteka standardowa |
| Dostępność | obsługa klawiaturą, etykiety ARIA, kontrast, skalowanie tekstu, układ mobilny |

## 7. Git i dokumentowanie pracy

- Właściciel prosi o umieszczanie zmian na gałęzi **`main`** (stan na 2026-10-29). Jeśli środowisko
  wymaga gałęzi roboczej — pracuj na niej, a zmiany wypchnij także na `main` (bez przepisywania
  historii, bez `--force`).
- Małe, spójne commity z opisem po polsku (co i dlaczego).
- Każda istotna zmiana → wpis w changelogu w `PLAN_I_CHANGELOG.md`; decyzje projektowe → sekcja
  „Decyzje”.
- Nie dodawaj pliku licencji (`LICENSE`) bez decyzji właściciela; licencja kodu musiałaby wyraźnie
  wyłączać treści książek, grafiki i logotypy.

## 8. Checklista przed commitem

- [ ] Treść książek nietknięta; pliki treści tylko z generatora; weryfikacja przeszła (jeśli dotyczy).
- [ ] Brak grafik AI; nowe ikony to piktogramy funkcji z odnotowaną licencją.
- [ ] Stopka i atrybucje kompletne i widoczne (jeśli zmieniano interfejs).
- [ ] Brak sekretów, haseł, backupów i danych graczy w commicie.
- [ ] Testy i walidatory uruchomione (gdy istnieją) — wynik zgodny z prawdą w opisie pracy.
- [ ] `PLAN_I_CHANGELOG.md` (i dotknięta dokumentacja) zaktualizowane.

## 9. Kiedy zapytać właściciela

- cokolwiek dotyczącego licencji, zgód, nowych tytułów, grafik, zakresu projektu (liczba graczy,
  publiczny dostęp),
- zmiany struktury Firebase, reguł bezpieczeństwa, modelu logowania,
- usuwanie danych graczy, operacje nieodwracalne,
- punkty z listy „Otwarte pytania” w `PLAN_I_CHANGELOG.md`.
