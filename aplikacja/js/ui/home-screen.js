// Ekran główny: opis aplikacji, logowanie, a po zalogowaniu — katalog książek z pełną atrybucją,
// ostrzeżeniem o treści i pełną stopką redakcyjną (AGENTS.md, rozdz. 1.2).
// Przed zalogowaniem nie pokazujemy treści ani okładek — gra jest tylko dla zalogowanych graczy.

import { h, formatDateTime, htmlComment, plural } from './dom.js';
import { coverInfo, renderBlocks } from './content-renderer.js';
import { bookInfoList, contentWarning } from './book-info.js';
import { alertDialog } from './dialogs.js';
import { openInstructions } from './instructions.js';
import { activeBooks, bookBase, loadBook, loadColophon, loadManifest } from '../data/book-loader.js';
import { LoginError } from '../data/storage-errors.js';
import { nodeIdLabel } from '../core/engine.js';

export async function renderHome(app, root) {
  const page = h('div', { class: 'home' });
  root.append(page);
  page.append(
    htmlComment('Ekran główny. Wstęp: nazwa i krótki opis aplikacji.'),
    h(
      'section',
      { class: 'intro' },
      h('h1', {}, 'Gry paragrafowe'),
      h(
        'p',
        { class: 'lead' },
        'Aplikacja do grania w gry paragrafowe — książki, w których czytelnik sam decyduje, dokąd prowadzi '
          + 'historia. Tekst książek wyświetlamy bez żadnych zmian, za zgodą wydawców.',
      ),
    ),
  );

  if (!app.storage) {
    page.append(
      h(
        'section',
        { class: 'panel notice-panel', role: 'status' },
        h('h2', {}, 'Logowanie w przygotowaniu'),
        h('p', {}, 'Aplikacja jest jeszcze w budowie. Gra będzie dostępna dla graczy po uruchomieniu kont.'),
      ),
    );
    return null;
  }

  if (!app.session) {
    page.append(
      htmlComment('Logowanie: login i hasło zakłada administrator (bez trybu gościa i bez otwartej rejestracji).'),
      loginForm(app),
    );
    return null;
  }

  if (app.config.maintenance) {
    page.append(
      h(
        'section',
        { class: 'panel notice-panel', role: 'status' },
        h('h2', {}, 'Przerwa techniczna'),
        h('p', {}, 'Trwają prace przy aplikacji. Zapraszamy wkrótce — Twój postęp jest zapisany.'),
      ),
    );
    return null;
  }

  const books = (await activeBooks()).filter((book) => app.isBookEnabled(book.id));
  page.append(
    htmlComment('Katalog książek. Karta książki: okładka z podpisem autorki ilustracji, tytuł, autor, wydawca; '
      + 'po rozwinięciu — ostrzeżenie o treści, stan gry, przyciski, atrybucja i odnośniki, pełna stopka redakcyjna.'),
    h('h2', { class: 'section-title' }, 'Książki'),
  );
  if (!books.length) {
    page.append(h('p', { class: 'muted' }, 'Brak książek w katalogu.'));
    return null;
  }
  const catalog = h('div', { class: 'catalog' });
  page.append(catalog);
  for (const book of books) {
    try {
      catalog.append(await bookCard(app, book.id));
    } catch (error) {
      console.error(error);
      catalog.append(h('p', { class: 'error-text', role: 'alert' }, `Nie udało się wczytać książki ${book.id}.`));
    }
  }
  return null;
}

