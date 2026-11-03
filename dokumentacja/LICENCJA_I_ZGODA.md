# Licencja i zgoda Wydawcy — zasady obowiązujące w projekcie

> **Dokument nadrzędny.** Zasady opisane tutaj mają pierwszeństwo przed każdą inną
> decyzją projektową, „usprawnieniem”, prośbą o funkcję czy wygodą implementacji.
> **W razie jakiejkolwiek wątpliwości — nie rób i zapytaj właściciela repozytorium.**

- Podstawa: pisemne zgody wydawców (dla „Vae Victis”: korespondencja e-mail z 27–29.10.2026,
  4 wiadomości) oraz licencje zawarte w publikacjach (sekcja „LICENCJA” w stopce redakcyjnej).
- **Ten dokument — a zwłaszcza rejestr zgód (rozdz. 8) z dosłownymi cytatami kluczowych zdań
  (rozdz. 1) — jest wiążącym zapisem warunków w repozytorium.** Oryginały zgód i korespondencji
  przechowuje właściciel; po zakończeniu prac mogą nie znajdować się w repozytorium (dla „Vae Victis”
  tymczasowo: `Pliki/Zgoda Vae Victis.pdf`).
- Ostatnia aktualizacja dokumentu: 2026-11-01.

Oznaczenia źródła każdej zasady:

| Znacznik | Znaczenie |
|---|---|
| **[ZGODA]** | wynika wprost z korespondencji z Wydawcą (PDF) |
| **[LICENCJA]** | wynika z sekcji „LICENCJA” w stopce publikacji |
| **[WŁAŚCICIEL]** | wymaganie właściciela projektu |
| **[OSTROŻNOŚĆ]** | ostrożna interpretacja przyjęta w projekcie, żeby nie wyjść poza zakres udzielonej zgody |

---

## 1. Podstawa prawna

### 1.1. Licencja zawarta w publikacji

Stopka redakcyjna „Vae Victis” (EPUB, sekcja „LICENCJA”) — cytat dosłowny:

> Uwaga! Niniejsza publikacja nie może być rozpowszechniana, adaptowana, modyfikowana ani
> odsprzedawana bez pisemnej zgody Wydawcy. Dozwolone jest jej kopiowanie oraz dystrybucja
> bezpłatna na własny użytek.

Projekt (publiczne repozytorium + konwersja do JSON + aplikacja) wymaga więc **pisemnej zgody
Wydawcy** — i taką zgodę uzyskano wyłącznie dla „Vae Victis”, na warunkach opisanych niżej.

### 1.2. Przebieg korespondencji (streszczenie, z cytatami kluczowych zdań)

| Data | Nadawca | Treść (skrót) |
|---|---|---|
| 27.10.2026 | autor projektu (Paweł T.) | Prośba o zgodę. Opis projektu: przeglądarkowy interfejs do gier paragrafowych; treść paragrafów i wybory; opcjonalnie karta postaci, ekwipunek, statystyki, rzuty kośćmi, zapis postępu; **wąskie grono odbiorców (ok. 5 osób)**; kod i materiały **publicznie w repozytorium GitHub**; treść **przekształcona z EPUB/PDF do JSON i publicznie dostępna**; przy każdej grze: tytuł, autor(zy), informacja o Wydawnictwie / portalu, odnośniki; **bez zmian w treści literackiej**; projekt **hobbystyczny, bez zarabiania w jakikolwiek sposób**. |
| 28.10.2026 | Wydawca (Beniamin Muszyński) | Dwie kluczowe kwestie: (1) które teksty — część jest objęta dodatkowymi licencjami i umowami z autorami; (2) AI — generowane grafiki wymagają osobnych zgód autorskich; „wszystko musi być wcześniej uzgodnione”. |
| 28.10.2026 | autor projektu | Tytuły: „Vae victis” i „Wagabunda”. Brak ilustracji w aplikacji — **jedynie ikony/piktogramy** (np. symulator rzutu kośćmi, karta postaci). Ujawnienie: projekt tworzony narzędziami AI (kod, konwersja do JSON, animacje rzutu kośćmi), **bez ilustracji tworzonych przez AI**; jako ilustracje — okładki ze strony Wydawnictwa. |
| 29.10.2026 | Wydawca | **Decyzja** — patrz cytat poniżej. |

