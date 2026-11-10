# Kolekcja `sessions` w Firebase — do czego służy i czy rośnie bez końca

## Polecenie użytkownika

> Sprawdziłem konsolę Firebase i zobaczyłem tam dziwną kolekcję.
> Nazywa się "sessions"
> Zawiera dokumenty będące jakimiś ciągami znaków.
> Dokumenty zawierają pola "createdAt", "login", "passwordHash", "playerId".
>
> Przeprowadź analizę. Czy ta kolekcja jest niezbędna do działania? Czy ilość dokumentów w kolekcji
> będzie rosła w nieskończoność?

## Analizowane pliki i źródła

| Źródło | Wersja |
|---|---|
| `firebase/firestore.rules` | commit `7039573`, SHA-256 `3ddbbe419d7800b22096125ec2b72759b4b4f037b71bcbe929ac352e55dfb2e0` |
| `aplikacja/js/data/firestore-adapter.js` | commit `7039573`, SHA-256 `6f3c1267a2c1ab577be3796c3e89b467e35effaff68f661c3e3fcb8805323bac` |
| `aplikacja/js/main.js` (wylogowanie), `aplikacja/js/data/storage-errors.js` (`SESSION_DAYS = 30`) | commit `7039573` |
| `dokumentacja/FIREBASE.md` (rozdz. 3, 5, 6, 10, 11), `dokumentacja/FIREBASE_KONSOLA.md` (rozdz. 7, 10) | commit `7039573` |
| Dokumentacja Google: [TTL w Firestore](https://firebase.google.com/docs/firestore/ttl), [limity i darmowy pakiet Firestore](https://firebase.google.com/docs/firestore/quotas), [logowanie anonimowe — automatyczne czyszczenie](https://firebase.google.com/docs/auth/web/anonymous-auth) | sprawdzone 2026-11-10 (wyszukiwarka; konsoli projektu agent nie widzi) |

## Krótka odpowiedź

1. **Tak, kolekcja jest niezbędna.** To nie jest śmieć ani błąd — to „przepustka” zalogowanej
   przeglądarki. Bez niej nikt nie może się zalogować ani odczytać swoich zapisów gry. Została
   zaplanowana od początku (decyzja D5, D44) i jest opisana w `FIREBASE.md` (rozdz. 3 i 5) oraz w
   `FIREBASE_KONSOLA.md` (rozdz. 7: „tworzy APLIKACJA — nie zakładaj”).
2. **Nie rośnie w nieskończoność przy normalnym graniu, ale też sama się nie sprząta.** Jedna
   przeglądarka = co najwyżej jeden dokument (kolejne logowania go nadpisują, wylogowanie go usuwa).
   Przybywa ich powoli — tylko wtedy, gdy gracz zaloguje się w „nowej” przeglądarce (nowe urządzenie,
   okno prywatne, wyczyszczone dane strony) i nie wyloguje się przyciskiem „Wyloguj”. Takie stare
   dokumenty zostają w bazie na zawsze, ale po 30 dniach są **martwe** (nic nie otwierają). Przy
   kilku graczach to kilkadziesiąt maleńkich dokumentów rocznie — bez znaczenia dla kosztów i limitów.

## Ustalenia

### 1. Co jest w kolekcji

- **Nazwa dokumentu** („ciąg znaków”, np. `aB3xQ9…`) to identyfikator anonimowego konta przeglądarki
  w Firebase Authentication (`uid`). Aplikacja przy starcie loguje przeglądarkę anonimowo
  (`signInAnonymously`, `firestore-adapter.js`, funkcja `#ensureAuth`); Firebase pamięta to konto w
  przeglądarce, więc ta sama przeglądarka ma zawsze ten sam identyfikator. To konto nie zawiera
  żadnych danych osobowych.
- **Pola** (zgodne z `FIREBASE.md`, rozdz. 3 — opis pól `sessions/{authUid}`):

  | Pole | Co to jest |
  |---|---|
  | `playerId` | które konto gracza (`Player1` … `Player5`) jest zalogowane w tej przeglądarce |
  | `login` | login wpisany przy logowaniu |
  | `passwordHash` | **skrót** hasła (SHA-256, 64 znaki), nie samo hasło |
  | `createdAt` | czas logowania (z zegara serwera) |

- Dokumentu **nie może odczytać nikt z aplikacji** (`allow read: if false` w regułach) — ani gracz,
  ani administrator. Widać go tylko w konsoli Firebase.

### 2. Dlaczego kolekcja jest niezbędna

Projekt działa na bezpłatnym planie Spark, bez funkcji serwerowych (wariant A, `FIREBASE.md`,
rozdz. 10). Jedyny „strażnik” bazy to reguły bezpieczeństwa, a reguły nie dostają hasła przy każdym
odczycie. Dlatego logowanie działa tak:

1. Przeglądarka próbuje zapisać `sessions/{uid}` z loginem i skrótem hasła — kolejno dla `Player1`,
   `Player2`… (`login()` w `firestore-adapter.js`).
2. Reguły (`match /sessions/{uid}`) pozwalają na zapis **tylko wtedy, gdy login i skrót hasła
   zgadzają się** z `PlayerName` i `PlayerPassword` w `secrets/{playerId}`. Udany zapis = zalogowanie.
3. **Przy każdym odczycie i zapisie danych gracza** reguły zaglądają do tego dokumentu (funkcja
   `sessionValid()`): czy istnieje, czy nie ma więcej niż 30 dni i czy login oraz skrót hasła nadal
   pasują do `secrets`. To dzięki temu zmiana hasła w konsoli od razu wylogowuje gracza.

Przykład z życia: dokument w `sessions` działa jak opaska na rękę na koncercie. Przy wejściu
(logowanie) ochrona sprawdza bilet (hasło) i zakłada opaskę. Potem przy każdych drzwiach (każdy
odczyt zapisu gry) patrzy już tylko na opaskę. Bez opasek nikt nie wejdzie dalej niż do kasy.

**Skutek usunięcia kolekcji:** wszyscy gracze zostają wylogowani (to opisana w dokumentacji metoda
„Wylogowania wszystkich”, `FIREBASE_KONSOLA.md`, rozdz. 10). Danych gry to nie usuwa — są w `players`.
Przy następnym logowaniu kolekcja powstaje znowu. Usunięcie jest więc bezpieczne, ale nie usuwa
„problemu”, bo to nie jest problem.

### 3. Kiedy dokument powstaje, zmienia się i znika

| Zdarzenie | Co dzieje się z dokumentem |
|---|---|
| Pierwsze logowanie w danej przeglądarce | **powstaje** nowy dokument (nazwa = `uid` tej przeglądarki) |
| Ponowne logowanie w tej samej przeglądarce (także na inne konto, także po wygaśnięciu 30 dni) | ten sam dokument jest **nadpisywany** — liczba się nie zmienia |
| Błędne hasło | nic — reguły odrzucają zapis, dokument nie powstaje |
| Przycisk „Wyloguj” | dokument jest **usuwany** (`logout()` → `deleteDoc`) |
| Upłynęło 30 dni od logowania | aplikacja „zapomina” sesję w przeglądarce, reguły jej nie uznają — ale **dokument zostaje w bazie** (`restoreSession()` czyści tylko pamięć przeglądarki, nie usuwa dokumentu) |
| Gracz wyczyści dane strony, użyje okna prywatnego, nowej przeglądarki lub urządzenia | przeglądarka dostaje **nowy** `uid`, przy logowaniu powstaje **nowy** dokument; stary zostaje |
| Zmiana hasła lub loginu w `secrets` | dokument zostaje, ale od razu przestaje działać |

### 4. Czy liczba dokumentów rośnie bez końca

- **Górna granica w danej chwili** to liczba przeglądarek, w których ktoś jest zalogowany, plus
  „porzucone” dokumenty. Porzucony dokument powstaje tylko wtedy, gdy przeglądarka utraci swoje
  anonimowe konto (wyczyszczenie danych, okno prywatne, zmiana urządzenia) bez wcześniejszego
  „Wyloguj”.
- **Nic ich automatycznie nie usuwa**, więc w bardzo długim okresie liczba powoli rośnie. Szacunek
  dla 5 graczy: kilka urządzeń na osobę + okazjonalne okna prywatne i czyszczenie przeglądarki =
  rzędu kilkudziesięciu dokumentów rocznie.
- **Koszt i limity — pomijalne.** Jeden dokument to około 200–300 bajtów. Nawet 10 000 dokumentów to
  ok. 3 MB wobec 1 GiB bezpłatnego miejsca. Stare dokumenty nie są odczytywane ani zapisywane, więc nie
  zużywają dziennych limitów odczytów i zapisów.
- **Bezpieczeństwo — bez zagrożenia.** Dokumentu nie da się odczytać z aplikacji; porzucony dokument
  po 30 dniach nic nie otwiera; przed upływem 30 dni mógłby go użyć tylko ktoś, kto ma tamtą
  przeglądarkę z jej anonimowym kontem. Jedyna wrażliwość: w konsoli widać skrót hasła, ale
  administrator konsoli i tak widzi samo hasło w `secrets` (świadomie zaakceptowane, `FIREBASE.md`,
  rozdz. 5).

### 5. To samo dotyczy kont anonimowych w Authentication

W konsoli w *Authentication → Users* każda „nowa” przeglądarka zostawia anonimowe konto (bez
danych). Ich też przybywa powoli i bez końca. Firebase umie je sprzątać automatycznie (usuwa konta
anonimowe starsze niż 30 dni), ale tylko po przejściu na „Firebase Authentication with Identity
Platform” — to inny pakiet usług, który właściciel musiałby świadomie włączyć. Przy tej skali nie
jest to potrzebne.

## Rekomendacje

1. **Zostawić kolekcję `sessions`** — jest częścią logowania. Nie zakładać jej ani nie edytować
   ręcznie (zgodnie z `FIREBASE_KONSOLA.md`, rozdz. 7).
2. **Sprzątanie — warianty** (decyzja właściciela, pytanie P21 w `PLAN_I_CHANGELOG.md`):
   - **A. Nic nie zmieniać (★ rekomendacja).** Przy tej liczbie graczy dokumentów będzie mało.
     W razie chęci porządku: raz na jakiś czas w konsoli usunąć dokumenty z `createdAt` starszym niż
     30 dni — są już martwe, nikogo to nie wyloguje. Albo usunąć całą kolekcję — wyloguje wszystkich,
     gry zostają.
   - **B. Drobna poprawka w aplikacji:** gdy przeglądarka wykryje, że jej sesja wygasła (po 30 dniach),
     sama usuwa swój dokument z `sessions`. Reguły już na to pozwalają (`allow delete` dla właściciela
     sesji) — bez zmiany reguł i bez pracy w konsoli. Ogranicza to tylko część przypadków (nie pomoże
     przy wyczyszczeniu przeglądarki ani oknie prywatnym), bo tam przeglądarka traci dostęp do starego
     dokumentu.
   - **C. Automatyczne kasowanie po terminie (TTL w Firestore).** Wymaga dodatkowego pola z datą
     ważności (zmiana reguł, aplikacji, testów, dokumentacji) i — według dokumentacji Google —
     usuwanie przez TTL nie mieści się w bezpłatnym pakiecie, więc potrzebny byłby plan rozliczeniowy
     (Blaze). Nie rekomenduję przy tej skali.
3. Ewentualne uzupełnienie dokumentacji (`FIREBASE_KONSOLA.md`, rozdz. 7 lub 10): zdanie, że stare
   dokumenty w `sessions` mogą zostawać i można je bezpiecznie usuwać, gdy `createdAt` ma ponad 30 dni.
   Do zrobienia na polecenie właściciela.

## Niepewności

- Agent nie ma dostępu do konsoli projektu `gryparagrafowe-e1fb3` — nie zna aktualnej liczby
  dokumentów w `sessions`. Opis oparto na kodzie aplikacji i regułach z commitu `7039573`, które
  według `PLAN_I_CHANGELOG.md` są opublikowane w konsoli (2026-11-09).
- Informacje o TTL (brak bezpłatnego pakietu dla usuwania przez TTL) i o automatycznym czyszczeniu
  kont anonimowych (tylko z Identity Platform) pochodzą z dokumentacji Google znalezionej
  wyszukiwarką 2026-11-10; cenniki i warunki mogą się zmienić — przed ewentualnym wyborem wariantu C
  sprawdzić w konsoli.
- Szacunek „kilkadziesiąt dokumentów rocznie” zależy od zwyczajów graczy (liczba urządzeń, okna
  prywatne, czyszczenie przeglądarki) — to przybliżenie, nie pomiar.
