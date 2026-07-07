// =============================================================================
// lang.ts — langue active + direction du document (i18n FR / AR / EN + RTL).
//
// Miroir de `theme.ts` : la langue choisie est mémorisée dans localStorage et
// la direction (`dir`) / l'attribut `lang` de <html> sont appliqués en
// conséquence. Câblé globalement via un listener `languageChanged` dans
// `i18n/config.ts`, pour que le RTL fonctionne partout (pas seulement dans le
// chrome admin) et dès le premier rendu.
// =============================================================================

export type Lang = 'fr' | 'ar' | 'en';

const STORAGE_KEY = 'sougapp-lang';
const SUPPORTED: readonly Lang[] = ['fr', 'ar', 'en'];

/** Langue par défaut (aucun choix mémorisé). */
export const DEFAULT_LANG: Lang = 'fr';

/** Vrai si la valeur est une langue supportée. */
export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (SUPPORTED as readonly string[]).includes(v);
}

/** Vrai pour les langues écrites de droite à gauche. */
export function isRtl(lang: Lang): boolean {
  return lang === 'ar';
}

/** Langue mémorisée par l'utilisateur, ou null si aucun choix valide. */
export function getStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/** Langue effective : choix mémorisé sinon langue par défaut. */
export function getActiveLang(): Lang {
  return getStoredLang() ?? DEFAULT_LANG;
}

/** Applique la direction (`dir`) et l'attribut `lang` à <html>. */
export function applyLangDir(lang: Lang): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.dir = isRtl(lang) ? 'rtl' : 'ltr';
  el.lang = lang;
}

/** Applique la direction ET mémorise le choix de l'utilisateur. */
export function setLang(lang: Lang): void {
  applyLangDir(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* stockage indisponible : la direction reste appliquée pour la session */
  }
}
