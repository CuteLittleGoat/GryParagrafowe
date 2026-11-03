// Test dymny aplikacji w przeglądarce (Playwright + Chromium) — tryb lokalny (localhost).
// Uruchomienie (z katalogu głównego repozytorium, w dwóch terminalach):
//   python3 -m http.server 8765
//   node testy/e2e/test-dymny.cjs
// Zmienne: BASE (adres aplikacji, domyślnie http://localhost:8765/), SHOTS (katalog zrzutów ekranu,
// domyślnie katalog tymczasowy systemu — zrzuty nie trafiają do repozytorium).
const { chromium } = require('playwright');
const os = require('os');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8765/';
const OUT = process.env.SHOTS || path.join(os.tmpdir(), 'gryparagrafowe-e2e');
const results = [];
const errors = [];

function check(name, condition, details = '') {
  results.push({ name, ok: Boolean(condition), details });
  console.log(`${condition ? 'OK  ' : 'BŁĄD'} ${name}${details ? ` — ${details}` : ''}`);
}

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, locale: 'pl-PL' });
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`${msg.type()}: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()}`));

  // Układ „Dokąd dalej?”: przejścia po lewej, „Cofnij” po prawej (na tej samej wysokości).
  const undoOnRight = (target) => target.evaluate(() => {
    const list = document.querySelector('.choices-main').getBoundingClientRect();
    const undo = document.querySelector('.undo-block').getBoundingClientRect();
    return undo.left >= list.right - 1 && Math.abs(undo.top - list.top) < 5;
  });

  // Czytanie na głos (Analizy/Odczyt_Na_Glos_W_Przegladarce_2026-11-03.md): poza tekstem książki
  // (<article class="book-text">) akapity, nagłówki i punkty list mogą stać tylko w nav, aside, footer,
  // przyciskach i oknach — wtedy Chrome „Tryb czytania” czyta sam tekst i tytuł książki z paska gry.
  const onlyTitleOutsideText = async (target, label) => {
    const outside = await target.$$eval('main p, main h1, main h2, main h3, main li, main [role=note]', (els) => els
      .filter((el) => !el.closest('article.book-text, nav, aside, footer, button, dialog'))
      .map((el) => `${el.tagName.toLowerCase()}: ${el.textContent.replace(/\s+/g, ' ').trim()}`));
    check(`${label}: poza tekstem książki tylko tytuł (czytanie na głos)`, outside.length === 1 && outside[0].startsWith('h1: '), JSON.stringify(outside));
  };

  // Komentarze HTML po polsku wstawiane przez aplikację — i żadnego wewnątrz tekstu książki.
  const commentsIn = (target, rootSelector) => target.evaluate((selector) => {
    const root = document.querySelector(selector);
    const comments = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) comments.push(walker.currentNode.data.trim());
    const inBookText = [...root.querySelectorAll('.book-text')]
      .some((el) => document.createTreeWalker(el, NodeFilter.SHOW_COMMENT).nextNode() !== null);
    return { comments, inBookText };
  }, rootSelector);

  // 1. Ekran logowania
  await page.goto(BASE);
  await page.waitForSelector('form.login-panel');
  check('ekran logowania widoczny', await page.isVisible('text=Logowanie'));
  check('baner trybu lokalnego', await page.isVisible('.dev-banner'));
  check('brak okładki przed zalogowaniem', (await page.locator('.book-card').count()) === 0);
  check('stopka aplikacji', (await page.textContent('.app-footer')).includes('nieoficjalny i niekomercyjny'));
  const indexHtml = await page.evaluate(async () => (await fetch('index.html')).text());
  check('index.html: komentarze po polsku', ['<!-- Nagłówek aplikacji', '<!-- Główna część strony', '<!-- Stopka aplikacji'].every((t) => indexHtml.includes(t)));
  await page.screenshot({ path: path.join(OUT, '01-logowanie.png'), fullPage: true });

  // 2. Logowanie i katalog
  await page.fill('input[name=login]', 'Tester Łukasz');
  await page.fill('input[name=password]', 'cokolwiek');
  await page.click('button[type=submit]');
  await page.waitForSelector('.book-card');
  const card = await page.textContent('.book-card');
  check('karta książki: tytuł i autor', card.includes('Vae Victis') && card.includes('Beniamin Muszyński'));
  check('podpis autorki okładki', card.includes('Ilustracja na okładce: Justyna Bzdoń'));
  check('ostrzeżenie o treści', card.includes('Trigger warning: #Środki psychoaktywne'));
  check('stopka redakcyjna od copyrightu po ISBN', card.includes('Copyright © by Beniamin Muszyński, 2018.') && card.includes('ISBN 978-83-951564-0-3'));
  check('odnośniki do oryginałów', (await page.locator('.book-info a', { hasText: 'EPUB' }).count()) === 1);
  check('hasło nie trafiło do localStorage', !(await page.evaluate(() => JSON.stringify(Object.entries(localStorage)))).includes('cokolwiek'));
  check('gracz w nagłówku', (await page.textContent('#user-area')).includes('Tester Łukasz'));
  await page.evaluate(async () => {
    for (const img of document.images) { img.loading = 'eager'; }
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));
  });
  check('obrazy na ekranie głównym wczytane', await page.evaluate(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0)));
  const homeComments = await commentsIn(page, '.home');
  check('ekran główny: komentarze po polsku, żadnego w tekście książki', homeComments.comments.some((c) => c.startsWith('Katalog książek')) && homeComments.comments.some((c) => c.startsWith('Stopka redakcyjna')) && !homeComments.inBookText, JSON.stringify(homeComments));

  // 2a. Zwijana karta książki: na starcie zwinięta (okładka z podpisem, tytuł, autor, wydawca)
  const cardState = () => page.$eval('.book-card', (c) => ({
    expanded: c.querySelector('.book-toggle').getAttribute('aria-expanded'),
    panelVisible: !c.querySelector('.book-card-panel').hidden && c.querySelector('.book-card-panel').offsetHeight > 0,
    header: c.querySelector('.book-card-header').innerText,
  }));
  let state = await cardState();
  check('karta zwinięta na starcie', state.expanded === 'false' && !state.panelVisible, JSON.stringify(state.expanded));
  check('zwinięta karta: tytuł, autor, wydawca, podpis okładki', ['Vae Victis', 'Beniamin Muszyński', 'Wydawnictwo Wielokrotnego Wyboru', 'Ilustracja na okładce: Justyna Bzdoń'].every((t) => state.header.includes(t)));
  check('belka wskazuje stopkę redakcyjną', (await page.textContent('.book-toggle')).includes('stopka redakcyjna'));
  await page.screenshot({ path: path.join(OUT, '02-katalog.png'), fullPage: true });
  await page.click('.book-toggle');
  state = await cardState();
  check('belka rozwija kartę', state.expanded === 'true' && state.panelVisible);
  await page.click('.book-card-header');
  state = await cardState();
  check('kliknięcie nagłówka zwija kartę', state.expanded === 'false' && !state.panelVisible);
  await page.click('.book-card-header');
  check('stopka widoczna po rozwinięciu', await page.isVisible('.colophon-text >> text=ISBN 978-83-951564-0-3'));
  await page.screenshot({ path: path.join(OUT, '02b-karta-rozwinieta.png'), fullPage: true });

  // 3. Rozpoczęcie gry
  await page.click('text=Rozpocznij grę');
  await page.waitForSelector('.game-text');
  check('start: Wprowadzenie', (await page.textContent('.game-text')).includes('Wprowadzenie'));
  check('przy czytaniu książki stopka aplikacji ukryta', !(await page.isVisible('.app-footer')));
  check('Cofnij nieaktywne na starcie', await page.isDisabled('.undo-button'));
  check('brak napisu null na ekranie gry', !(await page.textContent('.game')).includes('null'));
  check('dopisek przy Cofnij', (await page.textContent('.undo-caption')) === 'To Twoja gra :) Graj jak lubisz!');
  await page.screenshot({ path: path.join(OUT, '03-wprowadzenie.png'), fullPage: true });

  // 4. Odnośnik w tekście → Prolog, przycisk → §1
  await page.click('.game-text a.book-link:has-text("Prologu")');
  await page.waitForFunction(() => document.querySelector('.game-text').textContent.includes('Czas nieubłaganie'));
  check('Prolog po kliknięciu w tekście', true);
  await page.click('.btn-choice:has-text("Przejdź do §1")');
  await page.waitForFunction(() => document.querySelector('.game-text h2')?.textContent.includes('1 Ogień'));
  const choices = await page.$$eval('.btn-choice', (els) => els.map((el) => el.textContent));
  check('§1: przyciski przejść', JSON.stringify(choices) === JSON.stringify(['Przejdź do §22', 'Przejdź do §15', 'Przejdź do §16', 'Przejdź do §6']), JSON.stringify(choices));
  check('„Dokąd dalej?”: przejścia po lewej, „Cofnij” po prawej', await undoOnRight(page));
  await page.screenshot({ path: path.join(OUT, '04-paragraf-1.png'), fullPage: true });

  // 4a. Układ HTML ekranu gry: znaczniki zgodne z rolą, komentarze po polsku poza tekstem książki
  const layout = await page.evaluate(() => {
    const game = document.querySelector('.game');
    return {
      header: Boolean(game.querySelector(':scope > header.game-bar h1')),
      tools: Boolean(game.querySelector(':scope > nav.game-tools')),
      choices: game.querySelector(':scope > nav.choices')?.getAttribute('aria-labelledby') ?? null,
      footer: Boolean(game.querySelector(':scope > footer.game-footer .mode-info')),
    };
  });
  check('ekran gry: header, nav (narzędzia), nav „Dokąd dalej?”, footer', layout.header && layout.tools && layout.choices === 'choices-title' && layout.footer, JSON.stringify(layout));
  const gameComments = await commentsIn(page, '.game');
  check('ekran gry: komentarze po polsku poza tekstem książki', gameComments.comments.some((c) => c.startsWith('TEKST KSIĄŻKI')) && gameComments.comments.length >= 5 && !gameComments.inBookText, JSON.stringify(gameComments));
  await onlyTitleOutsideText(page, '§1');
  const hiddenDisplay = await page.evaluate(() => {
    const bar = document.querySelector('.game-bar');
    bar.hidden = true;
    const display = getComputedStyle(bar).display;
    bar.hidden = false;
    return display;
  });
  check('atrybut hidden ukrywa także pasek gry (display: flex)', hiddenDisplay === 'none', hiddenDisplay);

  // 5. Cofnij
  await page.click('.btn-choice:has-text("Przejdź do §22")');
  await page.waitForFunction(() => document.querySelector('.game-text h2')?.textContent.startsWith('22'));
  await page.click('.undo-button');
  await page.waitForFunction(() => document.querySelector('.game-text h2')?.textContent.startsWith('1 '));
  check('Cofnij wraca do §1', true);

  // 6. Stan ustawiony ręcznie: §91 bez Informacji #18 → oznaczenia i potwierdzenie
  const setState = async (node, owned = [], extra = {}) => {
    // Najpierw wyjście z ekranu gry (aplikacja kończy wtedy zapis), dopiero potem zmiana stanu.
    await page.goto(`${BASE}#/`);
    await page.waitForSelector('.book-card');
    await page.evaluate(({ node, owned, extra }) => {
      const key = Object.keys(localStorage).find((k) => k.endsWith(':book:vae-victis'));
      const state = JSON.parse(localStorage.getItem(key));
      state.currentNode = node;
      state.history.push(node);
      state.visits[node] = (state.visits[node] ?? 0) + 1;
      state.modules.codewords.owned = owned;
      state.status = 'inProgress';
      Object.assign(state, extra);
      localStorage.setItem(key, JSON.stringify(state));
    }, { node, owned, extra });
    await page.goto(`${BASE}#/gra/vae-victis`);
    await page.waitForSelector('.game-text');
  };
  await setState('p91');
  const met = await page.$$eval('.choice', (els) => els.map((el) => el.className + ' | ' + el.textContent));
  check('§91: oznaczenia warunków', met.length === 2 && met[0].includes('choice-unmet') && met[1].includes('choice-met'), JSON.stringify(met));
  await onlyTitleOutsideText(page, '§91 z oznaczeniami warunków');
  await page.screenshot({ path: path.join(OUT, '05-warunki-p91.png'), fullPage: true });
  await page.click('.choice-unmet .btn-choice');
  await page.waitForSelector('dialog[open]');
  check('potwierdzenie przy niespełnionym warunku', (await page.textContent('dialog[open]')).includes('nie spełnia warunku'));
  await page.screenshot({ path: path.join(OUT, '06-potwierdzenie.png') });
  await page.click('dialog[open] button[value=cancel]');
  check('anulowanie zostawia w §91', (await page.textContent('.game-text h2')).startsWith('91'));

  // 7. §57: zdobycie Informacji przy wyborze linii dialogowej
  await setState('p57');
  const dup = await page.$$eval('.btn-choice', (els) => els.map((el) => el.textContent));
  check('§57: numerowane duplikaty', dup.some((t) => t.includes('(odnośnik 1 z 2)')), JSON.stringify(dup));
  await page.click('.btn-choice >> nth=0');
  await page.waitForSelector('.app-notice');
  check('komunikat o zdobyciu Informacji #19', (await page.textContent('.app-notice')).includes('#19'));
  check('komunikat w <aside> poza tekstem książki', await page.$eval('.app-notice', (el) => Boolean(el.closest('aside.app-notices')) && !el.closest('article')));
  await onlyTitleOutsideText(page, 'komunikat #19');
  await page.screenshot({ path: path.join(OUT, '07-zdobycie.png'), fullPage: true });

  // 8. Zdobyte Informacje (w tej książce zamiast „Karty postaci”): #19 zaznaczona, ręczne przełączanie
  check('przycisk „Informacje” zamiast „Karta postaci”', (await page.locator('.game-tools button', { hasText: 'Informacje' }).count()) === 1
    && (await page.locator('.game-tools button', { hasText: 'Karta postaci' }).count()) === 0);
  await page.click('.game-tools button:has-text("Informacje")');
  await page.waitForSelector('dialog[open] .codeword-grid');
  check('okno „Zdobyte Informacje”', (await page.textContent('dialog[open] .dialog-title')) === 'Zdobyte Informacje');
  check('karta: #19 zaznaczona', (await page.getAttribute('dialog[open] [aria-label="Informacja #19"]', 'aria-pressed')) === 'true');
  await page.click('dialog[open] [aria-label="Informacja #5"]');
  check('karta: ręczne zaznaczenie #5', (await page.getAttribute('dialog[open] [aria-label="Informacja #5"]', 'aria-pressed')) === 'true');
  await page.screenshot({ path: path.join(OUT, '08-karta.png') });
  await page.keyboard.press('Escape');

  // 9. Niejednoznaczny §170 z jedną Informacją — bez oznaczeń, z komunikatem
  await setState('p170', ['34']);
  check('§170: komunikat o niejednoznaczności', (await page.textContent('.app-notice-info')).includes('więcej niż jeden sposób'));
  check('§170: brak oznaczeń warunków', (await page.locator('.choice-condition').count()) === 0);
  check('§170: brak napisu null', !(await page.textContent('.game')).includes('null'));
  check('§170: komunikat w <aside>', await page.$eval('.app-notice-info', (el) => Boolean(el.closest('aside.ambiguous-note'))));
  await onlyTitleOutsideText(page, '§170');
  await page.screenshot({ path: path.join(OUT, '09-niejednoznaczny.png'), fullPage: true });

  // 10. Zakończenie §122
  const source = await page.evaluate(async () => {
    const content = await (await fetch('ksiazki/vae-victis/tresc.json')).json();
    return content.order.find((id) => content.nodes[id].links.some((l) => l.to === 'p122'));
  });
  await setState(source);
  await page.click('.btn-choice:has-text("Przejdź do §122")');
  await page.waitForSelector('.ending-box');
  const ending = await page.textContent('.ending-box');
  check('zakończenie: tytuł i pierwszy raz', ending.includes('Ea est natura hominum') && ending.includes('po raz pierwszy'), ending);
  check('zakończenie w <aside> „Koniec tej drogi”', await page.$eval('.ending-box', (el) => el.closest('aside.ending-area')?.getAttribute('aria-labelledby') === 'ending-title'));
  await onlyTitleOutsideText(page, 'zakończenie');
  await page.screenshot({ path: path.join(OUT, '10-zakonczenie.png'), fullPage: true });

  // 11. Notatki + Nowa gra z pytaniem o notatki
  await page.click('.game-tools button:has-text("Notatki")');
  await page.fill('dialog[open] textarea', 'Moje notatki testowe');
  await page.keyboard.press('Escape');
  await page.click('.game-tools button:has-text("Nowa gra")');
  await page.waitForSelector('dialog[open]');
  check('Nowa gra pyta o notatki', (await page.textContent('dialog[open]')).includes('notatkami'));
  await page.screenshot({ path: path.join(OUT, '11-nowa-gra.png') });
  await page.click('dialog[open] button[value=keep]');
  await page.waitForFunction(() => document.querySelector('.game-text').textContent.includes('Wprowadzenie'));
  const stateAfter = await page.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => k.endsWith(':book:vae-victis')))));
  check('nowa gra: notatki zachowane, zakończenie zapamiętane', stateAfter.notes === 'Moje notatki testowe' && stateAfter.endingsFound.includes('p122') && stateAfter.playthrough === 2, JSON.stringify({ notes: stateAfter.notes, endings: stateAfter.endingsFound, pt: stateAfter.playthrough }));

  // 12. Zapisy: zapis w miejscu 1 i wczytanie
  await page.click('.game-text a.book-link:has-text("Prologu")');
  await page.click('.game-tools button:has-text("Zapisy")');
  await page.waitForSelector('dialog[open] .save-slot');
  await page.click('dialog[open] .save-slot >> nth=0 >> button:has-text("Zapisz tutaj")');
  await page.waitForSelector('dialog[open] input[type=text]');
  await page.fill('dialog[open] input[type=text]', 'Przed ogniskiem');
  await page.click('dialog[open] button[value=confirm]');
  await page.waitForFunction(() => [...document.querySelectorAll('dialog[open] .save-slot')].some((el) => el.textContent.includes('Przed ogniskiem')));
  check('zapis w miejscu 1', true);
  await page.screenshot({ path: path.join(OUT, '12-zapisy.png') });
  await page.keyboard.press('Escape');
  await page.click('.btn-choice:has-text("Przejdź do §1")');
  await page.click('.game-tools button:has-text("Zapisy")');
  await page.click('dialog[open] .save-slot >> nth=0 >> button:has-text("Wczytaj")');
  await page.click('dialog[open] button[value=load]');
  await page.waitForFunction(() => document.querySelector('.game-text').textContent.includes('Czas nieubłaganie'));
  check('wczytanie zapisu wraca do Prologu', true);

  // 13. Wielkość tekstu A+ i motyw ciemny
  const before = await page.evaluate(() => getComputedStyle(document.querySelector('.game-text')).fontSize);
  await page.click('button[aria-label="Powiększ tekst"]');
  const after = await page.evaluate(() => getComputedStyle(document.querySelector('.game-text')).fontSize);
  check('A+ powiększa tekst', parseFloat(after) > parseFloat(before), `${before} → ${after}`);
  check('krój Old Standard TT', (await page.evaluate(() => document.fonts.check('16px "Old Standard TT"'))));
  await page.click('.game-tools button:has-text("Ustawienia")');
  await page.click('dialog[open] input[value=dark]');
  await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(OUT, '13-ciemny.png'), fullPage: true });

  // 14. O książce
  await page.goto(`${BASE}#/o-ksiazce/vae-victis`);
  await page.waitForSelector('.about-section');
  const about = await page.textContent('.about');
  check('O książce: stopka, od Wydawnictwa, dedykacja', about.includes('Copyright © by Beniamin Muszyński') && about.includes('Wydawnictwo Wielokrotnego Wyboru') && about.includes('Michałowi Jezierskiemu'));
  check('O książce: podpis okładki', about.includes('Ilustracja na okładce: Justyna Bzdoń'));
  check('O książce: stopka aplikacji ukryta', !(await page.isVisible('.app-footer')));
  const aboutComments = await commentsIn(page, '.about');
  check('O książce: komentarze po polsku, żadnego w tekście książki', aboutComments.comments.some((c) => c.startsWith('Strony wstępne książki')) && !aboutComments.inBookText, JSON.stringify(aboutComments));
  await page.waitForFunction(() => { const img = document.querySelector('.cover-large img'); return img && img.complete && img.naturalWidth > 0; }, null, { timeout: 30000 });
  check('O książce: okładka wczytana', true);
  await page.screenshot({ path: path.join(OUT, '14-o-ksiazce.png') });

  // 15. Telefon
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pl-PL' });
  const mobile = await phone.newPage();
  mobile.on('pageerror', (err) => errors.push(`mobile pageerror: ${err.message}`));
  await mobile.goto(BASE);
  await mobile.fill('input[name=login]', 'Telefon');
  await mobile.click('button[type=submit]');
  await mobile.waitForSelector('.book-card');
  await mobile.screenshot({ path: path.join(OUT, '15-telefon-katalog.png'), fullPage: true });
  await mobile.click('.book-toggle');
  await mobile.click('text=Rozpocznij grę');
  await mobile.waitForSelector('.game-text');
  await mobile.click('.game-text a.book-link:has-text("Prologu")');
  await mobile.click('.btn-choice:has-text("Przejdź do §1")');
  await mobile.waitForFunction(() => document.querySelector('.game-text h2')?.textContent.includes('1 Ogień'));
  check('telefon: „Cofnij” po prawej stronie przejść', await undoOnRight(mobile));
  await mobile.screenshot({ path: path.join(OUT, '16-telefon-gra.png'), fullPage: false });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('telefon: brak przewijania w poziomie', !overflow);

  // 16. „Nowa gra” z ekranu głównego otwiera pytanie w ekranie gry
  await page.goto(`${BASE}#/`);
  await page.waitForSelector('.book-card');
  check('rozwinięta karta zapamiętana w tej sesji', (await page.getAttribute('.book-toggle', 'aria-expanded')) === 'true');
  check('ekran główny: stopka aplikacji widoczna (z autorem piktogramu)', (await page.isVisible('.app-footer')) && (await page.textContent('.app-footer')).includes('Skoll'));
  await page.click('.book-card a:has-text("Nowa gra")');
  await page.waitForSelector('dialog[open]');
  check('Nowa gra z ekranu głównego', (await page.textContent('dialog[open] .dialog-title')) === 'Nowa gra');
  await page.click('dialog[open] button[value=cancel]');

  // 17. Wylogowanie
  await page.goto(BASE);
  await page.click('#user-area button:has-text("Wyloguj")');
  await page.waitForSelector('form.login-panel');
  check('wylogowanie wraca do logowania', true);

  check('brak błędów w konsoli', errors.length === 0, errors.join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nWynik: ${results.length - failed.length}/${results.length}`);
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error('PRZERWANO:', error);
  console.error('Błędy konsoli:', errors.join('\n'));
  process.exit(2);
});