Najważniejsze zdania z prośby (27.10.2026), na podstawie których Wydawca udzielił zgody
„na tych zasadach”:

> Przy każdej grze chciałbym wyraźnie umieścić:
> - tytuł publikacji,
> - imię i nazwisko autora lub autorów,
> - informację o Wydawnictwie Wielokrotnego Wyboru / portalu Masz Wybór,
> - odnośnik do oficjalnej strony publikacji oraz strony Wydawnictwa,
>
> Nie zamierzam wprowadzać zmian w samej treści literackiej. Konwersja służyłaby przede
> wszystkim podzieleniu publikacji na paragrafy, utworzeniu przejść między nimi oraz
> technicznej obsłudze mechaniki gry.

> Zaznaczam, że to ma być hobbystyczny projekt i nie zamierzam na nim zarabiać w żaden sposób.

Odpowiedź Wydawcy z 28.10.2026 (fragment):

> Po drugie kwestia AI, jeśli w aplikacji miałyby się pojawić generowane grafiki to wymaga to
> osobnych zgód autorskich na wykorzystanie tekstu.

Decyzja Wydawcy z 29.10.2026 (cytat dosłowny):

> właśnie "Wagabunda" jest jednym z tytułów z dzieloną licencją (jest sprzedawana w formie
> anglojęzycznej aplikacji przez autora). "Vae victis" na ten moment może być wykorzystane,
> tradycyjnie z zachowaniem wszystkich informacji skąd tekst pochodzi i przekopiowanej pełnej
> zawartości stopki redakcyjnej, od copyrightingu po numer ISBN. Ilustracji okładkowej można
> używać, ale też z informacją o jej autorce.
> Na potrzeby opisanego projektu wewnętrznego proszę korzystać z tekstu na tych zasadach.

---

## 2. Zakres zgody — co wolno, a czego nie

| Element | Status | Źródło |
|---|---|---|
| **„Vae Victis”** (Beniamin Muszyński) — tekst publikacji | ✅ dozwolone **„na ten moment”**, na zasadach z rozdz. 3–5 | [ZGODA] |
| Konwersja EPUB/PDF → JSON, publicznie dostępna w repozytorium GitHub | ✅ dozwolone (opisane w prośbie) | [ZGODA] |
| Podział na paragrafy, przejścia między nimi, techniczna obsługa mechaniki | ✅ dozwolone | [ZGODA] |
| Karta postaci, ekwipunek, statystyki, rzuty kośćmi, zapis postępu | ✅ dozwolone (opisane w prośbie) | [ZGODA] |
| Ilustracja okładkowa | ✅ dozwolone **z informacją o autorce** (Justyna Bzdoń) | [ZGODA] |
| Ikony / piktogramy interfejsu (kość, karta postaci itp.) | ✅ dozwolone | [ZGODA] |
| Kod aplikacji, konwersja i animacje rzutu kośćmi tworzone z pomocą AI | ✅ dozwolone (ujawnione Wydawcy) | [ZGODA] |
| Użytkownicy: wąskie grono (projekt wewnętrzny) | ✅ w prośbie „ok. 5 osób”; obecnie planowanych **6 graczy** — patrz rozdz. 9 | [ZGODA] |
| **„Wagabunda”** (Krzysztof Firkowski) | ⛔ **ODMOWA** — tytuł z dzieloną licencją | [ZGODA] |
| **Każdy inny tytuł** Wydawnictwa | ⛔ brak zgody — wymaga osobnej, pisemnej zgody **przed** dodaniem | [ZGODA] |
| Grafiki / ilustracje generowane przez AI | ⛔ niedozwolone (wymagałyby osobnych zgód autorskich) | [ZGODA] |

---

## 3. NAKAZY (obowiązki)

