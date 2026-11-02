// Adapter zapisu w Firebase (Firestore) — docelowy sposób logowania i zapisu postępu.
// Logowanie loginem i hasłem wg dokumentacja/FIREBASE.md, rozdz. 5:
//   1. przeglądarka loguje się anonimowo (Firebase Authentication),
//   2. aplikacja próbuje zapisać sessions/{uid} z loginem i skrótem SHA-256 hasła dla kolejnych kont
//      Player1 … PlayerN — reguły przepuszczają zapis tylko przy zgodnym loginie i haśle.
// Hasło nigdy nie jest zapisywane: ani w bazie (tylko skrót w sesji), ani w pamięci przeglądarki.
// Pamięć podręczna Firestore działa tylko w pamięci karty (bez trwałego zapisu na dysku).

import { ConflictError, LoginError, SAVE_SLOTS, SESSION_DAYS } from './storage-errors.js';

export const FIREBASE_SDK_VERSION = '12.19.0';
const SDK = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/`;
const LOCAL_SESSION_KEY = 'gp1:firebase-session'; // tylko identyfikator konta i login — bez hasła
// Bez dokumentu appConfig/public aplikacja sprawdza konta Player1 … Player10 (dokument jest opcjonalny).
const DEFAULT_PLAYER_COUNT = 10;

export async function createFirestoreAdapter({ config, appCheckSiteKey = null, emulator = false }) {
  const [appSdk, authSdk, fsSdk, appCheckSdk] = await Promise.all([
    import(`${SDK}firebase-app.js`),
    import(`${SDK}firebase-auth.js`),
    import(`${SDK}firebase-firestore.js`),
    appCheckSiteKey && !emulator ? import(`${SDK}firebase-app-check.js`) : Promise.resolve(null),
  ]);
  const app = appSdk.initializeApp(config);
  if (appCheckSdk) {
    appCheckSdk.initializeAppCheck(app, {
      provider: new appCheckSdk.ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
  const auth = authSdk.getAuth(app);
  const db = fsSdk.getFirestore(app);
  if (emulator) {
    authSdk.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    fsSdk.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  return new FirestoreAdapter({ authSdk, fs: fsSdk, auth, db, emulator, appCheck: Boolean(appCheckSdk) });
}

class FirestoreAdapter {
  constructor({ authSdk, fs, auth, db, emulator, appCheck }) {
    this.authSdk = authSdk;
    this.fs = fs;
    this.auth = auth;
    this.db = db;
    this.emulator = emulator;
    this.appCheckEnabled = appCheck;
    this.session = null;
    this.config = null;
  }

  get kind() {
    return this.emulator ? 'emulator' : 'firebase';
  }

  // --- konfiguracja aplikacji (appConfig/public) -----------------------------------------------

  async loadAppConfig() {
    await this.#ensureAuth();
    const snapshot = await this.fs.getDoc(this.fs.doc(this.db, 'appConfig', 'public'));
    const data = snapshot.exists() ? snapshot.data() : {};
    const count = Number.isInteger(data.playerCount) && data.playerCount > 0 && data.playerCount <= 99
      ? data.playerCount
      : DEFAULT_PLAYER_COUNT;
    this.config = {
      playerCount: count,
      maintenance: data.maintenance === true,
      // Puste elementy listy (konsola czasem wymaga wpisania wartości) są pomijane.
      disabledBooks: Array.isArray(data.disabledBooks) ? data.disabledBooks.filter((id) => typeof id === 'string' && id.trim()) : [],
    };
    return this.config;
  }

  // --- sesja ---------------------------------------------------------------------------------

  async #ensureAuth() {
    await this.auth.authStateReady();
    if (!this.auth.currentUser) await this.authSdk.signInAnonymously(this.auth);
    return this.auth.currentUser;
  }

  async restoreSession() {
    const stored = readLocalSession();
    if (!stored?.playerId) return null;
    const ageDays = (Date.now() - new Date(stored.createdAt).getTime()) / 86_400_000;
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!(ageDays >= 0 && ageDays < SESSION_DAYS) || !user || user.uid !== stored.uid) {
      clearLocalSession();
      return null;
    }
    // Reguły sprawdzają sesję przy każdym odczycie — odmowa oznacza wygasłą sesję albo zmienione hasło.
    try {
      await this.fs.getDoc(this.#playerRef(stored.playerId));
    } catch (error) {
      if (error?.code === 'permission-denied') {
        clearLocalSession();
        return null;
      }
      throw error;
    }
    this.session = { playerId: stored.playerId, displayName: stored.displayName, isAdmin: false };
    return this.session;
  }

  async login(login, password) {
    const displayName = String(login ?? '').trim();
    if (!displayName || !password) throw new LoginError('Podaj login i hasło.');
    let user;
    let config;
    try {
      user = await this.#ensureAuth();
      config = await this.loadAppConfig();
    } catch (error) {
      throw setupError(error);
    }
    const passwordHash = await sha256Hex(password);
    const sessionRef = this.fs.doc(this.db, 'sessions', user.uid);
    for (let number = 1; number <= config.playerCount; number += 1) {
      const playerId = `Player${number}`;
      try {
        await this.fs.setDoc(sessionRef, {
          playerId,
          login: displayName,
          passwordHash,
          createdAt: this.fs.serverTimestamp(),
        });
      } catch (error) {
        if (error?.code === 'permission-denied') continue;
        throw error;
      }
      writeLocalSession({ playerId, displayName, uid: user.uid, createdAt: new Date().toISOString() });
      this.session = { playerId, displayName, isAdmin: false };
      await this.#touchProfile(displayName);
      return this.session;
    }
    throw new LoginError('Nieprawidłowy login lub hasło. Wielkość liter ma znaczenie.');
  }

  async logout() {
    const user = this.auth.currentUser;
    clearLocalSession();
    this.session = null;
    if (user) {
      try {
        await this.fs.deleteDoc(this.fs.doc(this.db, 'sessions', user.uid));
      } catch (error) {
        console.error(error);
      }
    }
  }

  // --- profil i ustawienia --------------------------------------------------------------------

  async #touchProfile(displayName) {
    const ref = this.#playerRef(this.#playerId());
    const now = new Date().toISOString();
    const snapshot = await this.fs.getDoc(ref);
    if (snapshot.exists()) {
      await this.fs.updateDoc(ref, { displayName, updatedAt: now });
    } else {
      await this.fs.setDoc(ref, { schemaVersion: 1, displayName, settings: {}, createdAt: now, updatedAt: now });
    }
  }

  async loadProfile() {
    const snapshot = await this.fs.getDoc(this.#playerRef(this.#playerId()));
    return snapshot.exists() ? snapshot.data() : { schemaVersion: 1, settings: {} };
  }

  async saveSettings(settings) {
    await this.fs.setDoc(
      this.#playerRef(this.#playerId()),
      { settings: { ...settings }, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  }

  // --- stan gry (autozapis) -------------------------------------------------------------------

  async loadBookState(bookId) {
    const snapshot = await this.fs.getDoc(this.#bookRef(bookId));
    return snapshot.exists() ? snapshot.data() : null;
  }

  // Zapis w transakcji: jeśli w międzyczasie inne urządzenie zapisało nowszy stan — ConflictError.
  async saveBookState(bookId, state, { force = false } = {}) {
    const ref = this.#bookRef(bookId);
    const updatedAt = new Date().toISOString();
    const revision = await this.fs.runTransaction(this.db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      const stored = snapshot.exists() ? snapshot.data() : null;
      const storedRevision = stored?.revision ?? 0;
      if (!force && stored && storedRevision !== state.revision) throw new ConflictError(stored);
      const next = Math.max(storedRevision, state.revision ?? 0) + 1;
      transaction.set(ref, { ...plain(state), bookId, revision: next, updatedAt });
      return next;
    });
    state.revision = revision;
    state.updatedAt = updatedAt;
    return revision;
  }

  // --- ręczne zapisy (save1 … save3) ----------------------------------------------------------

  async listSaves(bookId) {
    const snapshot = await this.fs.getDocs(this.fs.collection(this.#bookRef(bookId), 'saves'));
    const saves = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
    return SAVE_SLOTS.map((saveId) => (saves.has(saveId) ? { saveId, ...saves.get(saveId) } : { saveId, empty: true }));
  }

  async writeSave(bookId, saveId, { label, state }) {
    checkSlot(saveId);
    await this.fs.setDoc(this.#saveRef(bookId, saveId), {
      schemaVersion: 1,
      label: String(label).slice(0, 100),
      state: plain(state),
      createdAt: new Date().toISOString(),
    });
  }

  async readSave(bookId, saveId) {
    checkSlot(saveId);
    const snapshot = await this.fs.getDoc(this.#saveRef(bookId, saveId));
    return snapshot.exists() ? snapshot.data() : null;
  }

  async deleteSave(bookId, saveId) {
    checkSlot(saveId);
    await this.fs.deleteDoc(this.#saveRef(bookId, saveId));
  }

  // --- pomocnicze ------------------------------------------------------------------------------

  #playerId() {
    if (!this.session) throw new Error('Brak zalogowanego gracza');
    return this.session.playerId;
  }

  #playerRef(playerId) {
    return this.fs.doc(this.db, 'players', playerId);
  }

  #bookRef(bookId) {
    return this.fs.doc(this.db, 'players', this.#playerId(), 'books', bookId);
  }

  #saveRef(bookId, saveId) {
    return this.fs.doc(this.#bookRef(bookId), 'saves', saveId);
  }
}

// Błędy konfiguracji projektu Firebase (kroki administratora — FIREBASE.md, rozdz. 9) zamieniamy na
// komunikaty dla gracza; inne błędy (np. brak internetu) przekazujemy dalej.
function setupError(error) {
  const code = error?.code ?? '';
  if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') {
    return new LoginError('Logowanie nie jest jeszcze włączone (administrator: włącz w Firebase logowanie anonimowe).');
  }
  if (code === 'permission-denied') {
    return new LoginError('Baza danych nie jest jeszcze gotowa (administrator: opublikuj reguły z pliku firebase/firestore.rules).');
  }
  return error;
}

function checkSlot(saveId) {
  if (!SAVE_SLOTS.includes(saveId)) throw new Error(`Nieznane miejsce zapisu: ${saveId}`);
}

// Kopia bez wartości niedozwolonych w Firestore (np. undefined).
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readLocalSession() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(LOCAL_SESSION_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeLocalSession(value) {
  try {
    globalThis.localStorage?.setItem(LOCAL_SESSION_KEY, JSON.stringify(value));
  } catch {
    // Brak pamięci przeglądarki (np. tryb prywatny) — sesja działa do zamknięcia karty.
  }
}

function clearLocalSession() {
  try {
    globalThis.localStorage?.removeItem(LOCAL_SESSION_KEY);
  } catch {
    // jw.
  }
}