function loginForm(app) {
  const login = h('input', { class: 'input', name: 'login', autocomplete: 'username', required: true, autocapitalize: 'none', spellcheck: 'false' });
  const password = h('input', { class: 'input', name: 'password', type: 'password', autocomplete: 'current-password' });
  const error = h('p', { class: 'form-error', role: 'alert' });
  const submit = h('button', { type: 'submit', class: 'btn btn-primary' }, 'Zaloguj');
  const isLocal = app.storage.kind === 'local';
  const isEmulator = app.storage.kind === 'emulator';
  const form = h(
    'form',
    { class: 'panel login-panel', 'aria-labelledby': 'login-title', novalidate: true },
    h('h2', { id: 'login-title' }, 'Logowanie'),
    isLocal
      ? h(
        'p',
        { class: 'dev-banner' },
        h('strong', {}, 'Tryb lokalny (do testów na tym komputerze). '),
        'Dane zapisują się tylko w tej przeglądarce; hasło nie jest sprawdzane ani zapisywane.',
      )
      : null,
    isEmulator
      ? h('p', { class: 'dev-banner' }, h('strong', {}, 'Tryb testowy (emulator Firebase). '), 'Dane nie trafiają do prawdziwej bazy.')
      : null,
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Login'), login),
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Hasło'), password),
    error,
    h('div', { class: 'form-actions' }, submit),
    h('p', { class: 'muted small' }, 'Nie masz konta? Konta zakłada administrator — nie ma otwartej rejestracji. '
      + 'Logowanie jest pamiętane na tym urządzeniu przez 30 dni.'),
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    if (!login.value.trim()) {
      error.textContent = 'Podaj login.';
      login.focus();
      return;
    }
    if (!isLocal && !password.value) {
      error.textContent = 'Podaj hasło.';
      password.focus();
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Logowanie…';
    try {
      await app.login(login.value, password.value);
      password.value = '';
      await app.route();
    } catch (failure) {
      password.value = '';
      error.textContent = failure instanceof LoginError
        ? failure.message
        : 'Nie udało się zalogować. Sprawdź połączenie z internetem i spróbuj ponownie.';
      if (!(failure instanceof LoginError)) console.error(failure);
      submit.disabled = false;
      submit.textContent = 'Zaloguj';
    }
  });
  queueMicrotask(() => login.focus());
  return form;
}

// Karty książek są zwijane, żeby przy wielu książkach ekran główny był czytelny (decyzja właściciela,
// 2026-11-03). Zwinięta karta pokazuje okładkę z podpisem autorki ilustracji, tytuł, autora i wydawcę;
// po rozwinięciu — ostrzeżenie o treści, stan gry, przyciski, atrybucję i pełną stopkę redakcyjną.
// Rozwinięte karty pamiętamy do końca sesji przeglądarki (sessionStorage — tylko stan widoku).
const EXPANDED_KEY = 'gp1:ui:rozwiniete-karty';

