import type { ModuleKey } from "./modules";

/** Merchants belong to the vendor-type services only. */
export type MerchantCategory = "food" | "grocery" | "marketplace" | "pharmacy";
export const MERCHANT_CATEGORIES: MerchantCategory[] = [
  "food",
  "grocery",
  "marketplace",
  "pharmacy",
];

export type MerchantStatus = "active" | "pending" | "suspended";

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  city: string; // region key
  rating: number;
  reviews: number;
  status: MerchantStatus;
  orders: number; // last 30 days
  revenue: number; // MRU, last 30 days
  joinedMonthsAgo: number;
}

// The category is a subset of ModuleKey; this assertion keeps them aligned.
const _categoryIsModule: Record<MerchantCategory, ModuleKey> = {
  food: "food",
  grocery: "grocery",
  marketplace: "marketplace",
  pharmacy: "pharmacy",
};
void _categoryIsModule;

export const MERCHANTS: Merchant[] = [
  { id: "M-1042", name: "Restaurant Le Sahel", category: "food", city: "nouakchott", rating: 4.8, reviews: 1284, status: "active", orders: 3120, revenue: 4_680_000, joinedMonthsAgo: 22 },
  { id: "M-1039", name: "Épicerie El Baraka", category: "grocery", city: "nouakchott", rating: 4.6, reviews: 872, status: "active", orders: 2140, revenue: 3_210_000, joinedMonthsAgo: 18 },
  { id: "M-1051", name: "Chinguetti Market", category: "marketplace", city: "nouadhibou", rating: 4.7, reviews: 543, status: "active", orders: 980, revenue: 6_120_000, joinedMonthsAgo: 14 },
  { id: "M-1058", name: "Pharmacie Ibn Sina", category: "pharmacy", city: "nouakchott", rating: 4.9, reviews: 2156, status: "active", orders: 1640, revenue: 2_480_000, joinedMonthsAgo: 26 },
  { id: "M-1063", name: "Boulangerie Al Madina", category: "food", city: "rosso", rating: 4.4, reviews: 318, status: "active", orders: 720, revenue: 1_080_000, joinedMonthsAgo: 9 },
  { id: "M-1067", name: "Supérette Tevragh Zeina", category: "grocery", city: "nouakchott", rating: 4.5, reviews: 651, status: "pending", orders: 0, revenue: 0, joinedMonthsAgo: 1 },
  { id: "M-1070", name: "Souk El Djedid", category: "marketplace", city: "kiffa", rating: 4.2, reviews: 194, status: "active", orders: 430, revenue: 1_920_000, joinedMonthsAgo: 7 },
  { id: "M-1074", name: "Pharmacie Centrale", category: "pharmacy", city: "atar", rating: 4.6, reviews: 402, status: "suspended", orders: 210, revenue: 316_000, joinedMonthsAgo: 12 },
  { id: "M-1081", name: "Café Maure", category: "food", city: "nouakchott", rating: 4.3, reviews: 289, status: "active", orders: 640, revenue: 890_000, joinedMonthsAgo: 5 },
  { id: "M-1085", name: "Dépôt Ksar", category: "grocery", city: "nouadhibou", rating: 4.1, reviews: 137, status: "pending", orders: 0, revenue: 0, joinedMonthsAgo: 1 },
  { id: "M-1090", name: "Boutique Adrar", category: "marketplace", city: "atar", rating: 4.5, reviews: 226, status: "active", orders: 380, revenue: 2_340_000, joinedMonthsAgo: 11 },
  { id: "M-1094", name: "Pharmacie An-Nour", category: "pharmacy", city: "rosso", rating: 4.7, reviews: 518, status: "active", orders: 890, revenue: 1_260_000, joinedMonthsAgo: 16 },
];
