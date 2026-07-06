import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Map, ShoppingBag, Settings, Car, Wallet, Blocks, X, Navigation, Megaphone } from 'lucide-react';
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

interface SidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ sidebarOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-text/30 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 bg-primary text-primary-foreground flex flex-col h-screen fixed top-0 z-50 transition-transform duration-200",
        "ltr:left-0 rtl:right-0",
        sidebarOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full",
        "lg:translate-x-0 lg:ltr:left-0 lg:rtl:right-0",
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-strong/30">
          <h1 className="text-xl font-bold">SougApp Admin</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => {
            const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                <Icon size={20} />
                <span>{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
