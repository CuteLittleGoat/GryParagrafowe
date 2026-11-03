# Pytania do Wydawcy (Wydawnictwo Wielokrotnego Wyboru)

> Plik roboczy, **uzupełniany na bieżąco** o kolejne pytania wraz z postępem prac.
> Utworzony: 2026-10-29 · ostatnia aktualizacja: 2026-11-03.
>
> **Zakres pytań (decyzja właściciela, 2026-11-02): Wydawcę pytamy wyłącznie o sprawy licencyjne**
> (zakres zgody, sposób prezentacji i wykorzystania materiałów) — **nie o treść ani zasady gry w
> poszczególnych książkach**. Wątpliwości dotyczące treści opisujemy w osobnych analizach w `Analizy/`.

## Polecenie użytkownika

> Przygotuj też w folderze Analizy/ plik z pytaniami do wydawcy. Pytanie o pozwolenie na zmianę
> czcionki będzie jako pierwsze. Nie jestem pewien czy licencja pozwala na taką modyfikację. Niby
> czytniki ebooków pozwalają na to, ale w tym przypadku wolę mieć pewność. Plik będzie uzupełniany o
> kolejne pytania wraz z postępem prac.

Uzupełnienie z 2026-11-01 (pytanie PW3 — usunięte 2026-11-02):

> P8 - teraz robimy wariant a). Dopisz też to jako dodatkowe pytanie do wydawcy.

Polecenie z 2026-11-02 (usunięcie PW3):

> Usuń pytanie "PW3. Niejednoznaczne wskazówki w §170, §259, §286 i §289".
> Wystawcy będziemy pytać tylko o rzeczy związane z licencjami a nie treścią poszczególnych książek.

Polecenie z 2026-11-03 (pytanie PW4):

> Dlatego nie chcę tworzyć własnego lektora/TTS tylko nakierować już istniejącego w przeglądarce.
> Niemniej dodaj to do pytań do wydawcy. Czy funkcja nakierowywania lektora wbudowanego w przeglądarkę
> nie łamie zasad licencyjnych.

## Źródła

- `Pliki/Zgoda Vae Victis.pdf` (oryginał u właściciela; warunki i cytaty — rejestr zgód w
  `dokumentacja/LICENCJA_I_ZGODA.md`) — korespondencja z Wydawcą z
  27–29.10.2026: zgoda na „Vae Victis” (pełna stopka, informacje o źródle, okładka z informacją o
  autorce, bez grafik AI). O sposobie wyświetlania tekstu (krój, rozmiar, kolory) zgoda nie wspomina.
- Sekcja „LICENCJA” w stopce `Pliki/Vae-Victis-15-to-lecie-MW.epub` (SHA-256 `89547ec8…1cd7`):
  „Uwaga! Niniejsza publikacja nie może być rozpowszechniana, adaptowana, modyfikowana ani
  odsprzedawana bez pisemnej zgody Wydawcy. Dozwolone jest jej kopiowanie oraz dystrybucja bezpłatna
  na własny użytek.”
- Stopka tego samego pliku: „W niniejszej publikacji wykorzystano czcionkę Old Standard zaprojektowaną
  przez Alexeya Kryukova. Czcionka użyta zgodnie z Open Source Licensee.”
- [`dokumentacja/LICENCJA_I_ZGODA.md`](../dokumentacja/LICENCJA_I_ZGODA.md) — zasady projektu.
- [`Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md`](Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md) —
  analiza czytania na głos funkcją przeglądarki (podstawa pytania PW4).

## Rejestr pytań

