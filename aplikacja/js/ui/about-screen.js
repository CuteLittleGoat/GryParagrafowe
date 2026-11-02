// Ekran „O książce”: okładka z podpisem, atrybucja, źródło, ostrzeżenie o treści i strony wstępne
// książki 1:1 (stopka redakcyjna, „od Wydawnictwa”, strona tytułowa, dedykacja, spis treści, …).
// Odnośniki wewnętrzne są tu zwykłym tekstem (bez skoków do paragrafów); zewnętrzne — działają.

import { h } from './dom.js';
import { renderBlocks, coverInfo } from './content-renderer.js';
import { bookInfoList, contentWarning, coverFigure } from './book-info.js';
import { bookBase, isActiveBook, loadBook } from '../data/book-loader.js';
import { nodeLabel } from '../core/engine.js';

// Etykiety nawigacyjne (tekst aplikacji) dla typowych stron wstępnych — FORMAT_KSIAZKI.md, rozdz. 4.1.
const FRONT_LABELS = {
  stopka: 'Stopka redakcyjna',
  wydawnictwo: 'Od Wydawnictwa',
  tytul: 'Strona tytułowa',
  dedykacja: 'Dedykacja',
  'spis-tresci': 'Spis treści',
  wprowadzenie: 'Wprowadzenie (zasady gry)',
  prolog: 'Prolog',
};

function hasText(blocks) {
  return blocks.some((block) => {
    if (block.type === 'list') return true;
    return (block.inline ?? []).some((item) => (item.text ?? '').trim() || item.link);
  });
}

export async function renderAbout(app, root, bookId) {
  if (!(await isActiveBook(bookId)) || !app.isBookEnabled(bookId)) {
    root.append(h('section', { class: 'panel' }, h('h1', {}, 'Nie znaleziono książki'), h('p', {}, h('a', { href: '#/', class: 'btn' }, 'Menu główne'))));
    return null;
  }
  const { manifest, content } = await loadBook(bookId);
  const base = bookBase(bookId);
  app.setTitle(`O książce: ${manifest.title}`);
  const fronts = content.order.filter((id) => content.nodes[id].kind === 'front' && hasText(content.nodes[id].blocks));
  const renderOptions = { assetBase: base, cover: coverInfo(manifest) };

  root.append(
    h(
      'div',
      { class: 'about' },
      h(
        'nav',
        { class: 'about-nav', 'aria-label': 'Nawigacja' },
        h('a', { href: `#/gra/${bookId}`, class: 'btn btn-primary' }, 'Przejdź do gry'),
        h('a', { href: '#/', class: 'btn' }, 'Menu główne'),
      ),
      h('h1', {}, h('span', { class: 'muted-label' }, 'O książce: '), manifest.title),
      h(
        'div',
        { class: 'about-header' },
        coverFigure(manifest, base, { large: true }),
        h('div', { class: 'about-header-info' }, h('p', { class: 'book-card-author' }, manifest.authors.join(', ')), contentWarning(manifest), bookInfoList(manifest)),
      ),
      h(
        'nav',
        { class: 'about-toc panel', 'aria-label': 'Strony wstępne książki' },
        h('h2', { class: 'app-section-title' }, 'Strony wstępne książki'),
        h('ul', {}, fronts.map((id) => h('li', {}, h('a', { href: `#/o-ksiazce/${bookId}`, onClick: (event) => {
          event.preventDefault();
          document.getElementById(`front-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById(`front-${id}`)?.focus({ preventScroll: true });
        } }, FRONT_LABELS[id] ?? nodeLabel(content, id))))),
      ),
      fronts.map((id) =>
        h(
          'section',
          { class: 'about-section', id: `front-${id}`, tabindex: '-1', 'aria-labelledby': `front-${id}-title` },
          h('h2', { id: `front-${id}-title`, class: 'app-section-title' }, FRONT_LABELS[id] ?? nodeLabel(content, id)),
          h('div', { class: 'book-text', lang: manifest.language ?? 'pl' }, renderBlocks(content.nodes[id].blocks, renderOptions)),
        )),
      h(
        'nav',
        { class: 'about-nav about-nav-bottom', 'aria-label': 'Nawigacja' },
        h('a', { href: `#/gra/${bookId}`, class: 'btn btn-primary' }, 'Przejdź do gry'),
        h('a', { href: '#/', class: 'btn' }, 'Menu główne'),
      ),
    ),
  );
  return null;
}
