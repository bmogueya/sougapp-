import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Globe, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 rtl:pr-72 ltr:pl-72">
      <div className="font-semibold text-gray-700">
        Super Admin Panel
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-gray-500" />
          <select 
            className="border-none bg-transparent text-sm focus:ring-0 cursor-pointer"
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
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </header>
  );
}