| Nr | Pytanie (skrót) | Status | Wysłano | Odpowiedź Wydawcy | Co robimy do czasu odpowiedzi |
|---|---|---|---|---|---|
| PW1 | Czy gracz może zmienić krój pisma (czcionkę)? | 📝 przygotowane | — | — | tylko krój oryginalny (Old Standard); funkcji zmiany kroju nie budujemy |
| PW2 | Czy można dodać typowe ustawienia wyświetlania (wielkość liter, tryb ciemny, dopasowanie do ekranu telefonu)? | 📝 przygotowane | — | — | przygotowujemy je jak w czytnikach e-booków; przy braku zgody — wycofamy |
| PW4 | Czy możemy dodać przycisk, który na czas słuchania chowa przyciski aplikacji, tak żeby funkcja czytania na głos **wbudowana w przeglądarkę** czytała sam tekst paragrafu? (aplikacja nie ma własnego lektora) | 📝 przygotowane | — | — | własnego lektora nie tworzymy (Z3); przycisku „Sam tekst” nie dodajemy (decyzja właściciela 2026-11-03, P17); porządek w znacznikach HTML i komentarze — zrobione (2026-11-03); funkcji przeglądarki nie blokujemy |

Statusy: 📝 przygotowane → 📤 wysłane → ✅ zgoda / ⛔ brak zgody / ❓ odpowiedź wymaga doprecyzowania.

Pytanie PW3 (niejednoznaczne wskazówki w §170, §259, §286 i §289) — **usunięte 2026-11-02** na polecenie
właściciela (pytamy tylko o licencje); opis problemu:
[`Niejednoznaczne_Wskazowki_Vae_Victis_2026-11-02.md`](Niejednoznaczne_Wskazowki_Vae_Victis_2026-11-02.md).
Numeru PW3 nie używamy ponownie, żeby nie pomylić go z dawnym pytaniem — kolejne pytanie ma numer PW4.

## PW1. Zmiana kroju pisma (czcionki)

**Dlaczego pytamy.** Tekst będzie domyślnie wyświetlany tym samym krojem co w publikacji (Old
Standard — tak podaje stopka). Chcemy dać graczom możliwość przełączenia na inny krój, np.
ułatwiający czytanie osobom z dysleksją. Treść nie zmienia się ani o literę — zmienia się tylko wygląd
liter. Czytniki e-booków pozwalają na to standardowo, ale licencja w stopce zabrania adaptowania i
modyfikowania publikacji bez pisemnej zgody, a dotychczasowa zgoda nie mówi nic o sposobie
wyświetlania. Właściciel projektu woli mieć pewność.

**Pytanie:** Czy gracz może w aplikacji zmienić krój pisma (czcionkę), którym wyświetlany jest tekst
„Vae victis”? Domyślnie będzie to Old Standard, jak w publikacji; dodatkowo gracz mógłby wybrać inną
czcionkę, np. ułatwiającą czytanie osobom z dysleksją. Treść pozostaje bez zmian.

**Do czasu odpowiedzi:** wyłącznie krój oryginalny. Wybór innego kroju (Etap 7, opcjonalnie) — tylko po
zgodzie Wydawcy.

## PW2. Pozostałe ustawienia wyświetlania

**Dlaczego pytamy.** Z tego samego powodu co PW1 — dla pewności. Te ustawienia są standardem w
czytnikach e-booków (w formacie EPUB tekst z założenia dopasowuje się do ekranu), a bez nich gra na
telefonie byłaby niewygodna:
- zmiana wielkości liter — dwa przyciski „powiększ / pomniejsz” (decyzja właściciela),
- tryb ciemny (jasny tekst na ciemnym tle),
- dopasowanie układu do ekranu telefonu (inne łamanie wierszy niż w PDF; podział na akapity i
  paragrafy bez zmian).

**Pytanie:** Czy możemy dodać typowe ustawienia wyświetlania, znane z czytników e-booków: zmianę
wielkości liter, tryb ciemny oraz dopasowanie układu tekstu do ekranu telefonu? Treść pozostaje bez zmian.

**Do czasu odpowiedzi:** przygotowujemy te ustawienia zgodnie z dokumentacją; jeśli Wydawca się nie
zgodzi — wycofamy je.

## PW4. Czytanie na głos funkcją wbudowaną w przeglądarkę

