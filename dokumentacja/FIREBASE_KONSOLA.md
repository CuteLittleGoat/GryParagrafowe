# Firebase — co założyć w konsoli (instrukcja krok po kroku)

> Dla administratora (właściciela) projektu. Opisuje **dokładnie**, co trzeba utworzyć w konsoli
> Firebase, żeby gracze mogli się logować: nazwy kolekcji, dokumentów i pól, typy i wartości.
> Szczegóły techniczne (jak działa logowanie, reguły, kopie zapasowe):
> [FIREBASE.md](FIREBASE.md). Stan na 2026-11-02.

Konsola: <https://console.firebase.google.com/> → projekt **GryParagrafowe** (`gryparagrafowe-e1fb3`).
Nazwy przycisków podaję po angielsku (tak wyświetla je konsola), a w nawiasie po polsku.

## 0. Trzy zasady, o których łatwo zapomnieć

1. **Wielkość liter ma znaczenie** — w nazwach kolekcji, dokumentów i pól. `secrets` to nie
   `Secrets`; `Player1` to nie `player1`; `PlayerName` to nie `playerName`. Aplikacja i reguły
   bezpieczeństwa szukają dokładnie tych nazw.
2. **Identyfikator dokumentu wpisujesz sam.** Przy tworzeniu dokumentu konsola proponuje losowy
   identyfikator (przycisk *Auto-ID*) — **nie używaj go**; wpisz np. `Player1`.
3. **Typ pola musi się zgadzać.** Login i hasło to zawsze typ **string** (tekst) — także wtedy, gdy
   hasło składa się z samych cyfr. Liczba kont to liczba całkowita — typ **int64** (w starszych
   wersjach konsoli: *number*), a przerwa techniczna — **boolean**.

## 1. Mapa bazy — co zakładasz Ty, a co aplikacja

```text
Firestore Database
├── secrets/                ← zakładasz Ty — OBOWIĄZKOWO (konta: loginy i hasła)
│   ├── Player1             PlayerName: "…"   PlayerPassword: "…"   ← właściciel (administrator)
│   ├── Player2             PlayerName: "…"   PlayerPassword: "…"   ← Wydawnictwo
│   ├── Player3 … Player5   PlayerName: "…"   PlayerPassword: "…"   ← gracze
│   └── (kolejne konta później: Player6, Player7, …)
├── appConfig/              ← zakładasz Ty — OPCJONALNIE (zalecane)
│   └── public              playerCount: 5   maintenance: false   disabledBooks: (pusta lista)
├── admins/                 ← zakładasz Ty — PÓŹNIEJ (przed panelem administratora)
│   └── Player1             rola: "administrator"
├── players/                ← tworzy APLIKACJA (postęp graczy) — nie zakładaj
└── sessions/               ← tworzy APLIKACJA (logowania) — nie zakładaj
```

| Kolekcja | Kto zakłada | Czy konieczna teraz |
|---|---|---|
| `secrets` | administrator, w konsoli | **tak** — bez niej nikt się nie zaloguje |
| `appConfig` | administrator, w konsoli | nie — bez niej aplikacja sprawdza konta `Player1` … `Player10` |
| `admins` | administrator, w konsoli | nie — przyda się przy panelu administratora (kopie zapasowe) |
| `players`, `sessions` | aplikacja, sama | nie zakładaj — powstaną przy pierwszym logowaniu i pierwszej grze |

Aplikacja **nie może** zakładać kont (kolekcji `secrets`) — celowo: gdyby mogła, każdy mógłby założyć
sobie konto. Dlatego konta zakłada wyłącznie administrator w konsoli.

## 2. Krok 1 — Logowanie anonimowe ✅ (zrobione 2026-11-02)

*Build* (menu po lewej) → **Authentication** → zakładka *Sign-in method* (Metoda logowania) → dostawca
**Anonymous** (Anonimowy) → *Enable* (Włącz) → *Save* (Zapisz).

To techniczny pierwszy krok logowania — gracz go nie widzi i nie podaje żadnych danych.

## 3. Krok 2 — Reguły bezpieczeństwa

1. *Build* → **Firestore Database** → zakładka **Rules** (Reguły).
2. Usuń całą obecną treść w edytorze.
3. Wklej **całą** zawartość pliku [`firebase/firestore.rules`](../firebase/firestore.rules) — na
   GitHubie: otwórz plik → przycisk *Copy raw file* (ikona kopiowania nad treścią pliku).
