// Ekran główny: opis aplikacji, logowanie, a po zalogowaniu — katalog książek z pełną atrybucją,
// ostrzeżeniem o treści i pełną stopką redakcyjną (AGENTS.md, rozdz. 1.2).
// Przed zalogowaniem nie pokazujemy treści ani okładek — gra jest tylko dla zalogowanych graczy.

import { h, formatDateTime, plural } from './dom.js';
import { renderBlocks } from './content-renderer.js';
import { bookInfoList, contentWarning, coverFigure } from './book-info.js';
import { activeBooks, bookBase, loadColophon, loadManifest } from '../data/book-loader.js';
import { LoginError } from '../data/storage-errors.js';
import { nodeIdLabel } from '../core/engine.js';

export async function renderHome(app, root) {
  const page = h('div', { class: 'home' });
  root.append(page);
  page.append(
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
      h('p', { class: 'muted' }, 'Aplikacja jest przeznaczona dla wąskiego grona graczy — konta zakłada administrator.'),
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
    page.append(loginForm(app));
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
  page.append(h('h2', { class: 'section-title' }, 'Książki'));
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
  const titleId = `book-${bookId}-title`;
  const hasGame = Boolean(state?.currentNode);
  const actions = h(
    'div',
    { class: 'actions' },
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
    h('a', { href: `#/o-ksiazce/${bookId}`, class: 'btn' }, 'O książce'),
  );
  return h(
    'article',
    { class: 'book-card', 'aria-labelledby': titleId },
    h(
      'div',
      { class: 'book-card-main' },
      coverFigure(manifest, base),
      h(
        'div',
        { class: 'book-card-details' },
        h('h3', { id: titleId, class: 'book-card-title' }, manifest.title),
        h('p', { class: 'book-card-author' }, manifest.authors.join(', ')),
        contentWarning(manifest),
        progressText(state),
        actions,
      ),
    ),
    bookInfoList(manifest),
    h(
      'section',
      { class: 'colophon', 'aria-labelledby': `${titleId}-colophon` },
      h('h4', { id: `${titleId}-colophon`, class: 'app-section-title' }, 'Stopka redakcyjna'),
      h('div', { class: 'book-text colophon-text', lang: manifest.language ?? 'pl' }, renderBlocks(colophon.blocks, { assetBase: base })),
    ),
  );
}

function progressText(state) {
  if (!state?.currentNode) return h('p', { class: 'progress muted' }, 'Gra jeszcze nie została rozpoczęta.');
  const place = nodeIdLabel(state.currentNode) ?? 'początek książki';
  const endings = state.endingsFound?.length ?? 0;
  const parts = [
    `Rozgrywka nr ${state.playthrough ?? 1}`,
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