**Dlaczego pytamy.**
- Przeglądarki internetowe (np. Microsoft Edge, Google Chrome, Safari, Firefox) mają wbudowaną funkcję
  czytania stron na głos. Gracz sam ją włącza i sam wybiera w przeglądarce głos i tempo.
- Aplikacja **nie ma własnego lektora** (decyzja właściciela): nie mówi, niczego nie nagrywa, nie tworzy
  plików dźwiękowych i nie wybiera głosu.
- Przeglądarka czyta dziś jednak całą stronę, także przyciski („Ustawienia”, „Przejdź do §54”, „Cofnij”)
  i komunikaty aplikacji.
- Właściciel rozważa przycisk (roboczo „Sam tekst”), który na czas słuchania chowa przyciski i
  komunikaty. Przeglądarka przeczyta wtedy sam tekst paragrafu. Treść się nie zmienia, a tytuł, autor i
  odnośnik „O książce” zostają widoczne.
- Nasze zasady wykluczają lektora/TTS tworzonego z tekstu książki (LICENCJA_I_ZGODA.md, Z3), bo zgoda go
  nie obejmuje. Przycisk lektorem nie jest, ale ma ułatwić czytanie na głos — dlatego chcemy mieć
  pewność.
- Część głosów w przeglądarkach działa przez internet (usługa producenta przeglądarki). To ustawienie
  przeglądarki gracza, na które aplikacja nie ma wpływu — uczciwie o tym informujemy.
- Szczegóły:
  [`Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md`](Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md).

**Pytanie:** Czy możemy dodać w aplikacji przycisk, który na czas słuchania chowa przyciski i komunikaty
aplikacji, tak aby funkcja czytania na głos wbudowana w przeglądarkę (włączana przez gracza) czytała
tylko tekst paragrafu? Aplikacja nie ma własnego lektora i niczego nie nagrywa; głos i tempo ustawia
gracz w przeglądarce. Tekst pozostaje bez zmian, a tytuł i autor zostają widoczne.

**Do czasu odpowiedzi** (decyzja właściciela 2026-11-03, pytanie P17 w `PLAN_I_CHANGELOG.md`: „Czekając na
odpowiedź od wydawcy zrób porządek w znacznikach i dodaj komentarze.”):
- własnego lektora nie tworzymy;
- przycisku „Sam tekst” nie dodajemy;
- porządek w znacznikach HTML i komentarze po polsku — zrobione (2026-11-03); Chrome czyta teraz tekst
  paragrafu i tytuł książki, ale funkcje czytające całą stronę nadal czytają przyciski;
- funkcji przeglądarki nie blokujemy — to narzędzie gracza, jak czytnik ekranu dla osób niewidomych.

## Szkic wiadomości (PW1 + PW2 + PW4)

Do skopiowania i wysłania przez właściciela (można dopisać pytania z sekcji „Propozycje”):

```text
Dzień dobry,

dziękuję za zgodę na wykorzystanie „Vae victis”. Prace nad aplikacją ruszyły. Tekst i pełna stopka redakcyjna zostaną przeniesione bez żadnych zmian.

Zanim ostatecznie przygotuję sposób wyświetlania tekstu, chcę się upewnić co do trzech kwestii:

1. Czy gracz może w aplikacji zmienić krój pisma (czcionkę), którym wyświetlany jest tekst? Domyślnie będzie to Old Standard, jak w publikacji. Dodatkowo gracz mógłby wybrać inną czcionkę, np. ułatwiającą czytanie osobom z dysleksją. Treść pozostaje bez zmian — zmienia się tylko wygląd liter.

2. Czy możemy dodać typowe ustawienia wyświetlania, znane z czytników e-booków: zmianę wielkości liter, tryb ciemny (jasny tekst na ciemnym tle) oraz dopasowanie układu tekstu do ekranu telefonu? Tutaj również treść pozostaje bez zmian.

3. Przeglądarki internetowe (np. Microsoft Edge, Google Chrome, Safari) mają wbudowaną funkcję czytania stron na głos — gracz sam ją włącza i sam wybiera w przeglądarce głos i tempo. Aplikacja nie ma własnego lektora, niczego nie nagrywa i nie tworzy plików dźwiękowych. Obecnie przeglądarka czyta jednak całą stronę, łącznie z przyciskami (np. „Ustawienia”, „Przejdź do §22”). Chciałbym dodać przycisk, który na czas słuchania ukryje przyciski i komunikaty aplikacji, tak żeby przeglądarka przeczytała sam tekst paragrafu. Treść pozostaje bez zmian, a tytuł i autor są nadal widoczne. Czy taka funkcja jest zgodna z udzieloną zgodą? Dodam, że niektóre przeglądarki korzystają z głosów działających przez internet — to ustawienie przeglądarki gracza, na które aplikacja nie ma wpływu.

Pozdrawiam serdecznie,
[podpis]
```

