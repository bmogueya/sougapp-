import { useState, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMRU, cn } from "@/lib/utils";
import type { OrderStatus } from "@/data/dashboard";

const ALL_ORDERS = [
  { id: "ORS-48213", customer: "Aïcha mint Ahmed", amount: 1450, status: "delivered" as OrderStatus, items: 3, time: "il y a 3 min", payment: "Bankily" },
  { id: "ORS-48212", customer: "Mohamed Ould Sidi", amount: 12800, status: "preparing" as OrderStatus, items: 1, time: "il y a 6 min", payment: "Masrivi" },
  { id: "ORS-48211", customer: "Fatimetou mint Baba", amount: 2360, status: "pending" as OrderStatus, items: 2, time: "il y a 11 min", payment: "Sedad" },
  { id: "ORS-48210", customer: "Cheikh Ould Vall", amount: 640, status: "onTheWay" as OrderStatus, items: 1, time: "il y a 14 min", payment: "Espèces" },
  { id: "ORS-48209", customer: "Mariem mint Sidi", amount: 3980, status: "delivered" as OrderStatus, items: 8, time: "il y a 18 min", payment: "Bankily" },
  { id: "ORS-48208", customer: "Sidi Ould Cheikh", amount: 900, status: "onTheWay" as OrderStatus, items: 1, time: "il y a 21 min", payment: "Espèces" },
  { id: "ORS-48207", customer: "Khadijetou mint Ely", amount: 2150, status: "cancelled" as OrderStatus, items: 5, time: "il y a 25 min", payment: "Carte" },
  { id: "ORS-48206", customer: "Ahmedou Ould Salem", amount: 5000, status: "delivered" as OrderStatus, items: 1, time: "il y a 29 min", payment: "Bankily" },
  { id: "ORS-48205", customer: "Salka mint Mohamed", amount: 6240, status: "delivered" as OrderStatus, items: 12, time: "il y a 34 min", payment: "Sedad" },
  { id: "ORS-48204", customer: "Baba Ould Ahmed", amount: 1120, status: "onTheWay" as OrderStatus, items: 2, time: "il y a 38 min", payment: "Bankily" },
];

const STATUS_TABS = ["all", "pending", "preparing", "onTheWay", "delivered", "cancelled"] as const;

export function MerchantOrders() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = ALL_ORDERS;
    if (tab !== "all") list = list.filter((o) => o.status === tab);
    if (search) list = list.filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Commandes</h1>
        <p className="mt-1 text-sm text-muted">
          Suivez et gérez les commandes de votre boutique
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-bg pl-10 pr-4 py-2.5 text-sm text-text border border-border placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  tab === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-2",
                )}
              >
                {s === "all" ? "Toutes" : s === "pending" ? "Attente" : s === "preparing" ? "Prép." : s === "onTheWay" ? "En route" : s === "delivered" ? "Livrées" : "Annulées"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">{""}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShoppingBag className="mx-auto text-faint mb-3" size={40} />
                    <p className="font-medium text-text">Aucune commande trouvée</p>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border transition-colors hover:bg-surface-2">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-muted">{o.id}</td>
                    <td className="px-6 py-4 font-medium text-text">{o.customer}</td>
                    <td className="px-6 py-4 text-muted">{o.items}</td>
                    <td className="px-6 py-4 font-mono font-semibold tabular-nums text-text">
                      {formatMRU(o.amount, "fr")}
                    </td>
                    <td className="px-6 py-4 text-muted">{o.payment}</td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4">
                      <button className="text-faint hover:text-primary transition-colors" title="Détails">
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}