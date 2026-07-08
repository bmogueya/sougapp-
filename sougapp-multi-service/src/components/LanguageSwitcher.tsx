import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';

// La persistance + l'application de `dir`/`lang` sont centralisées dans
// `i18n/config.ts` (listener `languageChanged`) : ici on ne fait que déclencher
// le changement. Réutilisable dans tous les chrome (admin, client, driver…).
const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
] as const;

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe size={18} className="text-muted" />
      <select
        aria-label={t('language')}
        className="border-none bg-transparent text-sm text-text focus:ring-0 cursor-pointer"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