## Propozycje kolejnych pytań (do decyzji właściciela)

| Nr | Propozycja pytania | Skąd się wzięła |
|---|---|---|
| K1 | Czy możemy pokazać w aplikacji ostrzeżenie o treści z Państwa strony („Trigger warning: #Środki psychoaktywne”), z informacją, że pochodzi z Państwa strony? **Propozycja: dołączyć do pierwszej wiadomości** (to tylko potwierdzenie). | decyzja właściciela P7 (wyświetlamy na ekranie głównym); tekst pochodzi ze strony Wydawnictwa, nie z publikacji (zasada Z12 w LICENCJA_I_ZGODA.md) |
| K2 | Czy możemy pokazać w aplikacji opis książki z Państwa strony (zamiast samego odnośnika)? | LICENCJA_I_ZGODA.md, rozdz. 9 pkt 3 — obecnie tylko odnośnik |
| K3 | → przeniesione do rejestru jako PW3 (2026-11-01); **PW3 usunięte 2026-11-02** — Wydawcę pytamy tylko o licencje | decyzja właściciela |
| K4 | Prośba o kolejne tytuły i informacja o planie zwiększenia liczby graczy | decyzja właściciela P12 — po ukończeniu „Vae Victis” i przygotowaniu kont dla 6 graczy |

## Niepewności

- Zgoda z 29.10.2026 nie wspomina o sposobie wyświetlania tekstu (krój, wielkość, kolory) — stąd PW1 i PW2.
- Licencja zabrania „adaptowania” i „modyfikowania” publikacji. Nie wiadomo, czy Wydawca uzna zmianę
  kroju pisma za modyfikację (tekst się nie zmienia, ale zmienia się wygląd publikacji).
- To, że czytniki e-booków standardowo pozwalają zmieniać krój i wielkość liter, jest argumentem, ale
  nie rozstrzyga sprawy dla tej aplikacji.
- PW4: zgoda nie wspomina o czytaniu na głos. Nie wiadomo, czy Wydawca uzna pomoc dla lektora
  wbudowanego w przeglądarkę za „wersję audio”, której nasze zasady (Z3) nie dopuszczają, czy za zwykłe
  ułatwienie w czytaniu (jak tryb ciemny albo czytnik ekranu).

## Jak uzupełniać ten plik

1. Nowe pytanie → wiersz w „Rejestrze pytań” (status 📝) i osobna sekcja: dlaczego pytamy, treść
   pytania (prostym, uprzejmym językiem), co robimy do czasu odpowiedzi.
2. Propozycje agentów trafiają do sekcji „Propozycje kolejnych pytań”; o wysłaniu decyduje właściciel.
3. Po wysłaniu → status 📤 i data.
4. Po odpowiedzi → status, **dosłowny** cytat odpowiedzi i jej skutki dla projektu. Oryginał
   korespondencji przechowuje właściciel (w `Pliki/` albo poza repozytorium); zasady i rejestr zgód
   w `dokumentacja/LICENCJA_I_ZGODA.md` aktualizujemy na
   polecenie właściciela.
