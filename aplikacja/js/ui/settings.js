// Ustawienia wyświetlania i mechaniki. Gracz zalogowany ma je w swoim profilu; dodatkowo ostatnie
// ustawienia wyglądu pamiętamy na urządzeniu (tylko motyw i rozmiar tekstu — żadnych danych gracza).

export const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
export const THEMES = ['auto', 'light', 'dark'];
export const MECHANICS_MODES = ['auto', 'manual'];
export const DEFAULT_SETTINGS = Object.freeze({ theme: 'auto', fontScale: 1, mechanicsMode: 'auto' });

const DEVICE_KEY = 'gp1:device';

export function normalizeSettings(raw = {}) {
  return {
    theme: THEMES.includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    fontScale: FONT_SCALES.includes(raw.fontScale) ? raw.fontScale : DEFAULT_SETTINGS.fontScale,
    mechanicsMode: MECHANICS_MODES.includes(raw.mechanicsMode) ? raw.mechanicsMode : DEFAULT_SETTINGS.mechanicsMode,
  };
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.style.setProperty('--font-scale', String(settings.fontScale));
}

export function stepFontScale(current, direction) {
  const index = Math.max(0, FONT_SCALES.indexOf(current));
  return FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, index + direction))];
}

export function loadDeviceSettings() {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(DEVICE_KEY) ?? 'null');
    return raw ? { theme: raw.theme, fontScale: raw.fontScale } : {};
  } catch {
    return {};
  }
}

export function saveDeviceSettings(settings) {
  try {
    globalThis.localStorage?.setItem(DEVICE_KEY, JSON.stringify({ theme: settings.theme, fontScale: settings.fontScale }));
  } catch {
    // Brak dostępu do pamięci przeglądarki (np. tryb prywatny) — ustawienia działają do zamknięcia karty.
  }
}

export const THEME_LABELS = { auto: 'Automatyczny (jak w systemie)', light: 'Jasny', dark: 'Ciemny' };
export const MODE_LABELS = {
  auto: 'Automatyczny — aplikacja zapisuje zdobyte Informacje i oznacza drogi',
  manual: 'Ręczny — jak na papierze: sam prowadzisz kartę, aplikacja niczego nie oznacza',
};
