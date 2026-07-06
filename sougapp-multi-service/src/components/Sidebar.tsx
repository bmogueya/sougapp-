import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Map, ShoppingBag, Settings, Car, Wallet, Blocks } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed top-0 rtl:right-0 ltr:left-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">SougApp Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </Link>
        <Link to="/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Users size={20} />
          <span>{t('users')}</span>
        </Link>
        <Link to="/drivers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Car size={20} />
          <span>{t('drivers')}</span>
        </Link>
        <Link to="/merchants" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Store size={20} />
          <span>{t('merchants')}</span>
        </Link>
        <Link to="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <ShoppingBag size={20} />
          <span>{t('orders')}</span>
        </Link>
        <Link to="/finance" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Wallet size={20} />
          <span>{t('finance')}</span>
        </Link>
        <Link to="/zones" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Map size={20} />
          <span>{t('zones')}</span>
        </Link>
        <Link to="/modules" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
          <Blocks size={20} />
          <span>{t('modules_nav')}</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors mt-auto">
          <Settings size={20} />
          <span>{t('settings')}</span>
        </Link>
      </nav>
    </aside>
  );
}
