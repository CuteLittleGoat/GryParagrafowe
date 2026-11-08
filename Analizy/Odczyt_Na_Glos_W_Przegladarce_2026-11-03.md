# Odczyt na głos funkcją przeglądarki — jak sprawić, żeby czytany był tylko tekst paragrafu

Analiza z 2026-11-03. Rodzaj zadania: **wyłącznie analiza** (AGENTS.md, rozdz. 4.2), więc kod aplikacji
pozostał bez zmian. Na polecenie właściciela dopisano też pytanie do Wydawcy (**PW4** w
[`Pytania_Do_Wydawcy_2026-10-29.md`](Pytania_Do_Wydawcy_2026-10-29.md)).

> **Status (2026-11-08):**
> - Wariant A wdrożono 2026-11-03: porządek w znacznikach HTML i komentarze po polsku (D55).
> - Wariant B (przycisk „Sam tekst”) i pytanie PW4 do Wydawcy są **wstrzymane** decyzją właściciela —
>   na obecną chwilę bez dalszych prac (D62).
> - Analiza zostaje jako opis pomysłu.

## Polecenie użytkownika

> Przeprowadź analizę rozbudowy kodu HTML. Niektóre przeglądarki mają opcję czytania zawartości
> strony. Chciałbym, żeby w przypadku tego HTML syntezator nie czytał przycisków nawigacyjnych,
> przycisków do obsługi książki ("Ustawienia", "Zapisz" itp.) tylko samą treść akapitu. Przeprowadź
> analizę jak to zrobić. Być może potrzebny będzie dodatkowy przycisk i znaczniki HTML w treści. Przy
> okazji przebudowy kodu zadbaj o to, żeby w kodzie HTML były komentarze po polsku. Ważne - to ma
> tylko obsługiwać przeglądarkowy mechanizm zamiany tekstu na mowę. Nie tworzymy żadnego bota do
> odczytu. Wszystkie ustawienia dotyczące odczytu (głos męski, żeński, prędkość odczytu itd.)
> pozostają po stronie przeglądarki.

Uzupełnienie (2026-11-03, w trakcie analizy):

> Dlatego nie chcę tworzyć własnego lektora/TTS tylko nakierować już istniejącego w przeglądarce.
> Niemniej dodaj to do pytań do wydawcy. Czy funkcja nakierowywania lektora wbudowanego w przeglądarkę
> nie łamie zasad licencyjnych.

## W skrócie

