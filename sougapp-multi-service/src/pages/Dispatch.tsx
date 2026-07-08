import { useState, useMemo, useEffect } from "react";
import {
  Crosshair,
  Activity,
} from "lucide-react";
import { MapComponent } from "@/components/MapComponent";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMRU, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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

// Fallback coordinate if address not recognized
const NOUAKCHOTT: [number, number] = [18.0735, -15.9582];
const ZOOM = 13;

type OrderStatus = "pending" | "preparing" | "ready_for_delivery";

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

const STATUS_TONE: Record<OrderStatus, "neutral" | "warning" | "info"> = {
  pending: "neutral",
  preparing: "warning",
  ready_for_delivery: "info",
};

export function Dispatch() {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [drivers, setDrivers] = useState<DispatchDriver[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    // Only fetch orders that are not yet delivered/cancelled
    const { data } = await supabase
      .from('orders')
      .select('*, stores(name, address)')
      .in('status', ['pending', 'preparing', 'ready_for_delivery']);
      
    if (data) {
      const formatted = data.map((o: any) => ({
        id: o.id,
        status: o.status,
        name: o.stores?.name || 'Inconnu',
        type: 'food',
        district: o.delivery_address || 'Tevragh Zeina', // Fallback district for map
        amount: o.total_amount
      }));
      setOrders(formatted);
    }
  };

  const fetchDrivers = async () => {
    // Fetch all drivers
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'driver');
      
    if (data) {
      // In a real app, we would query their active status and current location.
      const formatted = data.map((d: any) => ({
        id: d.id,
        name: `${d.first_name} ${d.last_name}`,
        status: "idle" as const,
        district: "Tevragh Zeina",
        rating: 5.0
      }));
      setDrivers(formatted);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOrders(), fetchDrivers()]).then(() => setLoading(false));

    // Realtime subscription
    const channel = supabase.channel('dispatch-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders = useMemo(
    () =>
      filterStatus === "all"
        ? orders
        : orders.filter((o) => o.status === filterStatus),
    [orders, filterStatus],
  );

  const assignOrder = async (orderId: string) => {
    const idleDriver = drivers.find((d) => d.status === "idle");
    if (!idleDriver) {
      alert("Aucun livreur disponible !");
      return;
    }

    // Assign in DB
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: idleDriver.id, status: 'delivering' })
      .eq('id', orderId);

    if (error) {
      alert("Erreur lors de l'assignation: " + error.message);
    } else {
      // Optimistic update
      fetchOrders();
    }
  };

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
      // Simple exact match logic or fallback
      let coords = DISTRICT_COORDS[d.district];
      if (!coords) coords = NOUAKCHOTT;
      
      locs.push({
        id: d.id,
        name: d.name,
        latitude: coords[0] + (Math.random() * 0.01 - 0.005),
        longitude: coords[1] + (Math.random() * 0.01 - 0.005),
        description: `${d.district} · ${d.status === "idle" ? "Disponible" : "En course"} · ★ ${d.rating.toFixed(1)}`,
        color: d.status === "idle" ? "#22c55e" : "#f97316",
      });
    });

    filteredOrders.forEach((o) => {
      let coords = DISTRICT_COORDS[o.district] || NOUAKCHOTT;
      locs.push({
        id: o.id,
        name: o.name,
        latitude: coords[0] + 0.004,
        longitude: coords[1] + 0.004,
        description: `${o.id.substring(0, 8)} · ${formatMRU(o.amount, "fr", { compact: true })} · ${o.district}`,
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
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {idleCount} disponible{idleCount > 1 ? "s" : ""}
          </div>
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
      <div className="grid grid-cols-4 gap-4" aria-live="polite">
        {[
          { label: "En attente", value: orders.filter((o) => o.status === "pending").length, accent: "text-warning" },
          { label: "En préparation", value: orders.filter((o) => o.status === "preparing").length, accent: "text-info" },
          { label: "Prêts à livrer", value: orders.filter((o) => o.status === "ready_for_delivery").length, accent: "text-success" },
          { label: "Livreurs occupés", value: drivers.filter((d) => d.status === "busy").length, accent: "text-danger" },
        ].map((kpi) => (
          <Card key={kpi.label} className="flex items-center gap-3 px-5 py-4">
            <span className={cn("font-mono text-2xl font-bold tabular-nums", kpi.accent)}>
              {loading ? "-" : kpi.value}
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
              {(["all", "pending", "preparing", "ready_for_delivery"] as const).map((s) => (
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

          <ul className="flex-1 divide-y divide-border overflow-y-auto" aria-live="polite">
            {loading ? (
              <li className="p-8 text-center text-muted">Chargement...</li>
            ) : filteredOrders.map((order) => (
              <li
                key={order.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                    order.status === "pending" && "bg-warning",
                    order.status === "preparing" && "bg-info",
                    order.status === "ready_for_delivery" && "bg-success animate-pulse",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted">
                      {order.id.substring(0, 8)}
                    </span>
                    <Badge tone={STATUS_TONE[order.status]}>
                      {order.status === "pending" ? "Attente" : order.status === "preparing" ? "Prép." : "Prêt"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-medium text-text">
                    {order.name}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="truncate">{order.district}</span>
                    <span>{formatMRU(order.amount, "fr", { compact: true })}</span>
                  </div>
                  <button
                    onClick={() => assignOrder(order.id)}
                    disabled={order.status !== "ready_for_delivery" || idleCount === 0}
                    className={cn(
                      "mt-2 w-full rounded-lg py-1.5 text-xs font-medium transition-colors",
                      order.status === "ready_for_delivery" && idleCount > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary-strong shadow-sm"
                        : "cursor-not-allowed bg-surface-2 text-faint",
                    )}
                  >
                    {order.status === "ready_for_delivery"
                      ? idleCount > 0
                        ? "Assigner un livreur (Force Dispatch)"
                        : "Aucun livreur dispo"
                      : "En attente du marchand"}
                  </button>
                </div>
              </li>
            ))}
            {!loading && filteredOrders.length === 0 && (
              <li className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-muted">
                <Crosshair size={24} className="text-faint" />
                <p className="text-sm">Aucune commande en cours</p>
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
              Carte Leaflet · Temps réel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}