// Wybór adaptera zapisu:
// - pod adresem aplikacji w internecie (np. GitHub Pages) — Firebase (konta graczy, logowanie hasłem),
// - na komputerze dewelopera (localhost) — zapis lokalny bez kont (tylko do testów),
// - localhost z parametrem ?emulator — Firebase w lokalnym emulatorze (testy, bez prawdziwej bazy).
// Bez konfiguracji Firebase logowanie poza localhost jest niedostępne — nie da się grać bez
// logowania (AGENTS.md, rozdz. 1.2 pkt 6).

import { LocalAdapter } from './local-adapter.js';
import { createFirestoreAdapter } from './firestore-adapter.js';
import { appCheckSiteKey, firebaseConfig } from '../../../firebase/firebase-config.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

// Projekt „demo-…” istnieje tylko w emulatorze — nie łączy się z prawdziwą bazą.
const EMULATOR_CONFIG = Object.freeze({
  apiKey: 'demo-api-key',
  authDomain: 'demo-gryparagrafowe.firebaseapp.com',
  projectId: 'demo-gryparagrafowe',
  appId: 'demo-app',
});

export function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname);
}

export async function createStorage(location = globalThis.location) {
  const local = isLocalHost(location.hostname);
  if (local && new URLSearchParams(location.search).has('emulator')) {
    return createFirestoreAdapter({ config: EMULATOR_CONFIG, emulator: true });
  }
  if (local) return new LocalAdapter(globalThis.localStorage);
  if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId) return null;
  return createFirestoreAdapter({ config: firebaseConfig, appCheckSiteKey: appCheckSiteKey || null });
}