4. Kliknij **Publish** (Opublikuj).

Reguły można opublikować przed założeniem kont — bez kont i tak nikt się nie zaloguje. Pierwsza linijka
wklejonej treści to `rules_version = '2';`.

**Aktualizacja reguł 2026-11-08** (D66): w ustawieniach gracza dochodzą krój pisma (`bookFont`) i wygląd
akapitów (`paragraphStyle`).
- Opublikuj w konsoli nową treść `firebase/firestore.rules` — tak samo jak wyżej.
- Do czasu publikacji aplikacja działa: krój i wygląd akapitów pamięta na urządzeniu, a pozostałe
  ustawienia zapisuje na koncie.

## 4. Krok 3 — Kolekcja `secrets` (konta graczy) — OBOWIĄZKOWO

### 4.1. Pierwsze konto (zakłada kolekcję)

1. *Build* → **Firestore Database** → zakładka **Data** (Dane) → **+ Start collection** (Rozpocznij
   kolekcję).
2. *Collection ID* (Identyfikator kolekcji): `secrets` → *Next* (Dalej).
3. *Document ID* (Identyfikator dokumentu): `Player1` — wpisz ręcznie (nie *Auto-ID*).
4. Pierwsze pole:
   - *Field* (Pole): `PlayerName`
   - *Type* (Typ): `string`
   - *Value* (Wartość): login gracza, np. `ania`
5. **+ Add field** (Dodaj pole) — drugie pole:
   - *Field*: `PlayerPassword`
   - *Type*: `string`
   - *Value*: hasło gracza
6. *Save* (Zapisz).

### 4.2. Kolejne konta

W kolekcji `secrets` kliknij **+ Add document** (Dodaj dokument) i powtórz kroki 3–6 dla `Player2`,
`Player3`, … `Player7`.

### 4.3. Pola dokumentu konta

| Pole | Typ | Wartość | Zasady |
|---|---|---|---|
| `PlayerName` | **string** | login, np. `ania` | inny dla każdego konta; bez spacji na początku i na końcu; do 100 znaków; polskie litery dozwolone |
| `PlayerPassword` | **string** | hasło | zalecane min. 12 znaków, losowe; **nie** hasło używane w innych serwisach; polskie litery dozwolone; spacje na początku i końcu liczą się jako znaki hasła — lepiej ich unikać |

Tylko te dwa pola — innych nie dodawaj.

### 4.4. Konta (stan na 2026-11-02 — założone przez właściciela)

| Identyfikator dokumentu | Dla kogo |
|---|---|
| `Player1` | właściciel (administrator) |
| `Player2` | **Wydawnictwo** (konto do wysłania razem z odnośnikiem do aplikacji) |
| `Player3` | gracz |
| `Player4` | gracz |
| `Player5` | gracz |
| `Player6`, `Player7`, … | kolejni gracze — później (pamiętaj o zwiększeniu `playerCount`) |

Identyfikator to zawsze `Player` + numer bez zera na początku (`Player1`, nie `Player01`), od 1 do 99.
Numer konta jest stały — gracz loguje się **loginem** (`PlayerName`), a jego postęp jest zapisany
przy numerze konta. Dzięki temu login i hasło można później zmienić bez utraty postępu.

## 5. Krok 4 — Kolekcja `appConfig` — OPCJONALNIE (zalecane)

1. W zakładce **Data**: **+ Start collection** → *Collection ID*: `appConfig` → *Next*.
2. *Document ID*: `public` (małymi literami).
3. Pola:

| Pole | Typ | Wartość teraz | Co robi |
|---|---|---|---|
| `playerCount` | **int64** (starsze konsole: *number*) | `5` (tyle kont jest teraz) | ile kont aplikacja sprawdza przy logowaniu (`Player1` … `PlayerN`); bez tego pola: 10 |
| `maintenance` | **boolean** | `false` | `true` = **przerwa techniczna**: gracze widzą komunikat „Przerwa techniczna” i nie mogą grać (postęp zostaje) |
| `disabledBooks` | **array** | pusta lista (możesz pominąć to pole; pusty element tekstowy jest ignorowany) | lista książek wyłączonych awaryjnie, np. po wycofaniu zgody: element typu `string` o wartości `vae-victis` ukrywa „Vae Victis” |

