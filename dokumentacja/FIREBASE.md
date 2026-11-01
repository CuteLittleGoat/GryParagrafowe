# Firebase — struktura danych, bezpieczeństwo, kopie zapasowe

> Status: **projekt** (wdrożenie w Etapie 5 i 6 — patrz [PLAN_I_CHANGELOG.md](../PLAN_I_CHANGELOG.md)).
> Do czasu wdrożenia aplikacja korzysta z lokalnego adaptera zapisu (localStorage) o tym samym
> modelu danych.
>
> **Stan na 2026-10-29:** właściciel utworzył projekt Firebase **`gryparagrafowe-e1fb3`**;
> konfiguracja webowa jest w [`firebase/firebase-config.js`](../firebase/firebase-config.js)
> (bez `measurementId` — Google Analytics nie jest podłączony); reguły Firestore w konsoli
> **tymczasowo blokują cały dostęp** (rozdz. 6). Pozostałe kroki konfiguracji — rozdz. 9.

## 1. Założenia

1. Firebase przechowuje **wyłącznie dane graczy**: profil, stan gry w każdej książce, ręczne zapisy,
   odkryte zakończenia, notatki. **Treść książek nie trafia do Firebase** — leży w repozytorium
   (zakaz Z10 w [LICENCJA_I_ZGODA.md](LICENCJA_I_ZGODA.md)).
2. Wielu graczy (obecnie **6**, liczba nieograniczona strukturą), wiele książek, każdy gracz
   niezależny — osobne dokumenty, osobne hasła, brak wglądu w dane innych.
3. Logowanie **loginem i hasłem przechowywanymi w Firestore** (decyzja właściciela, P4): konta
   graczy `Player1` … `Player6`, a w dokumencie każdego konta dwa pola — `PlayerName` (login) i
   `PlayerPassword` (hasło). Administrator ustawia i zmienia je ręcznie w konsoli Firebase. Aplikacja
   **nigdy** nie odczytuje ich z bazy; hasło nie trafia do backupu, logów ani localStorage.
4. Modyfikacja bazy **wyłącznie przez aplikację**: Firebase App Check + reguły bezpieczeństwa +
   sesje powiązane z loginem i hasłem. Administrator ma dodatkowo dostęp przez konsolę Firebase.
5. Rozwiązanie działa na **bezpłatnym planie Spark** — nie wymaga Cloud Functions.
   (Wariant z Cloud Functions — rozdz. 10.)

> **Doświadczenia z innego projektu:** właściciel dostarczył (2026-10-29) instrukcję wdrożenia
> App Check z projektu „Karty” (`Instrukcja_AppCheck_2026-09-07.md`, stan na 2026-09-20 — App Check
> wdrożony i wymuszony). Wnioski uwzględniono w rozdz. 7. Instrukcja dotyczy App Check i nie zmienia
> modelu logowania opisanego w rozdz. 5.

## 2. Usługi

| Usługa | Zastosowanie | Uwagi |
|---|---|---|
| Cloud Firestore | dane graczy | baza utworzona 2026-10-29; region wybrany przy tworzeniu (**nie do zmiany**) — do odnotowania |
| Firebase Authentication | dostawca **Anonimowy** — każda przeglądarka dostaje `uid` | logowanie loginem i hasłem realizuje dokument sesji (rozdz. 5) |
| Firebase App Check | dopuszcza tylko żądania z prawdziwej aplikacji | **reCAPTCHA Enterprise** — działa na planie Spark (rozdz. 7) |
| Hosting | **GitHub Pages** (`cutelittlegoat.github.io`) — decyzja właściciela | stronę publikujemy dopiero z działającym logowaniem (Etap 7) |
| Google Analytics | **nie włączać** | prywatność graczy, zakaz analityki marketingowej (Z5) |

## 3. Struktura danych (Firestore)

```
appConfig/public                                    ustawienia globalne, m.in. liczba kont graczy
players/{playerId}                                  profil gracza (playerId = Player1 … Player6)
players/{playerId}/books/{bookId}                   stan gry w danej książce (autozapis)
players/{playerId}/books/{bookId}/saves/{saveId}    ręczne zapisy (save1 … save3)
secrets/{playerId}                                  login i hasło gracza: PlayerName, PlayerPassword
admins/{playerId}                                   znacznik administratora
sessions/{authUid}                                  sesje logowania (techniczne)
```

