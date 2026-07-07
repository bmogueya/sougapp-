import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { setTheme, nextTheme, type Theme } from '../lib/theme';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Bouton bascule clair ⇄ sombre. L'état initial reflète la classe `.dark`
 * déjà posée par le script anti-flash d'index.html.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  );

  const toggle = () => {
    const next = nextTheme(theme);
    setTheme(next);
    setThemeState(next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className={cn(
        'p-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors',
        className,
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
