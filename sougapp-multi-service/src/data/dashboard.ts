import type { ModuleKey } from "./modules";

export interface ModuleStat {
  key: ModuleKey;
  orders: number;
  revenue: number; // MRU, today
  deltaPct: number;
  live: boolean;
  spark: number[];
}

export interface Kpi {
  key: "gmv" | "orders" | "activeDrivers" | "newUsers";
  value: number;
  deltaPct: number;
  currency?: boolean;
}

export type OrderStatus =
  | "delivered"
  | "onTheWay"
  | "preparing"
  | "pending"
  | "cancelled";

export interface RecentOrder {
  id: string;
  customer: string;
  module: ModuleKey;
  amount: number; // MRU
  status: OrderStatus;
  minutesAgo: number;
}

/** Today's per-service snapshot powering the constellation board. */
export const MODULE_STATS: ModuleStat[] = [
  { key: "food", orders: 1284, revenue: 1_920_000, deltaPct: 12.4, live: true, spark: [22, 30, 28, 41, 38, 52, 60, 68] },
  { key: "grocery", orders: 872, revenue: 1_340_000, deltaPct: 8.1, live: true, spark: [40, 38, 44, 50, 47, 55, 58, 62] },
  { key: "marketplace", orders: 543, revenue: 2_610_000, deltaPct: 18.9, live: true, spark: [12, 18, 26, 24, 33, 40, 48, 57] },
  { key: "pharmacy", orders: 316, revenue: 486_000, deltaPct: 4.2, live: true, spark: [30, 32, 29, 35, 34, 38, 37, 41] },
  { key: "parcel", orders: 428, revenue: 372_000, deltaPct: -2.6, live: true, spark: [50, 46, 48, 42, 44, 39, 41, 37] },
  { key: "taxi", orders: 1610, revenue: 805_000, deltaPct: 15.7, live: true, spark: [20, 28, 35, 44, 52, 63, 71, 80] },
  { key: "wallet", orders: 2140, revenue: 96_000, deltaPct: 22.3, live: true, spark: [30, 40, 52, 60, 74, 82, 95, 110] },
  { key: "billing", orders: 690, revenue: 58_000, deltaPct: 6.8, live: true, spark: [18, 22, 20, 26, 25, 30, 33, 35] },
  { key: "booking", orders: 148, revenue: 214_000, deltaPct: -1.1, live: false, spark: [24, 22, 25, 21, 23, 20, 22, 19] },
];

export const KPIS: Kpi[] = [
  { key: "gmv", value: 7_910_000, deltaPct: 11.6, currency: true },
  { key: "orders", value: 8031, deltaPct: 9.2 },
  { key: "activeDrivers", value: 612, deltaPct: 5.4 },
  { key: "newUsers", value: 1487, deltaPct: 14.8 },
];

/** 14-day revenue (MRU, in thousands) and order-count series. */
export const REVENUE_SERIES = [
  { day: "01", revenue: 5120, orders: 6100 },
  { day: "02", revenue: 4890, orders: 5820 },
  { day: "03", revenue: 5340, orders: 6240 },
  { day: "04", revenue: 6010, orders: 6980 },
  { day: "05", revenue: 5760, orders: 6510 },
  { day: "06", revenue: 6820, orders: 7420 },
  { day: "07", revenue: 7240, orders: 7810 },
  { day: "08", revenue: 6980, orders: 7590 },
  { day: "09", revenue: 6540, orders: 7180 },
  { day: "10", revenue: 7110, orders: 7640 },
  { day: "11", revenue: 7680, orders: 8020 },
  { day: "12", revenue: 7320, orders: 7880 },
  { day: "13", revenue: 7540, orders: 7960 },
  { day: "14", revenue: 7910, orders: 8031 },
];

export const RECENT_ORDERS: RecentOrder[] = [
  { id: "SG-48213", customer: "Aïcha mint Ahmed", module: "food", amount: 1450, status: "onTheWay", minutesAgo: 3 },
  { id: "SG-48212", customer: "Mohamed Ould Sidi", module: "marketplace", amount: 12800, status: "preparing", minutesAgo: 6 },
  { id: "SG-48211", customer: "Fatimetou mint Baba", module: "pharmacy", amount: 2360, status: "delivered", minutesAgo: 11 },
  { id: "SG-48210", customer: "Cheikh Ould Vall", module: "taxi", amount: 640, status: "delivered", minutesAgo: 14 },
  { id: "SG-48209", customer: "Mariem mint Sidi", module: "grocery", amount: 3980, status: "pending", minutesAgo: 18 },
  { id: "SG-48208", customer: "Sidi Ould Cheikh", module: "parcel", amount: 900, status: "onTheWay", minutesAgo: 21 },
  { id: "SG-48207", customer: "Khadijetou mint Ely", module: "food", amount: 2150, status: "cancelled", minutesAgo: 25 },
  { id: "SG-48206", customer: "Ahmedou Ould Salem", module: "wallet", amount: 5000, status: "delivered", minutesAgo: 29 },
];
