import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Map,
  Crosshair,
  Users,
  Activity,
  Filter,
  Navigation,
} from "lucide-react";
import { MapComponent } from "@/components/MapComponent";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatMRU, cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 * Nouakchott district coordinates (approximate centroids)
 * ───────────────────────────────────────────────────────────── */
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Tevragh Zeina": [18.085, -15.983],
  Ksar: [18.095, -15.950],
  Arafat: [18.050, -15.970],
  "Dar Naïm": [18.120, -15.930],
  Toujounine: [18.130, -15.920],
  Riad: [18.030, -15.960],
  Sebkha: [18.070, -15.940],
  "El Mina": [18.020, -15.980],
};

const NOUAKCHOTT: [number, number] = [18.0735, -15.9582];
const ZOOM = 13;

type OrderStatus = "pending" | "preparing" | "ready";

interface DispatchOrder {
  id: string;
  status: OrderStatus;
  name: string;
  type: string;
  district: string;
  amount: number;
}

interface DispatchDriver {
  id: string;
  name: string;
  status: "idle" | "busy";
  district: string;
  rating: number;
}

const INITIAL_ORDERS: DispatchOrder[] = [
  { id: "ORD-5412", status: "pending", name: "Burger King", type: "food", district: "Tevragh Zeina", amount: 1450 },
  { id: "ORD-5413", status: "preparing", name: "Pizza Hot", type: "food", district: "Ksar", amount: 3200 },
  { id: "ORD-5414", status: "ready", name: "KFC", type: "food", district: "Arafat", amount: 2150 },
  { id: "ORD-5415", status: "pending", name: "Pharmacie El Wahda", type: "pharmacy", district: "Dar Naïm", amount: 980 },
  { id: "ORD-5416", status: "pending", name: "Marché Toujounine", type: "grocery", district: "Toujounine", amount: 4560 },
];

const INITIAL_DRIVERS: DispatchDriver[] = [
  { id: "DRV-001", name: "Amadou Ba", status: "idle", district: "Tevragh Zeina", rating: 4.8 },
  { id: "DRV-002", name: "Ousmane Diallo", status: "busy", district: "Ksar", rating: 4.5 },
  { id: "DRV-003", name: "Cheikh Vall", status: "idle", district: "Arafat", rating: 4.9 },
  { id: "DRV-004", name: "Demba Ba", status: "idle", district: "Dar Naïm", rating: 4.6 },
  { id: "DRV-005", name: "Moussa Doucouré", status: "busy", district: "Sebkha", rating: 4.7 },
];

const STATUS_TONE: Record<OrderStatus, "neutral" | "warning" | "info"> = {
  pending: "neutral",
  preparing: "warning",
  ready: "info",
};

const ASSIGNED_ORDERS: Record<string, string> = {
  "ORS-5413": "DRV-002",
  "ORD-5414": "DRV-005",
};

