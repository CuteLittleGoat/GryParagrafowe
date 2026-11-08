// Okno „Instrukcja”: jak grać, co robią przyciski i ustawienia aplikacji oraz jak aplikacja obsługuje
// mechanikę danej książki. Całe okno to komunikaty aplikacji — nie tekst książki.
//
// Część o książce składa się z opisów modułów mechaniki, z których książka korzysta (np. „Informacje”
// w „Vae Victis”; w innych książkach mogą to być np. punkty życia albo ekwipunek), z nazwami z pliku
// mechanika.json. Opisujemy wyłącznie działanie aplikacji — nie streszczamy ani nie zastępujemy zasad
// gry z samej książki (zasady czyta się w jej tekście, np. we „Wprowadzeniu”; LICENCJA_I_ZGODA.md, Z1, Z3).

import { h, plural } from './dom.js';
import { openDialog } from './dialogs.js';
import { BOOK_FONT_LABELS, BOOK_FONTS, MODE_LABELS, PARAGRAPH_STYLE_LABELS, PARAGRAPH_STYLES } from './settings.js';

// Otwiera okno instrukcji dla książki: { manifest, mechanics, content } jak z loadBook().
// mechanics = null, gdy książka nie ma automatycznej mechaniki (albo plik mechaniki nie pasuje do treści).
export function openInstructions({ manifest, mechanics = null, content = null }) {
  return openDialog({
    title: 'Instrukcja',
    wide: true,
    body: [
      h('p', {}, 'Aplikacja wyświetla tekst książki bez żadnych zmian. Czytasz i sam decydujesz, dokąd iść dalej — '
        + 'tak jak w papierowej książce.'),
      section('Jak grać', list(playItems())),
      section('Ustawienia (przycisk „Ustawienia” na ekranie gry)', list(settingsItems(mechanics))),
      section(`Ta książka: „${manifest.title}”`, bookItems({ manifest, mechanics, content })),
    ],
  });
}

function section(title, ...children) {
  return h('section', { class: 'instructions-section' }, h('h3', {}, title), children);
}

function list(items) {
  return h('ul', { class: 'instructions-list' }, items.filter(Boolean).map((item) => h('li', {}, item)));
}

function playItems() {
  return [
    'Pod tekstem paragrafu są przyciski „Przejdź do…” — prowadzą tam, dokąd odsyła tekst. Możesz też kliknąć '
      + 'odnośnik (numer) w samym tekście.',
    '„Cofnij” cofa ostatni ruch; kolejne kliknięcia cofają kolejne ruchy.',
    'Gra zapisuje się sama po każdym ruchu (na pasku gry widać „Zapisano”). Możesz przerwać w dowolnej chwili '
      + 'i wrócić później.',
    '„Zapisy” — trzy miejsca na Twoje własne zapisy, do których możesz wrócić w dowolnej chwili.',
    '„Notatki” — Twoja kartka do tej książki; zapisuje się sama.',
    '„Historia” — droga przebyta w bieżącej rozgrywce (z datą i godziną jej rozpoczęcia) i odkryte zakończenia.',
    '„Nowa gra” — zaczyna od początku książki. Odkryte zakończenia i własne zapisy zostają, a o notatki '
      + 'aplikacja zapyta.',
    '„O książce” — okładka, autor, wydawca, pełna stopka redakcyjna i strony wstępne książki.',
    '„Menu główne” — powrót do listy książek.',
    'Jeśli grasz na dwóch urządzeniach i gra zapisała się w międzyczasie gdzie indziej, aplikacja zapyta, '
      + 'który stan zachować.',
  ];
}

function settingsItems(mechanics) {
  return [
    '„Motyw” — jasny, ciemny albo automatyczny (taki jak w systemie urządzenia).',
    '„Wielkość tekstu” — przyciski A− i A+ (są też na pasku gry) zmniejszają i powiększają tekst.',
    ['„Krój pisma” — kształt liter tekstu książki (treść się nie zmienia):',
      h('ul', { class: 'instructions-list' }, BOOK_FONTS.map((font) => h('li', {}, BOOK_FONT_LABELS[font])))],
    ['„Wygląd akapitów”:',
      h('ul', { class: 'instructions-list' }, PARAGRAPH_STYLES.map((style) => h('li', {}, PARAGRAPH_STYLE_LABELS[style])))],
    mechanics
      ? ['„Tryb mechaniki”:', h('ul', { class: 'instructions-list' }, h('li', {}, MODE_LABELS.auto), h('li', {}, MODE_LABELS.manual))]
      : '„Tryb mechaniki” — w tej książce niedostępny: książka nie ma w aplikacji automatycznej mechaniki.',
    '„Instrukcja” — to okno.',
    'Motyw, wielkość tekstu i tryb mechaniki są zapamiętywane na Twoim koncie. Motyw, wielkość tekstu, krój pisma '
      + 'i wygląd akapitów — na tym urządzeniu (na telefonie i komputerze możesz mieć inne).',
  ];
}

