// Wybór adaptera zapisu.
// Do czasu wdrożenia Firebase (Etap 5) jedynym adapterem jest zapis lokalny — i działa on
// WYŁĄCZNIE na komputerze dewelopera (localhost). Na każdym innym adresie (np. GitHub Pages)
// logowanie jest niedostępne, więc nie da się grać bez logowania (AGENTS.md, rozdz. 1.2 pkt 6).

import { LocalAdapter } from './local-adapter.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname);
}

export async function createStorage(location = globalThis.location) {
  if (isLocalHost(location.hostname)) return new LocalAdapter(globalThis.localStorage);
  return null;
}
