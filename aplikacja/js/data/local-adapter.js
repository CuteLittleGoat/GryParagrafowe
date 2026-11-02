// Adapter zapisu w pamięci przeglądarki (localStorage) — WYŁĄCZNIE do pracy i testów na własnym
// komputerze (localhost). Nie sprawdza haseł i nigdy ich nie zapisuje (AGENTS.md, rozdz. 7).
// Interfejs jest taki sam jak docelowego adaptera Firestore (dokumentacja/FIREBASE.md, rozdz. 3).

import { ConflictError, LoginError, SAVE_SLOTS, SESSION_DAYS } from './storage-errors.js';

const PREFIX = 'gp1:';

export class LocalAdapter {
  constructor(storage = globalThis.localStorage, now = () => new Date()) {
    this.storage = storage;
    this.now = now;
    this.session = null;
  }

  get kind() {
    return 'local';
  }

  // --- sesja ---------------------------------------------------------------------------------

  async restoreSession() {
    const stored = this.#read('session');
    if (!stored?.playerId) return null;
    const ageDays = (this.now() - new Date(stored.createdAt)) / 86_400_000;
    if (!(ageDays >= 0 && ageDays < SESSION_DAYS)) {
      this.#remove('session');
      return null;
    }
    this.session = { playerId: stored.playerId, displayName: stored.displayName, isAdmin: false };
    return this.session;
  }

  // Hasło jest celowo pomijane: w trybie lokalnym nie ma kont, a hasła nie wolno zapisywać.
  async login(login) {
    const displayName = String(login ?? '').trim();
    if (!displayName) throw new LoginError('Podaj login.');
    const slug = displayName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const playerId = `local-${slug || 'gracz'}`;
    const timestamp = this.now().toISOString();
    this.#write('session', { playerId, displayName, createdAt: timestamp });
    const profile = this.#read(`player:${playerId}`) ?? { schemaVersion: 1, settings: {}, createdAt: timestamp };
    this.#write(`player:${playerId}`, { ...profile, displayName, updatedAt: timestamp });
    this.session = { playerId, displayName, isAdmin: false };
    return this.session;
  }

  async logout() {
    this.#remove('session');
    this.session = null;
  }

  // --- profil i ustawienia --------------------------------------------------------------------

  async loadProfile() {
    return this.#read(`player:${this.#playerId()}`) ?? { schemaVersion: 1, settings: {} };
  }

  async saveSettings(settings) {
    const key = `player:${this.#playerId()}`;
    const profile = this.#read(key) ?? { schemaVersion: 1 };
    this.#write(key, { ...profile, settings: { ...settings }, updatedAt: this.now().toISOString() });
  }

  // --- stan gry (autozapis) -------------------------------------------------------------------

  async loadBookState(bookId) {
    return this.#read(this.#bookKey(bookId));
  }

  // Zapis z kontrolą wersji: jeśli w międzyczasie inny zapis (np. w drugiej karcie) zmienił stan,
  // zgłasza ConflictError z nowszym stanem — chyba że gracz wybrał nadpisanie (force).
  async saveBookState(bookId, state, { force = false } = {}) {
    const key = this.#bookKey(bookId);
    const stored = this.#read(key);
    const storedRevision = stored?.revision ?? 0;
    if (!force && stored && storedRevision !== state.revision) throw new ConflictError(stored);
    const revision = Math.max(storedRevision, state.revision ?? 0) + 1;
    const toStore = { ...state, revision, updatedAt: this.now().toISOString() };
    this.#write(key, toStore);
    state.revision = revision;
    state.updatedAt = toStore.updatedAt;
    return revision;
  }

  // --- ręczne zapisy (save1 … save3) ----------------------------------------------------------

  async listSaves(bookId) {
    return SAVE_SLOTS.map((saveId) => {
      const save = this.#read(this.#saveKey(bookId, saveId));
      return save ? { saveId, ...save } : { saveId, empty: true };
    });
  }

  async writeSave(bookId, saveId, { label, state }) {
    this.#checkSlot(saveId);
    this.#write(this.#saveKey(bookId, saveId), {
      schemaVersion: 1,
      label,
      state,
      createdAt: this.now().toISOString(),
    });
  }

  async readSave(bookId, saveId) {
    this.#checkSlot(saveId);
    return this.#read(this.#saveKey(bookId, saveId));
  }

  async deleteSave(bookId, saveId) {
    this.#checkSlot(saveId);
    this.#remove(this.#saveKey(bookId, saveId));
  }

  // --- pomocnicze ------------------------------------------------------------------------------

  #playerId() {
    if (!this.session) throw new Error('Brak zalogowanego gracza');
    return this.session.playerId;
  }

  #bookKey(bookId) {
    return `player:${this.#playerId()}:book:${bookId}`;
  }

  #saveKey(bookId, saveId) {
    return `${this.#bookKey(bookId)}:save:${saveId}`;
  }

  #checkSlot(saveId) {
    if (!SAVE_SLOTS.includes(saveId)) throw new Error(`Nieznane miejsce zapisu: ${saveId}`);
  }

  #read(key) {
    const raw = this.storage.getItem(PREFIX + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  #write(key, value) {
    this.storage.setItem(PREFIX + key, JSON.stringify(value));
  }

  #remove(key) {
    this.storage.removeItem(PREFIX + key);
  }
}