| Ścieżka | Kto czyta | Kto zapisuje | W backupie? |
|---|---|---|---|
| `appConfig/public` | każdy klient aplikacji | tylko konsola | nie (konfiguracja) |
| `players/{playerId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `players/{playerId}/books/{bookId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `…/books/{bookId}/saves/{saveId}` | ten gracz, admin | ten gracz, admin | **tak** |
| `secrets/{playerId}` | **nikt** (tylko reguły) | tylko konsola | **NIE — nigdy** |
| `admins/{playerId}` | **nikt** (tylko reguły) | tylko konsola | nie |
| `sessions/{authUid}` | **nikt** (tylko reguły) | właściciel sesji (logowanie/wylogowanie) | **NIE** |

### 3.1. Identyfikatory

| Identyfikator | Format | Uwagi |
|---|---|---|
| `playerId` | `Player1` … `Player6` (wzorzec `^Player[1-9][0-9]?$`) | stały identyfikator konta; tworzy administrator; **niezmienny**. Login gracza to osobne pole `PlayerName` — można go zmienić bez przenoszenia danych |
| `bookId` | nazwa katalogu w `ksiazki/` (np. `vae-victis`) | **niezmienny** — zmiana = utrata powiązania zapisów |
| `saveId` | `save1`, `save2`, `save3` | 3 miejsca na ręczny zapis w każdej książce (decyzja właściciela, P6) |
| ID węzła (paragrafu) | np. `p1`, `p91A`, `p98-2`, `prolog` | bez kropek i ukośników (klucze map w Firestore) — patrz [FORMAT_KSIAZKI.md](FORMAT_KSIAZKI.md) |

### 3.2. Dokumenty — pola

**`players/{playerId}`**

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | wersja schematu dokumentu (obecnie 1) |
| `displayName` | string | login gracza zapisywany przez aplikację przy logowaniu (do panelu administratora i kopii zapasowych) |
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
| `undo` | array&lt;map&gt; | poprzednie stany rozgrywki dla przycisku „Cofnij” (miejsce, moduły, odwiedziny) — krok po kroku, do początku bieżącej rozgrywki |
| `revision` | number | licznik zapisów — wykrywanie konfliktu przy grze na dwóch urządzeniach |
| `startedAt`, `updatedAt` | timestamp | |

**`…/saves/{saveId}`** — ręczny zapis (3 miejsca: `save1` … `save3`)

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | |
| `label` | string | nazwa nadana przez gracza |
| `state` | map | kopia pól rozgrywki: `currentNode`, `history`, `visits`, `modules`, `notes`, `playthrough`, `contentVersion` |
| `createdAt` | timestamp | |

**`secrets/{playerId}`** — dokumenty `secrets/Player1` … `secrets/Player6`

| Pole | Typ | Opis |
|---|---|---|
| `PlayerName` | string | login gracza — **ustawiany ręcznie w konsoli**; musi być inny niż loginy pozostałych graczy |
| `PlayerPassword` | string | hasło gracza — **ustawiane ręcznie w konsoli** |

Nazwy pól `PlayerName` i `PlayerPassword` ustalił właściciel — **nie zmieniać** (wyjątek od zasady
`camelCase`).

**`admins/{playerId}`** — dokument może być pusty; samo istnienie nadaje uprawnienia administratora
graczowi o tym `playerId` (administrator loguje się swoim kontem gracza).

**`sessions/{authUid}`**

| Pole | Typ | Opis |
|---|---|---|
| `playerId` | string | konto zalogowanego gracza (`Player1` … `Player6`) |
| `login` | string | kopia wpisanego loginu — reguły porównują ją z aktualnym `PlayerName` |
| `password` | string | kopia wpisanego hasła — reguły porównują ją z aktualnym `PlayerPassword` |
| `createdAt` | timestamp | czas logowania (`serverTimestamp()`); logowanie pamiętane 30 dni (decyzja właściciela, P6) |

**`appConfig/public`**

| Pole | Typ | Opis |
|---|---|---|
| `playerCount` | number | liczba kont graczy (`Player1` … `PlayerN`); przy logowaniu aplikacja sprawdza kolejno te konta — obecnie **6** |
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
  "undo": [ { "currentNode": "p1", "visits": { "wprowadzenie": 1, "prolog": 1, "p1": 1 }, "modules": { "codewords": { "owned": [] } } } ],
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

## 5. Logowanie loginem i hasłem — przepływ (wariant A, plan Spark)

1. Start aplikacji → `signInAnonymously()` — przeglądarka otrzymuje `uid` (bez danych osobowych).
2. Gracz wpisuje **login** i **hasło**. Aplikacja odczytuje `appConfig/public.playerCount` (np. 6) i
   sprawdza kolejno konta `Player1` … `Player6`: dla każdego próbuje zapisać dokument
   `sessions/{uid}` = `{ playerId, login, password, createdAt: serverTimestamp() }`.
3. Reguły dopuszczają ten zapis **tylko wtedy, gdy login i hasło zgadzają się** z polami
   `PlayerName` i `PlayerPassword` w `secrets/{playerId}` (reguły odczytują `secrets` funkcją `get()`;
   aplikacja nie ma do tej kolekcji żadnego dostępu). Pierwszy udany zapis = zalogowanie. Jeśli
   żadne konto nie pasuje — komunikat „Nieprawidłowy login lub hasło”.
4. Po zalogowaniu aplikacja zapisuje login w `players/{playerId}.displayName` (do panelu
   administratora i kopii zapasowych).
5. Każdy odczyt i zapis danych gracza jest sprawdzany przez reguły: sesja istnieje, nie wygasła
   (30 dni) i **login oraz hasło z sesji nadal zgadzają się z polami w `secrets`**. Dzięki temu
   **zmiana loginu lub hasła w konsoli natychmiast wylogowuje** tego gracza ze wszystkich urządzeń.
6. Wylogowanie: usunięcie `sessions/{uid}` + `signOut()`.

Właściwości i ograniczenia (świadomie zaakceptowane):

- Loginy muszą być różne (przy dwóch kontach z tym samym loginem i hasłem wygrywa pierwsze z nich).
- Logowanie to co najwyżej tyle prób zapisu, ile jest kont (6) — przy tej liczbie graczy pomijalne.
- Login i hasło są przechowywane jawnym tekstem w `secrets` i `sessions` (wymóg: ręczna edycja w
  konsoli). Widzi je tylko administrator projektu Firebase. **Gracze nie powinni używać haseł z
  innych serwisów**; zalecane hasła losowe, min. 12 znaków.
- Reguły nie ograniczają liczby prób logowania. Ochrona: App Check (tylko prawdziwa aplikacja) +
  silne hasła. Opcjonalne wzmocnienie: wariant B (rozdz. 10).
- Możliwe utwardzenie bez zmiany wygody admina: przechowywanie skrótu hasła w sesji
  (`hashing.sha256` w regułach) — do rozważenia w Etapie 5.

## 6. Reguły bezpieczeństwa — projekt

**Stan obecny (od 2026-10-29):** w konsoli opublikowane są reguły tymczasowe, blokujące każdy
odczyt i zapis z aplikacji:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Docelowe reguły przygotujemy, gdy aplikacja będzie już tworzyć dokumenty i pola (Etap 5);
publikuje je właściciel. Konsola Firebase działa niezależnie od reguł, więc administrator może
już teraz zakładać dokumenty `secrets/{playerId}` i `admins/{playerId}`.

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
      return id is string && id.matches('^Player[1-9][0-9]?$');
    }
    function secretPath(playerId) {
      return /databases/$(database)/documents/secrets/$(playerId);
    }
    function sessionPath() {
      return /databases/$(database)/documents/sessions/$(request.auth.uid);
    }
    // Login i hasło zgadzają się z polami PlayerName i PlayerPassword konta
    function credentialsMatch(playerId, login, password) {
      return validPlayerId(playerId)
        && exists(secretPath(playerId))
        && get(secretPath(playerId)).data.PlayerName == login
        && get(secretPath(playerId)).data.PlayerPassword == password;
    }
    // Sesja istnieje, nie wygasła, a login i hasło w sesji nadal zgadzają się z kontem
    function sessionValid() {
      return signedIn()
        && exists(sessionPath())
        && request.time < get(sessionPath()).data.createdAt + duration.value(30, 'd')
        && credentialsMatch(get(sessionPath()).data.playerId,
                            get(sessionPath()).data.login,
                            get(sessionPath()).data.password);
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
        && request.resource.data.keys().hasOnly(['playerId', 'login', 'password', 'createdAt'])
        && request.resource.data.login is string
        && request.resource.data.password is string
        && request.resource.data.createdAt == request.time
        && credentialsMatch(request.resource.data.playerId,
                            request.resource.data.login,
                            request.resource.data.password);
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

        match /saves/{saveId} {
          allow read: if canAccess(playerId);
          allow create, update: if canAccess(playerId)
            && saveId.matches('^save[1-3]$');
          allow delete: if canAccess(playerId);
        }
      }
    }
  }
}
```

Do uzupełnienia w Etapie 5: walidacja schematu dokumentów (`keys().hasOnly(...)`, typy pól,
limity długości tablic i tekstów), testy reguł dla wszystkich ról (anonim bez sesji, gracz,
inny gracz, admin, sesja wygasła, login lub hasło zmienione w konsoli).

## 7. App Check i dodatkowe zabezpieczenia

### 7.1. App Check — wnioski z projektu „Karty”

Podstawa: `Instrukcja_AppCheck_2026-09-07.md` z projektu „Karty” (dostarczona przez właściciela
2026-10-29; w tamtym projekcie App Check działa z wymuszaniem od 2026-09-20).

| Wniosek z projektu „Karty” | Zastosowanie w GryParagrafowe |
|---|---|
| reCAPTCHA Enterprise działa na bezpłatnym planie Spark; utworzenie klucza nie wymaga płatności (tryb *Essentials*: 10 000 sprawdzeń miesięcznie za darmo) | dostawca: **reCAPTCHA Enterprise**; klasyczna reCAPTCHA v3 (wycofywana przez Google) — tylko awaryjnie |
| Enterprise ma **jeden, jawny klucz witryny** (`6L…`) — bez klucza tajnego | klucz może być w repozytorium (w `firebase/firebase-config.js`), tak jak `apiKey` |
| Klucz: typ *Website/Web*, sama domena (bez `https://` i ścieżki), weryfikacja domen włączona, **bez `localhost`**, bez wyzwania „checkbox” | domena `cutelittlegoat.github.io` (GitHub Pages) |
| Każdą aplikację Web w projekcie Firebase rejestruje się w App Check **tym samym kluczem** — inaczej po *Enforce* może przestać działać akurat ta używana | zarejestrować wszystkie aplikacje Web projektu `gryparagrafowe-e1fb3` |
| „App risk” — domyślne *Medium (0.5)*; **TTL tokenu: 1 dzień** (zakres 30 min – 7 dni) — rzadsze odnawianie, mniejsze zużycie limitu | te same ustawienia |
| Najpierw kilka dni obserwacji (App Check → *APIs* → Cloud Firestore: rosną żądania *Verified*), dopiero potem **Enforce** | jw.; **hamulec bezpieczeństwa: *Unenforce*** — działa od razu, bez zmian w kodzie |
| App Check to osobny przełącznik, sprawdzany **przed** regułami — reguł nie trzeba pod niego zmieniać; nie sprawdza, *kim* jest użytkownik | identyfikację gracza zapewniają sesje z hasłem (rozdz. 5) i reguły (rozdz. 6) |
| Po *Enforce* aplikacja działa tylko z adresu internetowego; do pracy lokalnej — **token debug** (*Manage debug tokens*), **nigdy w repozytorium** | jw. |
| Zmiana domeny strony wymaga dopisania nowej domeny do klucza w Google Cloud | jw. |

