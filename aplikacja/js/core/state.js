// Stan rozgrywki gracza w jednej książce — model zgodny z dokumentacja/FIREBASE.md (rozdz. 3.2).

export const SCHEMA_VERSION = 1;

export function createState({ manifest, mechanics, previous = null, keepNotes = false, now = new Date() }) {
  const timestamp = now.toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    bookId: manifest.id,
    contentVersion: manifest.contentVersion,
    status: 'inProgress',
    currentNode: mechanics?.startNode ?? manifest.startNode,
    history: [],
    visits: {},
    modules: initialModules(mechanics),
    notes: keepNotes && previous ? previous.notes ?? '' : '',
    endingsFound: previous ? [...(previous.endingsFound ?? [])] : [],
    playthrough: previous ? (previous.playthrough ?? 0) + 1 : 1,
    undo: [],
    revision: previous ? previous.revision ?? 0 : 0,
    startedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function initialModules(mechanics) {
  const modules = {};
  if (mechanics?.modules?.codewords) modules.codewords = { owned: [] };
  return modules;
}

// Sprawdza, czy zapisany stan pasuje do treści książki; zwraca listę problemów (pusta = poprawny).
export function validateState(state, content) {
  const problems = [];
  if (!state || typeof state !== 'object') return ['brak stanu'];
  if (state.schemaVersion !== SCHEMA_VERSION) problems.push(`nieznana wersja schematu ${state.schemaVersion}`);
  if (!content.nodes[state.currentNode]) problems.push(`nieznany węzeł ${state.currentNode}`);
  if (!Array.isArray(state.history) || state.history.some((id) => !content.nodes[id])) problems.push('błędna historia');
  if (!state.visits || typeof state.visits !== 'object') problems.push('błędne odwiedziny');
  if (!Array.isArray(state.endingsFound)) problems.push('błędna lista zakończeń');
  if (!Array.isArray(state.undo)) problems.push('błędna lista ruchów do cofnięcia');
  return problems;
}

export function sortCodes(codes) {
  return [...codes].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    return Number.isNaN(na) || Number.isNaN(nb) ? String(a).localeCompare(String(b)) : na - nb;
  });
}
