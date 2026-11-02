// Ekran gry: treść bieżącego węzła 1:1, przejścia, komunikaty mechaniki, „Cofnij”, panele
// (karta postaci, notatki, historia, zapisy, ustawienia) i „Nowa gra”.
// Komunikaty aplikacji są wizualnie oddzielone od tekstu książki; przyciski mają etykiety techniczne.

import { Game, nodeLabel } from '../core/engine.js';
import { describe } from '../core/conditions.js';
import { validateState } from '../core/state.js';
import { bookBase, isActiveBook, loadBook } from '../data/book-loader.js';
import { ConflictError } from '../data/storage-errors.js';
import { h, append, clear, formatDateTime, plural } from './dom.js';
import { coverInfo, renderBlocks } from './content-renderer.js';
import { alertDialog, confirmDialog, openDialog, promptDialog } from './dialogs.js';
import { FONT_SCALES, MODE_LABELS, THEME_LABELS, THEMES, stepFontScale } from './settings.js';

const UNDO_CAPTION = 'To Twoja gra :) Graj jak lubisz!'; // decyzja właściciela P5

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
  const endingNodes = content.order.filter((id) => content.nodes[id].ending);
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
    append(view, [
      gameBar(),
      toolbar(),
      noticesBox(),
      textArticle(),
      ambiguousNote(),
      finished ? endingBox() : choicesSection(),
      undoRow(),
      h('p', { class: 'mode-info muted small' }, `Tryb mechaniki: ${mode() === 'auto' ? 'automatyczny' : 'ręczny'}`, mechanics ? '' : ' (książka bez automatycznej mechaniki)'),
    ]);
    if (focusText) {
      window.scrollTo(0, 0);
      view.querySelector('.book-text')?.focus({ preventScroll: true });
    }
  }

  function gameBar() {
    const scaleIndex = FONT_SCALES.indexOf(app.settings.fontScale);
    return h(
      'div',
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
      game.state.modules.codewords ? h('button', { type: 'button', class: 'btn btn-small', onClick: openSheet }, 'Karta postaci') : null,
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
      if (notice.type === 'gain') items.push(`Zdobywasz Informację ${prefix}${notice.code} — zapisano na karcie postaci.`);
      if (notice.type === 'lose') items.push(`Tracisz Informację ${prefix}${notice.code} — usunięto z karty postaci.`);
    }
    if (!items.length) return null;
    return h(
      'div',
      { class: 'app-notice', role: 'status' },
      h('p', { class: 'app-notice-label' }, 'Komunikat aplikacji'),
      h('ul', {}, items.map((text) => h('li', {}, text))),
    );
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
    return h(
      'div',
      { class: 'app-notice app-notice-info', role: 'note' },
      h('p', { class: 'app-notice-label' }, 'Komunikat aplikacji'),
      h('p', {}, 'Wskazówki w tym miejscu można odczytać na więcej niż jeden sposób. Aplikacja nie podpowiada, '
        + 'którą drogę wybrać — zdecyduj według własnego odczytania tekstu.'),
      sorted.length
        ? h('p', {}, 'Twoja karta: ', sorted.map((code) => `Informacja ${prefix}${code} — ${game.hasCodeword(code) ? 'masz' : 'nie masz'}`).join('; '), '.')
        : null,
    );
  }

  function choicesSection() {
    const options = game.options();
    const totals = new Map();
    options.forEach((option) => totals.set(option.to, (totals.get(option.to) ?? 0) + 1));
    const seen = new Map();
    return h(
      'section',
      { class: 'choices', 'aria-labelledby': 'choices-title' },
      h('h2', { id: 'choices-title', class: 'choices-title' }, 'Dokąd dalej?'),
      options.length
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
        : h('p', { class: 'muted' }, 'Z tego miejsca nie prowadzi dalej żaden odnośnik.'),
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
    return h(
      'section',
      { class: 'ending-box', 'aria-labelledby': 'ending-title' },
      h('h2', { id: 'ending-title' }, 'Koniec tej drogi'),
      ending ? h('p', {}, 'Zakończenie: ', h('q', {}, ending.title)) : null,
      notice ? h('p', { class: 'ending-first' }, notice.first ? 'To zakończenie odkrywasz po raz pierwszy!' : 'To zakończenie odkryto już wcześniej.') : null,
      h('p', {}, `Odkryte zakończenia: ${found} z ${endingNodes.length}.`),
      h(
        'div',
        { class: 'actions' },
        h('button', { type: 'button', class: 'btn btn-primary', onClick: newGameDialog }, 'Zagraj ponownie'),
        h('button', { type: 'button', class: 'btn', onClick: openHistory }, 'Odkryte zakończenia'),
        h('a', { href: '#/', class: 'btn' }, 'Menu główne'),
      ),
    );
  }

  function undoRow() {
    return h(
      'div',
      { class: 'undo-row' },
      h('button', { type: 'button', class: 'btn', disabled: !game.canUndo, onClick: undoMove }, 'Cofnij'),
      h('span', { class: 'undo-caption' }, UNDO_CAPTION),
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
          `Według Twojej karty postaci ta droga nie spełnia warunku: ${describe(option.condition)}.`,
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
      title: `Karta postaci — ${codewordsModule?.label ?? 'Informacje'}`,
      wide: true,
      body: [
        h('p', {}, mode() === 'auto'
          ? 'Zdobyte Informacje są zaznaczane automatycznie.'
          : 'Tryb ręczny: zaznaczaj zdobyte Informacje samodzielnie, jak na kartce papieru.'),
        h('p', { class: 'muted small' }, 'Kliknij numer, aby go zaznaczyć lub odznaczyć. Ręcznych zmian na karcie nie cofa przycisk „Cofnij”.'),
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
        h('h3', {}, `Bieżąca rozgrywka (nr ${game.state.playthrough})`),
        h('ol', { class: 'history-list' }, history.map((id) => h('li', {}, nodeLabel(content, id)))),
        h('h3', {}, `Odkryte zakończenia: ${found.length} z ${endingNodes.length}`),
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
      playthrough: state.playthrough,
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
      ],
    });
  }

  return async () => {
    disposed = true;
    window.removeEventListener('pagehide', onPageHide);
    await flushSave();
  };
}