export function Dispatch() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [autoDispatch, setAutoDispatch] = useState(true);

  const filteredOrders = useMemo(
    () =>
      filterStatus === "all"
        ? orders
        : orders.filter((o) => o.status === filterStatus),
    [orders, filterStatus],
  );

  const assignOrder = useCallback((orderId: string) => {
    const idle = INITIAL_DRIVERS.find((d) => d.status === "idle" && !ASSIGNED_ORDERS[orderId]);
    if (!idle) return;
    ASSIGNED_ORDERS[orderId] = idle.id;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "ready" as const } : o)),
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === idle.id ? { ...d, status: "busy" as const } : d)),
    );
  }, []);

  const mapLocations = useMemo(() => {
    const locs: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      description?: string;
      color?: string;
    }[] = [];

    drivers.forEach((d) => {
      const coords = DISTRICT_COORDS[d.district];
      if (!coords) return;
      locs.push({
        id: d.id,
        name: d.name,
        latitude: coords[0],
        longitude: coords[1],
        description: `${d.district} · ${d.status === "idle" ? "Disponible" : "En course"} · ★ ${d.rating}`,
        color: d.status === "idle" ? "#22c55e" : "#f97316",
      });
    });

    filteredOrders.forEach((o) => {
      const coords = DISTRICT_COORDS[o.district];
      if (!coords) return;
      locs.push({
        id: o.id,
        name: o.name,
        latitude: coords[0] + 0.004,
        longitude: coords[1] + 0.004,
        description: `${o.id} · ${formatMRU(o.amount, "fr", { compact: true })} · ${o.district}`,
        color: "#ef4444",
      });
    });

    return locs;
  }, [drivers, filteredOrders]);

  const idleCount = useMemo(() => drivers.filter((d) => d.status === "idle").length, [drivers]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Live Dispatch</h1>
          <p className="mt-1 text-sm text-muted">
            Supervision des commandes et livreurs en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-muted shadow-card">
            <span className="h-2 w-2 rounded-full bg-success" />
            {idleCount} disponible{idleCount > 1 ? "s" : ""}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text shadow-card transition-colors hover:bg-surface-2">
            <Filter size={14} />
            Filtrer
          </button>
          <button
            onClick={() => setAutoDispatch(!autoDispatch)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-card transition-colors",
              autoDispatch
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-surface text-muted hover:bg-surface-2",
            )}
          >
            <Activity size={14} />
            Auto-Dispatch {autoDispatch ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "En attente", value: orders.filter((o) => o.status === "pending").length, accent: "text-warning" },
          { label: "En préparation", value: orders.filter((o) => o.status === "preparing").length, accent: "text-info" },
          { label: "Prêts", value: orders.filter((o) => o.status === "ready").length, accent: "text-success" },
          { label: "Livreurs occupés", value: drivers.filter((d) => d.status === "busy").length, accent: "text-danger" },
        ].map((kpi) => (
          <Card key={kpi.label} className="flex items-center gap-3 px-5 py-4">
            <span className={cn("font-mono text-2xl font-bold tabular-nums", kpi.accent)}>
              {kpi.value}
            </span>
            <span className="text-xs text-muted">{kpi.label}</span>
          </Card>
        ))}
      </div>

      {/* ── Map + Orders ── */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: Orders list */}
        <Card className="flex w-full flex-col overflow-hidden lg:w-1/3">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
              <Crosshair size={16} className="text-warning" />
              À dispatcher ({filteredOrders.length})
            </h2>
            <div className="flex gap-1">
              {(["all", "pending", "preparing", "ready"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                    filterStatus === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface-2",
                  )}
                >
                  {s === "all" ? "Tous" : s === "pending" ? "Attente" : s === "preparing" ? "Prép." : "Prêts"}
                </button>
              ))}
            </div>
          </div>

          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {filteredOrders.map((order) => (
              <li
                key={order.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    order.status === "pending" && "bg-warning",
                    order.status === "preparing" && "bg-info",
                    order.status === "ready" && "bg-success",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted">
                      {order.id}
                    </span>
                    <Badge tone={STATUS_TONE[order.status]}>
                      {order.status === "pending" ? "Attente" : order.status === "preparing" ? "Prép." : "Prêt"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-medium text-text">
                    {order.name}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span>{order.district}</span>
                    <span>{formatMRU(order.amount, "fr", { compact: true })}</span>
                  </div>
                  <button
                    onClick={() => assignOrder(order.id)}
                    disabled={order.status !== "pending" || idleCount === 0}
                    className={cn(
                      "mt-2 w-full rounded-lg py-1.5 text-xs font-medium transition-colors",
                      order.status === "pending" && idleCount > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary-strong"
                        : "cursor-not-allowed bg-surface-2 text-faint",
                    )}
                  >
                    {order.status === "pending"
                      ? idleCount > 0
                        ? "Assigner un livreur"
                        : "Aucun livreur dispo"
                      : "Déjà assignée"}
                  </button>
                </div>
              </li>
            ))}
            {filteredOrders.length === 0 && (
              <li className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-muted">
                <Crosshair size={24} className="text-faint" />
                <p className="text-sm">Aucune commande à afficher</p>
              </li>
            )}
          </ul>
        </Card>

        {/* Right: Map */}
        <div className="flex flex-1 flex-col gap-4">
          <MapComponent
            locations={mapLocations}
            center={NOUAKCHOTT}
            zoom={ZOOM}
            className="flex-1 min-h-0"
          />
          <div className="flex items-center gap-4 rounded-xl bg-surface px-4 py-2 shadow-card">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#22c55e]" />
              Livreurs dispos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#f97316]" />
              En course
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-[#ef4444]" />
              Points de livraison
            </span>
            <span className="ml-auto text-[11px] text-faint">
              Carte OpenStreetMap · Nouakchott
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}