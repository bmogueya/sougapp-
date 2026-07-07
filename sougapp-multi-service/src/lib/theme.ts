// =============================================================================
// theme.ts — gestion du thème clair/sombre "Desert Night".
//
// La stratégie Tailwind est `darkMode: "class"` : le thème sombre est actif
// quand la classe `.dark` est présente sur <html>. Un script inline dans
// index.html applique le thème AVANT le rendu React (anti-flash) ; ce module
// gère les changements côté application et la persistance.
// =============================================================================

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sougapp-theme';

/** Préférence système du navigateur. */
export function getSystemTheme(): Theme {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Thème mémorisé par l'utilisateur, ou null si aucun choix explicite. */
export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

/** Thème effectif : choix explicite sinon préférence système. */
export function getActiveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

/** Le thème opposé (pour un toggle deux états). */
export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

/** Applique le thème au DOM (ajoute/retire `.dark` sur <html>). */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/** Applique ET mémorise le choix de l'utilisateur. */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* stockage indisponible : le thème reste appliqué pour la session */
  }
}
