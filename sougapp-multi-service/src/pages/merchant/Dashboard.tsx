import { useState } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMRU } from '../../lib/utils';

const RECENT = [
  { id: "ORS-48213", customer: "Aïcha mint Ahmed", amount: 1450, status: "delivered" as const, items: 3, time: "il y a 3 min" },
  { id: "ORS-48212", customer: "Mohamed Ould Sidi", amount: 12800, status: "preparing" as const, items: 1, time: "il y a 6 min" },
  { id: "ORS-48211", customer: "Fatimetou mint Baba", amount: 2360, status: "pending" as const, items: 2, time: "il y a 11 min" },
  { id: "ORS-48210", customer: "Cheikh Ould Vall", amount: 640, status: "onTheWay" as const, items: 1, time: "il y a 14 min" },
  { id: "ORS-48209", customer: "Mariem mint Sidi", amount: 3980, status: "delivered" as const, items: 8, time: "il y a 18 min" },
];

export function MerchantDashboard() {
  const [stats] = useState({
    todayOrders: 12,
    todayRevenue: 24500,
    activeProducts: 45,
    pendingOrders: 3,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Vue d'ensemble</h1>
          <p className="mt-1 text-sm text-muted">
            Résumé de votre activité aujourd'hui
          </p>
        </div>
        <Link
          to="/merchant/settings"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
        >
          Gérer la boutique
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 px-5 py-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Commandes du jour</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-text">
              {stats.todayOrders}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 px-5 py-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info/10 text-info">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Revenus du jour</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-text">
              {formatMRU(stats.todayRevenue, "fr")}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 px-5 py-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Produits actifs</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-text">
              {stats.activeProducts}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 px-5 py-5 ltr:border-l-4 rtl:border-r-4 border-warning">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              Commandes en attente
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-text">
              {stats.pendingOrders}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text">
            Dernières commandes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted">
                <th className="px-5 py-3">Commande</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Articles</th>
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">{""}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border transition-colors hover:bg-surface-2"
                >
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-muted">
                    {o.id}
                  </td>
                  <td className="px-5 py-3 font-medium text-text">
                    {o.customer}
                  </td>
                  <td className="px-5 py-3 text-muted">{o.items}</td>
                  <td className="px-5 py-3 font-mono font-semibold tabular-nums text-text">
                    {formatMRU(o.amount, "fr")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-faint">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          to="/merchant/orders"
          className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
        >
          Voir toutes les commandes
        </Link>
      </Card>
    </div>
  );
}