# Architektura aplikacji

> Status: **projekt** — dokument opisuje docelową architekturę; szczegóły doprecyzowujemy w
> kolejnych etapach ([PLAN_I_CHANGELOG.md](../PLAN_I_CHANGELOG.md)). Zasady licencyjne
> ([LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md)) mają pierwszeństwo przed każdym zapisem poniżej.

## 1. Cele i założenia

1. **Statyczna aplikacja web**: HTML + CSS + JavaScript (moduły ES), **bez frameworków i bez kroku
   budowania** — działa z GitHub Pages i z lokalnego serwera HTTP.
2. Interfejs **po polsku**, responsywny (telefon → desktop), dostępny (klawiatura, czytniki ekranu,
   kontrast, skalowanie tekstu).
3. **Wiele książek** (katalog rozbudowywany w przyszłości) i **wiele kont** (obecnie 6 graczy) —
   każdy gracz ma niezależny stan w każdej książce.
4. **Mechanika modułowa**: każda książka deklaruje, których modułów potrzebuje (np. „Vae Victis”:
   tylko Informacje; inna książka: HP, kości, ekwipunek). Interfejs pokazuje tylko włączone moduły.
5. **Trzy rozdzielne warstwy danych**:
   - **treść** — niezmienna kopia publikacji 1:1, generowana skryptem (`tresc.json`, `stopka.json`),
   - **mechanika** — metadane gry (warunki, efekty, zakończenia) bez tekstu książki (`mechanika.json`),
   - **stan gracza** — Firebase (docelowo) / localStorage (etap rozwojowy).
6. Warstwa zapisu za **wymiennym adapterem** — najpierw lokalny, potem Firestore, bez zmian w silniku.

## 2. Stos technologiczny

| Obszar | Wybór | Uwagi |
|---|---|---|
| Interfejs | HTML5, CSS3 (zmienne CSS, motyw jasny/ciemny) | bez frameworków UI |
| Logika | JavaScript ES2020+, moduły ES (`<script type="module">`) | bez bundlera |
| Firebase | Firebase JS SDK (modułowy) z oficjalnego CDN `www.gstatic.com/firebasejs/<wersja>/…` | **przypięta wersja** |
| Czcionka (opcjonalnie) | np. Old Standard TT (licencja OFL) — krój użyty w oryginale | przy hostowaniu lokalnym dołączyć plik licencji OFL |
| Narzędzia (konwersja, weryfikacja) | Python 3, **tylko biblioteka standardowa** | uruchamiane lokalnie / w CI |
| Testy silnika | Node.js, wbudowany `node --test` | bez zależności |
| Testy reguł Firebase | Firebase Emulator Suite + `@firebase/rules-unit-testing` | Etap 5 |
| Testy E2E (opcjonalnie) | Playwright | Etap 7 |

Uruchamianie lokalne (moduły ES nie działają z `file://`):

```bash
python3 -m http.server 8000
```

## 3. Ekrany

| Ekran | Zawartość |
|---|---|
| **Ekran główny** | nazwa aplikacji; logowanie (login + hasło) albo „Zalogowano jako …” + Wyloguj; **katalog książek** — karta każdej książki: okładka z podpisem autorki ilustracji, tytuł, autor, wydawnictwo, odnośniki, przyciski „Kontynuuj” / „Nowa gra” / „O książce”, **pełna stopka redakcyjna**; stopka aplikacji (projekt nieoficjalny, niekomercyjny, treść za zgodą Wydawcy) |
| **Gra** | pasek: „Menu główne”, tytuł i autor, przyciski włączonych modułów (np. „Karta postaci”, „Kości”), „Notatki”, „Historia”, „Zapis/Wczytaj”, „Ustawienia”, „O książce”; **treść węzła 1:1** z klikalnymi odnośnikami w tekście; **panel przejść** — przyciski „Przejdź do N” generowane z odnośników węzła, ze stanem warunków; komunikaty mechaniki wizualnie oddzielone od tekstu |
| **Karta postaci** | panel składany z modułów książki (Informacje, statystyki, ekwipunek, liczniki…) + ręczna edycja (jak kartka papieru) |
| **Kości** | rzut wg wyrażenia (`k6`, `2k6`, `k100`…), animacja, historia rzutów — tylko gdy książka ma moduł `dice` |
| **Zapis / wczytanie** | autozapis + sloty ręczne |
| **Zakończenie** | tekst zakończenia 1:1; lista „Odkryte zakończenia”; „Zagraj ponownie”, „Menu główne” |
| **O książce** | okładka z podpisem, strona tytułowa, dedykacja, stopka, strona „od Wydawnictwa”, spis treści, odnośniki, informacja o zgodzie |
| **Panel administratora** | tylko dla administratora: backup, odtwarzanie gracza z pliku, lista graczy z datą ostatniej aktywności |
| **Ustawienia** | rozmiar tekstu, motyw, tryb mechaniki (automatyczny / ręczny) |

