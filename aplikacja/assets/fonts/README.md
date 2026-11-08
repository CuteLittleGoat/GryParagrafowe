# Fonty aplikacji

Tekst książki jest domyślnie złożony krojem z publikacji (Old Standard TT). Gracz może wybrać inny krój w
„Ustawieniach” → „Krój pisma”. To zmienia tylko wygląd liter — treść zostaje bez zmian. Wydawca zgodził
się na to 2026-11-08 (`dokumentacja/LICENCJA_I_ZGODA.md`, rozdz. 5.1 pkt 5; decyzja D65).

| Krój (kolejność w „Ustawieniach”) | Pliki | Wersja / źródło | Licencja |
|---|---|---|---|
| **Old Standard TT** — jak w oryginale (domyślny) | `OldStandard-Regular.ttf`, `-Italic.ttf`, `-Bold.ttf` | 3.000; Google Fonts, `ofl/oldstandardtt` (pobrane 2026-11-01) | SIL OFL 1.1 (`OFL.txt`) |
| **Literata** — szeryfowy, do czytania na ekranie | `literata/*.woff` | Fontsource 5.3.0 (Google Fonts v40, 2025-09-11) | SIL OFL 1.1 (`literata/OFL.txt`) |
| **PT Serif** — szeryfowy, klasyczny | `pt-serif/*.woff` | Fontsource 5.3.0 (Google Fonts v19, 2025-09-05) | SIL OFL 1.1 (`pt-serif/OFL.txt`) |
| **Open Sans** — bezszeryfowy | `open-sans/*.woff` | Fontsource 5.3.0 (Google Fonts v44, 2025-09-16) | SIL OFL 1.1 (`open-sans/OFL.txt`) |
| **Andika** — przyjazny dla osób z dysleksją | `andika/*.woff` | Fontsource 5.3.0 (Google Fonts v27, 2025-09-10) | SIL OFL 1.1 (`andika/OFL.txt`) |

- **Pliki nowych krojów** (2026-11-08):
  - z pakietów npm `@fontsource/<krój>@5.3.0` (Fontsource udostępnia pliki Google Fonts) — bez zmian;
  - dla każdego kroju: zwykły (400), kursywa (400), pogrubiony (700) i pogrubiona kursywa (700);
  - każdy styl w dwóch plikach: podstawowa łacina (`latin`) i znaki rozszerzone, w tym polskie
    (`latin-ext`);
  - format WOFF, który narzędzie sprawdzające czyta bez dodatkowych bibliotek;
  - reguły `@font-face` z zakresem znaków (`unicode-range`) — w `aplikacja/css/style.css`.
- **Pobieranie na żądanie.** Przeglądarka pobiera plik kroju dopiero wtedy, gdy gracz go wybierze.
  Kroje są dołączone lokalnie: żadnych zapytań do serwerów Google ani śledzenia.
- **Komplet znaków (kontrola K1).** Każdy krój i styl ma wszystkie znaki tekstu książki: polskie litery,
  „ ” – …, twardą spację, ©, é, ù. Sprawdza to `narzedzia/weryfikacja/sprawdz_kroje.py`
  (`dokumentacja/KONWERSJA.md`, rozdz. 3).
- **Bez zastrzeżonych nazw.** Wybrano kroje bez „Reserved Font Name” w licencji OFL. Pliki zawierają
  tylko wybrane znaki (podzbiory), a dla krojów z zastrzeżoną nazwą licencja traktowałaby to jak zmianę
  fontu.
- **Odrzuceni kandydaci** (sprawdzone 2026-11-08):
  - **OpenDyslexic** — brak twardej spacji (U+00A0), której tekst używa 1078 razy;
  - **Lexend** — brak kursywy, a kursywa jest w książce formatowaniem znaczącym;
  - **Merriweather** i **Lora** — zastrzeżona nazwa kroju (Reserved Font Name).
- **Andika** (SIL International) powstała dla początkujących czytelników. Ma wyraźne, trudne do
  pomylenia kształty liter (np. b/d/p/q), dlatego jest polecana osobom z dysleksją.
- **Licencja OFL** wymaga dołączenia jej tekstu do kopii fontów — pliki `OFL.txt` przy każdym kroju.
  Copyright: The Old Standard Project Authors (2011), The Literata Project Authors (2017), ParaType Ltd.
  (2010), The Open Sans Project Authors (2020), SIL International (2004–2022).

Sumy SHA-256 (do sprawdzenia, że pliki nie zostały zmienione) — Old Standard TT:

```text
42717a1280b523a506ca2b0285cca380e77fe214b1f6e3d75a8b925005f19eac  OldStandard-Regular.ttf
4b9522f4711317fc06e2413a58b4662c249cb707df193d682b9d640e365ef564  OldStandard-Italic.ttf
7d831e9d799ad23ee98e889381a9db2a283b2dac7f228dd5c06071decb9c54db  OldStandard-Bold.ttf
4faa2d9e2ce0a4b5b37e62ee6fafe474a539b31578f7214ed97cc3503aeb8ebd  OFL.txt
```

Nowe kroje (2026-11-08):

