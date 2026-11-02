# Niejednoznaczne wskazówki w „Vae Victis” (§170, §259, §286, §289) — na czym polega problem

Analiza z 2026-11-02. Napisana tak, żeby była zrozumiała bez znajomości fabuły książki — nie zdradza
też fabuły.

## Polecenie użytkownika

> A co do tych wskazówek zrób identycznie jak w oryginalnym pliku PDF. Zrób takie same przejścia
> między paragrafami. Jeżeli jest problem z interpretacją to napisz mi dokładnie w Analizy/ na czym
> polega problem. Napisz to prostym językiem i jak dla osoby, która nie zna fabuły książki i jej nie
> czytała.

## Co sprawdzono (źródła)

| Źródło | Wersja |
|---|---|
| Plik EPUB Wydawnictwa — źródło tekstu w aplikacji: `Pliki/Vae-Victis-15-to-lecie-MW.epub` | SHA-256 `89547ec8e80e1bd4aa21eabd142bb90bdfdcec101aa6e92a123593c2d1581cd7` |
| Plik PDF Wydawnictwa (oryginał do porównania; nie jest przechowywany w repozytorium): <https://masz-wybor.com.pl/wp-content/uploads/2025/11/Vae-Victis-15-to-lecie-MW.pdf> | pobrany 2026-11-02; 217 stron; SHA-256 `3d6962e1f8d2d9657fa8b9a5650b6293d910c3fd81fa816378fb4fdcae7621ee` |
| Treść w aplikacji: `ksiazki/vae-victis/tresc.json` (generator 1.1.0) | stan z 2026-11-02 (SHA-256 treści `7df246e61bec…`, zapisany w `mechanika.json` jako `contentSha256`) |
| Podpowiedzi aplikacji: `ksiazki/vae-victis/mechanika.json` | stan z 2026-11-02 |

## 1. Najważniejsze: przejścia w aplikacji są takie same jak w PDF

Porównano tekst aplikacji z tekstem oryginalnego PDF (z pominięciem odstępów i dzielenia wyrazów na
końcach wierszy — te w PDF wynikają tylko z łamania tekstu na stronie):

- **wszystkie 408 części gry** (372 paragrafy, 35 części oznaczonych literami A/B/C i jeden „ciąg
  dalszy” paragrafu) mają w aplikacji ten sam tekst, w tej samej kolejności, co w PDF;
- **wszystkie 559 odnośników z wydrukowanym numerem** (np. „– 235”) prowadzą w aplikacji dokładnie do
  paragrafu o tym numerze;
- **wszystkie 54 odnośniki do części paragrafu** („część A tego paragrafu”, „B”, „Czytaj dalej ten
  paragraf.” itp.) prowadzą do właściwej części tego samego paragrafu;
- w czterech omawianych paragrafach wiersze ze wskazówkami są w PDF i w aplikacji **identyczne** (tabela
  w rozdz. 3).

Aplikacja nie dodaje, nie usuwa i nie zmienia żadnego przejścia — gracz może przejść wszędzie tam,
dokąd prowadzi tekst książki, tak jak w wersji papierowej.

## 2. Jak działa ta gra (wyjaśnienie dla osoby, która jej nie zna)

- Książka składa się z **ponumerowanych paragrafów** (krótkich fragmentów tekstu). Na końcu
  paragrafu są wskazówki, do którego paragrafu przejść dalej — czytelnik sam wybiera drogę.
