import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  Line,
  Bar,
  BarChart,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  type TooltipContentProps,
} from "recharts";
import { ArrowUpRight, Store, CreditCard, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import {
  KPIS,
  MODULE_STATS,
  REVENUE_SERIES,
  RECENT_ORDERS,
  type Kpi,
  type ModuleStat,
  type RecentOrder,
} from "@/data/dashboard";
import { ORDERS, PAYMENT_LABELS } from "@/data/orders";
import { MODULE_MAP } from "@/data/modules";
import { Card } from "@/components/ui/Card";
import { DeltaPill } from "@/components/ui/DeltaPill";
import { Sparkline } from "@/components/ui/Sparkline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMRU, formatNumber, cn } from "@/lib/utils";

/** Map an app locale to an Intl locale, mirroring lib/utils. */
function intlOf(locale: string) {
  return locale === "ar" ? "ar-MR" : locale === "en" ? "en-US" : "fr-FR";
}

export function Dashboard() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const locale = intlOf(lang);

  // Board is ranked by today's activity — the busiest service leads.
  const ranked = useMemo(
    () => [...MODULE_STATS].sort((a, b) => b.orders - a.orders),
    [],
  );

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    ORDERS.forEach((o) => {
      const label = PAYMENT_LABELS[o.payment] || o.payment;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([method, orders]) => ({ method, orders }))
      .sort((a, b) => b.orders - a.orders);
  }, []);

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    ORDERS.forEach((o) => {
      counts[o.city] = (counts[o.city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, orders]) => ({ city: city.charAt(0).toUpperCase() + city.slice(1), orders }))
      .sort((a, b) => b.orders - a.orders);
  }, []);

  const moduleCompareData = useMemo(() => {
    return [...MODULE_STATS]
      .sort((a, b) => b.orders - a.orders)
      .map((m) => ({
        name: m.key,
        orders: m.orders,
        revenue: m.revenue,
        icon: MODULE_MAP[m.key].icon,
      }));
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <ConsoleHeader />
      <LedgerStrip kpis={KPIS} lang={lang} />
      <MarketBoard rows={ranked} lang={lang} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RevenuePanel locale={locale} className="xl:col-span-2" />
        <FluxPanel orders={RECENT_ORDERS} lang={lang} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PaymentPanel data={paymentData} lang={lang} />
        <CityPanel data={cityData} lang={lang} />
        <ModuleComparisonPanel data={moduleCompareData} lang={lang} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Console header — a market-hours eyebrow + a live Nouakchott clock.
 * ───────────────────────────────────────────────────────────── */
function ConsoleHeader() {
  const { t, i18n } = useTranslation();
  const locale = intlOf(i18n.language);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Africa/Nouakchott",
  }).format(now);

  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Nouakchott",
  }).format(now);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          <span
            className="h-2 w-2 rounded-full bg-success animate-pulse-soft"
            aria-hidden
          />
          <span className="text-text">{t("console.city")}</span>
          <span className="text-faint">·</span>
          <span>{t("console.liveMarket")}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">
          {t("dashboard")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("console.subtitle")}</p>
      </div>

      <div className="text-start sm:text-end">
        <div className="font-mono text-2xl font-semibold tabular-nums text-text sm:text-3xl">
          {time}
        </div>
        <div className="mt-0.5 text-xs capitalize text-faint">{date}</div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Ledger strip — the aggregate KPIs as one quiet ledger, not four
 * floating cards. Hairline separators via a single-pixel grid gap.
 * ───────────────────────────────────────────────────────────── */
