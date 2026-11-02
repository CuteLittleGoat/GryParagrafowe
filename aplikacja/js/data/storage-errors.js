// Wspólne stałe i błędy adapterów zapisu (lokalnego i Firestore).

export const SAVE_SLOTS = ['save1', 'save2', 'save3']; // decyzja właściciela P6
export const SESSION_DAYS = 30; // logowanie pamiętane 30 dni (P6)

// Błąd logowania z komunikatem dla gracza.
export class LoginError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LoginError';
  }
}

// Stan gry zmienił się w innym miejscu (druga karta, inne urządzenie) — `newer` to nowszy stan.
export class ConflictError extends Error {
  constructor(newer) {
    super('Stan gry zmienił się w innym oknie lub na innym urządzeniu.');
    this.name = 'ConflictError';
    this.newer = newer;
  }
}
