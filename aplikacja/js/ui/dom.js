// Pomocnicze funkcje DOM. Tekst wstawiamy wyłącznie jako węzły tekstowe (createElement / textContent)
// — nigdy przez innerHTML (AGENTS.md, rozdz. 7).

// h('p', { class: 'x', onClick: fn }, 'tekst', dziecko, [lista dzieci])
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') element.className = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key === 'text') element.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) element.setAttribute(key, '');
    else element.setAttribute(key, String(value));
  }
  return append(element, children);
}

export function append(parent, children) {
  for (const child of [children].flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function clear(element) {
  element.replaceChildren();
  return element;
}

// Komentarz HTML po polsku (widoczny w narzędziach przeglądarki, F12 → „Zbadaj”), np. opis części
// ekranu. Funkcje czytania na głos i czytniki ekranu go nie czytają. Nigdy nie wstawiamy komentarzy do
// tekstu książki (wnętrze <article class="book-text">) — tam jest wyłącznie treść 1:1.
export function htmlComment(text) {
  return document.createComment(` ${String(text).replaceAll('--', '—')} `);
}

// Odnośnik zewnętrzny (otwierany w nowej karcie, bez przekazywania informacji o stronie).
export function externalLink(href, text, props = {}) {
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer', ...props }, text);
}

// Tekst widoczny tylko dla czytników ekranu.
export function srOnly(text) {
  return h('span', { class: 'visually-hidden' }, text);
}

// Jeden format daty i godziny w całej aplikacji: rrrr-MM-dd gg:mm (np. 2026-11-03 08:52), czas
// lokalny urządzenia gracza (decyzja właściciela, 2026-11-03: „zastosuj jeden format daty i się go
// trzymaj wszędzie”). Używany m.in. przy dacie rozpoczęcia rozgrywki, ostatnim zapisie i w „Zapisach”.
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Polska odmiana liczebników: plural(3, ['zakończenie', 'zakończenia', 'zakończeń']).
export function plural(count, [one, few, many]) {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}
