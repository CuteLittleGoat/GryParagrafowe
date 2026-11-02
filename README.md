# Gry Paragrafowe

Przeglądarkowa aplikacja (HTML + CSS + JavaScript) do grania w **gry paragrafowe** (gry książkowe):
czytanie paragrafów i nawigacja zgodnie z treścią książki, karta postaci, rzuty kośćmi, zapis
postępu (Firebase), wiele kont graczy i wiele książek — z mechaniką dopasowaną do każdej książki.

> ⚠️ **Projekt hobbystyczny, niekomercyjny i nieoficjalny**, przeznaczony dla wąskiego grona graczy.
> Treść gier wykorzystywana **wyłącznie za pisemną zgodą Wydawcy**, bez jakichkolwiek zmian.
> Zasady: [`dokumentacja/LICENCJA_I_ZGODA.md`](dokumentacja/LICENCJA_I_ZGODA.md).

## Status

**Aplikacja działa lokalnie** (tryb testowy na własnym komputerze): logowanie, katalog, gra w „Vae
Victis” z automatyczną mechaniką, „Cofnij”, notatki, zapisy, zakończenia. **Następny krok: Firebase**
(konta graczy, zapis postępu w chmurze) i publikacja na GitHub Pages.
Plan prac, stan bieżący i changelog: [`PLAN_I_CHANGELOG.md`](PLAN_I_CHANGELOG.md).

## Katalog gier

| Gra | Autor | Wydawca | Zgoda | Status w aplikacji |
|---|---|---|---|---|
| **Vae Victis** | Beniamin Muszyński | Wydawnictwo Wielokrotnego Wyboru (portal Masz Wybór) | ✅ 29.10.2026 | ✅ gotowa (tryb lokalny); 🚧 publikacja po wdrożeniu Firebase |

### Atrybucja

**Vae Victis** — autor: Beniamin Muszyński. Copyright © by Beniamin Muszyński, 2018.
Copyright © for this edition by Masz Wybór, 2025. Wydawca: Wydawnictwo Wielokrotnego Wyboru
działające w ramach portalu Masz Wybór. Ilustracja na okładce: Justyna Bzdoń.
ISBN 978-83-951564-0-3.
Strona publikacji: <https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/> ·
strona Wydawnictwa: <https://masz-wybor.com.pl/>.
Pełna stopka redakcyjna jest prezentowana w aplikacji (ekran główny i „O książce”).

Treści książek, okładki i logotypy **nie są objęte żadną licencją tego repozytorium** — pozostają
własnością ich autorów i Wydawcy i są wykorzystywane za zgodą, na warunkach opisanych w
[`dokumentacja/LICENCJA_I_ZGODA.md`](dokumentacja/LICENCJA_I_ZGODA.md).

## Struktura repozytorium

```
├── AGENTS.md              instrukcje dla agentów AI (i ludzi) — zasady, konwencje, workflow
├── PLAN_I_CHANGELOG.md    plan prac, stan bieżący, decyzje, otwarte pytania, changelog
├── Pliki/                 materiały źródłowe: oryginalny EPUB (i tymczasowo dokument zgody) — tylko do odczytu
├── Analizy/               raporty z analiz
├── dokumentacja/          dokumentacja projektu
├── aplikacja/             kod aplikacji (css, js: core / modules / ui / data / utils, assets)
├── ksiazki/               dane książek (katalog, treść 1:1, mechanika, grafiki)
├── firebase/              konfiguracja webowa Firebase (firebase-config.js), docelowo reguły bezpieczeństwa
├── narzedzia/             skrypty konwersji EPUB → JSON i weryfikacji integralności
└── testy/                 testy i dane testowe
```

Szczegółowy opis katalogów: [`AGENTS.md`](AGENTS.md), rozdział „Struktura repozytorium”.

## Dokumentacja

| Dokument | Zawartość |
|---|---|
| [LICENCJA_I_ZGODA.md](dokumentacja/LICENCJA_I_ZGODA.md) | **nakazy i zakazy wynikające ze zgody Wydawcy** — dokument nadrzędny |
| [ARCHITEKTURA.md](dokumentacja/ARCHITEKTURA.md) | ekrany, silnik gry, moduły mechaniki, warstwa danych, testy |
| [FIREBASE.md](dokumentacja/FIREBASE.md) | struktura bazy, logowanie hasłem, reguły, App Check, backup i odtwarzanie, procedury admina |
| [FORMAT_KSIAZKI.md](dokumentacja/FORMAT_KSIAZKI.md) | format JSON książek (katalog, manifest, treść, stopka, mechanika) |
| [KONWERSJA.md](dokumentacja/KONWERSJA.md) | konwersja EPUB → JSON i weryfikacja wierności treści |
| [ksiazki/vae-victis/README.md](ksiazki/vae-victis/README.md) | karta książki „Vae Victis”: wyniki analizy pliku, mechanika, stopka |

## Uruchomienie lokalne

Moduły ES wymagają serwera HTTP (nie działają z `file://`). Z katalogu głównego repozytorium:

```bash
python3 -m http.server 8000
```

Następnie: <http://localhost:8000/>. Na `localhost` działa **tryb lokalny**: dowolny login, hasło
nie jest sprawdzane ani zapisywane, postęp zapisuje się tylko w tej przeglądarce. Pod każdym innym
adresem (np. GitHub Pages) logowanie lokalne jest wyłączone — do czasu wdrożenia Firebase nie da się
tam grać.

## Testy i weryfikacja

```bash
node --test 'testy/**/*.test.mjs'
```

```bash
python3 narzedzia/weryfikacja/weryfikuj_tresc.py narzedzia/konwersja/konfiguracja_vae-victis.json
```

```bash
python3 narzedzia/weryfikacja/weryfikuj_mechanike.py ksiazki/vae-victis
```

Test w przeglądarce (Playwright, przy uruchomionym serwerze na porcie 8765):

```bash
node testy/e2e/test-dymny.cjs
```
