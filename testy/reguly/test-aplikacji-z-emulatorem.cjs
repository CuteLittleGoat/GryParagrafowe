// Test aplikacji z emulatorem Firebase: prawdziwe logowanie loginem i hasłem (reguły z
// firebase/firestore.rules), zapis postępu w bazie, sesja po odświeżeniu, zmiana hasła, wylogowanie.
// Instrukcja uruchomienia — testy/reguly/README.md. Dane testowe są fikcyjne (projekt „demo-…”).
const { chromium } = require('playwright');
const { readFileSync } = require('fs');
const path = require('path');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');

const BASE = process.env.BASE || 'http://localhost:8765/';
const APP = `${BASE}?emulator#/`;
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || null;
const results = [];
const errors = [];

function check(name, condition, details = '') {
  results.push({ name, ok: Boolean(condition) });
  console.log(`${condition ? 'OK  ' : 'BŁĄD'} ${name}${details ? ` — ${details}` : ''}`);
}

const ACCOUNTS = {
  Player1: { PlayerName: 'Gracz Testowy', PlayerPassword: 'Tajne-Hasło-1' },
  Player7: { PlayerName: 'wydawca', PlayerPassword: 'Haslo-Wydawcy-7' },
};

async function main() {
  const env = await initializeTestEnvironment({
    projectId: 'demo-gryparagrafowe',
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync(path.join(__dirname, '../../firebase/firestore.rules'), 'utf8') },
  });
  await env.clearFirestore();
  // Dostęp z pominięciem reguł (jak konsola Firebase); withSecurityRulesDisabled nie zwraca wyniku.
  const admin = async (fn) => {
    let result;
    await env.withSecurityRulesDisabled(async (context) => {
      result = await fn(context.firestore());
    });
    return result;
  };
  await admin(async (db) => {
    for (const [playerId, secret] of Object.entries(ACCOUNTS)) await setDoc(doc(db, 'secrets', playerId), secret);
    await setDoc(doc(db, 'appConfig', 'public'), { playerCount: 7, maintenance: false, disabledBooks: [] });
  });

  const browser = await chromium.launch(PROXY ? { proxy: { server: PROXY, bypass: 'localhost,127.0.0.1' } } : {});
  const context = await browser.newContext({ locale: 'pl-PL', viewport: { width: 1000, height: 900 } });
  const page = await context.newPage();
  const watch = (target, label) => {
    target.on('pageerror', (err) => errors.push(`${label} pageerror: ${err.message}`));
    target.on('console', (msg) => {
      const text = msg.text();
      // Odmowy przy sprawdzaniu kolejnych kont podczas logowania są oczekiwane.
      if (msg.type() === 'error' && !/PERMISSION_DENIED|permission-denied|Missing or insufficient permissions|403/.test(text)) {
        errors.push(`${label} console: ${text}`);
      }
    });
  };
  watch(page, 'gracz');

  // 1. Logowanie — złe hasło
  await page.goto(APP);
  await page.waitForSelector('form.login-panel');
  check('baner trybu testowego (emulator)', (await page.textContent('.dev-banner')).includes('emulator'));
  await page.fill('input[name=login]', 'Gracz Testowy');
  await page.fill('input[name=password]', 'zle-haslo');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => document.querySelector('.form-error')?.textContent.length > 0, null, { timeout: 30000 });
  check('złe hasło — odmowa', (await page.textContent('.form-error')).includes('Nieprawidłowy login lub hasło'));

  // 2. Logowanie — poprawne
  await page.fill('input[name=password]', 'Tajne-Hasło-1');
  await page.click('button[type=submit]');
  await page.waitForSelector('.book-card', { timeout: 30000 });
  check('poprawne logowanie (Player1)', (await page.textContent('#user-area')).includes('Gracz Testowy'));
  const storageDump = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
  check('hasło nie trafiło do pamięci przeglądarki', !storageDump.includes('Tajne'));
  const sessions = await admin(async (db) => {
    const { getDocs, collection } = require('firebase/firestore');
    return (await getDocs(collection(db, 'sessions'))).docs.map((item) => item.data());
  });
  check('sesja w bazie: skrót hasła zamiast hasła', sessions.length === 1 && /^[0-9a-f]{64}$/.test(sessions[0].passwordHash)
    && !JSON.stringify(sessions).includes('Tajne') && sessions[0].playerId === 'Player1', JSON.stringify(sessions.map((s) => s.playerId)));

  // 3. Gra i zapis w bazie
  await page.click('.book-toggle');
  await page.click('text=Rozpocznij grę');
  await page.waitForSelector('.game-text', { timeout: 30000 });
  await page.click('.game-text a.book-link:has-text("Prologu")');
  await page.click('.btn-choice:has-text("Przejdź do §1")');
  await page.waitForFunction(() => document.querySelector('.save-status')?.textContent === 'Zapisano', null, { timeout: 30000 });
  const stored = await admin(async (db) => (await getDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis'))).data());
  check('stan gry zapisany w bazie', stored?.currentNode === 'p1' && stored.revision >= 3, `węzeł ${stored?.currentNode}, wersja ${stored?.revision}`);
  const profile = await admin(async (db) => (await getDoc(doc(db, 'players', 'Player1'))).data());
  check('profil gracza z loginem', profile?.displayName === 'Gracz Testowy');

  // 4. Ręczny zapis
  await page.click('.game-tools button:has-text("Zapisy")');
  await page.click('dialog[open] .save-slot >> nth=0 >> button:has-text("Zapisz tutaj")');
  await page.fill('dialog[open] input[type=text]', 'Pierwszy zapis');
  await page.click('dialog[open] button[value=confirm]');
  await page.waitForFunction(() => [...document.querySelectorAll('dialog[open] .save-slot')].some((el) => el.textContent.includes('Pierwszy zapis')), null, { timeout: 30000 });
  const save = await admin(async (db) => (await getDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save1'))).data());
  check('ręczny zapis w bazie', save?.label === 'Pierwszy zapis' && save.state.currentNode === 'p1');
  await page.keyboard.press('Escape');

  // 5. Odświeżenie strony — sesja i stan z bazy
  await page.reload();
  await page.waitForSelector('.game-text', { timeout: 30000 });
  check('po odświeżeniu: zalogowany, ta sama pozycja', (await page.textContent('.game-text h2')).startsWith('1 '));

  // 6. Konflikt: inne urządzenie zapisało nowszy stan
  await admin(async (db) => {
    await setDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis'), { ...stored, currentNode: 'p22', history: [...stored.history, 'p22'], revision: 99 });
  });
  await page.click('.btn-choice:has-text("Przejdź do §15")');
  await page.waitForSelector('dialog[open]', { timeout: 30000 });
  check('konflikt zapisów — pytanie do gracza', (await page.textContent('dialog[open]')).includes('innym oknie lub na innym urządzeniu'));
  await page.click('dialog[open] button[value=load]');
  await page.waitForFunction(() => document.querySelector('.game-text h2')?.textContent.startsWith('22'), null, { timeout: 30000 });
  check('wczytano nowszy stan (§22)', true);

  // 7. Drugi gracz (konto Wydawcy, Player7)
  const publisherContext = await browser.newContext({ locale: 'pl-PL' });
  const publisher = await publisherContext.newPage();
  watch(publisher, 'wydawca');
  await publisher.goto(APP);
  await publisher.waitForSelector('form.login-panel');
  await publisher.fill('input[name=login]', 'wydawca');
  await publisher.fill('input[name=password]', 'Haslo-Wydawcy-7');
  await publisher.click('button[type=submit]');
  await publisher.waitForSelector('.book-card', { timeout: 30000 });
  check('konto Wydawcy (Player7) — logowanie i katalog', (await publisher.textContent('.book-card')).includes('Gra jeszcze nie została rozpoczęta.'));

  // 8. Zmiana hasła w konsoli wylogowuje gracza
  await admin(async (db) => setDoc(doc(db, 'secrets', 'Player1'), { PlayerName: 'Gracz Testowy', PlayerPassword: 'Nowe-Haslo-2' }));
  await page.goto(APP);
  await page.reload();
  await page.waitForSelector('form.login-panel', { timeout: 30000 });
  check('zmiana hasła w konsoli — gracz wylogowany', true);

  // 9. Wylogowanie usuwa sesję z bazy
  await publisher.click('#user-area button:has-text("Wyloguj")');
  await publisher.waitForSelector('form.login-panel');
  const remaining = await admin(async (db) => {
    const { getDocs, collection } = require('firebase/firestore');
    return (await getDocs(collection(db, 'sessions'))).docs.map((item) => item.data().playerId);
  });
  check('wylogowanie usuwa sesję Wydawcy', !remaining.includes('Player7'), JSON.stringify(remaining));

  check('brak błędów w konsoli przeglądarki', errors.length === 0, errors.join(' | '));
  await browser.close();
  await env.cleanup();
  const failed = results.filter((item) => !item.ok);
  console.log(`\nWynik: ${results.length - failed.length}/${results.length}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error('PRZERWANO:', error);
  console.error('Błędy konsoli:', errors.join('\n'));
  process.exit(2);
});
