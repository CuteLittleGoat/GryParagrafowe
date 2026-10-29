# Firebase — struktura danych, bezpieczeństwo, kopie zapasowe

> Status: **projekt** (wdrożenie w Etapie 5 i 6 — patrz [PLAN_I_CHANGELOG.md](../PLAN_I_CHANGELOG.md)).
> Do czasu wdrożenia aplikacja korzysta z lokalnego adaptera zapisu (localStorage) o tym samym
> modelu danych.

## 1. Założenia

1. Firebase przechowuje **wyłącznie dane graczy**: profil, stan gry w każdej książce, ręczne zapisy,
   odkryte zakończenia, notatki. **Treść książek nie trafia do Firebase** — leży w repozytorium
   (zakaz Z10 w [LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md)).
2. Wielu graczy (obecnie **6**, liczba nieograniczona strukturą), wiele książek, każdy gracz
   niezależny — osobne dokumenty, osobne hasła, brak wglądu w dane innych.
3. Uwierzytelnianie **hasłem przechowywanym w Firestore** (pole `PlayerPassword`), które
   administrator zmienia ręcznie w konsoli Firebase. Hasło **nigdy** nie jest odczytywane przez
   aplikację, nie trafia do backupu, logów ani localStorage.
4. Modyfikacja bazy **wyłącznie przez aplikację**: Firebase App Check + reguły bezpieczeństwa +
   sesje powiązane z hasłem. Administrator ma dodatkowo dostęp przez konsolę Firebase.
5. Rozwiązanie działa na **bezpłatnym planie Spark** — nie wymaga Cloud Functions.
   (Wariant z Cloud Functions — rozdz. 10.)

> ⚠️ **Do uzgodnienia:** właściciel wspomniał o analizie zabezpieczeń z innego projektu, która
> miała zostać dołączona — **nie została dołączona**. Po jej otrzymaniu należy porównać ją z tym
> dokumentem (zwłaszcza rozdz. 5–7) i ujednolicić podejście.

## 2. Usługi

| Usługa | Zastosowanie | Uwagi |
|---|---|---|
| Cloud Firestore | dane graczy | region proponowany: `europe-central2` (Warszawa) — **nie do zmiany po utworzeniu bazy** |
| Firebase Authentication | dostawca **Anonimowy** — każda przeglądarka dostaje `uid` | logowanie hasłem realizuje dokument sesji (rozdz. 5) |
| Firebase App Check | dopuszcza tylko żądania z prawdziwej aplikacji | reCAPTCHA Enterprise (lub reCAPTCHA v3) dla aplikacji web |
| Hosting | GitHub Pages (rekomendacja) albo Firebase Hosting | decyzja w Etapie 7; stronę publikujemy dopiero z działającym logowaniem |
| Google Analytics | **nie włączać** | prywatność graczy, zakaz analityki marketingowej (Z5) |

## 3. Struktura danych (Firestore)

```
appConfig/public                                    ustawienia globalne (opcjonalne)
players/{playerId}                                  profil gracza
players/{playerId}/books/{bookId}                   stan gry w danej książce (autozapis)
players/{playerId}/books/{bookId}/saves/{slotId}    ręczne zapisy (sloty)
secrets/{playerId}                                  hasło gracza: PlayerPassword
admins/{playerId}                                   znacznik administratora
sessions/{authUid}                                  sesje logowania (techniczne)
```

