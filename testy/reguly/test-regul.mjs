// Testy reguł bezpieczeństwa Firestore (firebase/firestore.rules) w emulatorze Firebase.
// Uruchomienie — instrukcja w testy/reguly/README.md.
import { after, before, beforeEach, describe, test } from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  Timestamp, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-gryparagrafowe';
const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

const ACCOUNTS = {
  Player1: { PlayerName: 'alicja', PlayerPassword: 'Haslo-Alicji-123' },
  Player2: { PlayerName: 'bartek', PlayerPassword: 'Hasło-Bartka-456' }, // admin; hasło z polską literą
  Player3: { PlayerName: 'celina', PlayerPassword: 'Haslo-Celiny-789' },
};

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(new URL('../../firebase/firestore.rules', import.meta.url), 'utf8'), host, port: Number(port) },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const [playerId, secret] of Object.entries(ACCOUNTS)) await setDoc(doc(db, 'secrets', playerId), secret);
    await setDoc(doc(db, 'admins', 'Player2'), {});
    await setDoc(doc(db, 'appConfig', 'public'), { playerCount: 3, maintenance: false, disabledBooks: [] });
  });
});

function sessionData(playerId, login, password) {
  return { playerId, login, passwordHash: sha256(password), createdAt: serverTimestamp() };
}

// Loguje przeglądarkę `uid` jako gracza i zwraca jej bazę.
async function loggedIn(uid, playerId) {
  const db = env.authenticatedContext(uid).firestore();
  const { PlayerName, PlayerPassword } = ACCOUNTS[playerId];
  await assertSucceeds(setDoc(doc(db, 'sessions', uid), sessionData(playerId, PlayerName, PlayerPassword)));
  return db;
}

function bookState(overrides = {}) {
  return {
    schemaVersion: 1,
    bookId: 'vae-victis',
    contentVersion: '1.0.0',
    status: 'inProgress',
    currentNode: 'p1',
    history: ['wprowadzenie', 'prolog', 'p1'],
    visits: { wprowadzenie: 1, prolog: 1, p1: 1 },
    modules: { codewords: { owned: ['4'] } },
    notes: 'notatka',
    endingsFound: [],
    playthrough: 1,
    undo: [{ from: 'prolog', historyLength: 2, status: 'inProgress', added: [], removed: [], entered: 'p1' }],
    revision: 1,
    startedAt: '2026-11-02T10:00:00.000Z',
    updatedAt: '2026-11-02T10:05:00.000Z',
    ...overrides,
  };
}

const bookRef = (db, playerId = 'Player1') => doc(db, 'players', playerId, 'books', 'vae-victis');

describe('dostęp bez logowania', () => {
  test('niezalogowany nie czyta konfiguracji ani danych', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'appConfig', 'public')));
    await assertFails(getDoc(doc(db, 'players', 'Player1')));
    await assertFails(setDoc(doc(db, 'sessions', 'x'), sessionData('Player1', 'alicja', 'Haslo-Alicji-123')));
  });

  test('przeglądarka zalogowana anonimowo czyta tylko appConfig/public', async () => {
    const db = env.authenticatedContext('anon').firestore();
    await assertSucceeds(getDoc(doc(db, 'appConfig', 'public')));
    await assertFails(getDoc(doc(db, 'appConfig', 'inny')));
    await assertFails(getDocs(collection(db, 'appConfig')));
    await assertFails(getDoc(doc(db, 'secrets', 'Player1')));
    await assertFails(getDoc(doc(db, 'admins', 'Player2')));
    await assertFails(getDoc(doc(db, 'players', 'Player1')));
    await assertFails(setDoc(doc(db, 'appConfig', 'public'), { playerCount: 99 }));
  });
});