4. *Save*.

Uwagi:
- `playerCount` musi być liczbą (**int64**; w starszych konsolach *number*) — tekst `"5"` (typ string)
  aplikacja zignoruje.
- Po dodaniu konta o wyższym numerze niż `playerCount` (np. `Player6` przy `playerCount` = 5)
  **zwiększ `playerCount`** — inaczej nowy gracz nie zaloguje się.
- `maintenance` musi być typu **boolean** (przełącznik *true / false*), nie tekstem.

## 6. Krok 5 — Kolekcja `admins` — PÓŹNIEJ

Potrzebna dopiero przy panelu administratora (kopie zapasowe, lista graczy — kolejny etap prac).

1. **+ Start collection** → *Collection ID*: `admins` → *Next*.
2. *Document ID*: identyfikator konta administratora, np. `Player1`.
3. Jedno dowolne pole, np. *Field*: `rola`, *Type*: `string`, *Value*: `administrator` — liczy się
   samo istnienie dokumentu, nie treść pola.
4. *Save*.

Administrator widzi dane wszystkich graczy (w przyszłym panelu); haseł i sesji nie widzi nikt poza
konsolą. Odebranie uprawnień = usunięcie dokumentu.

## 7. Czego NIE zakładać — kolekcje tworzone przez aplikację

| Kolekcja | Kiedy powstaje | Co zawiera |
|---|---|---|
| `players` | przy pierwszym logowaniu gracza | `players/Player1` — profil (login, ustawienia: motyw, rozmiar tekstu, tryb mechaniki, krój pisma, wygląd akapitów); `players/Player1/books/vae-victis` — stan gry (miejsce w książce, Informacje, notatki, odkryte zakończenia); `…/saves/save1` … `save3` — ręczne zapisy |
| `sessions` | przy każdym logowaniu | jeden dokument na przeglądarkę: numer konta, login, **skrót** hasła (nie samo hasło), czas logowania |

Tych dokumentów nie edytuj ręcznie — wyjątki opisuje rozdz. 10.

## 8. Sprawdzenie po założeniu

- [ ] *Authentication* → *Sign-in method*: **Anonymous — Enabled**.
- [ ] *Firestore Database* → *Rules*: opublikowana treść z `firebase/firestore.rules` (zaczyna się od
      `rules_version = '2';`, zawiera m.in. `match /secrets/{playerId}`).
- [x] *Data*: kolekcja `secrets` z dokumentami `Player1` … `Player5`; w każdym dokładnie dwa pola
      `PlayerName` i `PlayerPassword`, oba typu **string** (właściciel, 2026-11-02).
- [x] `appConfig/public` z polem `playerCount` typu **int64** = 5 (sprawdzone 2026-11-02: aplikacja
      odczytuje wartość poprawnie).
- [ ] Na stronie aplikacji logowanie działa dla każdego konta; zły login lub hasło daje komunikat
      „Nieprawidłowy login lub hasło”.

## 9. Najczęstsze pomyłki

| Objaw w aplikacji | Najczęstsza przyczyna | Co zrobić |
|---|---|---|
| „Nieprawidłowy login lub hasło”, choć dane są dobre | literówka w nazwie: `secret`, `Secrets`, `player1`, `Playername`; pole typu `number` zamiast `string`; spacja na końcu loginu w konsoli; identyfikator z *Auto-ID* zamiast `PlayerN` | popraw nazwę / typ / wartość w konsoli |
| Nowy gracz nie może się zalogować, pozostali mogą | numer konta większy niż `playerCount` (albo większy niż 10, gdy nie ma `appConfig`) | zwiększ `playerCount` w `appConfig/public` |
| „Baza danych nie jest jeszcze gotowa…” | nie opublikowano reguł z `firebase/firestore.rules` | krok 2 |
| „Logowanie nie jest jeszcze włączone…” | wyłączone logowanie anonimowe | krok 1 |
| Wszyscy widzą „Przerwa techniczna” | `maintenance` = `true` | ustaw `false` |
| Brak książki na ekranie głównym | jej identyfikator jest w `disabledBooks` | usuń element z listy |

## 10. Późniejsze zmiany

