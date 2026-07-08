import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

/**
 * Carte « Préférences » réutilisable (langue + thème), pensée pour les écrans
 * Profil des apps mobiles client/livreur. Utilise le namespace i18n par défaut,
 * indépendamment du namespace de la page hôte.
 */
export function PreferencesCard() {
  const { t } = useTranslation();

  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden">
      <h2 className="font-bold text-lg text-text px-6 pt-5 pb-2 flex items-center gap-2">
        <Settings size={20} className="text-primary" />
        {t('preferences')}
      </h2>
      <div className="divide-y divide-border">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-text">{t('language')}</span>
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-text">{t('theme')}</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