describe('logowanie (dokument sesji)', () => {
  test('poprawny login i hasło tworzą sesję', async () => {
    await loggedIn('u1', 'Player1');
  });

  test('hasło z polskimi literami', async () => {
    await loggedIn('u2', 'Player2');
  });

  test('złe hasło, zły login, cudze konto — odmowa', async () => {
    const db = env.authenticatedContext('u1').firestore();
    const ref = doc(db, 'sessions', 'u1');
    await assertFails(setDoc(ref, sessionData('Player1', 'alicja', 'zle-haslo')));
    await assertFails(setDoc(ref, sessionData('Player1', 'Alicja', 'Haslo-Alicji-123')));
    await assertFails(setDoc(ref, sessionData('Player2', 'alicja', 'Haslo-Alicji-123')));
    await assertFails(setDoc(ref, sessionData('Player9', 'alicja', 'Haslo-Alicji-123')));
    await assertFails(setDoc(ref, sessionData('Gracz1', 'alicja', 'Haslo-Alicji-123')));
  });

  test('sesja: tylko własny dokument, bez jawnego hasła, z czasem serwera, bez odczytu', async () => {
    const db = env.authenticatedContext('u1').firestore();
    const good = sessionData('Player1', 'alicja', 'Haslo-Alicji-123');
    await assertFails(setDoc(doc(db, 'sessions', 'u-inny'), good));
    await assertFails(setDoc(doc(db, 'sessions', 'u1'), { ...good, password: 'Haslo-Alicji-123' }));
    await assertFails(setDoc(doc(db, 'sessions', 'u1'), { ...good, createdAt: Timestamp.fromDate(new Date('2030-01-01')) }));
    await assertFails(setDoc(doc(db, 'sessions', 'u1'), { ...good, passwordHash: sha256('Haslo-Alicji-123').toUpperCase() }));
    await assertSucceeds(setDoc(doc(db, 'sessions', 'u1'), good));
    await assertFails(getDoc(doc(db, 'sessions', 'u1')));
  });

  test('wylogowanie usuwa sesję i odbiera dostęp', async () => {
    const db = await loggedIn('u1', 'Player1');
    await assertSucceeds(setDoc(doc(db, 'players', 'Player1'), { schemaVersion: 1, displayName: 'alicja' }));
    await assertFails(deleteDoc(doc(env.authenticatedContext('u-obcy').firestore(), 'sessions', 'u1')));
    await assertSucceeds(deleteDoc(doc(db, 'sessions', 'u1')));
    await assertFails(getDoc(doc(db, 'players', 'Player1')));
  });
});