| Co | Jak |
|---|---|
| **Dodanie gracza** | `secrets` → *Add document* → `Player6` z polami `PlayerName` i `PlayerPassword`; w `appConfig/public` zwiększ `playerCount` (np. do 6) |
| **Zmiana loginu lub hasła** | edytuj pole `PlayerName` lub `PlayerPassword` w `secrets/PlayerN` — gracz zostaje od razu wylogowany na wszystkich urządzeniach, loguje się nowymi danymi; postęp zostaje |
| **Wylogowanie wszystkich** | usuń dokumenty w kolekcji `sessions` (menu ⋮ przy kolekcji → *Delete collection*); kolekcja powstanie znów przy następnym logowaniu |
| **Przerwa techniczna** | `appConfig/public` → `maintenance` = `true`; po pracach — `false` |
| **Awaryjne wyłączenie książki** (np. wycofanie zgody) | `appConfig/public` → `disabledBooks` → dodaj element typu `string`, np. `vae-victis` |
| **Uprawnienia administratora** | dodaj / usuń dokument `admins/PlayerN` |
| **Przekazanie konta innej osobie** | najpierw kopia zapasowa (gdy powstanie panel administratora); potem usuń `players/PlayerN` (czyści postęp poprzedniej osoby) i ustaw nowe `PlayerName` oraz `PlayerPassword` |
| **Usunięcie konta** | usuń `secrets/PlayerN` (dostęp znika natychmiast), w razie potrzeby także `players/PlayerN` i `admins/PlayerN` |

### 10.1. Gdy przybywa graczy — krok po kroku

**`playerCount` = najwyższy numer konta.** Przykłady:
- Konta `Player1` … `Player7` → `playerCount` = **7**.
- Wartość wyższa też działa (np. 10 przy 7 kontach). Poprawne logowanie trwa tyle samo — aplikacja
  sprawdza numery po kolei i kończy na koncie gracza. Tylko przy złym loginie lub haśle komunikat o
  błędzie pojawia się odrobinę później, bo aplikacja sprawdza wtedy wszystkie numery, także te bez konta.
- Wartość niższa **blokuje** graczy z wyższymi numerami. Przykład: `playerCount` = 5, a konto
  `Player7` — ten gracz się nie zaloguje.
- Dziś: 5 kont (`Player1` … `Player5`) i `playerCount` = 5 — tak jest dobrze.

0. **Najpierw licencja.**
   - Zgoda Wydawcy dotyczy wąskiego grona — w prośbie „ok. 5 osób”.
   - Decyzja P12: po ukończeniu pierwszej książki i przygotowaniu kont dla 6 graczy właściciel prosi
     Wydawcę o kolejne tytuły i informuje o planie zwiększenia liczby graczy.
   - Znacząco większe grono — tylko za nową zgodą Wydawcy (`LICENCJA_I_ZGODA.md`, Z11 i rozdz. 9 pkt 1).
1. **Firestore Database → Data → kolekcja `secrets` → *Add document*.**
   - *Document ID*: kolejny numer, np. `Player6`.
   - Zapis: `Player` + numer bez zera na początku, od 1 do 99.
2. **Pola nowego dokumentu** (jak w rozdz. 4.3):
   - `PlayerName` (*string*) — login;
   - `PlayerPassword` (*string*) — hasło.
   - Wielkość liter ma znaczenie.
3. **`appConfig` → dokument `public` → pole `playerCount`.**
   - Wpisz najwyższy numer konta, np. `6`.
   - Typ pola: **int64** (w starszych konsolach *number*).
   - *Update*.
4. **Przekaż graczowi login i hasło** — osobno, nigdy w repozytorium.
5. **Sprawdzenie.**
   - Gracz loguje się na stronie aplikacji.
   - W kolekcji `sessions` pojawia się nowy dokument.
   - Dokument `players/Player6` z postępem aplikacja zakłada sama przy pierwszym logowaniu — nie zakładaj
     go ręcznie.

Uwagi:
- **Limit 99 kont** (`Player1` … `Player99`) wynika z reguł i aplikacji.
- **Brak pola `playerCount`.** Jeśli `appConfig/public` nie istnieje albo `playerCount` ma zły typ (np.
  tekst `"6"`), aplikacja sprawdza 10 kont (`Player1` … `Player10`).
- **Luki w numeracji nie przeszkadzają.** Aplikacja pomija brakujący numer (np. usunięte `Player4`).
  `playerCount` nadal ustawiasz na najwyższy numer konta.
- **Administrator.** Uprawnienia administratora daje osobny dokument `admins/PlayerN` (rozdz. 6) —
  zwykły gracz go nie potrzebuje.

