// Renderowanie treści książki 1:1 z modelu bloków (FORMAT_KSIAZKI.md, rozdz. 4).
// Tekst trafia do DOM wyłącznie jako węzły tekstowe — bez innerHTML, bez zmian znaków.
// Odnośniki zostają w miejscu i z oryginalnym tekstem; zmienia się tylko ich obsługa
// (w grze — przejście przez silnik, poza grą — zwykły tekst).

import { h } from './dom.js';

const SAFE_IMAGE = /^grafiki\/[A-Za-z0-9._-]+$/;
const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

// options:
//   assetBase   — katalog książki, np. 'ksiazki/vae-victis/'
//   cover       — { file, alt, caption } — okładka zawsze z podpisem autorki ilustracji
//   onLink      — (link, element) => void; bez tej funkcji odnośniki wewnętrzne są zwykłym tekstem
//   linkHref    — (link) => string; adres odnośnika wewnętrznego (domyślnie bieżący)
//   linkProps   — (link) => obiekt atrybutów dodawanych do odnośnika wewnętrznego
export function renderBlocks(blocks, options = {}) {
  return blocks.map((block) => renderBlock(block, options));
}

function renderBlock(block, options) {
  switch (block.type) {
    case 'p':
      return h('p', { class: blockClass(block) }, renderInline(block.inline, options));
    case 'heading':
      return h('h2', { class: blockClass(block, 'book-heading') }, renderInline(block.inline, options));
    case 'list':
      return h(
        block.ordered ? 'ol' : 'ul',
        { class: 'book-list' },
        block.items.map((item) => h('li', {}, renderBlocks(Array.isArray(item) ? item : [item], options))),
      );
    case 'image':
      return renderImage(block.src, block.alt, options, true);
    default:
      throw new Error(`Nieznany typ bloku: ${block.type}`);
  }
}

function blockClass(block, base = '') {
  const classes = base ? [base] : [];
  if (block.align) classes.push(`align-${block.align}`);
  if (block.marks?.includes('b')) classes.push('mark-b');
  if (block.marks?.includes('i')) classes.push('mark-i');
  return classes.join(' ') || null;
}

export function renderInline(items = [], options = {}) {
  return items.map((item) => {
    if ('text' in item) return withMarks(document.createTextNode(item.text), item.marks);
    if ('link' in item) return renderLink(item, options);
    if ('image' in item) return renderImage(item.image, item.alt, options, false);
    if ('br' in item) return h('br');
    throw new Error('Nieznany element w wierszu tekstu');
  });
}

function withMarks(node, marks = []) {
  let element = node;
  if (marks?.includes('i')) element = h('i', {}, element);
  if (marks?.includes('b')) element = h('b', {}, element);
  return element;
}

function renderLink(item, options) {
  const content = renderInline(item.inline, options);
  const { link } = item;
  if (link.href) {
    if (!SAFE_HREF.test(link.href)) return h('span', { class: 'book-link-static' }, content);
    return h(
      'a',
      { href: link.href, target: '_blank', rel: 'noopener noreferrer', class: 'book-link book-link-external' },
      content,
    );
  }
  if (!options.onLink || !link.to) return h('span', { class: 'book-link-static' }, content);
  const anchor = h(
    'a',
    {
      href: options.linkHref?.(link) ?? '#',
      class: 'book-link',
      dataset: { linkId: link.id },
      ...(options.linkProps?.(link) ?? {}),
    },
    content,
  );
  anchor.addEventListener('click', (event) => {
    event.preventDefault();
    options.onLink(link, anchor);
  });
  return anchor;
}

function renderImage(src, alt, options, isBlock) {
  if (!SAFE_IMAGE.test(src)) return null;
  const isCover = Boolean(options.cover && src === options.cover.file);
  const image = h('img', {
    src: `${options.assetBase ?? ''}${src}`,
    alt: isCover ? options.cover.alt : alt ?? '',
    loading: 'lazy',
    decoding: 'async',
    class: isCover ? 'book-image book-cover-image' : 'book-image',
  });
  if (!isBlock && !isCover) return image;
  return h(
    'figure',
    { class: isCover ? 'book-figure book-figure-cover' : 'book-figure' },
    image,
    isCover ? h('figcaption', { class: 'app-caption' }, options.cover.caption) : null,
  );
}

// Dane okładki do wyświetlenia: plik, tekst alternatywny i obowiązkowy podpis autorki ilustracji.
export function coverInfo(manifest) {
  return {
    file: manifest.cover.file,
    alt: `Okładka książki „${manifest.title}”`,
    caption: `Ilustracja na okładce: ${manifest.cover.illustrator}`,
  };
}
