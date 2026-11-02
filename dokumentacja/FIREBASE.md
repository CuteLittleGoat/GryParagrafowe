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
2. Wielu graczy (obecnie **5 kont**: właściciel, Wydawnictwo i 3 graczy; kolejne — później; liczba nieograniczona strukturą), wiele książek, każdy gracz
   niezależny — osobne dokumenty, osobne hasła, brak wglądu w dane innych.
3. Logowanie **loginem i hasłem przechowywanymi w Firestore** (decyzja właściciela, P4): konta
   graczy `Player1` … `Player5` (`Player1` — właściciel i administrator, `Player2` — Wydawnictwo), a w dokumencie każdego konta dwa pola — `PlayerName` (login) i
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
| `playerId` | `Player1` … `PlayerN`, obecnie `Player5` (wzorzec `^Player[1-9][0-9]?$`) | stały identyfikator konta; tworzy administrator; **niezmienny**. Login gracza to osobne pole `PlayerName` — można go zmienić bez przenoszenia danych |
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
| `undo` | array&lt;map&gt; | lista ruchów do cofnięcia (przycisk „Cofnij”) — krok po kroku, do początku bieżącej rozgrywki (technicznie: do 1000 ostatnich ruchów). Każdy wpis zapisuje tylko **zmiany** wprowadzone ruchem: `from` (węzeł przed ruchem), `entered` (węzeł po ruchu), `historyLength`, `status`, `added` / `removed` (Informacje zdobyte / utracone w tym ruchu) — mały rozmiar dokumentu |
| `revision` | number | licznik zapisów — wykrywanie konfliktu przy grze na dwóch urządzeniach |
| `startedAt`, `updatedAt` | timestamp | |

**`…/saves/{saveId}`** — ręczny zapis (3 miejsca: `save1` … `save3`)

| Pole | Typ | Opis |
|---|---|---|
| `schemaVersion` | number | |
| `label` | string | nazwa nadana przez gracza |
| `state` | map | kopia pól rozgrywki: `currentNode`, `status`, `history`, `visits`, `modules`, `notes`, `playthrough`, `undo`, `contentVersion`, `startedAt` (bez `endingsFound` — odkryte zakończenia są wspólne dla wszystkich rozgrywek; przy wczytaniu gracz decyduje, czy przywrócić notatki z zapisu) |
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
| `playerId` | string | konto zalogowanego gracza (`Player1` … `PlayerN`) |
| `login` | string | kopia wpisanego loginu — reguły porównują ją z aktualnym `PlayerName` |
| `passwordHash` | string | **skrót SHA-256** wpisanego hasła (64 znaki szesnastkowe, liczony w przeglądarce) — reguły porównują go ze skrótem aktualnego `PlayerPassword`; samo hasło nie jest zapisywane |
| `createdAt` | timestamp | czas logowania (`serverTimestamp()`); logowanie pamiętane 30 dni (decyzja właściciela, P6) |

**`appConfig/public`**

| Pole | Typ | Opis |
|---|---|---|
| `playerCount` | number | liczba kont graczy (`Player1` … `PlayerN`); przy logowaniu aplikacja sprawdza kolejno te konta — obecnie **5** (typ w konsoli: *int64*); **dokument opcjonalny** — bez niego aplikacja sprawdza konta `Player1` … `Player10` |
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
  "undo": [
    { "from": "wprowadzenie", "historyLength": 1, "status": "inProgress", "added": [], "removed": [], "entered": "prolog" },
    { "from": "prolog", "historyLength": 2, "status": "inProgress", "added": [], "removed": [], "entered": "p1" },
    { "from": "p1", "historyLength": 3, "status": "inProgress", "added": [], "removed": [], "entered": "p22" }
  ],
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

> Stan: **wdrożone w aplikacji** (`aplikacja/js/data/firestore-adapter.js`, 2026-11-02); sprawdzone
> w emulatorze (`testy/reguly/`). Działa po wykonaniu kroków administratora z rozdz. 9.

