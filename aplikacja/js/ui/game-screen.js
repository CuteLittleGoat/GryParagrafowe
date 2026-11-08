// Ekran gry: treść bieżącego węzła 1:1, przejścia, komunikaty mechaniki, „Cofnij”, panele
// (karta postaci / zdobyte Informacje, notatki, historia, zapisy, ustawienia) i „Nowa gra”.
// Komunikaty aplikacji są wizualnie oddzielone od tekstu książki; przyciski mają etykiety techniczne.
//
// Układ HTML ekranu gry (w drzewie strony opisany komentarzami po polsku — F12 → „Zbadaj”):
//   <header class="game-bar">        pasek: „Menu główne”, tytuł i autor (atrybucja), A−/A+, stan zapisu
//   <nav class="game-tools">         narzędzia: Informacje / Karta postaci, Notatki, Historia, Zapisy…
//   <aside class="app-notices">      komunikaty aplikacji (np. „Zdobywasz Informację #19.”)
//   <article class="book-text">      TEKST KSIĄŻKI — wyłącznie treść 1:1, bez komentarzy i dopisków
//   <aside class="ambiguous-note">   komunikat o niejednoznacznych wskazówkach
//   <nav class="choices">            „Dokąd dalej?”: przejścia i „Cofnij” (albo <aside class="ending-area">)
//   <footer class="game-footer">     informacja o trybie mechaniki
// Znaczniki zgodne z rolą elementów pomagają czytnikom ekranu i funkcjom czytania na głos w
// przeglądarkach odróżnić tekst paragrafu od przycisków i komunikatów aplikacji (Chrome „Tryb czytania”
// pomija nav, aside i footer; Firefox „Widok czytnika” usuwa aside i footer). Aplikacja nie ma własnego
// lektora — czyta przeglądarka gracza (decyzja D54; Analizy/Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md).

import { Game, nodeLabel } from '../core/engine.js';
import { describe } from '../core/conditions.js';
import { validateState } from '../core/state.js';
import { bookBase, isActiveBook, loadBook } from '../data/book-loader.js';
import { ConflictError } from '../data/storage-errors.js';
import { h, append, clear, formatDateTime, htmlComment, plural } from './dom.js';
import { coverInfo, renderBlocks } from './content-renderer.js';
import { alertDialog, confirmDialog, openDialog, promptDialog } from './dialogs.js';
import { openInstructions } from './instructions.js';
import { FONT_SCALES, MODE_LABELS, THEME_LABELS, THEMES, stepFontScale } from './settings.js';

// Dopisek przy „Cofnij” (decyzja właściciela P5) — w dwóch linijkach, równo pod przyciskiem.
const UNDO_CAPTION_LINES = ['To Twoja gra :)', 'Graj jak lubisz!'];