Szacunek zużycia limitu: przy 6 graczach i TTL 1 dzień — rząd kilkuset sprawdzeń miesięcznie,
wielokrotnie poniżej limitu 10 000. Przekroczenie limitu przy włączonym wymuszaniu zablokowałoby
aplikację do końca miesiąca (albo do *Unenforce*).

### 7.2. App Check — kroki wdrożenia (Etap 5)

1. Google Cloud → reCAPTCHA (`console.cloud.google.com/security/recaptcha`), projekt
   `gryparagrafowe-e1fb3` → **Create key**: typ *Website*, domena `cutelittlegoat.github.io` →
   skopiować klucz witryny.
2. Firebase → App Check → *Apps* → **Register** przy każdej aplikacji Web → reCAPTCHA Enterprise →
   wkleić klucz witryny; TTL `1 days`.
3. Dopisać klucz do konfiguracji aplikacji (`firebase/firebase-config.js`; nazwę pola i format
   pliku ustalimy w Etapie 5 — np. `appCheckEnterpriseSiteKey`, jak w projekcie „Karty”). Aplikacja
   wywołuje `initializeAppCheck(...)` z automatycznym odświeżaniem tokenu **przed** pierwszym użyciem
   Firestore.
4. Obserwacja przez kilka dni (zakładka *APIs*).
5. **Enforce** dla Cloud Firestore (oraz dla Authentication, jeśli konsola na to pozwala).

