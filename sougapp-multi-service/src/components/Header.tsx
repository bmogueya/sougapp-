import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

const Header = memo(function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  // La persistance + l'application de `dir`/`lang` sont centralisées dans
  // `i18n/config.ts` (listener `languageChanged`), donc valables pour tous
  // les rôles. Ici on ne fait que déclencher le changement.
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
          aria-label="Menu"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar-menu"
        >
          <Menu size={20} />
        </button>
        <div className="font-semibold text-text">
          Super Admin Panel
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <ThemeToggle />

        <div className="flex items-center gap-2">
          <Globe size={18} className="text-muted" />
          <select 
            className="border-none bg-transparent text-sm text-text focus:ring-0 cursor-pointer"
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <button 
          onClick={signOut}
          className="flex items-center gap-2 text-danger hover:text-danger text-sm font-medium"
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </header>
  );
});

export { Header };