Zasady prezentacji (z [LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md), rozdz. 5):
- tekst książki renderowany wiernie (akapity, kursywa, pogrubienie, wyrównanie, listy, grafiki),
- odnośniki w tekście pozostają w miejscu i z oryginalnym tekstem; przyciski mają etykiety techniczne,
- elementy aplikacji (komunikaty, podpowiedzi, przyciski) są wyraźnie odróżnione od tekstu książki,
- odnośniki zewnętrzne z treści otwierają oryginalną stronę w nowej karcie.

## 4. Silnik gry (`aplikacja/js/core/`)

**Ładowanie książki**: `ksiazki/katalog.json` → `ksiazki/<id>/ksiazka.json` (manifest) →
`tresc.json` + `mechanika.json` → kontrola zgodności wersji (`contentSha256` w mechanice musi
odpowiadać treści) → inicjalizacja modułów.

**Model**: książka to graf **węzłów** (strony wstępne, paragrafy, części A/B/C, ciąg dalszy) połączonych
**odnośnikami**. Każdy odnośnik ma stabilny identyfikator, do którego odwołuje się mechanika.

**Nawigacja** `goTo(targetNode, viaLink)`:
1. sprawdzenie warunków odnośnika (w trybie automatycznym),
2. efekty wyboru odnośnika (np. zdobycie Informacji przy linii dialogowej),
3. wejście do węzła: licznik odwiedzin, historia, efekty wejścia,
4. wykrycie zakończenia → rejestr odkrytych zakończeń,
5. autozapis (z opóźnieniem, bez blokowania interfejsu).

**Warunki** (deklaratywne, w `mechanika.json`): posiadanie / brak Informacji, zestawy (`all`/`any`/
`not`), liczba odwiedzin węzła, wartość statystyki, posiadanie przedmiotu, wynik rzutu.
**Efekty**: zdobycie / utrata Informacji, zmiana statystyki, dodanie / usunięcie przedmiotu,
zmiana licznika, rzut kośćmi.

**Tryby mechaniki** (ustawienie gracza):
- **automatyczny** — silnik stosuje efekty i oznacza opcje niedostępne (z podaniem powodu),
- **ręczny** — „jak na papierze”: gracz sam prowadzi kartę, wszystkie przyciski aktywne.

**Neutralność**: silnik nie dopowiada reguł spoza tekstu. Jeśli kilka opcji spełnia warunki, a tekst
nie wskazuje priorytetu — oznacza je wszystkie, wybiera gracz.

**„Nowa gra”**: zeruje stan rozgrywki (węzeł, historia, odwiedziny, moduły), zachowuje odkryte
zakończenia, zwiększa `playthrough`. Notatki — do decyzji (domyślnie zachowane).

## 5. Moduły mechaniki (`aplikacja/js/modules/`)

| Moduł | Opis | Stan gracza | „Vae Victis” |
|---|---|---|---|
| `codewords` | oznaczenia zdobywane w trakcie gry (Informacje, hasła, słowa kluczowe); etykieta z definicji książki | `owned: []` | ✅ „Informacje” #1–#43 |
| `visits` | licznik wejść w węzły (warunki typu „po raz kolejny”) — **zawsze włączony** | `visits` | ✅ |
| `endings` | rejestr odkrytych zakończeń — **zawsze włączony** | `endingsFound` | ✅ 21 zakończeń |
| `notes` | notatki gracza (odpowiednik kartki) | `notes` | ✅ |
| `stats` | statystyki z wartościami min/max i początkowymi (stałymi lub z rzutu): np. HP/Wytrzymałość, Zręczność, Szczęście | `values`, `initial` | — |
| `dice` | rzuty kośćmi: wyrażenia `XkY+Z`, animacja (kod, nie grafika AI), historia, testy (np. `2k6 ≤ Szczęście`) | `log` | — |
| `inventory` | ekwipunek: przedmioty, ilości, limity, zużycie | `items` | — |
| `counters` | liczniki zasobów (złoto, prowiant, czas) | mapa wartości | — |
| `combat` | walka wg reguł książki (rundy, siła ataku, obrażenia) | stan walki | — |
| `custom` | logika specyficzna dla książki (`ksiazki/<id>/modul.js`) | wg modułu | — |