1. Start aplikacji → `signInAnonymously()` — przeglądarka otrzymuje `uid` (bez danych osobowych).
2. Gracz wpisuje **login** i **hasło**. Przeglądarka liczy skrót SHA-256 hasła, odczytuje
   `appConfig/public.playerCount` (np. 7) i sprawdza kolejno konta `Player1` … `PlayerN`: dla każdego
   próbuje zapisać dokument `sessions/{uid}` = `{ playerId, login, passwordHash, createdAt:
   serverTimestamp() }`.
3. Reguły dopuszczają ten zapis **tylko wtedy, gdy login i skrót hasła zgadzają się** z polami
   `PlayerName` i `PlayerPassword` w `secrets/{playerId}` (reguły odczytują `secrets` funkcją `get()`
   i same liczą skrót hasła; aplikacja nie ma do tej kolekcji żadnego dostępu). Pierwszy udany zapis
   = zalogowanie. Jeśli żadne konto nie pasuje — komunikat „Nieprawidłowy login lub hasło”.
4. Po zalogowaniu aplikacja zapisuje login w `players/{playerId}.displayName` (do panelu
   administratora i kopii zapasowych), a w pamięci przeglądarki — tylko identyfikator konta, login i
   datę logowania (**bez hasła i bez jego skrótu**), żeby po odświeżeniu strony wiedzieć, czyje dane
   wczytać.
5. Każdy odczyt i zapis danych gracza jest sprawdzany przez reguły: sesja istnieje, nie wygasła
   (30 dni) i **login oraz skrót hasła z sesji nadal zgadzają się z polami w `secrets`**. Dzięki temu
   **zmiana loginu lub hasła w konsoli natychmiast wylogowuje** tego gracza ze wszystkich urządzeń.
6. Wylogowanie: usunięcie `sessions/{uid}` (anonimowe konto przeglądarki zostaje — nie zawiera
   żadnych danych).

Właściwości i ograniczenia (świadomie zaakceptowane):

- Loginy muszą być różne (przy dwóch kontach z tym samym loginem i hasłem wygrywa pierwsze z nich).
  Wielkość liter w loginie i haśle ma znaczenie.
- Logowanie to co najwyżej tyle prób zapisu, ile jest kont — przy tej liczbie graczy pomijalne
  (konsola przeglądarki pokazuje wtedy ostrzeżenia „PERMISSION_DENIED” — to oczekiwane).
- Hasło jest przechowywane jawnym tekstem tylko w `secrets` (wymóg: ręczna edycja w konsoli); widzi je
  tylko administrator projektu Firebase. W `sessions` jest wyłącznie skrót hasła. **Gracze nie
  powinni używać haseł z innych serwisów**; zalecane hasła losowe, min. 12 znaków.
- Reguły nie ograniczają liczby prób logowania. Ochrona: App Check (tylko prawdziwa aplikacja) +
  silne hasła. Opcjonalne wzmocnienie: wariant B (rozdz. 10).
- Pamięć podręczna Firestore działa wyłącznie w pamięci karty (bez trwałego zapisu w przeglądarce) —
  bez trybu offline, za to bez kopii danych na dysku urządzenia.

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

**Reguły docelowe: [`firebase/firestore.rules`](../firebase/firestore.rules)** (2026-11-02) — gotowe
do opublikowania przez właściciela (rozdz. 9, krok 4). Sprawdzone w emulatorze:
`testy/reguly/test-regul.mjs` (17 testów: wszystkie role i przypadki brzegowe) oraz
`testy/reguly/test-aplikacji-z-emulatorem.cjs` (aplikacja w przeglądarce z prawdziwymi regułami).
Instrukcja uruchomienia testów: [`testy/reguly/README.md`](../testy/reguly/README.md).

Co gwarantują reguły:

| Kolekcja | Zasada |
|---|---|
| `secrets`, `admins` | brak jakiegokolwiek dostępu z aplikacji (tylko konsola) |
| `appConfig/public` | odczyt dla przeglądarki zalogowanej anonimowo; zapis tylko w konsoli |
| `sessions/{uid}` | zapis tylko własnej sesji i tylko przy zgodnym loginie i skrócie hasła; czas z serwera; bez odczytu; usunięcie (wylogowanie) przez właściciela sesji |
| `players/{playerId}` i podkolekcje | tylko ten gracz (ważna sesja) albo administrator; lista graczy i usuwanie profilu — tylko administrator |
| walidacja | dozwolone pola i typy dokumentów, limity długości (notatki do 20 000 znaków, nazwa zapisu do 100), identyfikatory książek i zapisów (`save1`–`save3`), numer wersji stanu gry tylko rośnie |
| sesja | ważna 30 dni; zmiana `PlayerName` / `PlayerPassword` lub usunięcie `secrets/{playerId}` natychmiast odbiera dostęp |

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

1. ◐ Google Cloud → reCAPTCHA / Fraud Defense (`console.cloud.google.com/security/recaptcha`),
   projekt **`gryparagrafowe-e1fb3`** (ten sam co Firebase — bez końcówki w identyfikatorze) →
   **Utwórz klucz**: typ *Sieć* (Website), domena `cutelittlegoat.github.io`, weryfikacja domeny
   włączona. Pierwszy klucz (2026-11-02) powstał w projekcie AudioRPG — do ponownego utworzenia
   ([FIREBASE_KONSOLA.md](FIREBASE_KONSOLA.md), rozdz. 12).
2. ✅ Firebase → App Check → *Apps* → aplikacja Web *GryParagrafowe* → „Fraud Defense (formerly known
   as reCAPTCHA Enterprise)” → klucz witryny; TTL `1 days` → *Save* — właściciel, 2026-11-02.
3. ◐ Klucz witryny w `firebase/firebase-config.js` (`appCheckSiteKey`) — agent (P13); pierwszy klucz
   usunięty 2026-11-02 (zły projekt), pole czeka na nowy klucz.
   Aplikacja wywołuje `initializeAppCheck(...)` z automatycznym odświeżaniem tokenu **przed**
   pierwszym użyciem Firestore; przy pustym polu działa bez App Check. Klucz działa tylko pod adresem
   `cutelittlegoat.github.io` (na `localhost` aplikacja nie używa App Check).
4. ⬜ Obserwacja przez kilka dni od uruchomienia strony i pierwszych logowań: Firebase → App Check →
   zakładka *APIs* → *Cloud Firestore* — wykres żądań „Verified” (zweryfikowane) i „Unverified”.
5. ⬜ **Enforce** (Wymuś) dla Cloud Firestore, gdy prawie wszystkie żądania są zweryfikowane (oraz dla
   Authentication, jeśli konsola na to pozwala). Hamulec bezpieczeństwa: *Unenforce* (Wyłącz
   wymuszanie) — natychmiast przywraca dostęp, gdyby gracze nie mogli się zalogować.

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

> **Instrukcja krok po kroku dla administratora** — dokładne nazwy kolekcji, dokumentów i pól, typy,
> wartości i najczęstsze pomyłki: [FIREBASE_KONSOLA.md](FIREBASE_KONSOLA.md).

**Pierwsza konfiguracja**

> Kolekcje `players` i `sessions` tworzy **aplikacja** (przy pierwszym logowaniu i pierwszej grze) —
> nie trzeba ich zakładać. Kolekcję `secrets` (loginy i hasła) zakłada **wyłącznie administrator w
> konsoli**: aplikacja celowo nie ma do niej dostępu — gdyby mogła ją zapisywać, każdy mógłby założyć
> sobie konto. Przy regułach tymczasowych (blokada wszystkiego) aplikacja nie może zapisać niczego.

1. ✅ Projekt Firebase `gryparagrafowe-e1fb3` z aplikacją Web (bez Google Analytics) i bazą Firestore —
   właściciel, 2026-10-29; konfiguracja w `firebase/firebase-config.js`.
2. ✅ **Logowanie anonimowe**: Authentication → *Sign-in method* (Metody logowania) → *Anonymous*
   (Anonimowe) → włącz → Zapisz — właściciel, 2026-11-02 (sprawdzone próbą: działa).