```text
55b46dee03f7c6c2447a25d6069d7db31a805b23513870a224f4fb8978bd216e  literata/literata-latin-400-italic.woff
8e4abe8bdb3ab4fa669a97067200a01111ab8b62abfd9fc05a53e16dfd37ba0f  literata/literata-latin-400-normal.woff
777012c332d5d759a19e36238ee04d495a5a0c9c7f573563c37e0242aaba6165  literata/literata-latin-700-italic.woff
868d2a7f2ea83a1ec2d2abf189f6d92318dc55a2ec3a1565f53c827382980af6  literata/literata-latin-700-normal.woff
8b038ee8d453140743f276f96e478bfd6292c106b001e1614725fc440e296fb3  literata/literata-latin-ext-400-italic.woff
a001f5c81fe72e4e05ca781783bc6dbe8669fe1d099d98d503dca4c451cb9dff  literata/literata-latin-ext-400-normal.woff
ff6c2c4815f52270bdc90a769c56f81982bddbcc6d61e5aaa7169f4ca47a983b  literata/literata-latin-ext-700-italic.woff
ba1939b1d118f98d340e43e6f3957eb216f3bcfb453baf6f59c75bf0d1581fd7  literata/literata-latin-ext-700-normal.woff
9895ebc015226accf416b758ac1ca02a2fb4f83a89d316791ef697c3dc0852aa  literata/OFL.txt
343ebbcf6a477afb93b62a059c20b693f8f933a8d105c5696349f530c0e45600  pt-serif/pt-serif-latin-400-italic.woff
ae68cf8246b65dc0e42794f74c435f5056784226c8248601e9a678be0d6d4e7a  pt-serif/pt-serif-latin-400-normal.woff
4b7c90e8a39f7dac4049856bb971f74c8d45224900ea1cae1f793a079fffbe3d  pt-serif/pt-serif-latin-700-italic.woff
620229cfe1d1e584e088bd258da2a9f8d9382e0d6bfd685fddb63d18897cb827  pt-serif/pt-serif-latin-700-normal.woff
443f09eada4f6d1ab204a36463cf8bdeac78a4a000294b8a47baa5ffd4424c8e  pt-serif/pt-serif-latin-ext-400-italic.woff
a40be3afb03d0f65541077cd3e29d8049ed849da0cca53647d4845662c1687b2  pt-serif/pt-serif-latin-ext-400-normal.woff
8ea5ca5918cb2056033fbf5119461dba801fa760a2c90faccf8eabf401bd8db7  pt-serif/pt-serif-latin-ext-700-italic.woff
a2cdfa8e3887adc01692195853ce2b4626e154aba67076ad7c2d52e80d20e97e  pt-serif/pt-serif-latin-ext-700-normal.woff
28d2f6e154d4860524f6d5f7851c9a3b69492b82642e282381260bee7ab2f0a4  pt-serif/OFL.txt
fa8383f26e60a89f4eb956d2997b416d22023427100151438b42372718ca8231  open-sans/open-sans-latin-400-italic.woff
8b3c81a3240d7c8cc9877cf5233d97051aa07730947217db840e500470a4d44a  open-sans/open-sans-latin-400-normal.woff
9ca16c53500cb95d285e231560c7b0ffea942871250010c691d6e3c7738b8a72  open-sans/open-sans-latin-700-italic.woff
397ccaf840827f6c84ebadf664b6494338d4ea39440ab22811829868014c43f5  open-sans/open-sans-latin-700-normal.woff
401f0843a23cca7cfed4957540dfc155d38cd4dc4a4b1d8346d6d667e6419b9c  open-sans/open-sans-latin-ext-400-italic.woff
36901611b06b72e4e8731415db3b82a9f6dd60d4ec6000158bd500daa71e50a7  open-sans/open-sans-latin-ext-400-normal.woff
eb5bc3d310dd7462c4f818446b01a61924700880c1ec90ba1fc193f8737b88b0  open-sans/open-sans-latin-ext-700-italic.woff
6115db834325cfe31f52da435fd54aeda703e376c5819961dcaa1a1c6de5a4be  open-sans/open-sans-latin-ext-700-normal.woff
9e7f12fafee50a9b4f7b3004c0fa58990805620d9debb0daf7f75de0d3ad5548  open-sans/OFL.txt
3adf16204ecccf063a97303d4d724b5bbe96e248f9d0955dd6dc58135399746e  andika/andika-latin-400-italic.woff
abd8023b0afaae474ac3ffcaaa2ae9d76e0ec90727c5ff89633606acc368be7d  andika/andika-latin-400-normal.woff
bbb4affc75a589e0fecf433a66ec831334b29e08f53c7d2ac54dae9672958bcc  andika/andika-latin-700-italic.woff
67f650d0d2262a5bd328d7f131f87b341112b4b3e98292480fdc2c63bec047d6  andika/andika-latin-700-normal.woff
f1feffedf47ad37d1b9d3f1c8ca1617b85f499f1305b577201716f079d4bf4ee  andika/andika-latin-ext-400-italic.woff
9af72fa32776757fd2c122a6402421adb98211df26bdf28fd3fc3da500b360e6  andika/andika-latin-ext-400-normal.woff
7ec3f456a707a770151b06631330b4423f970286959c40ea12c6308e07e901ad  andika/andika-latin-ext-700-italic.woff
d60f32e31e1c10482f77dc1c0ba050d930cc76d59e624df9956b8db0fc25a3ca  andika/andika-latin-ext-700-normal.woff
cd7558bbc2e44500d3262b80bd30e6d3b02bb5bac469ec595809a606f61f2f8a  andika/OFL.txt
```