| Ścieżka | Kto czyta | Kto zapisuje | W backupie? |
|---|---|---|---|
| `appConfig/public` | każdy klient aplikacji | tylko konsola | nie (konfiguracja) |
| `players/{playerId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `players/{playerId}/books/{bookId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `…/books/{bookId}/saves/{slotId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `secrets/{playerId}` | **nikt** (tylko reguły) | tylko konsola | **NIE — nigdy** |
| `admins/{playerId}` | **nikt** (tylko reguły) | tylko konsola | nie |
| `sessions/{authUid}` | **nikt** (tylko reguły) | właściciel sesji (logowanie/wylogowanie) | **NIE** |

### 3.1. Identyfikatory

| Identyfikator | Format | Uwagi |
|---|---|---|
| `playerId` | `^[a-z0-9][a-z0-9_-]{1,31}$` (np. `ania`, `gracz-2`) | login gracza; nadaje administrator; **niezmienny** |
| `bookId` | nazwa katalogu w `ksiazki/` (np. `vae-victis`) | **niezmienny** — zmiana = utrata powiązania zapisów |
| `slotId` | `slot1` … `slot5` | liczba slotów do potwierdzenia |
| ID węzła (paragrafu) | np. `p1`, `p91A`, `p98-2`, `prolog` | bez kropek i ukośników (klucze map w Firestore) — patrz [FORMAT_KSIAZKI.md](FORMAT_KSIAZKI.md) |

### 3.2. Dokumenty — pola

**`players/{playerId}`**

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | wersja schematu dokumentu (obecnie 1) |
| `displayName` | string | nazwa wyświetlana (pseudonim — bez danych osobowych) |
| `settings` | map | ustawienia gracza: `theme` (`auto`/`light`/`dark`), `fontScale` (number), `mechanicsMode` (`auto`/`manual`) |
| `createdAt`, `updatedAt` | timestamp | |

**`players/{playerId}/books/{bookId}`** — autozapis bieżącej rozgrywki

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | wersja schematu |
| `bookId` | string | = ID dokumentu (sprawdzane w regułach) |
| `contentVersion` | string | wersja treści/mechaniki książki, przy której zapisano stan (migracje) |
| `status` | string | `inProgress` / `finished` |
| `currentNode` | string | ID bieżącego węzła |
| `history` | array&lt;string&gt; | odwiedzone węzły w kolejności |
| `visits` | map&lt;string, number&gt; | liczba wejść w węzeł (np. warunek „po raz kolejny”) |
| `modules` | map | stan **włączonych w książce** modułów mechaniki (rozdz. 3.3) |
| `notes` | string | notatki gracza |
| `endingsFound` | array&lt;string&gt; | ID węzłów zakończeń odkrytych we wszystkich podejściach |
| `playthrough` | number | numer podejścia (rośnie przy „Nowej grze”) |
| `revision` | number | licznik zapisów — wykrywanie konfliktu przy grze na dwóch urządzeniach |
| `startedAt`, `updatedAt` | timestamp | |

**`…/saves/{slotId}`** — ręczny zapis

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | |
| `label` | string | nazwa nadana przez gracza |
| `state` | map | kopia pól rozgrywki: `currentNode`, `history`, `visits`, `modules`, `notes`, `playthrough`, `contentVersion` |
| `createdAt` | timestamp | |

**`secrets/{playerId}`**

| Pole | Typ | Opis |
|---|---|---|
| `PlayerPassword` | string | hasło gracza — **edytowane ręcznie w konsoli** |

**`admins/{playerId}`** — dokument może być pusty; samo istnienie nadaje uprawnienia administratora
graczowi o tym `playerId` (administrator loguje się swoim kontem gracza).

**`sessions/{authUid}`**

| Pole | Typ | Opis |
|---|---|---|
| `playerId` | string | zalogowany gracz |
| `password` | string | kopia wpisanego hasła — reguły porównują ją z aktualnym `PlayerPassword` |
| `createdAt` | timestamp | czas logowania (`serverTimestamp()`); sesja ważna 30 dni |

**`appConfig/public`** (opcjonalnie)

| Pole | Typ | Opis |
|---|---|---|
| `maintenance` | boolean | tryb serwisowy — aplikacja pokazuje komunikat |
| `disabledBooks` | array&lt;string&gt; | awaryjne wyłączenie książek (np. wycofanie zgody — N9) |

### 3.3. Stan modułów mechaniki (`modules`)

Każda książka deklaruje w `mechanika.json`, których modułów używa; w stanie gracza pojawiają się
**tylko te moduły**. Nie każda książka ma HP, kości czy ekwipunek.

```json
{
  "codewords": { "owned": ["9", "12"] },
  "stats":     { "values": { "wytrzymalosc": 18, "zrecznosc": 9 }, "initial": { "wytrzymalosc": 20, "zrecznosc": 9 } },
  "inventory": { "items": [ { "id": "lina", "qty": 1 } ] },
  "counters":  { "zloto": 15 },
  "dice":      { "log": [ { "expr": "2k6", "rolls": [3, 5], "total": 8, "at": "2026-10-29T12:00:00Z" } ] }
}
```

Dla „Vae Victis” stan modułów to wyłącznie `codewords` (Informacje #1–#43).

### 3.4. Przykład — stan gracza w „Vae Victis”

```json
{
  "schemaVersion": 1,
  "bookId": "vae-victis",
  "contentVersion": "1.0.0",
  "status": "inProgress",
  "currentNode": "p22",
  "history": ["wprowadzenie", "prolog", "p1", "p22"],
  "visits": { "wprowadzenie": 1, "prolog": 1, "p1": 1, "p22": 1 },
  "modules": { "codewords": { "owned": [] } },
  "notes": "",
  "endingsFound": [],
  "playthrough": 1,
  "revision": 4,
  "startedAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

## 4. Wielu graczy, wiele książek, wiele urządzeń

- Każdy gracz ma własne dokumenty `players/{playerId}/…`; reguły nie pozwalają czytać cudzych.
- Nowa książka w katalogu nie wymaga zmian w strukturze — pojawia się nowy dokument
  `players/{playerId}/books/{nowyBookId}`.
- Kilku graczy na jednym urządzeniu: wylogowanie → logowanie innego gracza (ta sama przeglądarka,
  nowa sesja). Ten sam gracz na kilku urządzeniach: każde ma własną sesję; konflikt zapisów
  wykrywany po polu `revision` (aplikacja ostrzega, zanim nadpisze nowszy stan).

## 5. Logowanie hasłem — przepływ (wariant A, plan Spark)

1. Start aplikacji → `signInAnonymously()` — przeglądarka otrzymuje `uid` (bez danych osobowych).
2. Gracz wpisuje **login** (`playerId`) i **hasło** → aplikacja zapisuje dokument
   `sessions/{uid}` = `{ playerId, password, createdAt: serverTimestamp() }`.
3. Reguły dopuszczają ten zapis **tylko wtedy, gdy hasło jest zgodne** z
   `secrets/{playerId}.PlayerPassword` (reguły odczytują `secrets` funkcją `get()`; klient nie ma
   do tej kolekcji żadnego dostępu). Odmowa = komunikat „Nieprawidłowy login lub hasło”.
4. Każdy odczyt i zapis danych gracza jest sprawdzany przez reguły: sesja istnieje, nie wygasła
   (30 dni) i **hasło w sesji nadal zgadza się z aktualnym `PlayerPassword`**. Dzięki temu
   **zmiana hasła w konsoli natychmiast unieważnia wszystkie sesje** tego gracza.
5. Wylogowanie: usunięcie `sessions/{uid}` + `signOut()`.

Właściwości i ograniczenia (świadomie zaakceptowane):

- Hasło jest przechowywane jawnym tekstem w `secrets` i `sessions` (wymóg: ręczna edycja w
  konsoli). Widzi je tylko administrator projektu Firebase. **Gracze nie powinni używać haseł z
  innych serwisów**; zalecane hasła losowe, min. 12 znaków.
- Reguły nie ograniczają liczby prób logowania. Ochrona: App Check (tylko prawdziwa aplikacja) +
  silne hasła. Opcjonalne wzmocnienie: wariant B (rozdz. 10).
- Możliwe utwardzenie bez zmiany wygody admina: przechowywanie skrótu hasła w sesji
  (`hashing.sha256` w regułach) — do rozważenia w Etapie 5.

## 6. Reguły bezpieczeństwa — projekt

Docelowy plik: `firebase/firestore.rules` (Etap 5). Przed wdrożeniem **obowiązkowe testy** w
emulatorze (`@firebase/rules-unit-testing`). Szkic:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== Funkcje pomocnicze =====
    function signedIn() {
      return request.auth != null;
    }
    function validPlayerId(id) {
      return id is string && id.matches('^[a-z0-9][a-z0-9_-]{1,31}$');
    }
    function secretPath(playerId) {
      return /databases/$(database)/documents/secrets/$(playerId);
    }
    function sessionPath() {
      return /databases/$(database)/documents/sessions/$(request.auth.uid);
    }
    function passwordMatches(playerId, password) {
      return validPlayerId(playerId)
        && exists(secretPath(playerId))
        && get(secretPath(playerId)).data.PlayerPassword == password;
    }
    // Sesja istnieje, nie wygasła, a hasło w sesji nadal zgadza się z PlayerPassword
    function sessionValid() {
      return signedIn()
        && exists(sessionPath())
        && request.time < get(sessionPath()).data.createdAt + duration.value(30, 'd')
        && passwordMatches(get(sessionPath()).data.playerId, get(sessionPath()).data.password);
    }
    function currentPlayer() {
      return get(sessionPath()).data.playerId;
    }
    function isPlayer(playerId) {
      return sessionValid() && currentPlayer() == playerId;
    }
    function isAdmin() {
      return sessionValid()
        && exists(/databases/$(database)/documents/admins/$(currentPlayer()));
    }
    function canAccess(playerId) {
      return isPlayer(playerId) || isAdmin();
    }

    // ===== Tylko konsola Firebase =====
    match /secrets/{playerId} {
      allow read, write: if false;
    }
    match /admins/{playerId} {
      allow read, write: if false;
    }
    match /appConfig/{docId} {
      allow read: if signedIn();
      allow write: if false;
    }

    // ===== Sesje logowania =====
    match /sessions/{uid} {
      allow create, update: if signedIn()
        && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['playerId', 'password', 'createdAt'])
        && request.resource.data.password is string
        && request.resource.data.createdAt == request.time
        && passwordMatches(request.resource.data.playerId, request.resource.data.password);
      allow delete: if signedIn() && request.auth.uid == uid;
      allow read: if false;
    }

    // ===== Dane graczy =====
    match /players/{playerId} {
      allow get: if canAccess(playerId);
      allow list: if isAdmin();
      allow create, update: if canAccess(playerId);      // + walidacja schematu (Etap 5)
      allow delete: if isAdmin();

      match /books/{bookId} {
        allow read: if canAccess(playerId);
        allow create, update: if canAccess(playerId)
          && request.resource.data.bookId == bookId;      // + walidacja schematu
        allow delete: if canAccess(playerId);

        match /saves/{slotId} {
          allow read: if canAccess(playerId);
          allow create, update: if canAccess(playerId)
            && slotId.matches('^slot[1-5]$');
          allow delete: if canAccess(playerId);
        }
      }
    }
  }
}
```

Do uzupełnienia w Etapie 5: walidacja schematu dokumentów (`keys().hasOnly(...)`, typy pól,
limity długości tablic i tekstów), testy reguł dla wszystkich ról (anonim bez sesji, gracz,
inny gracz, admin, sesja wygasła, hasło zmienione).

## 7. App Check i dodatkowe zabezpieczenia

1. **App Check** (konsola Firebase → App Check):
   - zarejestrować aplikację web z dostawcą **reCAPTCHA Enterprise** (lub reCAPTCHA v3); klucz
     witryny ograniczony do domeny hostingu (np. `cutelittlegoat.github.io`);
   - w aplikacji `initializeAppCheck(...)` **przed** pierwszym użyciem Firestore, z automatycznym
     odświeżaniem tokenu;
   - przez kilka dni obserwować metryki (żądania zweryfikowane / niezweryfikowane), potem
     **włączyć wymuszanie (Enforce) dla Cloud Firestore** (oraz dla Authentication, jeśli konsola na
     to pozwala);
   - praca lokalna: **token debug** App Check zarejestrowany w konsoli — **nigdy nie commitować**.
2. **Klucz API** (Google Cloud Console → Interfejsy API → Dane logowania): ograniczyć klucz
   przeglądarkowy do referrerów domeny hostingu (+ `localhost` na czas rozwoju) oraz do API
   faktycznie używanych przez aplikację (listę zweryfikować w konsoli przy wdrożeniu).
3. **Konfiguracja webowa Firebase** (`apiKey`, `projectId` itd.) **nie jest sekretem** — może być w
   repozytorium. Bezpieczeństwo zapewniają reguły + App Check, nie ukrywanie konfiguracji.
4. **Sekretami są**: klucze kont serwisowych (Admin SDK), tokeny debug App Check, hasła, backupy z
   danymi graczy — **nigdy nie trafiają do repozytorium** (`.gitignore`).
5. Minimalizacja danych: tylko pseudonimy i stan gry; bez e-maili, bez analityki.

## 8. Kopie zapasowe i odtwarzanie

### 8.1. Zakres

- **W backupie**: `players/{playerId}` + wszystkie `books/{bookId}` + wszystkie `saves/{slotId}`.
- **Nigdy w backupie**: `secrets` (hasła), `sessions`, `admins`, a także **treść książek**.

### 8.2. Format pliku (JSON)

```json
{
  "format": "gry-paragrafowe-backup",
  "formatVersion": 1,
  "createdAt": "2026-10-29T12:00:00.000Z",
  "createdBy": "gracz1",
  "appVersion": "0.6.0",
  "scope": "all",
  "players": {
    "gracz1": {
      "profile": { "schemaVersion": 1, "displayName": "Gracz 1", "settings": {}, "createdAt": "…", "updatedAt": "…" },
      "books": {
        "vae-victis": {
          "state": { "schemaVersion": 1, "bookId": "vae-victis", "currentNode": "p22", "…": "…" },
          "saves": { "slot1": { "schemaVersion": 1, "label": "Przed pogrzebem", "state": {}, "createdAt": "…" } }
        }
      }
    }
  }
}
```

- `scope`: `all` (wszyscy gracze) albo `player` (jeden gracz).
- Pola czasu zapisane jako tekst ISO 8601 (UTC), przy odtwarzaniu zamieniane na `Timestamp`.
- Nazwa pliku: `gry-paragrafowe-backup-RRRRMMDD-GGMM.json` (ignorowana przez git).

### 8.3. Funkcje w aplikacji

| Funkcja | Kto | Opis |
|---|---|---|
| Backup wszystkich graczy | admin | pobranie pliku JSON (`scope: all`) |
| Backup jednego gracza | admin | `scope: player` |
| Eksport własnego postępu | gracz | pobranie własnych danych (`scope: player`) |
| **Odtworzenie gracza z pliku** | admin | patrz 8.4 |

### 8.4. Odtwarzanie (restore) — procedura w panelu administratora

1. Wybór pliku → **walidacja**: `format`, `formatVersion` (starsze wersje migrowane), schemat
   dokumentów, znane `bookId`, poprawne `playerId`.
2. **Podgląd**: gracze, książki i sloty w pliku, daty, porównanie z bieżącym stanem w bazie.
3. Wybór gracza (graczy) i zakresu (cały gracz / jedna książka).
4. Tryb **„Zastąp”** (domyślny): stan gracza staje się dokładnie taki jak w pliku — dokumenty
   nieobecne w pliku (np. późniejsze sloty) są usuwane.
5. Potwierdzenie przez wpisanie `playerId` → zapis wsadowy (batch, ≤ 500 operacji na partię) →
   raport.
6. Hasła nie są odtwarzane: jeśli brakuje `secrets/{playerId}`, administrator najpierw tworzy je
   ręcznie w konsoli (rozdz. 9).

Zalecenia: backup przed każdą zmianą reguł, schematu lub wersji aplikacji oraz okresowo (np. raz
w tygodniu); pliki przechowywać lokalnie lub na prywatnym dysku — **nie w repozytorium**.
Opcjonalnie (plan Blaze): zarządzany eksport Firestore / odtwarzanie do punktu w czasie (PITR).

## 9. Procedury administratora (konsola Firebase)

**Pierwsza konfiguracja (Etap 5)**
1. Utworzyć projekt Firebase (bez Google Analytics).
2. Dodać aplikację Web; konfigurację wpisać do pliku konfiguracyjnego aplikacji
   (`aplikacja/js/data/`).
3. Authentication → Metody logowania → włączyć **Anonimowe**.
4. Firestore → utworzyć bazę w trybie produkcyjnym, region `europe-central2`.
5. Firestore → Reguły → wkleić `firebase/firestore.rules` → Opublikuj
   (alternatywnie: `firebase deploy --only firestore:rules`).
6. App Check i ograniczenia klucza API — rozdz. 7.
7. Utworzyć dokumenty `secrets/{playerId}` dla graczy i `admins/{playerId}` dla administratora.

**Dodanie gracza**
1. Firestore → kolekcja `secrets` → „Dodaj dokument” → ID dokumentu = login gracza (np. `ania`).
2. Pole `PlayerPassword` (typ: string) = hasło.
3. (Opcjonalnie) `players/ania` z polem `displayName` — inaczej profil powstanie przy pierwszym
   logowaniu.
4. Przekazać graczowi login i hasło.

**Zmiana hasła** — edycja `secrets/{playerId}.PlayerPassword`. Wszystkie sesje gracza tracą ważność
natychmiast; gracz loguje się ponownie nowym hasłem.

**Uprawnienia administratora** — utworzenie (pustego) dokumentu `admins/{playerId}`; odebranie —
usunięcie dokumentu.

**Wylogowanie wszystkich** — usunięcie dokumentów w kolekcji `sessions`.

**Usunięcie gracza** — najpierw backup; potem usunięcie `players/{playerId}` (z podkolekcjami),
`secrets/{playerId}` i ewentualnie `admins/{playerId}`.

## 10. Wariant B — Cloud Functions + własne tokeny (plan Blaze)

Funkcja wywoływalna `login(playerId, password)` (Admin SDK) porównuje hasło z `secrets` i zwraca
token (`createCustomToken(playerId, { admin })`); klient loguje się `signInWithCustomToken`.
Reguły upraszczają się do `request.auth.uid == playerId` i `request.auth.token.admin == true`.

| Za | Przeciw |
|---|---|
| hasło nie trafia do dokumentu sesji | wymaga planu Blaze (konto rozliczeniowe) |
| możliwe ograniczanie prób logowania | wdrażanie funkcji (Firebase CLI), więcej elementów |
| standardowy model uwierzytelniania | zmiana hasła nie unieważnia tokenów bez dodatkowej logiki |

**Decyzja robocza:** wariant A (Spark). Rewizja po porównaniu z analizą z innego projektu.

## 11. Koszty i limity

Dla 6 graczy zużycie jest znikome w stosunku do bezpłatnych limitów planu Spark (dzienne limity
odczytów/zapisów Firestore — zweryfikować aktualne wartości w cenniku Firebase). Uwaga: wywołania
`get()`/`exists()` w regułach są liczone jako odczyty dokumentów.

## 12. Do ustalenia

- porównanie z analizą zabezpieczeń z innego projektu (brak pliku),
- region bazy, czas ważności sesji (proponowane 30 dni), liczba slotów zapisu (proponowane 5),
- czy gracz może sam importować swój backup (domyślnie: nie — tylko administrator).