App Check można zarejestrować wcześniej, ale wymuszenie (krok 5) ma sens dopiero wtedy, gdy
aplikacja korzysta z bazy z docelowymi regułami.

### 7.3. Pozostałe zabezpieczenia

1. **Klucz API** (Google Cloud Console → Interfejsy API → Dane logowania): opcjonalnie ograniczyć
   klucz przeglądarkowy do referrerów domeny hostingu (+ `localhost` na czas rozwoju) oraz do API
   faktycznie używanych przez aplikację (listę zweryfikować w konsoli przy wdrożeniu) — dodatkowa
   warstwa, nie zastępuje App Check.
2. **Konfiguracja webowa Firebase** (`apiKey`, `projectId` itd.) **nie jest sekretem** — może być w
   repozytorium. Bezpieczeństwo zapewniają reguły + App Check, nie ukrywanie konfiguracji.
3. **Sekretami są**: klucze kont serwisowych (Admin SDK), tokeny debug App Check, hasła, backupy z
   danymi graczy — **nigdy nie trafiają do repozytorium** (`.gitignore`).
4. Minimalizacja danych: tylko pseudonimy i stan gry; bez e-maili, bez analityki.

## 8. Kopie zapasowe i odtwarzanie

### 8.1. Zakres

- **W backupie**: `players/{playerId}` + wszystkie `books/{bookId}` + wszystkie `saves/{saveId}`.
- **Nigdy w backupie**: `secrets` (loginy i hasła), `sessions`, `admins`, a także **treść książek**.
  Dla rozpoznania graczy plik zawiera `displayName` (login zapisany przy ostatnim logowaniu).