- W trakcie lektury czytelnik zdobywa **„Informacje”** — ponumerowane od #1 do #43. Działa to jak
  zbieranie pieczątek w karcie: gdy w tekście pojawia się oznaczenie w rodzaju „(U#19)”, czytelnik
  zapisuje na kartce „mam #19”.
- W niektórych paragrafach dalsza droga zależy od zebranych Informacji. Wskazówka wygląda wtedy tak:
  - „#18 – część A tego paragrafu” → *jeśli masz Informację #18, idź do części A*;
  - „Brak #18 – część B tego paragrafu” → *jeśli nie masz Informacji #18, idź do części B*.
- Zwykle takie wiersze wykluczają się nawzajem: każdy czytelnik pasuje do dokładnie jednego z nich.
  Aplikacja w trybie automatycznym sama pokazuje wtedy, który wiersz pasuje do karty gracza (ale
  niczego nie blokuje — wybór zawsze należy do gracza).

## 3. Na czym polega problem

W **czterech paragrafach** wiersze są zapisane tak, że **przy niektórych zestawach Informacji pasują
do nich dwa wiersze naraz** — a tekst nie mówi, który wybrać. Aplikacja nie zgaduje za autora, więc
w tych miejscach nie podpowiada drogi.

Wiersze ze wskazówkami (dosłownie, jednakowo w PDF i w aplikacji):

| Paragraf (strona PDF) | Wiersze ze wskazówkami |
|---|---|
| §170 (s. 114) | „Brak #34 lub Brak #35 – część A tego paragrafu” · „#34 lub #35 – część B tego paragrafu” |
| §259 (s. 162) | „#40 – 235” · „#41 – 278” · „Brak #40 lub Brak #41 – 242” |
| §286 (s. 179) | „#42 albo #43 – 277” · „Brak #42 lub #43 – 245” |
| §289 (s. 180) | „#42 albo #43 – 291” · „Brak #42 lub Brak #43 – 285” |

W tabelach poniżej: ✓ = wiersz pasuje do gracza, ✗ = nie pasuje — przy czytaniu słowo po słowie.

### §170 — dwie Informacje: #34 i #35

| Gracz ma… | „Brak #34 lub Brak #35” → część A | „#34 lub #35” → część B | Ile dróg pasuje |
|---|---|---|---|
| żadnej z nich | ✓ | ✗ | 1 (część A) |
| tylko #34 | ✓ (brakuje mu #35) | ✓ (ma #34) | **2 — problem** |
| tylko #35 | ✓ (brakuje mu #34) | ✓ (ma #35) | **2 — problem** |
| obie | ✗ | ✓ | 1 (część B) |

Przykład z życia: na drzwiach wiszą dwie kartki — „Jeśli nie masz biletu lub nie masz legitymacji,
idź do kasy” i „Jeśli masz bilet lub legitymację, wejdź na salę”. Osoba, która ma bilet, ale nie ma
legitymacji, pasuje do obu kartek.

### §259 — dwie Informacje: #40 i #41, trzy drogi

| Gracz ma… | „#40” → 235 | „#41” → 278 | „Brak #40 lub Brak #41” → 242 | Ile dróg pasuje |
|---|---|---|---|---|
| żadnej z nich | ✗ | ✗ | ✓ | 1 (242) |
| tylko #40 | ✓ | ✗ | ✓ (brakuje mu #41) | **2 — problem** (235 albo 242) |
| tylko #41 | ✗ | ✓ | ✓ (brakuje mu #40) | **2 — problem** (278 albo 242) |
| obie | ✓ | ✓ | ✗ | **2 — problem** (235 albo 278) |

### §286 — zapis „Brak #42 lub #43” można przeczytać na trzy sposoby

Drugi wiersz nie powtarza słowa „Brak” przed #43, więc nie wiadomo, czego dotyczy „Brak”:

1. „(Brak #42) lub (#43)” — czytanie słowo po słowie: brakuje #42 **albo** masz #43;
2. „Brak (#42 lub #43)” — nie masz **ani #42, ani #43**;
3. „Brak #42 lub Brak #43” — tak jak w §289: brakuje którejkolwiek z nich.

| Gracz ma… | „#42 albo #43” → 277 | „Brak #42 lub #43” → 245 (czytanie 1 / 2 / 3) | Ile dróg pasuje |
|---|---|---|---|
| żadnej z nich | ✗ | ✓ / ✓ / ✓ | 1 (245) |
| tylko #42 | ✓ | ✗ / ✗ / ✓ | 1 albo 2 — zależnie od czytania |
| tylko #43 | ✓ | ✓ / ✗ / ✓ | 1 albo 2 — zależnie od czytania |
| obie | ✓ (*) | ✓ / ✗ / ✗ | 1 albo 2 — zależnie od czytania |

(*) Dodatkowa wątpliwość: słowo **„albo”** bywa rozumiane jako „jedno z dwóch, ale nie oba naraz”.
Przy takim rozumieniu gracz, który ma **obie** Informacje, w ogóle nie pasuje do wiersza „#42 albo
#43”.

### §289 — dwie Informacje: #42 i #43

| Gracz ma… | „#42 albo #43” → 291 | „Brak #42 lub Brak #43” → 285 | Ile dróg pasuje |
|---|---|---|---|
| żadnej z nich | ✗ | ✓ | 1 (285) |
| tylko #42 | ✓ | ✓ (brakuje mu #43) | **2 — problem** |
| tylko #43 | ✓ | ✓ (brakuje mu #42) | **2 — problem** |
| obie | ✓ (*) | ✗ | 1 (291) — albo 0, jeśli „albo” znaczy „nie oba naraz” |

### Co prawdopodobnie miał na myśli autor (przypuszczenie, nie fakt)

Wiele wskazuje na to, że chodziło o prostą zasadę: **„masz którąkolwiek z tych Informacji → wiersz
bez słowa »Brak«; nie masz żadnej → wiersz z »Brak«”**. Przy takim rozumieniu każdy gracz pasowałby do
jednej drogi — poza §259, gdzie gracz z **obiema** Informacjami nadal ma do wyboru 235 i 278. Tekst
książki tego jednak nie rozstrzyga, a Wydawcy o treść książek nie pytamy (decyzja właściciela z
2026-11-02).

## 4. Jak aplikacja postępuje w tych czterech miejscach

- **Przejścia**: dokładnie takie jak w książce — wszystkie wiersze są klikalne i prowadzą tam, gdzie
  w PDF.
- **Podpowiedzi**: aplikacja **nie oznacza**, który wiersz pasuje do karty gracza (w pozostałych
  miejscach książki oznacza). Zamiast tego pokazuje krótki komunikat, że wskazówki można odczytać na
  kilka sposobów, oraz które z wymienionych Informacji gracz ma, a których nie ma.
- **Wybór**: należy do gracza — tak jak przy czytaniu książki na papierze. Żadna droga nie jest
  zablokowana.

## 5. Rekomendacja

- **A (zalecane, stan obecny)**: zostawić tak, jak jest — przejścia jak w oryginale, a w czterech
  niejasnych miejscach gracz decyduje sam, jak przy papierowej książce.
- B: aplikacja podpowiada drogę według „prawdopodobnej intencji autora” (rozdz. 3) — **niezalecane**:
  aplikacja dopowiadałaby zasady, których w książce nie ma (zasada neutralności silnika, AGENTS.md
  rozdz. 3).

## 6. Przy okazji porównania z PDF — inne ustalenia

1. **Kolejność logo w stopce redakcyjnej** — w PDF najpierw jest podpis „Logo Masz Wybór:”, a pod nim
   logo; aplikacja pokazywała logo nad podpisem, bo tak zapisano je w pliku EPUB. **Poprawione**
   (2026-11-02): skrypt konwersji umieszcza grafikę za tekstem akapitu, w którym jest zakotwiczona —
   tak jak w PDF.
2. **Numeracja list na stronie „od Wydawnictwa”** — w PDF „1)”, „2)”…, w przeglądarce domyślnie
   „1.”, „2.”. **Poprawione** w wyglądzie aplikacji (treść bez zmian).
3. **Różnica między dwoma plikami Wydawnictwa** — na liście publikacji (strona „od Wydawnictwa”) tytuł
   jednej z gier ma w EPUB pierwszą literę „H” (zwykłe H), a w PDF „Ḫ” (H z łuczkiem pod spodem):
   EPUB „Hé-mu-ù-zu”, PDF „Ḫé-mu-ù-zu”. Aplikacja wiernie odwzorowuje EPUB (plik źródłowy) — to nie jest
   błąd konwersji. Odnotowano w karcie książki (`ksiazki/vae-victis/README.md`); niczego nie zmieniamy.
4. Pozostałe różnice w tekście dotyczą tylko stron, które w PDF mają elementy układu strony (numery
   stron w spisie treści, numeracja list) — treść paragrafów gry jest zgodna w całości.

## 7. Niepewności

- Nie znamy intencji autora w czterech opisanych miejscach — rozdz. 3 opisuje tylko możliwe odczytania.
- Słowo „albo” bywa rozumiane wyłącznie („jedno z dwóch, nie oba”) albo zwykle („jedno lub drugie”);
  książka nie wyjaśnia, w jakim znaczeniu go używa.
- Porównanie z PDF pomija odstępy i znaki dzielenia wyrazów na końcach wierszy (w PDF wynikają z
  łamania tekstu). Wierność tekstu co do znaku względem pliku źródłowego (EPUB) sprawdza osobno
  weryfikacja W1–W8 (`narzedzia/weryfikacja/weryfikuj_tresc.py`): 8/8.
