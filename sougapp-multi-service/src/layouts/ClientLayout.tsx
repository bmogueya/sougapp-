import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const NAV = [
  { to: '/app', labelKey: 'nav.home', icon: Home },
  { to: '/app/search', labelKey: 'nav.search', icon: Search },
  { to: '/app/cart', labelKey: 'nav.cart', icon: ShoppingCart },
  { to: '/app/profile', labelKey: 'nav.profile', icon: User },
];

export function ClientLayout() {
  const { t } = useTranslation('client');
  const location = useLocation();

  const isActive = (path: string) => 
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col min-h-screen bg-surface-2 pb-16 sm:pb-0">
      {/* Top Header pour mobile - Peut être dynamique selon la route, mais voici un basique */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-center bg-primary text-primary-foreground shadow-sm">
        <h1 className="text-lg font-bold tracking-tight">SougApp</h1>
      </header>

      {/* Zone de contenu défilante */}
      <main id="main-content" className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border sm:hidden shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {NAV.map(({ to, labelKey, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive(to) ? "text-primary" : "text-muted hover:text-text"
              )}
            >
              <Icon size={20} className={isActive(to) ? "fill-primary/20" : ""} />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Sidebar Desktop (Alternative pour les grands écrans) */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-border p-4 shadow-sm">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-black text-primary">SougApp</h1>
        </div>
        <nav className="space-y-2">
          {NAV.map(({ to, labelKey, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm",
                isActive(to) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted hover:bg-surface-2 hover:text-text"
              )}
            >
              <Icon size={20} />
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