1. **Dziś przeglądarka czyta więcej niż tekst paragrafu.**
   - Funkcje czytające całą stronę czytają po kolei wszystko: „Gracz: …”, „Wyloguj”, „Menu główne”,
     „Ustawienia”, „Przejdź do §54”, „Cofnij”, „Tryb mechaniki: automatyczny”.
   - Chrome w „Trybie czytania” pomija przyciski, ale czyta tytuł książki, „Dokąd dalej?” i warunki
     przy przejściach (np. „Warunek: masz Informację #18 — niespełniony”).
   - Czyta też komunikaty (np. „Zdobywasz Informację #19.”) i dopisek „To Twoja gra :) Graj jak
     lubisz!”.
2. **Same znaczniki HTML, bez nowego przycisku, pomagają tylko częściowo.**
   - Chrome czyta wtedy tekst i tytuł książki.
   - Firefox czyta sam tekst, ale tylko w dłuższych paragrafach.
   - Funkcje czytające całą stronę nadal czytają przyciski, bo przyciski są na ekranie.
3. **Pewny sposób to dodatkowy przycisk — roboczo „Sam tekst”.**
   - Na czas słuchania chowa przyciski i komunikaty, więc na ekranie zostaje tekst paragrafu.
   - Pod tekstem zostają przycisk powrotu i linijka z tytułem, autorem i odnośnikiem „O książce”. Tej
     linijki nie wolno schować, bo zasada Z7 zabrania ukrywania atrybucji.
   - W teście wszystkie sprawdzone mechanizmy czytały wtedy sam tekst paragrafu. Funkcje czytające
     całą stronę mogą na końcu dodać te dwie krótkie linijki.
4. **Bez własnego lektora.**
   - Aplikacja nie mówi, nie nagrywa, nie wybiera głosu ani tempa i nie wysyła tekstu do żadnej usługi.
   - Czytanie włącza gracz w swojej przeglądarce i tam ustawia głos i tempo — dokładnie tak, jak w
     poleceniu.
5. **Licencja.**
   - Nasze zasady zabraniają lektora/TTS tworzonego z tekstu książki (Z3).
   - Ułatwienie pracy lektorowi wbudowanemu w przeglądarkę to przypadek graniczny — stąd pytanie **PW4**
     do Wydawcy.
   - Propozycja (pytanie **P17** do właściciela): porządek w znacznikach i komentarze po polsku od razu,
     a przycisk „Sam tekst” po odpowiedzi Wydawcy.

## Analizowane pliki i źródła

| Źródło | Wersja |
|---|---|
| Aplikacja: `index.html`, `aplikacja/js/ui/game-screen.js`, `aplikacja/js/ui/content-renderer.js`, `aplikacja/css/style.css`, `aplikacja/js/main.js`, `aplikacja/js/ui/settings.js`, `firebase/firestore.rules` | commit `f8bbb3b` (gałąź `main`, 2026-11-03); SHA-256: `index.html` `b0d7e2af6d6bd5cc6bc42b313c118b44850ba1863725bc1b32f13836ba8a35a0`, `game-screen.js` `f71f0b7aa1c9ce690e9e26a2d2b9c5072b06702cd1e577fe8cc870ef7ced9164`, `content-renderer.js` `0d473c02efe1f535cbac15899162822fe7642c1274b4083f29a5d17db953ddfd`, `style.css` `3664e4eefc70336e6ea9fbe4d3921093e753bf8e890b6fd9831d10011d26e856`, `firestore.rules` `7b740157d5e6040e9615ced8f756b47ba6df370b5ce7414d2aef7b363dd402d2` |
| Treść: `ksiazki/vae-victis/tresc.json` (408 części gry) | SHA-256 `7df246e61becf3890d7ca44198bf3ea4f096d214afa378c58cf636172f76bd36` |
| Firefox — biblioteka wybierająca tekst do „Widoku czytnika”: Mozilla Readability (pakiet npm `@mozilla/readability`) | 0.6.0; `Readability.js` `34dcab3d0832d0019f02990eed6b6124e029e8c32b9f0c6f2550544ff8dff174`, `Readability-readerable.js` `a98d28805804c1986ceed470678a3f409f150ee7f1d227f8c8239c005d21de65` |
| Firefox — kod przeglądarki (repozytorium `mozilla-firefox/firefox`, gałąź `main`, pobrany 2026-11-03): `toolkit/components/narrate/Narrator.sys.mjs`, `toolkit/components/reader/ReaderMode.sys.mjs`, `toolkit/components/reader/Readerable.js`, `toolkit/components/reader/content/aboutReader.html` | SHA-256 kolejno: `e9328f8f025e7982783be0e5fc08c7376565107b77cdc9175134620c243bccfb`, `c89961a618cbbe0828a1868c28b3afbea315df653199eb2a7066d8132660a2db`, `06f2a6d8a81bcf238f8154479182aad28e3ae46d93d9fcecadad15c91da3f13d`, `9f3228b0c670af7ca0166e612cfff559ec24bbfe22d520c70d2fe388cbf655bb` |
| Chrome — kod „Trybu czytania” (repozytorium `chromium/chromium`, gałąź `main`, pobrany 2026-11-03): `chrome/renderer/accessibility/ax_tree_distiller.cc`, `chrome/renderer/accessibility/read_anything/read_anything_app_model.cc`, `chrome/renderer/accessibility/read_anything/read_anything_node_utils.cc`, `ui/accessibility/ax_role_properties.cc` | SHA-256 kolejno: `a1d6195cb4b09fb6ff681369f15f48902de5d355494837d09d126edf60a8a984`, `813294f93450709f3a4573f82e5b3405390ab376616e945103351b8fd157fc15`, `addad94355296551b59c364b07c796ec50d7e34cff76c55f77b94387cf3a4726`, `1f1d181858ed84743fd481b61e05a69fa05bd2b0864b7c3e72504ba2ba1c2c2f` |
| Przeglądarka testowa | Chromium 153.0.8010.12 (Playwright 1.63.0) |
| Strony pomocy Google (sprawdzone 2026-11-03) | <https://support.google.com/chrome/answer/14218344?hl=en> (tryb czytania na komputerze), <https://support.google.com/chrome/answer/14768725?hl=en> („Listen to this page”, Android) |
| Strony pomocy Microsoft (sprawdzone 2026-11-03) | <https://support.microsoft.com/en-us/edge/use-immersive-reader-in-microsoft-edge> (tryb czytania i „Read aloud”), <https://www.microsoft.com/en-us/edge/features/read-aloud> (przekierowuje do explore.microsoft.com) |
| Strony pomocy Apple (sprawdzone 2026-11-03) | <https://support.apple.com/guide/iphone/listen-to-a-webpage-iph449fc616c/ios>, <https://support.apple.com/guide/iphone/hear-whats-on-the-screen-or-typed-iph96b214f0/ios> — **treści nie udało się pobrać** (narzędzie zwracało tylko spis treści); opis Safari oparto na streszczeniu z wyników wyszukiwania |

Skrypt testowy (rozdz. 2) był plikiem roboczym poza repozytorium (AGENTS.md, rozdz. 3).

## 1. Jak przeglądarki czytają strony na głos

Są trzy rodzaje takich funkcji:

- **czytanie całej strony** — przeglądarka czyta po kolei wszystko, co jest na stronie (np. Edge
  „Czytaj na głos” — *Read aloud*, iPhone „Mów zawartość ekranu” — *Speak Screen*, Chrome na
  Androidzie *Listen to this page*);
- **tryb czytania** — przeglądarka sama wybiera „główny tekst” strony, pokazuje go w uproszczonym widoku
  i dopiero ten widok czyta (Chrome „Tryb czytania” — *Reading mode*, Firefox „Widok czytnika” +
  „Narracja” — *Reader View* + *Narrate*, tryb czytania Edge, Safari);
- **czytanie zaznaczenia** — czytany jest tylko zaznaczony fragment (Edge *Read aloud selection*, iPhone
  „Mów zaznaczenie” — *Speak Selection*, Mac — skrót Option+Esc, Android — *Select to Speak*).

Nazwy w polskich wersjach przeglądarek mogą się nieco różnić od podanych.

| Przeglądarka | Funkcja | Co czyta i jak wybiera tekst | Głos i tempo |
|---|---|---|---|
| **Microsoft Edge** (komputer i telefon) | *Read aloud* — cała strona albo zaznaczenie; tryb czytania | Dokumentacja: „Read aloud … reads the text of a webpage audibly”; dla fragmentu: „select the text of what you'd like to hear, then right-click (or press and hold) and select Read aloud selection”. **Sposób wyboru tekstu przy czytaniu całej strony nie jest opisany** (kod zamknięty, nie testowano). Tryb czytania Edge „will simplify the page you're on by hiding distracting pop-ups and buttons”, ale działa tylko na „supported pages”. | w pasku czytania Edge; „Read aloud is available in both online and offline modes, however, only a few voice options are available while offline” |
| **Google Chrome** (komputer) | *Reading mode* + przycisk odtwarzania | Czyta tekst pokazany w trybie czytania. **Z kodu Chrome:** reguły szukają obszaru `<main>` albo `<article>` i zbierają z niego nagłówki, akapity, punkty list, notatki, obrazy i tabele. Pomijają przyciski i inne kontrolki, nawigację (`<nav>`), nagłówek strony, `<aside>` i stopki (`<footer>`). Elementów ukrytych atrybutem `hidden` nie ma w drzewie, z którego Chrome korzysta. Model uczenia maszynowego (*Screen2x*) może tylko **dodać** fragmenty, nie usunąć. Pomoc Google: „Reading mode is not compatible with all sites”, m.in. „Forms”, „Login screens”. | ustawienia trybu czytania; „Reading mode automatically downloads Google natural voices for your current language” |
| **Google Chrome** (Android) | *Listen to this page* | „Standard playback: Reads all the words on the page.” „This feature isn't available yet on all websites.” Wymaga włączenia „Make searches and browsing better”. Jest też *AI playback*: „Generates podcast-like conversations from the page” — to już przetwarzanie treści przez AI Google, a nie zwykłe czytanie. | w odtwarzaczu (*Voice*, *1.0x*) |
| **Mozilla Firefox** (komputer) | *Reader View* + *Narrate* | Biblioteka Readability wybiera „główny blok tekstu”. Usuwa elementy ukryte (`hidden`, `aria-hidden="true"`), przyciski, formularze, `<aside>` i `<footer>`. Ikona widoku czytnika pojawia się tylko przy dość długich akapitach (próg: akapity od 140 znaków, „wynik” powyżej 20). **Z kodu Firefoksa:** narracja czyta też nagłówek widoku czytnika — adres strony, tytuł karty, autora (jeśli go rozpozna) i szacowany czas czytania. | głosy systemu; tempo w pasku narracji |
| **Safari** (iPhone, iPad, Mac) | *Listen to Page*; w iOS także *Speak Screen* i *Speak Selection* | *Listen to Page* — w menu strony. Zasad wyboru tekstu nie znaleziono; prawdopodobnie są podobne do trybu czytnika (**niepotwierdzone**). *Speak Screen* czyta cały tekst na ekranie, *Speak Selection* — zaznaczenie. | ustawienia systemu (Dostępność) |

**Wspólna zasada.** Element ukryty atrybutem `hidden` (czyli niewyświetlany, `display: none`) nie trafia
do drzewa dostępności, z którego korzystają czytniki ekranu i część funkcji czytania. Nie ma go też w
widocznym tekście strony, więc żaden mechanizm nie powinien go przeczytać.
- **Chrome i Firefox** — wynika to z ich kodu i potwierdził to test.
- **Edge i Safari** — wynika to z zasady działania stron WWW; nie testowano.

## 2. Co przeglądarka przeczytałaby dziś na ekranie gry (test)

**Jak sprawdzono.**
- Aplikację uruchomiono lokalnie (tryb localhost) w przeglądarce testowej i sprawdzono sześć sytuacji:
  - §57 — zwykły paragraf, 3 przejścia;
  - §54 — z komunikatem „Zdobywasz Informację #19.”;
  - §91 — z oznaczeniami warunków;
  - §37 — krótki paragraf;
  - §170 — z komunikatem o niejednoznaczności;
  - §122 — zakończenie.
- W każdej sytuacji porównano z tekstem paragrafu:
  1. co wybiera Firefox — biblioteka Readability uruchomiona tak jak w Firefoksie;
  2. co wybiera Chrome — reguły z kodu Chrome odtworzone na prawdziwym drzewie dostępności strony;
  3. cały widoczny tekst strony — to czytają funkcje „cała strona”;
  4. co daje zaznaczenie całego tekstu paragrafu.
- Warianty znaczników (rozdz. 3) nałożono na gotową stronę w przeglądarce testowej, bez zmian w kodzie
  aplikacji.

**Wyniki dla obecnej wersji:**

| Mechanizm | Co czyta oprócz tekstu paragrafu |
|---|---|
| Chrome „Tryb czytania” | przyciski pomija; czyta jednak: „Vae Victis” (tytuł z paska gry), „Dokąd dalej?”, warunki przy przejściach (§91, §37), „Komunikat aplikacji” i „Zdobywasz Informację #19.” (§54), cały komunikat o niejednoznaczności (§170), ramkę „Koniec tej drogi” z liczbą odkrytych zakończeń (§122), „To Twoja gra :) Graj jak lubisz!”, „Tryb mechaniki: automatyczny” |
| Firefox „Widok czytnika” | dłuższe paragrafy (§57, §54, §122) — **sam tekst**; w nagłówku widoku czytnika Firefox pokazuje i czyta tytuł karty „Vae Victis — Gry paragrafowe” oraz autora rozpoznanego z paska gry. Krótkie paragrafy (§91 — 434 znaki, §37, §170 — 302 znaki): **także** „Menu główne”, autor, „Dokąd dalej?”, warunki, komunikat, dopisek przy „Cofnij”, „Tryb mechaniki…” |
| Cały widoczny tekst | tekst paragrafu i 24–27 linijek interfejsu: „Przejdź do treści”, „Gry paragrafowe”, „Gracz: …”, „Wyloguj”, „Menu główne”, „Vae Victis”, „Beniamin Muszyński”, „A−”, „A+”, „Informacje”, „Notatki”, „Historia”, „Zapisy”, „Ustawienia”, „O książce”, „Nowa gra”, „Dokąd dalej?”, „Przejdź do §54 (odnośnik 1 z 2)” …, „Cofnij”, „To Twoja gra :)”, „Graj jak lubisz!”, „Tryb mechaniki: automatyczny” |
| Zaznaczenie całego tekstu paragrafu | **dokładnie tekst paragrafu** — w każdej sytuacji |

**Dlaczego Firefox myli się przy krótkich paragrafach.**
- Gdy wybrany tekst ma mniej niż 500 znaków, biblioteka Readability ponawia wybór z łagodniejszymi
  regułami i bierze najdłuższy wynik. Wtedy dochodzą elementy interfejsu.
- W „Vae Victis” takich części gry jest **107 z 408 (26%)**; mediana długości to ok. 730 znaków.
- W ok. **19 z 408** części (np. §37) Firefox w ogóle nie pokaże ikony widoku czytnika, bo tekstu jest za
  mało. To szacunek z treści, potwierdzony w przeglądarce dla §37.

**Dodatkowe ustalenie.** Atrybut `hidden` na pasku gry, narzędziach i nagłówku aplikacji dziś **nie
działa**. Arkusz stylów nadaje im `display: flex` albo `grid`, a to wygrywa z domyślnym ukrywaniem.
Rozwiązanie z rozdz. 3 (wariant B) wymaga więc reguły CSS `[hidden] { display: none !important; }`.

## 3. Możliwe rozwiązania

Zbiorcze wyniki testu (sytuacje z rozdz. 2; „+” = co jest czytane poza tekstem paragrafu):

| Wariant | Chrome „Tryb czytania” | Firefox „Widok czytnika” | Cały widoczny tekst |
|---|---|---|---|
| obecny | + tytuł, „Dokąd dalej?”, warunki, komunikaty, zakończenie, dopiski | dłuższe: sam tekst; krótkie: + wiele elementów interfejsu | + wszystkie przyciski i napisy (24–27 linijek) |
| **A** — znaczniki | + tylko tytuł „Vae Victis” | dłuższe: sam tekst; część krótkich: + autor, „Dokąd dalej?”, warunki, dopisek | bez zmian (wszystko) |
| **B** — „Sam tekst” | **sam tekst** | **sam tekst** (także krótkie paragrafy) | + 2 linijki na końcu: przycisk powrotu i „Vae Victis · Beniamin Muszyński · O książce” |
| D — `aria-hidden` (odrzucony) | sam tekst | sam tekst | bez zmian (wszystko); szkodzi osobom niewidomym |

### Wariant A — porządek w znacznikach HTML (gracz niczego nie zauważy)

Elementy interfejsu dostają znaczniki zgodne z ich rolą (dziś to w większości zwykłe `div` i `section`):

| Element ekranu gry | Dziś | Po zmianie |
|---|---|---|
| pasek gry (tytuł, autor, A−/A+, stan zapisu) | `div.game-bar` | `<header class="game-bar">` |
| narzędzia gry | `<nav>` | bez zmian |
| komunikaty aplikacji | `div.app-notice` (`role="status"`) | `<aside aria-label="Komunikaty aplikacji">`, wewnątrz dotychczasowy obszar `role="status"` (czytniki ekranu nadal ogłoszą komunikat) |
| komunikat o niejednoznaczności | `div` z `role="note"` | wewnątrz `<aside>` |
| „Dokąd dalej?” (przejścia i „Cofnij”) | `<section>` | `<nav aria-labelledby="choices-title">` — to nawigacja między paragrafami |
| zakończenie (ramka „Koniec tej drogi”, „Cofnij”) | `div` | wewnątrz `<aside aria-label="Koniec tej drogi">` |
| „Tryb mechaniki: …” | `<p>` | wewnątrz `<footer class="game-footer">` |
| tekst książki | `<article class="book-text" lang="pl">` | bez zmian — wyłącznie tekst książki |

Do tego reguła CSS `[hidden] { display: none !important; }`.

- **Zalety:**
  - zmiana niewidoczna dla gracza;
  - czytniki ekranu dla osób niewidomych dostają czytelne obszary strony („nawigacja”, „komunikaty”);
  - Chrome przestaje czytać dopiski i komunikaty;
  - żadnej nowej funkcji.
- **Wady:** nie spełnia celu dla funkcji czytających całą stronę ani dla części krótkich paragrafów w
  Firefoksie.

### Wariant B — przycisk „Sam tekst”

**Jak to wygląda dla gracza:**
1. W pasku narzędzi gry jest przycisk **„Sam tekst”**.
2. Po kliknięciu na ekranie zostaje tylko tekst paragrafu. Pod nim są przycisk **„Pokaż przyciski”** i
   linijka **„Vae Victis · Beniamin Muszyński · O książce”**.
3. Gracz włącza czytanie w swojej przeglądarce, np. w Edge: prawy przycisk myszy → „Czytaj na głos”.
   Przeglądarka czyta tekst paragrafu.
4. Po wysłuchaniu gracz klika „Pokaż przyciski” albo naciska Esc. Wraca zwykły widok z „Dokąd dalej?”.

Dwie odmiany:
- **B1 — jednorazowy:** po „Pokaż przyciski” tryb się wyłącza. Przy kolejnym paragrafie trzeba znów
  kliknąć „Sam tekst”.
- **B2 — stały ★:** tryb zostaje włączony.
  - Każdy kolejny paragraf otwiera się jako sam tekst; „Pokaż przyciski” odsłania przyciski tylko dla
    bieżącego paragrafu.
  - Wyłącza się go ponownym kliknięciem „Sam tekst” (przycisk pokazuje, czy tryb jest włączony).
  - Tryb jest pamiętany **tylko na tym urządzeniu**, tak jak motyw i wielkość tekstu. Nie wymaga to
    zmian w Firebase: reguły dopuszczają w ustawieniach gracza tylko `theme`, `fontScale` i
    `mechanicsMode`.
  - Przy słuchaniu wielu paragrafów z rzędu to jedno kliknięcie na paragraf mniej niż w B1.

**Technicznie:**
- Ukryte (atrybut `hidden`) są:
  - nagłówek aplikacji z nazwą gracza i „Przejdź do treści”;
  - pasek gry i narzędzia;
  - komunikaty;
  - „Dokąd dalej?” albo zakończenie;
  - „Tryb mechaniki…”.
- Widoczne zostają `<article>` z tekstem i `<footer class="reading-footer">` z przyciskiem i atrybucją.
- Fokus:
  - po włączeniu trafia na tekst (czytnik ekranu zaczyna od tekstu);
  - po „Pokaż przyciski” trafia na nagłówek „Dokąd dalej?”.
- Komunikaty (np. o zdobytej Informacji) nie przepadają — pojawiają się po „Pokaż przyciski”.

**Wynik testu** (wersja z linijką atrybucji — pięć sytuacji z rozdz. 2: §57, §91, §37, §170, §122, w
tym krótkie paragrafy; wersja bez tej linijki — wszystkie sześć):
- Chrome i Firefox: **sam tekst paragrafu**.
- Cały widoczny tekst: tekst paragrafu i na końcu dwie linijki — przycisk powrotu i atrybucja.
- Ważny szczegół: linijkę z atrybucją trzeba umieścić w elemencie `<footer>`. Jako zwykły blok (`div`)
  Firefox czytał ją w krótkich paragrafach, a w `<footer>` — już nie.

**Dlaczego atrybucja zostaje na ekranie.**
- Zasada N1: przy każdej grze widać tytuł, autora i drogę do informacji o Wydawcy.
- Zasada Z7: atrybucji nie wolno ukrywać.
- Checklista w LICENCJA_I_ZGODA.md (rozdz. 6): „tytuł i autor widoczne”.
- Linijka jest pod tekstem, zwykłej wielkości, z odnośnikiem „O książce” (stopka, okładka z podpisem,
  odnośniki do Wydawcy). Można ją też umieścić nad tekstem — wtedy przeglądarka przeczyta ją jako
  pierwszą.

**Ocena wariantu B:**
- **Zalety:**
  - działa z każdym rodzajem czytania, także z czytaniem całej strony;
  - nie zależy od tego, jak przeglądarka zgaduje „główny tekst”;
  - przydaje się też przy zwykłym, spokojnym czytaniu.
- **Wady:**
  - jeden przycisk więcej;
  - żeby wybrać drogę, trzeba kliknąć „Pokaż przyciski”;
  - komunikaty widać dopiero po odsłonięciu przycisków.

### Wariant C — przycisk „Zaznacz tekst” (opcjonalny dodatek)

Przycisk zaznacza cały tekst paragrafu. W teście zaznaczenie obejmowało dokładnie tekst książki. Gracz
uruchamia potem czytanie zaznaczenia w przeglądarce lub w systemie:
- Edge: *Read aloud selection*;
- iPhone: „Mów zaznaczenie” (trzeba je włączyć w ustawieniach);
- Android: *Select to Speak*;
- Mac: Option+Esc.

- **Zalety:** bardzo mało kodu; niczego nie ukrywa.
- **Wady:**
  - więcej kroków w menu przeglądarki;
  - nie każda przeglądarka czyta zaznaczenie (Firefox nie ma takiej funkcji);
  - na telefonie zaznaczenie zrobione przez stronę może nie wywołać menu (niesprawdzone).

### Odrzucone

- **D — `aria-hidden="true"` na przyciskach i komunikatach.**
  - W teście Chrome i Firefox czytały wtedy sam tekst.
  - Funkcje czytające całą stronę nadal widzą przyciski na ekranie.
  - Czytniki ekranu dla osób niewidomych przestałyby „widzieć” przyciski, więc gra stałaby się dla nich
    nie do użycia (to także błąd dostępności: ukryte, a wciąż klikalne elementy).
- **E — własny lektor (np. funkcja `speechSynthesis` przeglądarki wywoływana przez aplikację).**
  Zakazany zasadą Z3 i sprzeczny z decyzją właściciela („Nie tworzymy żadnego bota do odczytu”).
- **F — styl CSS `speak: never` (moduł CSS Speech).** Funkcje czytania w przeglądarkach go nie
  obsługują.
- **G — osobna strona (adres) z samym tekstem.** Działa jak wariant B, ale wymaga więcej kodu (osobny
  adres, przekazanie stanu gry) i nic nie dodaje.

## 4. Rekomendacja

1. **Od razu, niezależnie od Wydawcy:**
   - wariant A;
   - komentarze po polsku w HTML (rozdz. 5);
   - reguła CSS `[hidden]`.

   To zwykły, poprawny układ strony (pomaga też czytnikom ekranu) i nie dodaje nowej funkcji.
2. **Po odpowiedzi Wydawcy na PW4 (jeśli się zgodzi):** wariant **B2** — przycisk „Sam tekst” w
   odmianie stałej. Opcjonalnie także C.
3. **Jeśli Wydawca się nie zgodzi:** zostajemy przy A. Funkcji przeglądarki nie blokujemy — to narzędzie
   gracza, tak jak czytnik ekranu dla osób niewidomych. Czytanie działa wtedy jak dziś.

**Plan wdrożenia** (dla A — punkty 1–3; dla B — wszystkie):
1. `aplikacja/css/style.css` — `[hidden] { display: none !important; }`, style nowych elementów,
   komentarze po polsku.
2. `aplikacja/js/ui/game-screen.js` — znaczniki z tabeli wariantu A i komentarze w drzewie strony
   (rozdz. 5). Dla B także: przycisk „Sam tekst” (`aria-pressed`), `<footer class="reading-footer">`,
   ukrywanie, fokus i klawisz Esc.
3. `index.html` — komentarze po polsku (rozdz. 5).
4. `aplikacja/js/main.js` — przy zmianie ekranu przywrócić nagłówek aplikacji (jak dziś stopkę).
5. `aplikacja/js/ui/settings.js` — pamiętanie trybu „Sam tekst” na urządzeniu (osobny klucz w pamięci
   przeglądarki, poza ustawieniami w profilu gracza).
6. `testy/e2e/test-dymny.cjs` — sprawdzenia:
   - w trybie „Sam tekst” widoczny jest tylko tekst i dwie linijki pod nim;
   - atrybucja jest widoczna;
   - „Pokaż przyciski” i Esc przywracają przyciski;
   - przyciski nie mają `aria-hidden`.
7. Dokumentacja: `dokumentacja/ARCHITEKTURA.md` (układ ekranu gry), `dokumentacja/LICENCJA_I_ZGODA.md`
   (po odpowiedzi na PW4), `PLAN_I_CHANGELOG.md`.
8. Sprawdzenie przez właściciela po wdrożeniu:
   - Edge „Czytaj na głos” (Windows);
   - Chrome „Tryb czytania”;
   - telefon (Chrome na Androidzie albo Safari na iPhonie).

Bez zmian: `tresc.json`, `stopka.json`, `mechanika.json` (tekst książki 1:1), Firebase i reguły
bezpieczeństwa.

## 5. Komentarze po polsku w kodzie HTML

- Jedynym plikiem HTML jest `index.html` — dostaje komentarz przy każdej części strony.
- Ekrany (gra, ekran główny, „O książce”) buduje JavaScript, więc kod HTML widoczny w przeglądarce
  („Zbadaj element”, F12) powstaje w trakcie działania. Proponuję:
  - komentarze po polsku w kodzie JavaScript — konwencja projektu, już jest;
  - dodatkowo komentarze HTML wstawiane przez aplikację na granicach głównych części ekranu gry
    (`document.createComment`), widoczne po F12.
- **Nigdy wewnątrz `<article>`** — w nim jest wyłącznie tekst książki.
- Komentarzy nie czyta żadna funkcja czytania na głos: nie są wyświetlane i nie należą do tekstu ani do
  drzewa dostępności.

Proponowany szkielet `index.html` (wycinek):

```html
<body>
  <!-- Odnośnik „Przejdź do treści” dla osób korzystających z klawiatury (pojawia się po naciśnięciu Tab). -->
  <a class="skip-link" href="#app">Przejdź do treści</a>

  <!-- Nagłówek aplikacji: logo (piktogram kozy), nazwa aplikacji, zalogowany gracz i „Wyloguj”.
       W widoku „Sam tekst” ukryty — przeglądarka czyta wtedy tylko tekst paragrafu. -->
  <header class="app-header">…</header>

  <!-- Główna część strony. Ekrany (ekran główny, gra, „O książce”) wstawia tutaj JavaScript
       (katalog aplikacja/js/ui/). Tekst książki trafia wyłącznie do elementu <article class="book-text">. -->
  <main id="app" tabindex="-1"></main>

  <!-- Stopka aplikacji — tylko na ekranie głównym (decyzja właściciela D52, zasada N10). -->
  <footer class="app-footer">…</footer>
</body>
```

Proponowany układ ekranu gry (komentarze wstawiane przez `game-screen.js`):

```html
<div class="game">
  <!-- Pasek gry: tytuł i autor książki (atrybucja), wielkość tekstu, stan zapisu. -->
  <header class="game-bar">…</header>
  <!-- Narzędzia gry: Informacje, Notatki, Historia, Zapisy, Ustawienia, O książce, Nowa gra, Sam tekst. -->
  <nav class="game-tools" aria-label="Narzędzia gry">…</nav>
  <!-- Komunikaty aplikacji — nie są częścią książki. -->
  <aside class="app-notices" aria-label="Komunikaty aplikacji">…</aside>
  <!-- TEKST KSIĄŻKI — bez żadnych zmian. Jedyny fragment przeznaczony do czytania na głos. -->
  <article class="book-text game-text" lang="pl" aria-label="Tekst książki: §57">…</article>
  <!-- Widok „Sam tekst”: powrót do przycisków i atrybucja (tytuł, autor, „O książce”). -->
  <footer class="reading-footer" hidden>…</footer>
  <!-- Dokąd dalej? Przejścia do kolejnych paragrafów i „Cofnij”. -->
  <nav class="choices" aria-labelledby="choices-title">…</nav>
  <!-- Informacja o trybie mechaniki (automatyczny albo ręczny). -->
  <footer class="game-footer">…</footer>
</div>
```

## 6. Zgodność z zasadami licencyjnymi

| Zasada (LICENCJA_I_ZGODA.md) | Ocena |
|---|---|
| Z1, N5 — treść 1:1 | ✅ tekst bez zmian; pliki treści nietknięte; „Sam tekst” chowa wyłącznie elementy aplikacji |
| Z3 — bez lektora/TTS z tekstu książki | Aplikacja nie tworzy dźwięku ani nagrań i nie uruchamia syntezy mowy. Czyta przeglądarka, na polecenie gracza. Wariant B służy jednak właśnie ułatwieniu czytania na głos — **przypadek graniczny → pytanie PW4** |
| N1, Z7 — atrybucja widoczna, nieukrywana | ✅ w wariancie B tytuł, autor i „O książce” zostają na ekranie |
| Z9 — bez eksportu treści | ✅ żaden plik ani nagranie; aplikacja nie przekazuje tekstu nigdzie poza ekran gracza |
| 5.1 pkt 5 — własna prezentacja | wariant B to sposób wyświetlania (jak tryb ciemny), ale jego celem jest czytanie na głos — dlatego osobne pytanie PW4, a nie tylko PW2 |
| Z10 — treść poza Firebase | ✅ bez zmian; tryb „Sam tekst” pamiętany tylko na urządzeniu |

**Uwaga do PW4.**
- Część głosów działa przez internet:
  - Edge: głosy online i offline;
  - Chrome na Androidzie: funkcja wymaga ustawienia „Make searches and browsing better”.
- Wtedy przeglądarka może przekazywać czytany fragment usłudze swojego producenta (Microsoft, Google);
  dokumentacja tego wprost nie opisuje.
- Chrome na Androidzie ma też *AI playback*, które tworzy z treści strony rozmowę w stylu podcastu.
- To ustawienia i funkcje przeglądarki gracza — aplikacja ich nie wywołuje i nie ma na nie wpływu.
  Dzieje się tak już dziś, bez żadnych zmian w aplikacji, a przycisk „Sam tekst” tego nie zmienia.
- Uczciwie wspominamy o tym w pytaniu.

## 7. Niepewności i braki danych

- **Edge (czytanie całej strony) i Safari.**
  - Sposób wyboru tekstu nie jest opisany, a w środowisku testowym nie ma tych przeglądarek.
  - Wniosek „ukrytych elementów nie czyta” wynika z zasady działania stron (ukryte elementy nie są
    wyświetlane i nie ma ich w drzewie dostępności).
  - Potwierdzi go właściciel po wdrożeniu, na własnym komputerze i telefonie.
- **Chrome.**
  - Reguły odtworzono z kodu (gałąź `main`, 2026-11-03) i uruchomiono w Chromium 153.
  - Części opartej na modelu uczenia maszynowego (*Screen2x*) nie odtworzono — może ona tylko dodać
    fragmenty. W wariancie B jedynymi kandydatami są dwie linijki pod tekstem.
- **Firefox.**
  - Test użył biblioteki Readability 0.6.0 z npm; Firefox może mieć nieco inną wersję.
  - Nagłówek widoku czytnika (adres strony, tytuł karty, czas czytania) jest elementem Firefoksa i
    narracja zawsze go czyta.
- **Telefony.** Nie wiadomo, czy funkcje czytania działają na stronie po zalogowaniu:
  - Chrome na Androidzie: „isn't available yet on all websites”;
  - Safari: zasady dostępności *Listen to Page* nieznane — stron Apple nie udało się pobrać, opis
    pochodzi ze streszczeń wyników wyszukiwania.
- **Nazwy funkcji.** Polskie nazwy w przeglądarkach mogą różnić się od podanych; w analizie podano nazwy
  angielskie z dokumentacji.
- **Licencja.** Czy Wydawca uzna wariant B za dopuszczalny — pytanie PW4. Wariant A jest zwykłym
  poprawnym HTML, ale także on poprawia to, co czyta Chrome. Jeśli właściciel woli ostrożność, może
  również go wstrzymać do odpowiedzi.
- **Sprawa pokrewna (poza zakresem).** Ta sama zasada — narzędzie przeglądarki gracza, a nie funkcja
  aplikacji — dotyczy np. automatycznego tłumaczenia stron w przeglądarce.

## 8. Pytanie do właściciela

Zapisane w `PLAN_I_CHANGELOG.md` jako **P17**:

**Czytanie na głos — co robimy i kiedy?** Przykład: w Edge klikasz „Czytaj na głos”, a przeglądarka
czyta dziś także „Ustawienia”, „Przejdź do §54” i „Cofnij”.

- **A** — tylko porządek w znacznikach i komentarze po polsku.
  - Gracz nic nie zauważy, a Chrome przestanie czytać m.in. „Dokąd dalej?”, warunki i komunikaty.
  - Czytanie całej strony nadal obejmie przyciski.
  - Przycisku „Sam tekst” nie robimy.
- **B ★** — teraz porządek w znacznikach i komentarze (jak w A); przycisk „Sam tekst” (tryb stały,
  pamiętany na urządzeniu) dopiero po odpowiedzi Wydawcy na PW4.
- **C** — wszystko teraz (A i przycisk „Sam tekst”), tak jak przy ustawieniach wyświetlania (PW2). Jeśli
  Wydawca się nie zgodzi, przycisk usuniemy.

Nazwy „Sam tekst” i „Pokaż przyciski” są robocze — można je zmienić.