Kontrakt modułu (interfejs JS):

```js
export default {
  id: 'codewords',
  initState(definition) {},             // stan początkowy z definicji w mechanika.json
  evaluate(condition, state, ctx) {},   // obsługiwane warunki
  apply(effect, state, ctx) {},         // obsługiwane efekty
  renderPanel(container, state, api) {},// panel na karcie postaci
  validateState(state, definition) {},  // walidacja (np. przy odtwarzaniu backupu)
  migrate(state, fromVersion) {},       // migracje schematu stanu
};
```

Losowość w module `dice`: `crypto.getRandomValues` (z odrzucaniem wyników, by rozkład był równomierny).

## 6. Warstwa danych (`aplikacja/js/data/`)

Interfejs adaptera zapisu (wspólny dla obu implementacji):

| Metoda | Opis |
|---|---|
| `login(playerId, password)` / `logout()` / `currentPlayer()` | sesja gracza |
| `loadProfile()` / `saveProfile(profile)` | profil i ustawienia |
| `loadBookState(bookId)` / `saveBookState(bookId, state)` | autozapis (z kontrolą `revision`) |
| `listSaves(bookId)` / `saveSlot(bookId, slotId, data)` / `loadSlot(bookId, slotId)` / `deleteSlot(…)` | sloty |
| `exportBackup(scope)` / `restoreBackup(file, options)` | kopie zapasowe (restore — tylko admin) |

- `LocalAdapter` — localStorage, **wyłącznie do rozwoju i testów lokalnych** (bez prawdziwego
  uwierzytelniania; nie publikujemy go jako trybu gościa — N7).
- `FirestoreAdapter` — docelowy, wg [FIREBASE.md](FIREBASE.md) (sesje, App Check, pamięć podręczna
  offline Firestore).
- Migracje stanu wg `schemaVersion`; walidacja przed zapisem i przy odtwarzaniu backupu.

## 7. Interfejs (`aplikacja/js/ui/`, `aplikacja/css/`)

- Prosty router ekranów (hash w adresie, np. `#/`, `#/gra/vae-victis`), przycisk „Menu główne”
  zawsze dostępny w grze.
- Komponenty: karta książki, stopka książki, czytnik węzła, panel przejść, karta postaci, kości,
  okno zapisu, panel administratora, ustawienia, komunikaty.
- Bezpieczeństwo DOM: tekst książki budowany przez `createElement`/`textContent` z modelu JSON —
  **bez `innerHTML` dla treści**.
- Ikony: tylko piktogramy funkcji (licencje odnotowane w `aplikacja/assets/icons/`).

## 8. Bezpieczeństwo i prywatność (skrót)

- Brak sekretów w repozytorium; konfiguracja webowa Firebase nie jest sekretem.
- Dostęp do bazy tylko przez aplikację: App Check + reguły + sesje z hasłem ([FIREBASE.md](FIREBASE.md)).
- Brak analityki, reklam i trackerów; dane graczy ograniczone do pseudonimów i stanu gry.
- Opcjonalnie: nagłówek Content-Security-Policy (meta) ograniczający źródła skryptów do własnej
  domeny i CDN Firebase.

## 9. Testy i jakość

| Rodzaj | Zakres |
|---|---|
| Weryfikacja treści | tekst z `tresc.json` = tekst z EPUB; odnośniki; liczba węzłów; SHA-256 źródła ([KONWERSJA.md](KONWERSJA.md)) |
| Walidacja mechaniki | odwołania do istniejących węzłów/odnośników; każde (U#n) z tekstu ma efekt; składnia warunków |
| Testy jednostkowe silnika | warunki, efekty, nawigacja, zakończenia, migracje (`node --test`) |
| Testy reguł Firebase | wszystkie role i przypadki brzegowe (emulator) |
| Scenariusze ręczne „Vae Victis” | np. §9 przy ponownej wizycie → część A; §91 z #18 i bez; tabela warunków §161; §98 „Czytaj dalej” |
| Dostępność | nawigacja klawiaturą, etykiety ARIA, kontrast, powiększenie tekstu |
