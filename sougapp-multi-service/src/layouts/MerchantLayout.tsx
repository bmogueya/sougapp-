import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Tag,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

const NAV = [
  { to: "/merchant", labelKey: "merchantNav.overview", icon: Store },
  { to: "/merchant/orders", labelKey: "merchantNav.orders", icon: ShoppingBag },
  { to: "/merchant/products", labelKey: "merchantNav.products", icon: Package },
  { to: "/merchant/categories", labelKey: "merchantNav.categories", icon: Tag },
  { to: "/merchant/settings", labelKey: "merchantNav.settings", icon: Settings },
];

export function MerchantLayout() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/merchant"
      ? location.pathname === "/merchant"
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-text/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-surface border-border transition-transform duration-300 ltr:left-0 rtl:right-0 lg:static lg:translate-x-0 lg:rtl:translate-x-0",
          sidebarOpen
            ? "translate-x-0 rtl:-translate-x-0"
            : "-translate-x-full rtl:translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-5">
          <Link to="/merchant" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <Store size={18} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-text">
              Merchant Panel
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-faint hover:text-text hover:bg-surface-2 p-1.5 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV.map(({ to, labelKey, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon size={18} />
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-faint hover:text-text hover:bg-surface-2 p-2 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ltr:ml-auto rtl:mr-auto">
            <button className="relative p-2 text-faint hover:text-text hover:bg-surface-2 rounded-lg transition-colors">
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
            <div className="flex items-center gap-3 border-l border-border ltr:pl-4 rtl:pr-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                M
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-medium text-text">Mon Magasin</p>
                <p className="text-xs text-muted">Marchand</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}