function readExpanded() {
  try {
    return new Set(JSON.parse(globalThis.sessionStorage?.getItem(EXPANDED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function storeExpanded(bookId, expanded) {
  try {
    const ids = readExpanded();
    if (expanded) ids.add(bookId);
    else ids.delete(bookId);
    globalThis.sessionStorage?.setItem(EXPANDED_KEY, JSON.stringify([...ids]));
  } catch {
    // Brak pamięci sesji (np. tryb prywatny) — karta po prostu startuje zwinięta.
  }
}

function publisherLine(manifest) {
  return manifest.publisher.portal
    ? `${manifest.publisher.name} (portal ${manifest.publisher.portal})`
    : manifest.publisher.name;
}

async function bookCard(app, bookId) {
  const base = bookBase(bookId);
  const [manifest, colophon, state] = await Promise.all([
    loadManifest(bookId),
    loadColophon(bookId),
    app.storage.loadBookState(bookId).catch((error) => {
      console.error(error);
      return null;
    }),
  ]);
  const cover = coverInfo(manifest);
  const titleId = `book-${bookId}-title`;
  const panelId = `book-${bookId}-panel`;
  const hasGame = Boolean(state?.currentNode);
  // Instrukcja potrzebuje mechaniki książki — wczytujemy ją dopiero po kliknięciu.
  const showInstructions = async () => {
    try {
      await openInstructions(await loadBook(bookId));
    } catch (error) {
      console.error(error);
      await alertDialog({ title: 'Instrukcja', message: 'Nie udało się wczytać instrukcji. Spróbuj ponownie.' });
    }
  };
  // Przyciski karty: gra, „Nowa gra” i „Instrukcja” po lewej; „O książce” po prawej (decyzja właściciela).
  const actions = h(
    'div',
    { class: 'actions book-actions' },
    h('a', { href: `#/gra/${bookId}`, class: 'btn btn-primary' }, hasGame ? 'Kontynuuj grę' : 'Rozpocznij grę'),
    hasGame
      ? h('a', {
        href: `#/gra/${bookId}`,
        class: 'btn',
        onClick: () => {
          app.pendingNewGame = bookId;
        },
      }, 'Nowa gra')
      : null,
    h('button', { type: 'button', class: 'btn', onClick: showInstructions }, 'Instrukcja'),
    h('a', { href: `#/o-ksiazce/${bookId}`, class: 'btn btn-about' }, 'O książce'),
  );

  // Nagłówek — zawsze widoczny; kliknięcie zwija i rozwija kartę (dla klawiatury: belka poniżej).
  const header = h(
    'div',
    { class: 'book-card-header' },
    h('img', { class: 'book-card-thumb', src: `${base}${cover.file}`, alt: cover.alt, decoding: 'async', loading: 'lazy' }),
    h(
      'div',
      { class: 'book-card-heading' },
      h('h3', { id: titleId, class: 'book-card-title' }, manifest.title),
      h('p', { class: 'book-card-author' }, manifest.authors.join(', ')),
      h('p', { class: 'book-card-publisher' }, publisherLine(manifest)),
      h('p', { class: 'app-caption book-card-cover-credit' }, cover.caption),
    ),
  );

  const toggleLabel = h('span', { class: 'book-toggle-label' });
  const toggleHint = h('span', { class: 'book-toggle-hint' }, 'szczegóły, ostrzeżenie o treści, stopka redakcyjna');
  const toggle = h(
    'button',
    { type: 'button', class: 'book-toggle', 'aria-controls': panelId },
    h('span', { class: 'book-toggle-icon', 'aria-hidden': 'true' }),
    toggleLabel,
    toggleHint,
  );

  const collapseBottom = h('button', { type: 'button', class: 'btn btn-small book-collapse-bottom' }, 'Zwiń kartę');
  const panel = h(
    'div',
    { id: panelId, class: 'book-card-panel', role: 'region', 'aria-labelledby': titleId },
    contentWarning(manifest),
    progressText(state),
    actions,
    bookInfoList(manifest),
    htmlComment('Stopka redakcyjna — pełna i dosłowna, z pliku źródłowego publikacji (zasada N3).'),
    h(
      'section',
      { class: 'colophon', 'aria-labelledby': `${titleId}-colophon` },
      h('h4', { id: `${titleId}-colophon`, class: 'app-section-title' }, 'Stopka redakcyjna'),
      h('div', { class: 'book-text colophon-text', lang: manifest.language ?? 'pl' }, renderBlocks(colophon.blocks, { assetBase: base })),
    ),
    collapseBottom,
  );

  const card = h('article', { class: 'book-card', 'aria-labelledby': titleId }, header, toggle, panel);
  const setExpanded = (expanded) => {
    card.classList.toggle('is-expanded', expanded);
    panel.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggleLabel.textContent = expanded ? 'Zwiń' : 'Rozwiń';
    toggleHint.hidden = expanded;
    storeExpanded(bookId, expanded);
  };
  header.addEventListener('click', () => setExpanded(panel.hidden));
  toggle.addEventListener('click', () => setExpanded(panel.hidden));
  collapseBottom.addEventListener('click', () => {
    setExpanded(false);
    card.scrollIntoView({ block: 'start' });
    toggle.focus({ preventScroll: true });
  });
  setExpanded(readExpanded().has(bookId));
  return card;
}

function progressText(state) {
  if (!state?.currentNode) return h('p', { class: 'progress muted' }, 'Gra jeszcze nie została rozpoczęta.');
  const place = nodeIdLabel(state.currentNode) ?? 'początek książki';
  const endings = state.endingsFound?.length ?? 0;
  // Rozgrywkę opisuje data i godzina rozpoczęcia — bez numerowania kolejnych gier (decyzja właściciela).
  const parts = [
    state.startedAt ? `Rozgrywka (data rozpoczęcia: ${formatDateTime(state.startedAt)})` : 'Rozgrywka',
    state.status === 'finished' ? 'zakończona' : `miejsce: ${place}`,
    `odkryte zakończenia: ${endings}`,
  ];
  return h(
    'p',
    { class: 'progress' },
    parts.join(' · '),
    state.updatedAt ? h('span', { class: 'muted' }, ` · ostatni zapis: ${formatDateTime(state.updatedAt)}`) : null,
    endings ? h('span', { class: 'visually-hidden' }, ` (${endings} ${plural(endings, ['zakończenie', 'zakończenia', 'zakończeń'])})`) : null,
  );
}