### 8.2. Format pliku (JSON)

```json
{
  "format": "gry-paragrafowe-backup",
  "formatVersion": 1,
  "createdAt": "2026-10-29T12:00:00.000Z",
  "createdBy": "Player1",
  "appVersion": "0.6.0",
  "scope": "all",
  "players": {
    "Player2": {
      "profile": { "schemaVersion": 1, "displayName": "ania", "settings": {}, "createdAt": "…", "updatedAt": "…" },
      "books": {
        "vae-victis": {
          "state": { "schemaVersion": 1, "bookId": "vae-victis", "currentNode": "p22", "…": "…" },
          "saves": { "save1": { "schemaVersion": 1, "label": "Przed pogrzebem", "state": {}, "createdAt": "…" } }
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
| **Odtworzenie gracza z pliku** | **tylko admin** (decyzja właściciela) | patrz 8.4 |

### 8.4. Odtwarzanie (restore) — procedura w panelu administratora

1. Wybór pliku → **walidacja**: `format`, `formatVersion` (starsze wersje migrowane), schemat
   dokumentów, znane `bookId`, poprawne `playerId`.
2. **Podgląd**: gracze, książki i ręczne zapisy w pliku, daty, porównanie z bieżącym stanem w bazie.
3. Wybór gracza (graczy) i zakresu (cały gracz / jedna książka).
4. Tryb **„Zastąp”** (domyślny): stan gracza staje się dokładnie taki jak w pliku — dokumenty
   nieobecne w pliku (np. późniejsze ręczne zapisy) są usuwane.
5. Potwierdzenie przez wpisanie `playerId` (np. `Player2`) → zapis wsadowy (batch, ≤ 500 operacji
   na partię) → raport.
6. Loginy i hasła nie są odtwarzane: jeśli brakuje `secrets/{playerId}`, administrator najpierw
   tworzy go ręcznie w konsoli (rozdz. 9).

Zalecenia: backup przed każdą zmianą reguł, schematu lub wersji aplikacji oraz okresowo (np. raz
w tygodniu); pliki przechowywać lokalnie lub na prywatnym dysku — **nie w repozytorium**.
Opcjonalnie (plan Blaze): zarządzany eksport Firestore / odtwarzanie do punktu w czasie (PITR).

## 9. Procedury administratora (konsola Firebase)

**Pierwsza konfiguracja**
1. ✅ Projekt Firebase `gryparagrafowe-e1fb3` — utworzony przez właściciela 2026-10-29
   (w konfiguracji aplikacji Web brak `measurementId`, czyli bez Google Analytics).
2. ✅ Aplikacja Web; konfiguracja w `firebase/firebase-config.js` — właściciel, 2026-10-29.
3. ⬜ Authentication → Metody logowania → włączyć **Anonimowe** (Etap 5).
4. ✅ Firestore — baza utworzona, reguły tymczasowe blokują cały dostęp (rozdz. 6) — właściciel,
   2026-10-29. Region bazy wybrany przy tworzeniu (nie do zmiany) — do odnotowania w tym dokumencie.
5. ⬜ Firestore → Reguły → wkleić `firebase/firestore.rules` → Opublikuj (Etap 5; alternatywnie
   `firebase deploy --only firestore:rules`).
6. ⬜ App Check — rozdz. 7.2; opcjonalnie ograniczenia klucza API — rozdz. 7.3.
7. ⬜ Konta graczy: dokumenty `secrets/Player1` … `secrets/Player6` (pola `PlayerName` i
   `PlayerPassword`), dokument `appConfig/public` z polem `playerCount` = 6 oraz `admins/{playerId}`
   dla administratora. Można je zakładać już teraz — konsola działa niezależnie od reguł.

**Dodanie gracza** (np. siódmego)
1. Firestore → kolekcja `secrets` → „Dodaj dokument” → ID dokumentu: `Player7`.
2. Pole `PlayerName` (typ: string) = login, np. `ania` — inny niż loginy pozostałych graczy.
3. Pole `PlayerPassword` (typ: string) = hasło.
4. `appConfig/public` → pole `playerCount` zwiększyć do 7.
5. Przekazać graczowi login i hasło. Profil `players/Player7` powstanie przy pierwszym logowaniu.

**Zmiana loginu lub hasła** — edycja pola `PlayerName` lub `PlayerPassword` w `secrets/{playerId}`.
Gracz zostaje od razu wylogowany ze wszystkich urządzeń i loguje się ponownie nowymi danymi. Jego
postęp w grach zostaje (jest przypisany do konta `PlayerN`, nie do loginu).

**Uprawnienia administratora** — utworzenie (pustego) dokumentu `admins/{playerId}` (np.
`admins/Player1`); odebranie — usunięcie dokumentu.

**Wylogowanie wszystkich** — usunięcie dokumentów w kolekcji `sessions`.

**Przekazanie konta innej osobie** — najpierw backup; potem usunięcie `players/{playerId}` (z
podkolekcjami — czyści postęp poprzedniej osoby) i ustawienie nowego `PlayerName` oraz
`PlayerPassword`.

**Usunięcie konta** — najpierw backup; potem usunięcie `players/{playerId}` (z podkolekcjami),
`secrets/{playerId}` i ewentualnie `admins/{playerId}`. Konto o najwyższym numerze można też usunąć,
zmniejszając `playerCount`.

## 10. Wariant B — Cloud Functions + własne tokeny (plan Blaze)

Funkcja wywoływalna `login(playerId, password)` (Admin SDK) porównuje hasło z `secrets` i zwraca
token (`createCustomToken(playerId, { admin })`); klient loguje się `signInWithCustomToken`.
Reguły upraszczają się do `request.auth.uid == playerId` i `request.auth.token.admin == true`.

| Za | Przeciw |
|---|---|
| hasło nie trafia do dokumentu sesji | wymaga planu Blaze (konto rozliczeniowe) |
| możliwe ograniczanie prób logowania | wdrażanie funkcji (Firebase CLI), więcej elementów |
| standardowy model uwierzytelniania | zmiana hasła nie unieważnia tokenów bez dodatkowej logiki |

**Decyzja robocza:** wariant A (Spark). Instrukcja z projektu „Karty” (rozdz. 7.1) dotyczy App
Check i nie zmienia tego wyboru.

## 11. Koszty i limity

Dla 6 graczy zużycie jest znikome w stosunku do bezpłatnych limitów planu Spark (dzienne limity
odczytów/zapisów Firestore — zweryfikować aktualne wartości w cenniku Firebase). Uwaga: wywołania
`get()`/`exists()` w regułach są liczone jako odczyty dokumentów.

## 12. Do ustalenia

- format pliku `firebase/firebase-config.js`: obecnie `const firebaseConfig = {…}` (do wczytania
  klasycznym `<script>` przed modułami aplikacji); ewentualnie `window.firebaseConfig` z polem klucza
  App Check, jak w projekcie „Karty” — decyzja w Etapie 5, zmianę wprowadza właściciel,
- region bazy (już wybrany przy tworzeniu — odnotować).
