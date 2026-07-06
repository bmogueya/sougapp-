import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Map, ShoppingBag, Settings, Car, Wallet, Blocks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/users', icon: Users, labelKey: 'users' },
  { to: '/drivers', icon: Car, labelKey: 'drivers' },
  { to: '/merchants', icon: Store, labelKey: 'merchants' },
  { to: '/orders', icon: ShoppingBag, labelKey: 'orders' },
  { to: '/finance', icon: Wallet, labelKey: 'finance' },
  { to: '/zones', icon: Map, labelKey: 'zones' },
  { to: '/modules', icon: Blocks, labelKey: 'modules_nav' },
  { to: '/settings', icon: Settings, labelKey: 'settings' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed top-0 rtl:right-0 ltr:left-0">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">SougApp Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon size={20} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