3. ✅ **Reguły**: Firestore Database → *Rules* (Reguły) → zastąpić całą treść zawartością pliku
   `firebase/firestore.rules` → *Publish* (Opublikuj) — właściciel, 2026-11-02 (sprawdzone próbą).
4. ✅ **Konta graczy** (właściciel, 2026-11-02: `Player1` — właściciel, `Player2` — Wydawnictwo,
   `Player3` … `Player5` — gracze): Firestore Database → *Start collection* (Rozpocznij kolekcję) →
   ID kolekcji `secrets` → dokumenty o ID `Player1`, `Player2`, … W
   każdym dwa pola typu *string*: `PlayerName` (login, inny dla każdego konta) i `PlayerPassword`
   (hasło; zalecane min. 12 znaków, losowe). Wielkość liter ma znaczenie.
5. ✅ (opcjonalnie) **Ustawienia aplikacji** (właściciel, 2026-11-02): kolekcja `appConfig` →
   dokument `public` → pola: `playerCount` (typ *int64*) = `5`, `maintenance` (typ *boolean*) =
   `false`, `disabledBooks` (typ *array*) — puste. Bez tego dokumentu aplikacja sprawdza konta `Player1` … `Player10`; dokument
   przyda się przy przerwie technicznej, wyłączeniu książki albo ponad 10 kontach.
6. ✅ **Administrator** (właściciel, 2026-11-02 — `admins/Player1`): kolekcja `admins` → dokument
   o ID konta administratora (np. `Player1`) — z dowolnym polem, np. `rola` = `administrator` (liczy
   się samo istnienie dokumentu).
7. ✅ **Publikacja strony** (właściciel, 2026-11-02; repozytorium publiczne): GitHub → repozytorium → *Settings* → *Pages* → *Source*: „Deploy from a
   branch” → *Branch*: `main`, folder `/ (root)` → *Save*. Adres aplikacji:
   `https://cutelittlegoat.github.io/GryParagrafowe/` (pierwsza publikacja trwa kilka minut). Można
   włączyć w dowolnej chwili — bez kont i reguł docelowych strona pokazuje tylko formularz logowania.
8. ⬜ Sprawdzenie: logowanie każdym kontem, gra, zapis, wylogowanie.
9. ◐ **App Check** — pierwszy klucz powstał w innym projekcie (AudioRPG) i został usunięty z
   konfiguracji; nowy klucz w projekcie `gryparagrafowe-e1fb3` wg
   [FIREBASE_KONSOLA.md](FIREBASE_KONSOLA.md), rozdz. 12; potem obserwacja i wymuszenie (rozdz. 7.2,
   kroki 4–5); opcjonalnie ograniczenia klucza API — rozdz. 7.3.

**Dodanie gracza** (np. siódmego)
1. Firestore → kolekcja `secrets` → „Dodaj dokument” → ID dokumentu: `Player7`.
2. Pole `PlayerName` (typ: string) = login, np. `ania` — inny niż loginy pozostałych graczy.
3. Pole `PlayerPassword` (typ: string) = hasło.
4. `appConfig/public` → pole `playerCount` zwiększyć do 7.
5. Przekazać graczowi login i hasło. Profil `players/Player7` powstanie przy pierwszym logowaniu.

**Zmiana loginu lub hasła** — edycja pola `PlayerName` lub `PlayerPassword` w `secrets/{playerId}`.
Gracz zostaje od razu wylogowany ze wszystkich urządzeń i loguje się ponownie nowymi danymi. Jego
postęp w grach zostaje (jest przypisany do konta `PlayerN`, nie do loginu).

**Uprawnienia administratora** — utworzenie dokumentu `admins/{playerId}` (np. `admins/Player1`,
z dowolnym polem); odebranie — usunięcie dokumentu.

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

- ✅ format pliku `firebase/firebase-config.js` — moduł ES (`export const firebaseConfig`, `export const
  appCheckSiteKey`), zmieniony za zgodą właściciela (P13, 2026-11-02),
- region bazy (już wybrany przy tworzeniu — odnotować).