// Opisy modułów mechaniki. Nowy moduł (np. punkty życia, ekwipunek) = nowy wpis z opisem tego,
// jak obsługuje go aplikacja.
const MODULE_HELP = {
  codewords: codewordsHelp,
  visits: visitsHelp,
  endings: endingsHelp,
};

function bookItems({ manifest, mechanics, content }) {
  const hasIntroduction = Boolean(content?.nodes?.wprowadzenie);
  const rules = h('p', {}, hasIntroduction
    ? 'Zasady gry opisuje sama książka — w części „Wprowadzenie (zasady gry)”, którą czytasz na początku gry; '
      + 'znajdziesz ją też w „O książce”.'
    : 'Zasady gry opisuje sama książka — na stronach wstępnych, które czytasz na początku gry; znajdziesz je też '
      + 'w „O książce”.');
  if (!mechanics) {
    return [
      rules,
      h('p', {}, 'Ta książka nie ma w aplikacji automatycznej mechaniki — grasz jak na papierze. Wszystko, co '
        + 'trzeba zapamiętać, możesz zapisać w „Notatkach”.'),
    ];
  }
  const modules = Object.entries(mechanics.modules ?? {})
    .filter(([name]) => MODULE_HELP[name])
    .map(([name, module]) => MODULE_HELP[name](module, mechanics, manifest));
  return [rules, h('p', {}, 'Aplikacja pomaga w tym, co trzeba zapamiętywać w trakcie gry:'), modules];
}

function codewordsHelp(module, mechanics) {
  const label = module.label ?? 'Informacje';
  const prefix = module.prefix ?? '#';
  const buttonLabel = module.buttonLabel ?? 'Karta postaci';
  const panelTitle = module.panelTitle ?? `Karta postaci — ${label}`;
  const values = module.values ?? [];
  const example = `${prefix}${values[0] ?? '1'}`;
  const ambiguous = Object.values(mechanics.nodes ?? {}).some((node) => node?.ambiguous);
  return h(
    'div',
    { class: 'instructions-module' },
    h('h4', {}, label),
    // Bez łącznej liczby Informacji — książka jej nie podaje (por. zasadę dla zakończeń, D60).
    h('p', {}, `W tej książce zbierasz ${label} — każda ma swój numer (np. ${example}).`),
    list([
      `Tryb automatyczny: gdy tekst paragrafu mówi, że zdobywasz albo tracisz Informację, aplikacja sama ją zaznacza `
        + `i pokazuje komunikat, np. „Zdobywasz Informację ${example}.”`,
      'Przy przejściach, które według tekstu zależą od posiadanych Informacji, aplikacja pokazuje warunek i znak: '
        + '✓ — warunek spełniony, ✗ — niespełniony. Drogę z niespełnionym warunkiem też możesz wybrać — aplikacja '
        + 'tylko zapyta, czy na pewno.',
      ambiguous
        ? 'W kilku miejscach wskazówki można odczytać na więcej niż jeden sposób — tam aplikacja nie oznacza dróg '
          + 'i pokazuje komunikat; wybierasz według własnego odczytania tekstu.'
        : null,
      `Tryb ręczny: aplikacja niczego sama nie zaznacza ani nie oznacza — ${label} zaznaczasz sam, jak na kartce.`,
      `Przycisk „${buttonLabel}” otwiera okno „${panelTitle}” z listą wszystkich numerów; zaznaczone to te, które `
        + 'masz. Kliknięcie numeru zaznacza go albo odznacza. Takich ręcznych zmian nie cofa przycisk „Cofnij”.',
      `„Nowa gra” zaczyna z pustym oknem „${panelTitle}”.`,
    ]),
  );
}

function visitsHelp() {
  return h(
    'div',
    { class: 'instructions-module' },
    h('h4', {}, 'Odwiedzone miejsca'),
    list([
      'Aplikacja pamięta, ile razy byłeś w danym miejscu. Gdy według tekstu droga zależy od tego, czy jesteś tu '
        + 'ponownie, w trybie automatycznym przejście dostaje warunek, np. „jesteś w tym miejscu po raz drugi lub '
        + 'kolejny”, ze znakiem ✓ albo ✗.',
    ]),
  );
}

function endingsHelp(module, mechanics, manifest) {
  // Liczbę zakończeń podajemy tylko za opisem Wydawcy (manifest.announcedEndings, D60).
  const announced = manifest?.announcedEndings?.count;
  return h(
    'div',
    { class: 'instructions-module' },
    h('h4', {}, 'Zakończenia'),
    list([
      'Gdy dojdziesz do zakończenia, aplikacja pokaże ramkę „Koniec tej drogi” i zapamięta odkryte zakończenie. '
        + 'Odkryte zakończenia widać w „Historii” — zostają także po „Nowej grze”.',
      Number.isInteger(announced) && announced > 0
        ? `Według opisu Wydawcy książka ma ${announced} ${plural(announced, ['zakończenie', 'zakończenia', 'zakończeń'])}.`
        : null,
    ]),
  );
}