**N1. Atrybucja przy każdej grze** [ZGODA] — wyraźnie i czytelnie:
- tytuł publikacji,
- imię i nazwisko autora (autorów),
- informacja o Wydawnictwie Wielokrotnego Wyboru / portalu Masz Wybór,
- odnośnik do oficjalnej strony publikacji
  (dla „Vae Victis”: <https://masz-wybor.com.pl/ksiegarnia/vae-victis-beniamin-muszynski/>)
  oraz do strony Wydawnictwa (<https://masz-wybor.com.pl/>).

**N2. Informacja o źródle tekstu** [ZGODA] — zachowujemy „wszystkie informacje skąd tekst
pochodzi”: wydawca, wydanie, ISBN, plik źródłowy, strona, z której oryginał można pobrać.
Informacja o źródle jest widoczna w aplikacji („O książce”) i zapisana w metadanych książki.

**N3. Pełna stopka redakcyjna, dosłownie** [ZGODA] + [WŁAŚCICIEL]
- Przekopiowana **w całości, bez żadnych zmian** — „od copyrightingu po numer ISBN”
  (w „Vae Victis”: od „Copyright © by Beniamin Muszyński, 2018.” do „ISBN 978-83-951564-0-3”),
  łącznie z sekcjami LICENCJA i WYDAWCA, danymi kontaktowymi i logotypami, które są częścią stopki.
- Wyświetlana **na ekranie głównym przy danej książce** (wymóg właściciela) oraz dostępna z poziomu
  gry (ekran „O książce”). Od 2026-11-03 karta książki na ekranie głównym jest **zwijana** (decyzja
  właściciela — czytelność przy wielu książkach): zwinięta karta pokazuje okładkę z podpisem autorki
  ilustracji, tytuł, autora i wydawcę, a belka „Rozwiń” wprost wymienia „stopkę redakcyjną”; po
  rozwinięciu stopka jest pełna, w zwykłym rozmiarze. Sama zgoda Wydawcy wymaga pełnej zawartości
  stopki (bez wskazania miejsca) — umieszczenie na ekranie głównym to wymóg właściciela.
- Stopka jest generowana automatycznie z pliku źródłowego (nie przepisywana ręcznie) — patrz
  [KONWERSJA.md](KONWERSJA.md).

**N4. Okładka tylko z informacją o autorce ilustracji** [ZGODA]
- Każde wyświetlenie okładki (karta książki, „O książce”, ekran startowy gry) ma widoczny podpis,
  np. „Ilustracja na okładce: Justyna Bzdoń” (w stopce: „Grafiki: Justyna Bzdoń [okładka]”).

**N5. Treść 1:1** [ZGODA] + [WŁAŚCICIEL] — tekst publikacji przenosimy **bez jakichkolwiek zmian**;
konwersja służy wyłącznie podziałowi na paragrafy, utworzeniu przejść i technicznej obsłudze
mechaniki. Szczegóły: rozdz. 5.

**N6. Projekt niekomercyjny** [ZGODA] — „nie zamierzam na nim zarabiać w żaden sposób”.
Patrz zakaz Z5.

**N7. Wąskie grono odbiorców — projekt wewnętrzny** [ZGODA] + [OSTROŻNOŚĆ]
- Rozgrywka dostępna wyłącznie dla graczy z kontami założonymi przez administratora
  (logowanie hasłem). **Bez trybu gościa** i bez otwartej rejestracji.
- Ekran główny (katalog, stopki, atrybucje) może być publiczny; sama gra — tylko po zalogowaniu.
- Publiczne udostępnienie strony (np. GitHub Pages) dopiero wtedy, gdy działa logowanie.

**N8. Każda zgoda jest spisana w rejestrze zgód** [OSTROŻNOŚĆ] + [WŁAŚCICIEL]
- Rejestr zgód (rozdz. 8) zawiera dla każdego tytułu status, datę, zakres i warunki szczegółowe, a
  ten dokument — dosłowne cytaty kluczowych zdań zgody. Dzięki temu warunki są znane także wtedy,
  gdy oryginały korespondencji nie są przechowywane w repozytorium.
- Oryginały (np. PDF z korespondencją) przechowuje właściciel. Agenci ich nie usuwają, nie
  zmieniają i nie przenoszą (`Pliki/` jest dla agentów tylko do odczytu); o usunięciu ich z
  repozytorium decyduje właściciel.

**N9. Zgoda jest udzielona „na ten moment”** [ZGODA]
- Jeśli Wydawca wycofa lub zmieni zgodę: natychmiast ukryć książkę w aplikacji (status w katalogu),
  usunąć jej treść i grafiki z repozytorium, poinformować graczy; o ewentualnym usunięciu
  treści z historii git decyduje właściciel repozytorium.

**N10. Oznaczenie charakteru projektu** [OSTROŻNOŚĆ]
- Stopka aplikacji zawiera informację, że to **nieoficjalny, niekomercyjny projekt hobbystyczny**,
  a treść „Vae Victis” wykorzystano **za zgodą Wydawnictwa Wielokrotnego Wyboru** — tak, by nikt nie
  odniósł wrażenia, że to oficjalna aplikacja Wydawnictwa.
- Stopka aplikacji jest widoczna **na ekranie głównym** (przed zalogowaniem i po nim) — tam zaczyna
  każdy gracz; przy czytaniu książki i w „O książce” jej nie pokazujemy (decyzja właściciela
  2026-11-03: „Przy czytaniu książek nie chcę, żeby wyświetlała się ta stopka.”). Zgoda Wydawcy nie
  wymaga stopki aplikacji; atrybucja książki w grze zostaje (tytuł i autor na pasku gry, „O książce”).

**N11. Odnośniki zewnętrzne z treści zachowujemy** [ZGODA] + [OSTROŻNOŚĆ]
- Linki w treści (strona Wydawnictwa, Patronite Wydawnictwa, adresy e-mail ze stopki, odesłanie
  do innej gry na stronie Masz Wybór) pozostają **linkami zewnętrznymi** — otwierają oryginalną
  stronę w nowej karcie. Nigdy nie zastępujemy ich treścią w aplikacji (np. gra „Jestem”, do
  której odsyła jedno z zakończeń, **nie jest objęta zgodą**).

---

## 4. ZAKAZY

**Z1. Zakaz jakichkolwiek zmian w treści literackiej** [ZGODA] + [LICENCJA] + [WŁAŚCICIEL]
— „absolutny zakaz ingerowania w treść publikacji”. Pełna lista w rozdz. 5.

**Z2. Zakaz grafik generowanych przez AI** [ZGODA]
- Żadnych ilustracji, portretów postaci, scen, map, teł, „klimatycznych” obrazków, wariantów
  okładki ani AI-upscalingu okładki.
- Dozwolone są wyłącznie **piktogramy funkcji interfejsu** (kość, karta postaci, menu, zapis,
  ustawienia itp.): z biblioteki ikon o znanej, wolnej licencji (licencję odnotować w
  `aplikacja/assets/icons/`), symbole Unicode albo proste kształty SVG/CSS.
- Ikony **nie mogą przedstawiać treści książki** (postaci, miejsc, wydarzeń, przedmiotów
  fabularnych) — np. przedmioty w ekwipunku pokazujemy nazwą z tekstu, bez obrazków. [OSTROŻNOŚĆ]
- **Logo aplikacji**: piktogram kozy z biblioteki Game Icons (autor: Skoll, licencja CC BY 3.0,
  `aplikacja/assets/icons/README.md`) — w nagłówku i jako ikona karty przeglądarki (decyzja
  właściciela, 2026-11-02). To znak aplikacji (nawiązanie do nazwy właściciela), a nie ilustracja
  książki — kozy występują wprawdzie w kilku paragrafach „Vae Victis” jako zwierzęta gospodarskie, ale
  piktogram nie przedstawia żadnej sceny ani postaci z książki. Gotowa ikona, nie grafika AI.
  [WŁAŚCICIEL]

**Z3. Zakaz innych treści generowanych przez AI na podstawie książki** [OSTROŻNOŚĆ]
- Żadnych streszczeń, „podpowiedzi fabularnych”, dopisanych opisów, tłumaczeń, wersji audio
  (lektor/TTS), czatów z postaciami, quizów czy rekomendacji wyborów generowanych z tekstu.
  To byłaby adaptacja, której zgoda nie obejmuje (Wydawca wprost zastrzegł kwestię AI).

**Z4. Zakaz dodawania tytułów bez zgody** [ZGODA]
- **„Wagabunda” — odmowa.** Nie dodajemy jej w żadnej formie (tekst, okładka, opis, wzmianka
  w katalogu aplikacji).
- Żaden inny tytuł nie trafia do repozytorium (nawet roboczo, nawet w gałęzi) bez osobnej,
  pisemnej zgody Wydawcy zarchiwizowanej w `Pliki/` i wpisanej do rejestru (rozdz. 8).

**Z5. Zakaz komercjalizacji w jakiejkolwiek formie** [ZGODA]
- Reklamy, płatny dostęp, subskrypcje, mikropłatności, „premium”, zbiórki i darowizny na projekt,
  linki afiliacyjne, sponsorowanie, sprzedaż kodu z treścią, analityka marketingowa/reklamowa.
- Uwaga: odnośnik do Patronite **Wydawnictwa**, który jest częścią treści publikacji (strona
  „od Wydawnictwa”), pozostaje bez zmian — to element oryginału, a nie zbiórka projektu.

**Z6. Zakaz modyfikowania okładki** [ZGODA] + [OSTROŻNOŚĆ]
- Bez kadrowania zmieniającego kompozycję, filtrów, rozmycia, retuszu, kolorowania, nakładania
  tekstu/elementów, używania jako tła, generowania wariantów.
- Dozwolone wyłącznie: proporcjonalne przeskalowanie i kompresja/konwersja formatu (wydajność).
  To samo dotyczy logotypów ze stopki.

**Z7. Zakaz usuwania, skracania i ukrywania stopki oraz atrybucji** [ZGODA]
- Nie skracamy, nie parafrazujemy, nie przenosimy w trudno dostępne miejsca, nie ukrywamy
  stylami (np. mikroskopijna czcionka, kolor tła).
- Zwijana karta książki na ekranie głównym (rozdz. N3) nie jest ukrywaniem: tytuł, autor, wydawca i
  okładka z podpisem są zawsze widoczne, belka nazywa stopkę redakcyjną, a po jednym kliknięciu stopka
  jest pełna i czytelna (w „O książce” — zawsze rozwinięta).

**Z8. Zakaz używania logotypów Wydawnictwa/portalu poza odwzorowaniem stopki** [OSTROŻNOŚĆ]
- Nie jako logo aplikacji, favicon, ikona PWA, ekran powitalny, element brandingu.

**Z9. Zakaz udostępniania treści w innej postaci niż gra w aplikacji** [LICENCJA] + [OSTROŻNOŚĆ]
- Żadnych funkcji „pobierz/eksportuj/drukuj całą książkę” (PDF, EPUB, DOCX, TXT), publicznego
  API z treścią, przenoszenia treści do innych serwisów, publikowania JSON jako osobnego produktu.
- Kopie zapasowe danych graczy **nie zawierają treści książek** (tylko identyfikatory i stan gry).

**Z10. Zakaz przechowywania treści książek w Firebase** [OSTROŻNOŚĆ]
- Treść leży wyłącznie w repozytorium (tak jak opisano Wydawcy). Firebase = tylko stan graczy.

**Z11. Zakaz zmiany zakresu projektu bez nowej zgody** [ZGODA]
- Zgoda dotyczy „opisanego projektu wewnętrznego”. Bez nowej zgody nie: otwieramy aplikacji dla
  szerokiej publiczności, nie publikujemy w sklepach z aplikacjami, nie promujemy jako
  ogólnodostępnego serwisu, nie znacząco zwiększamy grona odbiorców.

**Z12. Zakaz kopiowania innych materiałów ze strony Wydawnictwa** [OSTROŻNOŚĆ]
- Opisów (blurbów), recenzji, grafik innych tytułów itp. nie kopiujemy — **linkujemy** do strony
  Wydawnictwa. Zgoda obejmuje tekst publikacji „Vae Victis” i jej ilustrację okładkową.

---

## 5. Wierność treści — zasady szczegółowe (konwersja i prezentacja)

### 5.1. Dozwolone operacje techniczne (lista zamknięta)

1. Podział publikacji na jednostki nawigacyjne (strony wstępne, paragrafy, części A/B/C,
   ciąg dalszy paragrafu) **dokładnie według podziału w pliku źródłowym**.
2. Zamiana odnośników w tekście na interaktywne elementy nawigacji — odnośnik zostaje **w tym
   samym miejscu i z tym samym tekstem** (np. „22” w nawiasie staje się klikalne).
3. Dodanie **warstwy mechaniki jako osobnych metadanych** (osobny plik `mechanika.json`), która
   wskazuje identyfikatory paragrafów i odnośników, ale **nie zawiera i nie zmienia tekstu**.
4. Zachowanie formatowania znaczącego: akapity, nagłówki/numery paragrafów, kursywa, pogrubienie,
   listy, wyrównanie (np. podpis autora wyrównany do prawej), grafiki w ich miejscu.
5. Własna prezentacja: wielkość liter, kolory, tryb ciemny, układ dopasowany do ekranu telefonu
   (jak w czytnikach e-booków) — dla pewności z prośbą do Wydawcy o potwierdzenie (pytanie PW2 w
   [`Analizy/Pytania_Do_Wydawcy_2026-10-29.md`](../Analizy/Pytania_Do_Wydawcy_2026-10-29.md)).
   **Krój pisma: wyłącznie oryginalny** (Old Standard); możliwość wyboru innego kroju przez gracza —
   dopiero po zgodzie Wydawcy (pytanie PW1). [WŁAŚCICIEL] + [OSTROŻNOŚĆ]
6. Normalizacja białych znaków **wyłącznie** w zakresie, w jakim i tak robi to HTML (sekwencja
   spacji/nowych linii → jedna spacja). Każdy inny znak — bez zmian (w tym twarde spacje, „”, –, …).
7. Proporcjonalne przeskalowanie i kompresja grafik (okładka, logotypy ze stopki).

### 5.2. Zabronione (przykłady — lista otwarta)

- **Poprawianie czegokolwiek**: literówek, ortografii, interpunkcji, gramatyki, stylu — **nawet
  oczywistych błędów**. Przykłady z „Vae Victis”, które **zostają bez zmian**: „cześci A” (§9),
  „Open Source Licensee” (stopka), „Po po kolejnym okresie” (jeden z paragrafów).
- Zamiana znaków typograficznych („” → "", – → -, … → ..., twarda spacja → spacja), zmiana
  wielkości liter, zmiana zapisu liczb.
- Skracanie, łączenie, dzielenie, przestawianie zdań, akapitów i paragrafów; pomijanie
  fragmentów — **także stron wstępnych** (stopka, „od Wydawnictwa”, strona tytułowa, dedykacja,
  spis treści, wprowadzenie, prolog).
- Dopisywanie czegokolwiek do tekstu książki (komentarzy, nagłówków, ostrzeżeń, podsumowań).
  Komunikaty aplikacji (np. „Zdobyto Informację #19”) muszą być **wizualnie oddzielone** od tekstu
  książki i nie mogą udawać jego części.
- Parafrazowanie wyborów na przyciskach. Przyciski nawigacji mają etykiety techniczne
  (np. „Przejdź do 22”); treść wyboru czyta się w tekście paragrafu.
- „Naprawianie” błędów nawigacji (np. odnośnika prowadzącego do złego paragrafu). Wykryty błąd
  **zgłaszamy właścicielowi**; korekta wyłącznie na podstawie oficjalnej erraty/nowego wydania od
  Wydawcy i z adnotacją w dokumentacji książki.
- Tłumaczenia, uwspółcześnianie języka, cenzurowanie, „łagodzenie” treści.
- **Ręczna edycja plików treści** (`tresc.json`, `stopka.json`) — są generowane wyłącznie skryptem
  z pliku źródłowego i weryfikowane automatycznie (patrz [KONWERSJA.md](KONWERSJA.md)).

### 5.3. Zasada neutralności silnika

Silnik gry **nie dopowiada reguł, których nie ma w tekście**. Jeśli tekst nie rozstrzyga, którą
z kilku pasujących opcji wybrać, aplikacja oznacza opcje spełniające warunki, ale **wyboru
dokonuje gracz**. Tryb „ręczny” (jak na papierze) musi pozwalać grać bez automatyki.

---

## 6. Wymagane elementy w aplikacji (checklista)

> Przegląd 2026-11-02 (aplikacja w trybie lokalnym, „Vae Victis”): wszystkie elementy obecne — sprawdzone
> testem w przeglądarce (`testy/e2e/test-dymny.cjs`). Ponowny przegląd po wdrożeniu Firebase i przed
> publikacją strony.

**Ekran główny — karta każdej książki**
- [x] okładka + podpis autorki ilustracji (N4)
- [x] tytuł, autor(zy), „Wydawnictwo Wielokrotnego Wyboru” / „portal Masz Wybór” (N1)
- [x] odnośnik do oficjalnej strony publikacji i do strony Wydawnictwa (N1)
- [x] **pełna stopka redakcyjna** w wiernym brzmieniu (N3)
- [x] informacja o źródle: wydawca, wydanie, ISBN, odnośniki do oryginałów na stronie Wydawnictwa (N2)
- [x] ostrzeżenie o treści ze strony Wydawnictwa — dosłownie, z informacją o źródle i odnośnikiem
  (decyzja właściciela; patrz rozdz. 9 pkt 4)

**Ekran gry**
- [x] tytuł i autor widoczne (np. w nagłówku)
- [x] dostęp do „O książce” z menu gry: stopka, okładka z podpisem, linki, informacja o zgodzie
- [x] tekst paragrafu 1:1, komunikaty aplikacji wizualnie oddzielone (rozdz. 5)
- [x] krój pisma oryginalny; wybór innego kroju tylko po zgodzie Wydawcy (rozdz. 5.1 pkt 5)

**Cała aplikacja**
- [x] stopka aplikacji na ekranie głównym: projekt nieoficjalny, niekomercyjny, treść za zgodą Wydawcy (N10)
- [x] brak reklam, płatności, zbiórek, trackerów marketingowych (Z5)
- [x] brak grafik AI; ikony tylko jako piktogramy funkcji z odnotowaną licencją (Z2)
- [x] gra dostępna tylko po zalogowaniu (N7)

**Repozytorium**
- [x] README z atrybucją książek
- [x] wpis w rejestrze zgód z warunkami i cytatami kluczowych zdań (N8)
- [x] brak pliku licencji open source obejmującego treść (patrz rozdz. 7, pkt 7)

---

## 7. Procedura dodania nowej książki

1. **Pisemna zgoda Wydawcy dla konkretnego tytułu** (e-mail) — przed jakąkolwiek pracą nad tytułem.
2. Wpis w rejestrze zgód (rozdz. 8) — na polecenie właściciela — z datą, zakresem i warunkami
   szczegółowymi (mogą różnić się od warunków dla „Vae Victis”!) oraz dosłownymi cytatami
   kluczowych zdań zgody w tym dokumencie. Oryginał korespondencji przechowuje właściciel (w
   `Pliki/` albo poza repozytorium).
3. Ustalenie: autorzy tekstu i grafik, zawartość stopki, licencje fontów/grafik, odnośniki.
4. Konwersja i weryfikacja wg [KONWERSJA.md](KONWERSJA.md); karta książki w `ksiazki/<id>/README.md`.
5. Przegląd zgodności z checklistą z rozdz. 6.
6. Dopiero wtedy wpis w katalogu aplikacji (`ksiazki/katalog.json`).
7. Jeśli kiedykolwiek do repozytorium zostanie dodana licencja open source dla **kodu**, musi ona
   wyraźnie **wyłączać** treści książek, grafiki i logotypy (`ksiazki/`, `Pliki/`) — te pozostają
   własnością autorów i Wydawcy, wykorzystywaną za zgodą. Decyzja należy do właściciela.

---

## 8. Rejestr zgód

Jedyne miejsce w repozytorium, które określa, z jakich tytułów wolno korzystać. **Brak wpisu =
brak zgody.** Wpisy dodaje się i zmienia wyłącznie na polecenie właściciela.

| Tytuł | Autor | Status | Data | Źródło zgody | Warunki szczegółowe |
|---|---|---|---|---|---|
| Vae Victis | Beniamin Muszyński | ✅ zgoda „na ten moment” | 29.10.2026 | korespondencja e-mail z 27–29.10.2026 — cytaty w rozdz. 1.2; oryginał u właściciela (tymczasowo `Pliki/Zgoda Vae Victis.pdf`) | pełna stopka (od copyrightu po ISBN); informacje o źródle; okładka z informacją o autorce (Justyna Bzdoń); bez grafik AI; projekt wewnętrzny, niekomercyjny |
| Wagabunda | Krzysztof Firkowski | ⛔ odmowa | 29.10.2026 | jw. | tytuł z dzieloną licencją — nie wykorzystywać w żadnej formie |

---

## 9. Kwestie otwarte i rozstrzygnięte

Pytania do Wydawcy zbieramy w [`Analizy/Pytania_Do_Wydawcy_2026-10-29.md`](../Analizy/Pytania_Do_Wydawcy_2026-10-29.md).

1. **Liczba graczy** — w prośbie „ok. 5 osób”, obecnie planowanych 6. ✅ Decyzja właściciela
   (2026-10-29): po ukończeniu pierwszej książki i przygotowaniu kont dla 6 graczy właściciel poprosi
   Wydawcę o kolejne tytuły i poinformuje o planie zwiększenia liczby graczy.
2. **Plik EPUB w publicznym repozytorium** (`Pliki/`) — ✅ decyzja właściciela (2026-10-29):
   **zostaje**; w aplikacji będą odnośniki do oryginałów na stronie Wydawnictwa. (Licencja w stopce
   dopuszcza „kopiowanie oraz dystrybucję bezpłatną na własny użytek”, a Wydawca udostępnia plik
   bezpłatnie na swojej stronie.)
3. **Opis książki ze strony Wydawnictwa** — nie kopiujemy (Z12), na karcie książki dajemy odnośnik.
   Wyświetlenie opisu w aplikacji wymaga potwierdzenia Wydawcy (propozycja pytania K2).
4. **Ostrzeżenie o treści** ze strony Wydawnictwa („Trigger warning: #Środki psychoaktywne”) — ✅
   decyzja właściciela (2026-10-29): **wyświetlamy na ekranie głównym**, przy wyborze książki,
   dosłownie, z informacją, że pochodzi ze strony Wydawnictwa, i z odnośnikiem. Potwierdzenie
   Wydawcy — propozycja pytania K1.
5. **Analiza zabezpieczeń z innego projektu** — ✅ dostarczona 2026-10-29 (instrukcja App Check);
   dotyczy Firebase, nie licencji — wnioski w [FIREBASE.md](FIREBASE.md), rozdz. 7.
6. **Krój pisma i ustawienia wyświetlania** — decyzja właściciela (2026-10-29): krój jak w oryginale,
   dwa przyciski zmiany wielkości liter. Zmiana kroju przez gracza — **dopiero po zgodzie Wydawcy**
   (pytanie PW1); pozostałe ustawienia wyświetlania — z prośbą o potwierdzenie (pytanie PW2).
7. **Wzmianka o „Wagabundzie” w tekście „Vae Victis”** — strona „od Wydawnictwa” (część publikacji)
   wymienia publikacje Wydawcy, m.in. „Wagabunda, Krzysztof Firkowski. Fantastyka”. ✅ Decyzja
   właściciela (2026-11-02): **nie skracać** — to tekst „Vae Victis”, a nie użycie tytułu „Wagabunda”
   w aplikacji (zakaz Z4 dotyczy m.in. katalogu aplikacji); zainteresowani pobiorą tytuł bezpośrednio
   od Wydawcy (odnośnik do strony Wydawnictwa jest w aplikacji).
8. **Czytanie na głos funkcją wbudowaną w przeglądarkę** — decyzja właściciela (2026-11-03): **bez
   własnego lektora/TTS** (zgodnie z Z3). Przeglądarka czyta stronę na polecenie gracza, a głos i tempo
   ustawia gracz w przeglądarce. Rozważany przycisk „Sam tekst” chowałby na czas słuchania przyciski i
   komunikaty aplikacji, tak żeby przeglądarka czytała sam tekst paragrafu (tekst bez zmian, atrybucja
   widoczna — N1, Z7). Ponieważ przycisk ma ułatwiać czytanie na głos, właściciel polecił zapytać
   Wydawcę (pytanie PW4). Funkcji przeglądarki nie blokujemy — to narzędzie gracza, jak czytnik ekranu.
   Analiza:
   [`Analizy/Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md`](../Analizy/Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md).
