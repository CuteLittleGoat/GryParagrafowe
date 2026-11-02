// Punkt startowy aplikacji: ustawienia, logowanie, router ekranów.

import { createStorage } from './data/storage.js';
import { h, clear } from './ui/dom.js';
import { alertDialog } from './ui/dialogs.js';
import {
  DEFAULT_SETTINGS, applySettings, loadDeviceSettings, normalizeSettings, saveDeviceSettings,
} from './ui/settings.js';
import { renderHome } from './ui/home-screen.js';
import { renderGame } from './ui/game-screen.js';
import { renderAbout } from './ui/about-screen.js';

const app = {
  storage: null,
  session: null,
  settings: normalizeSettings({ ...DEFAULT_SETTINGS, ...loadDeviceSettings() }),
  main: document.getElementById('app'),
  userArea: document.getElementById('user-area'),
  dispose: null,

  async updateSettings(partial) {
    this.settings = normalizeSettings({ ...this.settings, ...partial });
    applySettings(this.settings);
    saveDeviceSettings(this.settings);
    if (this.session) {
      try {
        await this.storage.saveSettings(this.settings);
      } catch (error) {
        console.error(error);
      }
    }
  },

  async login(login, password) {
    this.session = await this.storage.login(login, password);
    await this.loadProfileSettings();
    this.renderUserArea();
  },

  async logout() {
    await this.dispose?.();
    this.dispose = null;
    await this.storage?.logout();
    this.session = null;
    this.renderUserArea();
    if (location.hash && location.hash !== '#/') location.hash = '#/';
    else route();
  },

  async loadProfileSettings() {
    try {
      const profile = await this.storage.loadProfile();
      this.settings = normalizeSettings({ ...this.settings, ...(profile?.settings ?? {}) });
      applySettings(this.settings);
      saveDeviceSettings(this.settings);
    } catch (error) {
      console.error(error);
    }
  },

  async restore() {
    this.session = await this.storage.restoreSession();
    if (this.session) await this.loadProfileSettings();
    this.renderUserArea();
  },

  renderUserArea() {
    clear(this.userArea);
    if (!this.session) return;
    this.userArea.append(
      h('span', { class: 'user-name' }, h('span', { class: 'user-label' }, 'Gracz: '), this.session.displayName),
      h('button', { type: 'button', class: 'btn btn-quiet btn-small', onClick: () => this.logout() }, 'Wyloguj'),
    );
  },

  setTitle(text) {
    document.title = text ? `${text} — Gry paragrafowe` : 'Gry paragrafowe';
  },
};

async function route() {
  await app.dispose?.();
  app.dispose = null;
  const match = (location.hash || '#/').match(/^#\/([a-z-]*)(?:\/([a-z0-9-]+))?\/?$/);
  const screen = match?.[1] ?? '';
  const bookId = match?.[2] ?? null;
  clear(app.main);
  window.scrollTo(0, 0);
  try {
    if (!app.session || screen === '' || !match) {
      app.setTitle('');
      if (screen !== '' && location.hash !== '#/') history.replaceState(null, '', '#/');
      app.dispose = await renderHome(app, app.main);
    } else if (screen === 'gra' && bookId) {
      app.dispose = await renderGame(app, app.main, bookId);
    } else if (screen === 'o-ksiazce' && bookId) {
      app.dispose = await renderAbout(app, app.main, bookId);
    } else {
      history.replaceState(null, '', '#/');
      app.dispose = await renderHome(app, app.main);
    }
  } catch (error) {
    console.error(error);
    clear(app.main).append(
      h('section', { class: 'panel error-panel', role: 'alert' },
        h('h1', {}, 'Coś poszło nie tak'),
        h('p', {}, 'Nie udało się wyświetlić tego ekranu. Spróbuj odświeżyć stronę.'),
        h('p', { class: 'muted' }, String(error.message ?? error)),
        h('p', {}, h('a', { href: '#/', class: 'btn' }, 'Menu główne'))),
    );
  }
  const heading = app.main.querySelector('h1');
  if (heading && document.activeElement === document.body) {
    heading.setAttribute('tabindex', '-1');
  }
}

async function start() {
  applySettings(app.settings);
  app.storage = await createStorage();
  if (app.storage) {
    try {
      await app.restore();
    } catch (error) {
      console.error(error);
      await alertDialog({ title: 'Logowanie', message: 'Nie udało się przywrócić sesji. Zaloguj się ponownie.' });
    }
  }
  // Odnośnik „Przejdź do treści” nie może zmieniać adresu (adres # obsługuje router ekranów).
  document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    app.main.focus();
  });
  window.addEventListener('hashchange', route);
  await route();
}

app.route = route;
start();