export async function renderGame(app, root, bookId) {
  if (!(await isActiveBook(bookId)) || !app.isBookEnabled(bookId)) {
    root.append(h('section', { class: 'panel' }, h('h1', {}, 'Nie znaleziono książki'), h('p', {}, h('a', { href: '#/', class: 'btn' }, 'Menu główne'))));
    return null;
  }
  const loading = h('p', { class: 'loading', role: 'status' }, 'Wczytywanie książki…');
  root.append(loading);
  const book = await loadBook(bookId);
  const { manifest, content, mechanics } = book;
  const base = bookBase(bookId);
  const cover = coverInfo(manifest);
  const codewordsModule = mechanics?.modules?.codewords ?? null;
  const prefix = codewordsModule?.prefix ?? '#';
  // Nazwy przycisku i okna z mechaniki książki (np. „Vae Victis”: „Informacje” / „Zdobyte Informacje”);
  // książki bez własnych nazw — „Karta postaci”.
  const sheetButtonLabel = codewordsModule?.buttonLabel ?? 'Karta postaci';
  const sheetTitle = codewordsModule?.panelTitle ?? `Karta postaci — ${codewordsModule?.label ?? 'Informacje'}`;
  // Liczbę wszystkich zakończeń podajemy tylko wtedy, gdy podaje ją Wydawca w opisie książki
  // (manifest.announcedEndings) — liczby policzonej przez nas z treści nie ujawniamy (decyzja właściciela,
  // D60): „Odkryte zakończenia: 1”, a przy liczbie od Wydawcy — „Odkryte zakończenia: 1 z 25”.
  const announcedEndings = Number.isInteger(manifest.announcedEndings?.count) && manifest.announcedEndings.count > 0
    ? manifest.announcedEndings.count
    : null;
  const endingsLabel = (found) => `Odkryte zakończenia: ${found}${announcedEndings ? ` z ${announcedEndings}` : ''}`;
  app.setTitle(manifest.title);

  const mode = () => (mechanics ? app.settings.mechanicsMode : 'manual');
  const view = h('div', { class: 'game' });
  let saveTimer = null;
  let saving = Promise.resolve();
  let pendingSaves = 0;
  let saveStatus = '';
  let disposed = false;
  let game = null;
  game = await openGame();
  let lastNotices = game.notices;

  loading.replaceWith(view);
  render();

  const onPageHide = () => flushSave();
  window.addEventListener('pagehide', onPageHide);
  if (app.pendingNewGame === bookId) {
    app.pendingNewGame = null;
    queueMicrotask(() => newGameDialog());
  }

  // --- wczytanie / utworzenie stanu ----------------------------------------------------------

  async function openGame() {
    const stored = await app.storage.loadBookState(bookId);
    if (stored) {
      const problems = stored.bookId === bookId ? validateState(stored, content) : ['inna książka'];
      if (!problems.length) return new Game({ content, mechanics, manifest, state: stored, mode: mode() });
      console.warn('Zapisany stan nie pasuje do treści:', problems);
      await alertDialog({
        title: 'Nowa gra',
        message: 'Zapisany stan gry nie pasuje do obecnej wersji książki, więc gra zaczyna się od początku. '
          + 'Odkryte zakończenia i notatki zostają.',
      });
    }
    const previous = stored && Array.isArray(stored.endingsFound) ? stored : null;
    const created = Game.newGame({ content, mechanics, manifest, previous, keepNotes: true, mode: mode(), now: new Date() });
    // Nowy stan zastępuje zapisany — z tym samym numerem wersji, żeby nie wywołać konfliktu zapisu.
    created.state.revision = Number.isInteger(stored?.revision) ? stored.revision : 0;
    await persist(created);
    return created;
  }

  // --- zapis ------------------------------------------------------------------------------------

  // Zwraca true, gdy zapis się udał (konflikt i błąd same ustawiają komunikat).
  async function persist(target = game, { force = false } = {}) {
    try {
      await app.storage.saveBookState(bookId, target.state, { force });
      return true;
    } catch (error) {
      if (error instanceof ConflictError) {
        await resolveConflict(error);
      } else {
        console.error(error);
        setSaveStatus('Błąd zapisu — spróbuj ponownie', true);
      }
      return false;
    }
  }

  // Zapisy wykonują się po kolei; „Zapisano” pojawia się dopiero, gdy w kolejce nic już nie czeka.
  function enqueueSave() {
    pendingSaves += 1;
    saving = saving.then(async () => {
      const ok = await persist();
      pendingSaves -= 1;
      if (ok && pendingSaves === 0 && !saveTimer) setSaveStatus('Zapisano');
    });
    return saving;
  }

  function queueSave({ delay = 0 } = {}) {
    setSaveStatus('Zapisywanie…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      enqueueSave();
    }, delay);
  }

  function flushSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
      enqueueSave();
    }
    return saving;
  }

  async function resolveConflict(error) {
    const choice = await openDialog({
      title: 'Postęp zmienił się w innym miejscu',
      body: [
        h('p', {}, 'Ta książka została w międzyczasie zapisana w innym oknie lub na innym urządzeniu.'),
        h('p', {}, 'Możesz wczytać tamten (nowszy) stan albo zastąpić go stanem z tego okna.'),
      ],
      actions: [
        { id: 'load', label: 'Wczytaj nowszy stan', kind: 'primary' },
        { id: 'overwrite', label: 'Zastąp stanem z tego okna' },
      ],
    });
    if (choice === 'overwrite') {
      await app.storage.saveBookState(bookId, game.state, { force: true });
      setSaveStatus('Zapisano');
      return;
    }
    const newer = error.newer;
    if (newer && !validateState(newer, content).length) {
      game = new Game({ content, mechanics, manifest, state: newer, mode: mode() });
      lastNotices = [];
      if (!disposed) render({ focusText: true });
      setSaveStatus('Wczytano nowszy stan');
    }
  }

  function setSaveStatus(text, isError = false) {
    saveStatus = text;
    const element = view.querySelector('.save-status');
    if (element) {
      element.textContent = text;
      element.classList.toggle('is-error', isError);
      element.setAttribute('role', isError ? 'alert' : 'status');
    }
  }

  // --- widok ------------------------------------------------------------------------------------

  function render({ focusText = false } = {}) {
    game.mode = mode();
    clear(view);
    const finished = game.state.status === 'finished';
    // append() z dom.js pomija puste elementy (null) — natywne Element.append wstawiłoby tekst „null”.
    // Komentarze HTML stoją przed częściami ekranu, nigdy wewnątrz tekstu książki.
    append(view, [
      htmlComment('Pasek gry: „Menu główne”, tytuł i autor książki (atrybucja), wielkość tekstu, stan zapisu.'),
      gameBar(),
      htmlComment('Narzędzia gry: panele (Informacje / Karta postaci, Notatki, Historia, Zapisy, Ustawienia), „O książce”, „Nowa gra”.'),
      toolbar(),
      noticesBox(),
      htmlComment('TEKST KSIĄŻKI — bez żadnych zmian (1:1). Jedyny fragment ekranu przeznaczony do czytania na głos.'),
      textArticle(),
      htmlComment('Koniec tekstu książki.'),
      ambiguousNote(),
      finished ? endingSection() : choicesSection(),
      htmlComment('Informacja o trybie mechaniki (automatyczny albo ręczny — zmiana w „Ustawieniach”).'),
      modeFooter(),
    ]);
    if (focusText) {
      window.scrollTo(0, 0);
      view.querySelector('.book-text')?.focus({ preventScroll: true });
    }
  }

  // Pasek gry jako <header> (nagłówek ekranu gry). Tytuł i autor są tu zawsze widoczne (N1, Z7).
  function gameBar() {
    const scaleIndex = FONT_SCALES.indexOf(app.settings.fontScale);
    return h(
      'header',
      { class: 'game-bar' },
      h('a', { href: '#/', class: 'btn btn-small' }, 'Menu główne'),
      h(
        'div',
        { class: 'game-bar-title' },
        h('h1', { class: 'game-book-title' }, manifest.title),
        h('span', { class: 'game-book-author' }, manifest.authors.join(', ')),
      ),
      h(
        'div',
        { class: 'font-buttons', role: 'group', 'aria-label': 'Wielkość tekstu' },
        h('button', { type: 'button', class: 'btn btn-small', 'aria-label': 'Pomniejsz tekst', title: 'Pomniejsz tekst', disabled: scaleIndex <= 0, onClick: () => changeFont(-1) }, 'A−'),
        h('button', { type: 'button', class: 'btn btn-small', 'aria-label': 'Powiększ tekst', title: 'Powiększ tekst', disabled: scaleIndex >= FONT_SCALES.length - 1, onClick: () => changeFont(1) }, 'A+'),
      ),
      h('span', { class: 'save-status', role: 'status' }, saveStatus),
    );
  }

  function toolbar() {
    return h(
      'nav',
      { class: 'game-tools', 'aria-label': 'Narzędzia gry' },
      game.state.modules.codewords ? h('button', { type: 'button', class: 'btn btn-small', onClick: openSheet }, sheetButtonLabel) : null,
      h('button', { type: 'button', class: 'btn btn-small', onClick: openNotes }, 'Notatki'),
      h('button', { type: 'button', class: 'btn btn-small', onClick: openHistory }, 'Historia'),
      h('button', { type: 'button', class: 'btn btn-small', onClick: openSaves }, 'Zapisy'),
      h('button', { type: 'button', class: 'btn btn-small', onClick: openSettings }, 'Ustawienia'),
      h('a', { href: `#/o-ksiazce/${bookId}`, class: 'btn btn-small' }, 'O książce'),
      h('button', { type: 'button', class: 'btn btn-small', onClick: newGameDialog }, 'Nowa gra'),
    );
  }

  function noticesBox() {
    const items = [];
    if (book.mechanicsProblem) items.push(book.mechanicsProblem);
    for (const notice of lastNotices) {
      if (notice.type === 'gain') items.push(`Zdobywasz Informację ${prefix}${notice.code}.`);
      if (notice.type === 'lose') items.push(`Tracisz Informację ${prefix}${notice.code}.`);
    }
    if (!items.length) return null;
    // <aside> — treść poboczna względem tekstu książki; wewnątrz obszar role="status", żeby czytniki
    // ekranu ogłaszały komunikat.
    return [
      htmlComment('Komunikaty aplikacji — nie są częścią książki.'),
      h(
        'aside',
        { class: 'app-notices', 'aria-label': 'Komunikaty aplikacji' },
        h(
          'div',
          { class: 'app-notice', role: 'status' },
          h('p', { class: 'app-notice-label' }, 'Komunikat aplikacji'),
          h('ul', {}, items.map((text) => h('li', {}, text))),
        ),
      ),
    ];
  }

  function conditionState(option) {
    if (game.mode !== 'auto' || !option.condition || game.ambiguous) return null;
    return option.met ? 'met' : 'unmet';
  }

  function textArticle() {
    const options = new Map(game.options().map((option) => [option.id, option]));
    return h(
      'article',
      { class: 'book-text game-text', tabindex: '-1', lang: manifest.language ?? 'pl', 'aria-label': `Tekst książki: ${nodeLabel(content, game.nodeId)}` },
      renderBlocks(game.node.blocks, {
        assetBase: base,
        cover,
        linkHref: () => `#/gra/${bookId}`,
        linkProps: (link) => {
          const state = options.has(link.id) ? conditionState(options.get(link.id)) : null;
          return state ? { class: `book-link is-${state}` } : {};
        },
        onLink: (link) => chooseLink(link.id),
      }),
    );
  }

  function ambiguousNote() {
    if (game.mode !== 'auto' || !game.ambiguous) return null;
    const codes = new Set();
    const collect = (condition) => {
      if (!condition) return;
      if (condition.has) codes.add(condition.has);
      if (condition.notHas) codes.add(condition.notHas);
      for (const key of ['all', 'any']) condition[key]?.forEach(collect);
      if (condition.not) collect(condition.not);
    };
    game.options().forEach((option) => collect(option.condition));
    const sorted = [...codes].sort((a, b) => Number(a) - Number(b));
    return [
      htmlComment('Komunikat aplikacji o niejednoznacznych wskazówkach (aplikacja nie podpowiada drogi).'),
      h(
        'aside',
        { class: 'ambiguous-note', 'aria-label': 'Komunikat aplikacji o wskazówkach' },
        h(
          'div',
          { class: 'app-notice app-notice-info', role: 'note' },
          h('p', { class: 'app-notice-label' }, 'Komunikat aplikacji'),
          h('p', {}, 'Wskazówki w tym miejscu można odczytać na więcej niż jeden sposób. Aplikacja nie podpowiada, '
            + 'którą drogę wybrać — zdecyduj według własnego odczytania tekstu.'),
          sorted.length
            ? h('p', {}, 'Informacje wymienione w tym miejscu: ', sorted.map((code) => `${prefix}${code} — ${game.hasCodeword(code) ? 'masz' : 'nie masz'}`).join('; '), '.')
            : null,
        ),
      ),
    ];
  }

  function choicesSection() {
    const options = game.options();
    const totals = new Map();
    options.forEach((option) => totals.set(option.to, (totals.get(option.to) ?? 0) + 1));
    const seen = new Map();
    // Dwie kolumny: po lewej przejścia „Przejdź do…”, po prawej „Cofnij” z dopiskiem (decyzja właściciela).
    const list = options.length
        ? h('ul', { class: 'choice-list' }, options.map((option) => {
          const index = (seen.get(option.to) ?? 0) + 1;
          seen.set(option.to, index);
          const total = totals.get(option.to);
          const label = goToLabel(option.to) + (total > 1 ? ` (odnośnik ${index} z ${total})` : '');
          const state = conditionState(option);
          const descriptionId = `cond-${option.id}`;
          const highlight = (on) => view.querySelector(`.book-link[data-link-id="${option.id}"]`)?.classList.toggle('is-target', on);
          return h(
            'li',
            { class: `choice${state ? ` choice-${state}` : ''}` },
            h('button', {
              type: 'button',
              class: 'btn btn-choice',
              'aria-describedby': state ? descriptionId : null,
              onClick: () => chooseLink(option.id),
              onMouseenter: () => highlight(true),
              onMouseleave: () => highlight(false),
              onFocus: () => highlight(true),
              onBlur: () => highlight(false),
            }, label),
            state
              ? h('span', { id: descriptionId, class: 'choice-condition' },
                h('span', { 'aria-hidden': 'true' }, state === 'met' ? '✓ ' : '✗ '),
                `Warunek: ${describe(option.condition)} — ${state === 'met' ? 'spełniony' : 'niespełniony'}`)
              : null,
          );
        }))
        : h('p', { class: 'muted' }, 'Z tego miejsca nie prowadzi dalej żaden odnośnik.');
    // <nav> — przejścia między paragrafami to nawigacja (czytniki ekranu: obszar „Dokąd dalej?”).
    return [
      htmlComment('Dokąd dalej? Przejścia do kolejnych paragrafów (etykiety techniczne) i „Cofnij”.'),
      h(
        'nav',
        { class: 'choices', 'aria-labelledby': 'choices-title' },
        h('h2', { id: 'choices-title', class: 'choices-title' }, 'Dokąd dalej?'),
        h('div', { class: 'choices-layout' }, h('div', { class: 'choices-main' }, list), undoBlock()),
      ),
    ];
  }

  // Zakończenie: ramka „Koniec tej drogi” po lewej, „Cofnij” po prawej (na telefonie — pod ramką).
  // <aside> — informacja aplikacji o zakończeniu, poza tekstem książki.
  function endingSection() {
    return [
      htmlComment('Koniec tej drogi: informacja o zakończeniu, odkryte zakończenia, „Zagraj ponownie”, „Cofnij”.'),
      h(
        'aside',
        { class: 'ending-area', 'aria-labelledby': 'ending-title' },
        h('div', { class: 'choices-layout ending-layout' }, endingBox(), undoBlock()),
      ),
    ];
  }

  // Stopka ekranu gry (<footer>): informacja o trybie mechaniki.
  function modeFooter() {
    return h(
      'footer',
      { class: 'game-footer' },
      h('p', { class: 'mode-info muted small' }, `Tryb mechaniki: ${mode() === 'auto' ? 'automatyczny' : 'ręczny'}`, mechanics ? '' : ' (książka bez automatycznej mechaniki)'),
    );
  }

  function goToLabel(nodeId) {
    const node = content.nodes[nodeId];
    const label = nodeLabel(content, nodeId);
    return node?.kind === 'front' ? `Przejdź do: ${label}` : `Przejdź do ${label}`;
  }

  function endingBox() {
    const ending = game.node.ending;
    const notice = lastNotices.find((item) => item.type === 'ending');
    const found = game.state.endingsFound.length;
    // Nazwę obszaru („Koniec tej drogi”) nadaje otaczający <aside class="ending-area">.
    return h(
      'div',
      { class: 'ending-box' },
      h('h2', { id: 'ending-title' }, 'Koniec tej drogi'),
      ending ? h('p', {}, 'Zakończenie: ', h('q', {}, ending.title)) : null,
      notice ? h('p', { class: 'ending-first' }, notice.first ? 'To zakończenie odkrywasz po raz pierwszy!' : 'To zakończenie odkryto już wcześniej.') : null,
      h('p', {}, `${endingsLabel(found)}.`),
      h(
        'div',
        { class: 'actions' },
        h('button', { type: 'button', class: 'btn btn-primary', onClick: newGameDialog }, 'Zagraj ponownie'),
        h('button', { type: 'button', class: 'btn', onClick: openHistory }, 'Odkryte zakończenia'),
        h('a', { href: '#/', class: 'btn' }, 'Menu główne'),
      ),
    );
  }

  function undoBlock() {
    return h(
      'div',
      { class: 'undo-block' },
      h('button', { type: 'button', class: 'btn undo-button', disabled: !game.canUndo, onClick: undoMove }, 'Cofnij'),
      h('p', { class: 'undo-caption' }, `${UNDO_CAPTION_LINES[0]} `, h('br'), UNDO_CAPTION_LINES[1]),
    );
  }

  // --- akcje ------------------------------------------------------------------------------------

  async function chooseLink(linkId) {
    const option = game.options().find((item) => item.id === linkId);
    if (!option) return;
    if (conditionState(option) === 'unmet') {
      const confirmed = await confirmDialog({
        title: 'Warunek niespełniony',
        message: [
          `Ta droga nie spełnia warunku: ${describe(option.condition)}.`,
          'Możesz mimo to przejść dalej — wybór należy do Ciebie.',
        ],
        confirmLabel: goToLabel(option.to),
        cancelLabel: 'Zostań tutaj',
      });
      if (!confirmed) return;
    }
    lastNotices = game.choose(linkId);
    render({ focusText: true });
    queueSave();
  }

  function undoMove() {
    if (!game.undo()) return;
    lastNotices = [];
    render({ focusText: true });
    queueSave();
  }

  async function changeFont(direction) {
    await app.updateSettings({ fontScale: stepFontScale(app.settings.fontScale, direction) });
    const bar = view.querySelector('.game-bar');
    bar?.replaceWith(gameBar());
  }

  async function newGameDialog() {
    const hasNotes = game.state.notes.trim().length > 0;
    const choice = await openDialog({
      title: 'Nowa gra',
      body: [
        h('p', {}, 'Gra zacznie się od początku książki. Odkryte zakończenia i ręczne zapisy zostaną.'),
        hasNotes ? h('p', {}, 'Co zrobić z Twoimi notatkami?') : null,
      ],
      actions: hasNotes
        ? [
          { id: 'keep', label: 'Nowa gra — zachowaj notatki', kind: 'primary' },
          { id: 'clear', label: 'Nowa gra — wyczyść notatki' },
          { id: 'cancel', label: 'Anuluj' },
        ]
        : [
          { id: 'keep', label: 'Rozpocznij od nowa', kind: 'primary' },
          { id: 'cancel', label: 'Anuluj' },
        ],
    });
    if (choice !== 'keep' && choice !== 'clear') return;
    await flushSave();
    game = Game.newGame({ content, mechanics, manifest, previous: game.state, keepNotes: choice === 'keep', mode: mode(), now: new Date() });
    lastNotices = game.notices;
    render({ focusText: true });
    queueSave();
  }

  // --- panele -----------------------------------------------------------------------------------

  function openSheet() {
    const values = codewordsModule?.values ?? [];
    const summary = h('p', { class: 'muted' });
    const grid = h('div', { class: 'codeword-grid', role: 'group', 'aria-label': codewordsModule?.label ?? 'Informacje' });
    const fill = () => {
      clear(grid);
      const owned = values.filter((code) => game.hasCodeword(code)).length;
      summary.textContent = `Masz ${owned} z ${values.length} ${plural(values.length, ['Informacji', 'Informacji', 'Informacji'])}.`;
      for (const code of values) {
        const has = game.hasCodeword(code);
        grid.append(h('button', {
          type: 'button',
          class: `codeword${has ? ' is-owned' : ''}`,
          'aria-pressed': has ? 'true' : 'false',
          'aria-label': `Informacja ${prefix}${code}`,
          onClick: () => {
            game.setCodeword(code, !has);
            fill();
            grid.querySelector(`[aria-label="Informacja ${prefix}${code}"]`)?.focus();
            queueSave();
          },
        }, `${prefix}${code}`));
      }
    };
    fill();
    openDialog({
      title: sheetTitle,
      wide: true,
      body: [
        h('p', {}, mode() === 'auto'
          ? 'Zdobyte Informacje są zaznaczane automatycznie.'
          : 'Tryb ręczny: zaznaczaj zdobyte Informacje samodzielnie, jak na kartce papieru.'),
        h('p', { class: 'muted small' }, 'Kliknij numer, aby go zaznaczyć lub odznaczyć. Ręcznych zmian nie cofa przycisk „Cofnij”.'),
        summary,
        grid,
      ],
    }).then(() => render());
  }

  function openNotes() {
    const textarea = h('textarea', { class: 'notes-input', rows: '12', 'aria-label': 'Notatki' });
    textarea.value = game.state.notes;
    textarea.addEventListener('input', () => {
      game.setNotes(textarea.value);
      queueSave({ delay: 800 });
    });
    openDialog({
      title: 'Notatki',
      wide: true,
      body: [h('p', { class: 'muted small' }, 'Twoja kartka do tej książki. Notatki zapisują się automatycznie.'), textarea],
      onOpen: () => textarea.focus(),
    }).then(() => flushSave());
  }

  function openHistory() {
    const history = game.state.history;
    const found = game.state.endingsFound;
    openDialog({
      title: 'Historia i zakończenia',
      wide: true,
      body: [
        h('h3', {}, game.state.startedAt ? `Bieżąca rozgrywka (data rozpoczęcia: ${formatDateTime(game.state.startedAt)})` : 'Bieżąca rozgrywka'),
        h('ol', { class: 'history-list' }, history.map((id) => h('li', {}, nodeLabel(content, id)))),
        h('h3', {}, endingsLabel(found.length)),
        found.length
          ? h('ul', { class: 'endings-list' }, found.map((id) => h('li', {}, `${nodeLabel(content, id)} — `, h('q', {}, content.nodes[id]?.ending?.title ?? ''))))
          : h('p', { class: 'muted' }, 'Jeszcze żadnego.'),
      ],
    });
  }

  function snapshot() {
    const state = game.state;
    return JSON.parse(JSON.stringify({
      schemaVersion: state.schemaVersion,
      bookId: state.bookId,
      contentVersion: state.contentVersion,
      status: state.status,
      currentNode: state.currentNode,
      history: state.history,
      visits: state.visits,
      modules: state.modules,
      notes: state.notes,
      undo: state.undo,
      startedAt: state.startedAt,
    }));
  }

  async function openSaves() {
    let panel = null;
    const list = h('ul', { class: 'save-list' });
    const refresh = async () => {
      const saves = await app.storage.listSaves(bookId);
      clear(list);
      saves.forEach((save, index) => list.append(saveSlot(save, index + 1)));
    };
    const saveSlot = (save, number) => h(
      'li',
      { class: 'save-slot' },
      h(
        'div',
        { class: 'save-info' },
        h('strong', {}, `Miejsce ${number}`),
        save.empty
          ? h('span', { class: 'muted' }, ' — puste')
          : h('span', {}, ` — ${save.label} · ${nodeLabel(content, save.state?.currentNode)} · ${formatDateTime(save.createdAt)}`),
      ),
      h(
        'div',
        { class: 'save-actions' },
        h('button', { type: 'button', class: 'btn btn-small', onClick: () => writeSlot(save, number) }, 'Zapisz tutaj'),
        save.empty ? null : h('button', { type: 'button', class: 'btn btn-small', onClick: () => loadSlot(save) }, 'Wczytaj'),
        save.empty ? null : h('button', { type: 'button', class: 'btn btn-small btn-quiet', onClick: () => deleteSlot(save, number) }, 'Usuń'),
      ),
    );
    const writeSlot = async (save, number) => {
      if (!save.empty && !(await confirmDialog({ title: 'Zastąpić zapis?', message: `Miejsce ${number} zawiera zapis „${save.label}”. Zastąpić go bieżącym stanem gry?`, confirmLabel: 'Zastąp' }))) return;
      const label = await promptDialog({ title: `Zapis — miejsce ${number}`, label: 'Nazwa zapisu', value: save.empty ? `Zapis ${number}` : save.label });
      if (label === null) return;
      try {
        await app.storage.writeSave(bookId, save.saveId, { label: label || `Zapis ${number}`, state: snapshot() });
      } catch (error) {
        console.error(error);
        await alertDialog({ title: 'Błąd zapisu', message: 'Nie udało się zapisać gry. Spróbuj ponownie.' });
      }
      await refresh();
    };
    const loadSlot = async (save) => {
      const restoreNotes = h('input', { type: 'checkbox' });
      const choice = await openDialog({
        title: 'Wczytać zapis?',
        body: [
          h('p', {}, `Bieżąca rozgrywka zostanie zastąpiona zapisem „${save.label}”. Odkryte zakończenia zostaną.`),
          h('label', { class: 'checkbox' }, restoreNotes, ' Przywróć także notatki z tego zapisu (obecne notatki zostaną zastąpione)'),
        ],
        actions: [
          { id: 'load', label: 'Wczytaj', kind: 'primary' },
          { id: 'cancel', label: 'Anuluj' },
        ],
      });
      if (choice !== 'load') return;
      const saved = save.state ?? {};
      const next = {
        ...game.state,
        ...JSON.parse(JSON.stringify(saved)),
        bookId,
        endingsFound: game.state.endingsFound,
        revision: game.state.revision,
        notes: restoreNotes.checked ? saved.notes ?? '' : game.state.notes,
        undo: Array.isArray(saved.undo) ? JSON.parse(JSON.stringify(saved.undo)) : [],
        updatedAt: game.state.updatedAt,
      };
      const problems = validateState(next, content);
      if (problems.length) {
        await alertDialog({ title: 'Nie można wczytać', message: 'Ten zapis nie pasuje do obecnej wersji książki.' });
        return;
      }
      game = new Game({ content, mechanics, manifest, state: next, mode: mode() });
      lastNotices = [];
      panel?.close();
      render({ focusText: true });
      queueSave();
    };
    const deleteSlot = async (save, number) => {
      if (!(await confirmDialog({ title: 'Usunąć zapis?', message: `Usunąć zapis „${save.label}” z miejsca ${number}?`, confirmLabel: 'Usuń', danger: true }))) return;
      await app.storage.deleteSave(bookId, save.saveId);
      await refresh();
    };
    await openDialog({
      title: 'Zapisy',
      wide: true,
      body: [
        h('p', {}, 'Gra zapisuje się automatycznie po każdym ruchu. Masz też 3 miejsca na własne zapisy — możesz do nich wrócić w dowolnej chwili.'),
        list,
      ],
      onOpen: (dialog) => {
        panel = dialog;
        refresh();
      },
    });
  }

  function openSettings() {
    const radioGroup = (name, legend, values, labels, current, onChange, disabled = false) => h(
      'fieldset',
      { class: 'fieldset' },
      h('legend', {}, legend),
      values.map((value) => h(
        'label',
        { class: 'radio' },
        h('input', {
          type: 'radio',
          name,
          value,
          checked: value === current,
          disabled,
          onChange: () => onChange(value),
        }),
        ` ${labels[value]}`,
      )),
    );
    const scaleText = h('span', { class: 'scale-value' });
    const updateScale = () => {
      scaleText.textContent = `${Math.round(app.settings.fontScale * 100)}%`;
    };
    updateScale();
    openDialog({
      title: 'Ustawienia',
      wide: true,
      body: [
        radioGroup('theme', 'Motyw', THEMES, THEME_LABELS, app.settings.theme, (theme) => app.updateSettings({ theme })),
        h(
          'fieldset',
          { class: 'fieldset' },
          h('legend', {}, 'Wielkość tekstu'),
          h('div', { class: 'scale-row' },
            h('button', { type: 'button', class: 'btn btn-small', 'aria-label': 'Pomniejsz tekst', onClick: async () => { await changeFont(-1); updateScale(); } }, 'A−'),
            scaleText,
            h('button', { type: 'button', class: 'btn btn-small', 'aria-label': 'Powiększ tekst', onClick: async () => { await changeFont(1); updateScale(); } }, 'A+')),
        ),
        radioGroup(
          'mechanicsMode',
          'Tryb mechaniki',
          ['auto', 'manual'],
          MODE_LABELS,
          mode(),
          async (mechanicsMode) => {
            await app.updateSettings({ mechanicsMode });
            render();
          },
          !mechanics,
        ),
        // Instrukcja otwiera się nad oknem „Ustawienia”; po jej zamknięciu wracasz do ustawień.
        h(
          'fieldset',
          { class: 'fieldset' },
          h('legend', {}, 'Instrukcja'),
          h('p', { class: 'muted small' }, 'Jak grać, co robią przyciski i ustawienia oraz jak aplikacja obsługuje mechanikę tej książki.'),
          h('button', { type: 'button', class: 'btn btn-small', onClick: () => openInstructions({ manifest, mechanics, content }) }, 'Instrukcja'),
        ),
      ],
    });
  }

  return async () => {
    disposed = true;
    window.removeEventListener('pagehide', onPageHide);
    await flushSave();
  };
}