## 11. Poza bazą danych

| Usługa | Stan | Co dalej |
|---|---|---|
| **App Check** (potwierdzenie, że zapytania pochodzą z naszej aplikacji) | ✅ działa (2026-11-03): klucz „GryParagrafowe” z projektu `gryparagrafowe-e1fb3`, ważność tokenu 7 dni; próba na stronie — wymiana tokenu: kod 200 | kilka dni obserwacji (*App Check* → *APIs* → *Cloud Firestore*: żądania „Verified”), potem **Enforce**; gdyby gracze nie mogli się zalogować — **Unenforce** ([FIREBASE.md](FIREBASE.md), rozdz. 7.2); stary klucz z projektu AudioRPG do usunięcia (rozdz. 12, krok 5) |
| **GitHub Pages** (adres aplikacji) | ✅ włączone 2026-11-02 (repozytorium publiczne, gałąź `main`) | adres: `https://cutelittlegoat.github.io/GryParagrafowe/` |

## 12. App Check — klucz z niewłaściwego projektu (✅ naprawione 2026-11-03)

> Naprawione: właściciel utworzył klucz „GryParagrafowe” w projekcie `gryparagrafowe-e1fb3` i podmienił
> go w App Check (ważność tokenu 7 dni); agent wpisał go do aplikacji — wymiana tokenu działa (kod 200).
> Do zrobienia zostaje krok 5 (usunięcie starego klucza z projektu AudioRPG). Poniżej — opis na
> wypadek podobnego problemu w przyszłości.

**Diagnoza (2026-11-02):** pierwszy klucz reCAPTCHA (`6LefCQ0u…`) powstał w projekcie Google Cloud
**AudioRPG**, a musi być w projekcie Firebase gry. Serwer App Check odrzucał go komunikatem:
*„…ensure that the reCAPTCHA Enterprise API is enabled and that the site key is from the same project
as the one containing this app.”* Klucz został usunięty z konfiguracji aplikacji (aplikacja działa bez
App Check do czasu wpisania nowego klucza). **Nie włączaj Enforce, dopóki App Check nie zadziała.**

Ważne: projekt Firebase gry **jest już projektem Google Cloud** — ma identyfikator dokładnie
**`gryparagrafowe-e1fb3`** (bez żadnej końcówki). Nowego projektu nie trzeba zakładać; projekt
o identyfikatorze z końcówką (np. `gryparagrafowe-e1fb3-513516`) to **inny, pusty projekt** — nie
twórz w nim klucza (można go usunąć: *IAM i administracja* → *Ustawienia* → *Wyłącz*).

1. **Otwórz właściwy projekt bezpośrednio z odnośnika** (identyfikator projektu jest w adresie):
   <https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=gryparagrafowe-e1fb3>
   → sprawdź, czy w adresie strony jest `project=gryparagrafowe-e1fb3` → **Enable** (Włącz). Jeśli jest
   *Manage* (Zarządzaj) — usługa jest już włączona.
2. **Utwórz klucz w tym projekcie**:
   <https://console.cloud.google.com/security/recaptcha?project=gryparagrafowe-e1fb3> → *Utwórz klucz*:
   - *Nazwa wyświetlana*: dowolna, np. `GryParagrafowe` (to tylko etykieta na liście),
   - *Typ aplikacji*: **Sieć**,
   - *Lista domen*: `cutelittlegoat.github.io`; weryfikacja domeny włączona,
   - test zabezpieczający (wyzwanie) — **nie**; pozostałe ustawienia bez zmian → *Utwórz*.
3. **Podmień klucz w Firebase**: Firebase → *App Check* → *Apps* → aplikacja Web *GryParagrafowe* →
   dostawca *Fraud Defense (reCAPTCHA Enterprise)* → wpisz nowy klucz (TTL `1 days`) → *Save*.
4. **Przekaż nowy klucz agentowi** — wpisze go do `firebase/firebase-config.js` i sprawdzi stronę
   (wymiana tokenu powinna zwracać kod 200).
5. **Usuń stary klucz z projektu AudioRPG** — wyłącznie klucz o nazwie `gryparagrafowe-e1fb3`
   (`6LefCQ0u…`). **Nie usuwaj** klucza `WrathAndGlory-AudioRPG` — używa go inna Twoja aplikacja.
