// Wczytywanie katalogu i plików książek (statyczne pliki JSON z repozytorium).
// Treść książek nigdy nie trafia do Firebase — przeglądarka pobiera ją z tego samego serwisu co aplikację.

const BOOK_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const cache = new Map();

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Nie udało się wczytać pliku ${path} (${response.status})`);
  return response.json();
}

export function bookBase(bookId) {
  if (!BOOK_ID.test(bookId)) throw new Error(`Niepoprawny identyfikator książki: ${bookId}`);
  return `ksiazki/${bookId}/`;
}

export async function loadCatalog() {
  if (!cache.has('catalog')) {
    cache.set('catalog', fetchJson('ksiazki/katalog.json').catch((error) => {
      cache.delete('catalog');
      throw error;
    }));
  }
  return cache.get('catalog');
}

// Książki dostępne w aplikacji: tylko wpisy ze statusem „active”, w kolejności z katalogu.
export async function activeBooks() {
  const catalog = await loadCatalog();
  return catalog.books
    .filter((book) => book.status === 'active' && BOOK_ID.test(book.id))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function isActiveBook(bookId) {
  return (await activeBooks()).some((book) => book.id === bookId);
}

function cached(key, loader) {
  if (!cache.has(key)) {
    cache.set(key, loader().catch((error) => {
      cache.delete(key);
      throw error;
    }));
  }
  return cache.get(key);
}

export function loadManifest(bookId) {
  return cached(`manifest:${bookId}`, () => fetchJson(`${bookBase(bookId)}ksiazka.json`));
}

export function loadColophon(bookId) {
  return cached(`colophon:${bookId}`, () => fetchJson(`${bookBase(bookId)}stopka.json`));
}

// Pełna książka: manifest, treść, mechanika. Mechanika jest używana tylko wtedy, gdy powstała dla tej
// samej wersji treści (contentSha256) — w przeciwnym razie gra działa w trybie ręcznym.
export function loadBook(bookId) {
  return cached(`book:${bookId}`, async () => {
    const base = bookBase(bookId);
    const [manifest, contentResponse, mechanics] = await Promise.all([
      loadManifest(bookId),
      fetch(`${base}tresc.json`, { cache: 'no-cache' }),
      manifestHasMechanics(bookId).then((has) => (has ? fetchJson(`${base}mechanika.json`) : null)),
    ]);
    if (!contentResponse.ok) throw new Error(`Nie udało się wczytać treści książki (${contentResponse.status})`);
    const buffer = await contentResponse.arrayBuffer();
    const content = JSON.parse(new TextDecoder('utf-8').decode(buffer));
    const contentSha256 = await sha256Hex(buffer);
    const mechanicsMatches = Boolean(mechanics && mechanics.contentSha256 === contentSha256);
    return {
      manifest,
      content,
      mechanics: mechanicsMatches ? mechanics : null,
      mechanicsProblem: mechanics && !mechanicsMatches
        ? 'Plik mechaniki nie pasuje do wersji treści — gra działa w trybie ręcznym.'
        : null,
      contentSha256,
    };
  });
}

async function manifestHasMechanics(bookId) {
  const manifest = await loadManifest(bookId);
  return Array.isArray(manifest.modules) && manifest.modules.length > 0;
}

export async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
