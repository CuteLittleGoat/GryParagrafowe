// Ustawienia wyświetlania i mechaniki.
// - W profilu gracza (konto; Firebase albo tryb lokalny): motyw, wielkość tekstu, tryb mechaniki
//   (PROFILE_SETTING_KEYS — reguły Firebase dopuszczają w profilu tylko te klucze).
// - Na urządzeniu (pamięć przeglądarki, bez danych gracza): motyw, wielkość tekstu, krój pisma i wygląd
//   akapitów. Krój i wygląd akapitów zależą od ekranu (telefon, komputer), więc są tylko na urządzeniu.

export const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
export const THEMES = ['auto', 'light', 'dark'];
export const MECHANICS_MODES = ['auto', 'manual'];
// Krój pisma tekstu książki (zgoda Wydawcy z 2026-11-08) — na pierwszym miejscu i domyślnie krój jak w
// publikacji. Pliki i licencje: aplikacja/assets/fonts/README.md; reguły @font-face: css/style.css.
export const BOOK_FONTS = ['original', 'literata', 'pt-serif', 'open-sans', 'andika'];
// Wygląd akapitów: „wygodny na ekranie” (odstępy, do lewej — dotychczasowy, domyślny) albo „jak w
// książce” (wcięcia, bez odstępów, wyrównanie do obu krawędzi — jak w PDF).
export const PARAGRAPH_STYLES = ['screen', 'book'];
export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'auto',
  fontScale: 1,
  mechanicsMode: 'auto',
  bookFont: 'original',
  paragraphStyle: 'screen',
});
export const PROFILE_SETTING_KEYS = ['theme', 'fontScale', 'mechanicsMode'];
const DEVICE_SETTING_KEYS = ['theme', 'fontScale', 'bookFont', 'paragraphStyle'];

const DEVICE_KEY = 'gp1:device';

export function normalizeSettings(raw = {}) {
  return {
    theme: THEMES.includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    fontScale: FONT_SCALES.includes(raw.fontScale) ? raw.fontScale : DEFAULT_SETTINGS.fontScale,
    mechanicsMode: MECHANICS_MODES.includes(raw.mechanicsMode) ? raw.mechanicsMode : DEFAULT_SETTINGS.mechanicsMode,
    bookFont: BOOK_FONTS.includes(raw.bookFont) ? raw.bookFont : DEFAULT_SETTINGS.bookFont,
    paragraphStyle: PARAGRAPH_STYLES.includes(raw.paragraphStyle) ? raw.paragraphStyle : DEFAULT_SETTINGS.paragraphStyle,
  };
}

// Część ustawień zapisywana w profilu gracza (bez kluczy tylko z urządzenia).
export function profileSettings(settings) {
  return Object.fromEntries(PROFILE_SETTING_KEYS.map((key) => [key, settings[key]]));
}

function pick(settings, keys) {
  return Object.fromEntries(keys.filter((key) => settings[key] !== undefined).map((key) => [key, settings[key]]));
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.bookFont = settings.bookFont;
  root.dataset.paragraphs = settings.paragraphStyle;
  root.style.setProperty('--font-scale', String(settings.fontScale));
}

export function stepFontScale(current, direction) {
  const index = Math.max(0, FONT_SCALES.indexOf(current));
  return FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, index + direction))];
}

export function loadDeviceSettings() {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(DEVICE_KEY) ?? 'null');
    return raw ? pick(raw, DEVICE_SETTING_KEYS) : {};
  } catch {
    return {};
  }
}

export function saveDeviceSettings(settings) {
  try {
    globalThis.localStorage?.setItem(DEVICE_KEY, JSON.stringify(pick(settings, DEVICE_SETTING_KEYS)));
  } catch {
    // Brak dostępu do pamięci przeglądarki (np. tryb prywatny) — ustawienia działają do zamknięcia karty.
  }
}

export const THEME_LABELS = { auto: 'Automatyczny (jak w systemie)', light: 'Jasny', dark: 'Ciemny' };
export const BOOK_FONT_LABELS = {
  original: 'Old Standard TT — jak w oryginale',
  literata: 'Literata — szeryfowy, do czytania na ekranie',
  'pt-serif': 'PT Serif — szeryfowy, klasyczny',
  'open-sans': 'Open Sans — bezszeryfowy',
  andika: 'Andika — przyjazny dla osób z dysleksją',
};
export const PARAGRAPH_STYLE_LABELS = {
  screen: 'Wygodny na ekranie — odstępy między akapitami, tekst wyrównany do lewej',
  book: 'Jak w książce — wcięcie pierwszego wiersza, bez odstępów, tekst wyrównany do obu krawędzi',
};
export const MODE_LABELS = {
  auto: 'Automatyczny — aplikacja sama zapisuje to, co zdobywasz w grze, i oznacza drogi',
  manual: 'Ręczny — jak na papierze: wszystko zapisujesz sam, aplikacja niczego nie oznacza',
};
