import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

const Header = memo(function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { t } = useTranslation();
  const { signOut } = useAuth();

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

        <LanguageSwitcher />

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
