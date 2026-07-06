import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Map, Clock, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/driver', label: 'Missions', icon: Map },
  { to: '/driver/history', label: 'Historique', icon: Clock },
  { to: '/driver/profile', label: 'Profil', icon: User },
];

export function DriverLayout() {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => 
    path === '/driver' ? location.pathname === '/driver' : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col min-h-screen bg-bg pb-16 sm:pb-0">
      {/* Top Header pour mobile */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-surface border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-text">Driver App</h1>
        <button 
          onClick={() => signOut()}
          className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-danger"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Zone de contenu */}
      <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border sm:hidden shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive(to) ? "text-primary" : "text-muted hover:text-text"
              )}
            >
              <Icon size={22} className={isActive(to) ? "fill-primary/20" : ""} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Sidebar Desktop */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-border p-4 shadow-sm">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-black text-primary">Driver Portal</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {NAV.map(({ to, label, icon: Icon }) => (
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
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>
    </div>
  );
}
