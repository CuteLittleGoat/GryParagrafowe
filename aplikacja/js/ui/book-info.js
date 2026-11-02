// Atrybucja i informacje o źródle książki (AGENTS.md, rozdz. 1.2 pkt 1–4) — wspólne dla ekranu
// głównego i ekranu „O książce”. Wszystkie dane pochodzą z manifestu książki (ksiazka.json).

import { h, externalLink } from './dom.js';
import { coverInfo } from './content-renderer.js';

export function formatDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate ?? '');
  return match ? `${match[3]}.${match[2]}.${match[1]}` : isoDate ?? '';
}

export function coverFigure(manifest, base, { large = false } = {}) {
  const cover = coverInfo(manifest);
  return h(
    'figure',
    { class: large ? 'cover cover-large' : 'cover' },
    h('img', { src: `${base}${cover.file}`, alt: cover.alt, decoding: 'async', loading: large ? 'eager' : 'lazy' }),
    h('figcaption', { class: 'app-caption' }, cover.caption),
  );
}

function row(term, ...details) {
  return [h('dt', {}, term), h('dd', {}, details)];
}

function joinLinks(links) {
  return links.flatMap((link, index) => (index ? [' · ', link] : [link]));
}

export function bookInfoList(manifest) {
  const sourceFile = manifest.source?.file?.split('/').pop();
  return h(
    'dl',
    { class: 'book-info' },
    row(manifest.authors.length > 1 ? 'Autorzy' : 'Autor', manifest.authors.join(', ')),
    row(
      'Wydawca',
      manifest.publisher.name,
      manifest.publisher.portal ? ` (portal ${manifest.publisher.portal})` : '',
    ),
    row(
      'Odnośniki',
      joinLinks([
        externalLink(manifest.officialPage, 'strona książki'),
        externalLink(manifest.publisher.website, 'strona Wydawnictwa'),
      ]),
    ),
    manifest.originals?.length
      ? row(
        'Oryginał do pobrania',
        joinLinks(manifest.originals.map((original) => externalLink(original.url, original.format))),
        ' (bezpłatnie, na stronie Wydawnictwa)',
      )
      : null,
    row(
      'Źródło tekstu',
      'wydanie elektroniczne Wydawnictwa',
      sourceFile ? ` — plik ${sourceFile}` : '',
      manifest.source?.downloadPage ? [' (', externalLink(manifest.source.downloadPage, 'strona pobierania'), ')'] : '',
    ),
    manifest.isbn ? row('ISBN', manifest.isbn) : null,
    row('Okładka', `ilustracja: ${manifest.cover.illustrator}`),
    row('Zgoda', `treść wykorzystana za zgodą Wydawcy (${formatDate(manifest.consent?.date)})`),
  );
}

// Ostrzeżenie o treści — dosłownie, z informacją, że pochodzi ze strony Wydawnictwa (decyzja P7).
export function contentWarning(manifest) {
  const warning = manifest.contentWarning;
  if (!warning?.text) return null;
  return h(
    'aside',
    { class: 'content-warning', 'aria-label': 'Ostrzeżenie o treści' },
    h('p', { class: 'content-warning-title' }, 'Ostrzeżenie o treści'),
    h('p', { class: 'content-warning-text' }, h('q', {}, warning.text)),
    h(
      'p',
      { class: 'content-warning-source' },
      'Informacja ze strony Wydawnictwa (',
      externalLink(warning.source, 'źródło'),
      warning.checked ? `, stan na ${formatDate(warning.checked)}` : '',
      ').',
    ),
  );
}