function LedgerStrip({ kpis, lang }: { kpis: Kpi[]; lang: string }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-card lg:grid-cols-4">
      {kpis.map((kpi) => {
        const value = kpi.currency
          ? formatMRU(kpi.value, lang, { compact: true })
          : formatNumber(kpi.value, lang);
        return (
          <div key={kpi.key} className="bg-surface px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                {t(`kpi.${kpi.key}`)}
              </span>
              <DeltaPill value={kpi.deltaPct} />
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-text">
              {value}
            </div>
            <div className="mt-0.5 text-[11px] text-faint">{t("kpi.today")}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * The Market Board — the signature. Nine services ranked live,
 * read like a trading floor: accent spines, mono figures, pulse.
 * ───────────────────────────────────────────────────────────── */
function MarketBoard({ rows, lang }: { rows: ModuleStat[]; lang: string }) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-text">
            {t("board.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{t("board.caption")}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-success">
          <span
            className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft"
            aria-hidden
          />
          {t("board.live")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Column header */}
          <div className="flex items-center gap-4 px-5 pb-2 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            <span className="w-6 shrink-0 text-center">#</span>
            <span className="w-3 shrink-0" aria-hidden />
            <span className="flex-1">{t("board.service")}</span>
            <span className="w-24 text-end">{t("board.ordersCol")}</span>
            <span className="w-28 text-end">{t("board.revenueCol")}</span>
            <span className="w-16 text-end">Δ</span>
            <span className="w-28 text-end">{t("board.trend")}</span>
          </div>

          <ul className="pb-2">
            {rows.map((row, i) => (
              <BoardRow key={row.key} row={row} rank={i + 1} lang={lang} />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function BoardRow({
  row,
  rank,
  lang,
}: {
  row: ModuleStat;
  rank: number;
  lang: string;
}) {
  const { t } = useTranslation();
  const mod = MODULE_MAP[row.key];
  const Icon = mod.icon;
  const accent = `rgb(var(--m-${row.key}))`;

  return (
    <li
      className="group flex animate-fade-in-up items-center gap-4 px-5 py-2.5 transition-colors hover:bg-surface-2"
      style={{ animationDelay: `${rank * 45}ms` }}
    >
      <span className="w-6 shrink-0 text-center font-mono text-sm font-semibold tabular-nums text-faint">
        {formatNumber(rank, lang)}
      </span>

      {/* Accent spine — the service's colour, RTL-safe */}
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      {/* Service identity */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `rgb(var(--m-${row.key}) / 0.12)` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text">
            {t(`modules.${row.key}`)}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                row.live ? "animate-pulse-soft" : "opacity-40",
              )}
              style={{ backgroundColor: row.live ? accent : "rgb(var(--faint))" }}
              aria-hidden
            />
            {row.live ? t("board.live") : t("board.paused")}
          </span>
        </div>
      </div>

      {/* Orders */}
      <div className="w-24 shrink-0 text-end">
        <span className="font-mono text-sm font-semibold tabular-nums text-text">
          {formatNumber(row.orders, lang)}
        </span>
        <span className="ms-1 text-[11px] text-faint">
          {t("board.unitOrders")}
        </span>
      </div>

      {/* Revenue */}
      <div className="w-28 shrink-0 text-end font-mono text-sm font-semibold tabular-nums text-text">
        {formatMRU(row.revenue, lang, { compact: true })}
      </div>

      {/* Delta */}
      <div className="flex w-16 shrink-0 justify-end">
        <DeltaPill value={row.deltaPct} />
      </div>

      {/* Trend */}
      <div className="w-28 shrink-0">
        <Sparkline data={row.spark} color={accent} height={28} />
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Revenue panel — 14-day shape. Quiet by design; the board leads.
 * ───────────────────────────────────────────────────────────── */
function RevenuePanel({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-text">
            {t("revenue.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{t("revenue.caption")}</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full bg-primary"
              aria-hidden
            />
            {t("revenue.revenue")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-3.5 rounded-full bg-gold"
              aria-hidden
            />
            {t("revenue.ordersLine")}
          </span>
        </div>
      </div>
      <div className="min-h-[260px] flex-1 px-2 py-4">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={REVENUE_SERIES}
            margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgb(var(--primary))"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgb(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgb(var(--faint))",
                fontSize: 11,
                fontFamily: "IBM Plex Mono, monospace",
              }}
              dy={6}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "rgb(var(--faint))",
                fontSize: 11,
                fontFamily: "IBM Plex Mono, monospace",
              }}
              tickFormatter={(v: number) => `${v / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: "rgb(var(--border-strong))", strokeWidth: 1 }}
              content={(props) => <ChartTooltip {...props} locale={locale} />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name={t("revenue.revenue")}
              stroke="rgb(var(--primary))"
              strokeWidth={2}
              fill="url(#revFill)"
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name={t("revenue.ordersLine")}
              stroke="rgb(var(--gold))"
              strokeWidth={1.75}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  locale,
}: TooltipContentProps & { locale: string }) {
  if (!active || !payload?.length) return null;
  const fmt = new Intl.NumberFormat(locale);
  return (
    <div className="rounded-xl border border-border bg-overlay px-3 py-2 shadow-raised">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-faint">
        J{label}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center gap-2 text-xs text-text"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className="text-muted">{entry.name}</span>
          <span className="ms-auto font-mono font-semibold tabular-nums">
            {fmt.format(Number(entry.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Live flux — the order ticker. Newest transactions across the souk.
 * ───────────────────────────────────────────────────────────── */
function FluxPanel({
  orders,
  lang,
}: {
  orders: RecentOrder[];
  lang: string;
}) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-text">
          {t("flux.title")}
        </h2>
        <p className="mt-0.5 text-xs text-muted">{t("flux.caption")}</p>
      </div>

      <ul className="flex-1 divide-y divide-border">
        {orders.slice(0, 6).map((order) => {
          const accent = `rgb(var(--m-${order.module}))`;
          return (
            <li
              key={order.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
            >
              <span
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted">
                    {order.id}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: accent }}
                  >
                    {t(`modules.${order.module}`)}
                  </span>
                </div>
                <div className="truncate text-sm text-text">
                  {order.customer}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-sm font-semibold tabular-nums text-text">
                  {formatMRU(order.amount, lang, { compact: true })}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        to="/orders"
        className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
      >
        {t("flux.viewAll")}
        <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
      </Link>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Payment method breakdown — how customers pay across the souk.
 * ───────────────────────────────────────────────────────────── */
function PaymentPanel({
  data,
  lang,
}: {
  data: { method: string; orders: number }[];
  lang: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <CreditCard size={16} className="text-muted" />
        <h2 className="text-sm font-semibold tracking-tight text-text">
          {t("analytics.paymentMethods") || "Paiements"}
        </h2>
      </div>
      <div className="min-h-[200px] flex-1 px-2 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="rgb(var(--border))" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fill: "rgb(var(--faint))", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="method" tick={{ fill: "rgb(var(--text))", fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
            <Tooltip cursor={{ fill: "rgb(var(--surface-2))" }} contentStyle={{ background: "rgb(var(--overlay))", border: "1px solid rgb(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="orders" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
 * City distribution — orders grouped by city.
 * ───────────────────────────────────────────────────────────── */
function CityPanel({
  data,
  lang,
}: {
  data: { city: string; orders: number }[];
  lang: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <MapPin size={16} className="text-muted" />
        <h2 className="text-sm font-semibold tracking-tight text-text">
          {t("analytics.cities") || "Villes"}
        </h2>
      </div>
      <div className="min-h-[200px] flex-1 px-2 py-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgb(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="city" tick={{ fill: "rgb(var(--text))", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "rgb(var(--faint))", fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
            <Tooltip cursor={{ fill: "rgb(var(--surface-2))" }} contentStyle={{ background: "rgb(var(--overlay))", border: "1px solid rgb(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="orders" fill="rgb(var(--gold))" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Module comparison — each service's order volume vs revenue.
 * ───────────────────────────────────────────────────────────── */
function ModuleComparisonPanel({
  data,
  lang,
}: {
  data: { name: string; orders: number; revenue: number; icon: React.ComponentType<{ size?: number; className?: string }> }[];
  lang: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Store size={16} className="text-muted" />
        <h2 className="text-sm font-semibold tracking-tight text-text">
          {t("analytics.modules") || "Modules"}
        </h2>
      </div>
      <ul className="flex-1 divide-y divide-border">
        {data.slice(0, 6).map((mod) => {
          const accent = `rgb(var(--m-${mod.name}))`;
          return (
            <li key={mod.name} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `rgb(var(--m-${mod.name}) / 0.12)` }}>
                <mod.icon className="h-4 w-4" style={{ color: accent }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-text">
                  {t(`modules.${mod.name}`)}
                </div>
                <div className="flex gap-3 text-[11px] text-muted">
                  <span>{formatNumber(mod.orders, lang)} commandes</span>
                  <span>{formatMRU(mod.revenue, lang, { compact: true })}</span>
                </div>
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mod.orders / data[0].orders) * 100)}%`, backgroundColor: accent }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