describe('dane gracza', () => {
  test('gracz czyta i zapisuje tylko swoje dane', async () => {
    const db = await loggedIn('u1', 'Player1');
    await assertSucceeds(setDoc(doc(db, 'players', 'Player1'), {
      schemaVersion: 1, displayName: 'alicja', settings: { theme: 'dark', fontScale: 1.15, mechanicsMode: 'auto' },
      createdAt: '2026-11-02T10:00:00.000Z', updatedAt: '2026-11-02T10:00:00.000Z',
    }));
    await assertSucceeds(getDoc(doc(db, 'players', 'Player1')));
    await assertSucceeds(setDoc(bookRef(db), bookState()));
    await assertSucceeds(getDoc(bookRef(db)));
    await assertFails(getDoc(doc(db, 'players', 'Player3')));
    await assertFails(setDoc(bookRef(db, 'Player3'), bookState()));
    await assertFails(getDocs(collection(db, 'players')));
  });

  test('walidacja profilu i stanu gry', async () => {
    const db = await loggedIn('u1', 'Player1');
    await assertFails(setDoc(doc(db, 'players', 'Player1'), { displayName: 'alicja', isAdmin: true }));
    await assertFails(setDoc(doc(db, 'players', 'Player1'), { settings: { theme: 'neon' } }));
    await assertFails(setDoc(bookRef(db), bookState({ bookId: 'inna-ksiazka' })));
    await assertFails(setDoc(bookRef(db), bookState({ status: 'wygrana' })));
    await assertFails(setDoc(bookRef(db), bookState({ revision: 0 })));
    await assertFails(setDoc(bookRef(db), { ...bookState(), password: 'x' }));
    await assertFails(setDoc(doc(db, 'players', 'Player1', 'books', 'Zla_Nazwa'), bookState({ bookId: 'Zla_Nazwa' })));
  });

  test('numer wersji stanu gry tylko rośnie (konflikt dwóch urządzeń)', async () => {
    const db = await loggedIn('u1', 'Player1');
    await assertSucceeds(setDoc(bookRef(db), bookState({ revision: 1 })));
    await assertSucceeds(setDoc(bookRef(db), bookState({ revision: 2 })));
    await assertFails(setDoc(bookRef(db), bookState({ revision: 2 })));
    await assertFails(setDoc(bookRef(db), bookState({ revision: 1 })));
  });

  test('ręczne zapisy: tylko save1–save3', async () => {
    const db = await loggedIn('u1', 'Player1');
    const save = { schemaVersion: 1, label: 'Przed bitwą', state: bookState(), createdAt: '2026-11-02T10:00:00.000Z' };
    await assertSucceeds(setDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save1'), save));
    await assertSucceeds(setDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save3'), save));
    await assertFails(setDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save4'), save));
    await assertFails(setDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save2'), { ...save, label: 'x'.repeat(101) }));
    await assertSucceeds(getDocs(collection(db, 'players', 'Player1', 'books', 'vae-victis', 'saves')));
    await assertSucceeds(deleteDoc(doc(db, 'players', 'Player1', 'books', 'vae-victis', 'saves', 'save1')));
  });

  test('zmiana hasła lub loginu w konsoli natychmiast odbiera dostęp', async () => {
    const db = await loggedIn('u1', 'Player1');
    await assertSucceeds(setDoc(bookRef(db), bookState()));
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'secrets', 'Player1'), { PlayerName: 'alicja', PlayerPassword: 'Nowe-Haslo-000' });
    });
    await assertFails(getDoc(bookRef(db)));
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'secrets', 'Player1'), { PlayerName: 'ala', PlayerPassword: 'Haslo-Alicji-123' });
    });
    await assertFails(getDoc(bookRef(db)));
  });

  test('sesja starsza niż 30 dni wygasa', async () => {
    const db = env.authenticatedContext('u-stary').firestore();
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'sessions', 'u-stary'), {
        playerId: 'Player1', login: 'alicja', passwordHash: sha256('Haslo-Alicji-123'),
        createdAt: Timestamp.fromMillis(Date.now() - 31 * 24 * 3600 * 1000),
      });
    });
    await assertFails(getDoc(doc(db, 'players', 'Player1')));
  });

  test('usunięte konto (brak dokumentu secrets) odbiera dostęp', async () => {
    const db = await loggedIn('u1', 'Player1');
    await env.withSecurityRulesDisabled(async (context) => {
      await deleteDoc(doc(context.firestore(), 'secrets', 'Player1'));
    });
    await assertFails(getDoc(doc(db, 'players', 'Player1')));
  });
});

describe('administrator', () => {
  test('administrator czyta dane wszystkich graczy i listę graczy', async () => {
    const player = await loggedIn('u1', 'Player1');
    await assertSucceeds(setDoc(doc(player, 'players', 'Player1'), { schemaVersion: 1, displayName: 'alicja' }));
    await assertSucceeds(setDoc(bookRef(player), bookState()));
    const admin = await loggedIn('u-admin', 'Player2');
    await assertSucceeds(getDocs(collection(admin, 'players')));
    await assertSucceeds(getDoc(bookRef(admin, 'Player1')));
    await assertSucceeds(getDocs(collection(admin, 'players', 'Player1', 'books')));
  });

  test('administrator nie czyta haseł ani sesji', async () => {
    const admin = await loggedIn('u-admin', 'Player2');
    await assertFails(getDoc(doc(admin, 'secrets', 'Player1')));
    await assertFails(getDoc(doc(admin, 'sessions', 'u-admin')));
    await assertFails(getDocs(collection(admin, 'secrets')));
  });

  test('gracz bez uprawnień nie usuwa cudzych danych ani profilu', async () => {
    const player = await loggedIn('u3', 'Player3');
    await assertFails(deleteDoc(doc(player, 'players', 'Player1')));
    await assertFails(deleteDoc(doc(player, 'players', 'Player3')));
  });
});
