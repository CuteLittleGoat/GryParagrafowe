# Testy reguł Firebase i aplikacji z emulatorem

Testy uruchamiają się w **emulatorze Firebase** na własnym komputerze — nie łączą się z prawdziwą
bazą (projekt testowy `demo-gryparagrafowe`, dane fikcyjne). Wymagania: Node.js 22, Java 21
(emulator Firestore) i — dla testu aplikacji — Playwright z przeglądarką Chromium.

| Plik | Co sprawdza |
|---|---|
| `test-regul.mjs` | reguły `firebase/firestore.rules`: logowanie (dobre i złe dane, cudze konto, hasło z polskimi literami), dostęp tylko do własnych danych, administrator, walidacja dokumentów, numer wersji zapisu, wygaśnięcie sesji po 30 dniach, zmiana hasła w konsoli, wylogowanie — 17 testów |
| `test-aplikacji-z-emulatorem.cjs` | aplikacja w przeglądarce z prawdziwymi regułami: logowanie hasłem, brak hasła w pamięci przeglądarki i w bazie (tylko skrót), autozapis i ręczny zapis w bazie, sesja po odświeżeniu, konflikt zapisów z dwóch urządzeń, konto Wydawcy (`Player7`), wylogowanie po zmianie hasła — 15 sprawdzeń |

## Instalacja (jednorazowo)

Z katalogu `testy/reguly/` (katalog `node_modules/` jest pomijany przez git):

```bash
npm install
```

## Testy reguł

Z katalogu `firebase/` (tam jest `firebase.json`):

```bash
../testy/reguly/node_modules/.bin/firebase emulators:exec --only firestore --project demo-gryparagrafowe "node --test ../testy/reguly/test-regul.mjs"
```

## Test aplikacji z emulatorem

1. Emulatory logowania i bazy (z katalogu `firebase/`, w osobnym terminalu):

```bash
../testy/reguly/node_modules/.bin/firebase emulators:start --only auth,firestore --project demo-gryparagrafowe
```

2. Serwer aplikacji (z katalogu głównego repozytorium, w osobnym terminalu):

```bash
python3 -m http.server 8765
```

3. Test (z katalogu `testy/reguly/`):

```bash
node test-aplikacji-z-emulatorem.cjs
```

Aplikacja łączy się z emulatorem tylko pod adresem `localhost` z parametrem `?emulator`
(np. `http://localhost:8765/?emulator#/`) — w każdym innym przypadku emulator nie jest używany.
Biblioteka Firebase jest pobierana z `www.gstatic.com`; jeśli komputer korzysta z serwera
pośredniczącego (zmienna `HTTPS_PROXY`), test przekazuje go przeglądarce.
