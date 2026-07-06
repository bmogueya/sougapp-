import type { ModuleKey } from "./modules";
import type { OrderStatus } from "./dashboard";

export type { OrderStatus };

/** Payment rails used across Mauritania. Wallet names are proper nouns. */
export type PaymentMethod = "bankily" | "sedad" | "masrivi" | "cash" | "card";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "bankily",
  "sedad",
  "masrivi",
  "cash",
  "card",
];

/** Wallet brands render as-is; cash/card are translated. */
export const PAYMENT_LABELS: Record<PaymentMethod, string | null> = {
  bankily: "Bankily",
  sedad: "Sedad",
  masrivi: "Masrivi",
  cash: null,
  card: null,
};

export interface Order {
  id: string;
  customer: string;
  module: ModuleKey;
  items: number;
  amount: number; // MRU
  payment: PaymentMethod;
  status: OrderStatus;
  driver: string | null;
  city: string; // region key
  minutesAgo: number;
}

export const ORDERS: Order[] = [
  { id: "SG-48213", customer: "Aïcha mint Ahmed", module: "food", items: 3, amount: 1450, payment: "bankily", status: "onTheWay", driver: "Moussa D.", city: "nouakchott", minutesAgo: 3 },
  { id: "SG-48212", customer: "Mohamed Ould Sidi", module: "marketplace", items: 1, amount: 12800, payment: "masrivi", status: "preparing", driver: null, city: "nouakchott", minutesAgo: 6 },
  { id: "SG-48211", customer: "Fatimetou mint Baba", module: "pharmacy", items: 2, amount: 2360, payment: "sedad", status: "delivered", driver: "Yahya S.", city: "nouadhibou", minutesAgo: 11 },
  { id: "SG-48210", customer: "Cheikh Ould Vall", module: "taxi", items: 1, amount: 640, payment: "cash", status: "delivered", driver: "Brahim L.", city: "nouakchott", minutesAgo: 14 },
  { id: "SG-48209", customer: "Mariem mint Sidi", module: "grocery", items: 8, amount: 3980, payment: "bankily", status: "pending", driver: null, city: "rosso", minutesAgo: 18 },
  { id: "SG-48208", customer: "Sidi Ould Cheikh", module: "parcel", items: 1, amount: 900, payment: "cash", status: "onTheWay", driver: "Demba B.", city: "kiffa", minutesAgo: 21 },
  { id: "SG-48207", customer: "Khadijetou mint Ely", module: "food", items: 5, amount: 2150, payment: "card", status: "cancelled", driver: null, city: "nouakchott", minutesAgo: 25 },
  { id: "SG-48206", customer: "Ahmedou Ould Salem", module: "wallet", items: 1, amount: 5000, payment: "bankily", status: "delivered", driver: null, city: "atar", minutesAgo: 29 },
  { id: "SG-48205", customer: "Salka mint Mohamed", module: "grocery", items: 12, amount: 6240, payment: "sedad", status: "delivered", driver: "Ely T.", city: "nouakchott", minutesAgo: 34 },
  { id: "SG-48204", customer: "Baba Ould Ahmed", module: "food", items: 2, amount: 1120, payment: "bankily", status: "onTheWay", driver: "Moussa D.", city: "nouakchott", minutesAgo: 38 },
  { id: "SG-48203", customer: "Zeinabou mint Vall", module: "billing", items: 1, amount: 3200, payment: "masrivi", status: "delivered", driver: null, city: "nouadhibou", minutesAgo: 41 },
  { id: "SG-48202", customer: "Mohamed Lemine O.", module: "pharmacy", items: 4, amount: 1875, payment: "sedad", status: "preparing", driver: null, city: "kiffa", minutesAgo: 46 },
  { id: "SG-48201", customer: "Coumba mint Samba", module: "marketplace", items: 2, amount: 8600, payment: "card", status: "onTheWay", driver: "Amadou F.", city: "rosso", minutesAgo: 52 },
  { id: "SG-48200", customer: "Sidi Mohamed O.", module: "taxi", items: 1, amount: 520, payment: "cash", status: "delivered", driver: "Brahim L.", city: "nouakchott", minutesAgo: 58 },
  { id: "SG-48199", customer: "Aminata mint Ba", module: "food", items: 6, amount: 2740, payment: "bankily", status: "delivered", driver: "Ely T.", city: "nouakchott", minutesAgo: 63 },
  { id: "SG-48198", customer: "Yahya Ould Sidi", module: "grocery", items: 3, amount: 1560, payment: "cash", status: "pending", driver: null, city: "atar", minutesAgo: 68 },
  { id: "SG-48197", customer: "Fatou mint Cheikh", module: "booking", items: 1, amount: 4500, payment: "masrivi", status: "delivered", driver: null, city: "nouakchott", minutesAgo: 74 },
  { id: "SG-48196", customer: "Ismail Ould Baba", module: "parcel", items: 2, amount: 1350, payment: "sedad", status: "cancelled", driver: null, city: "nouadhibou", minutesAgo: 79 },
  { id: "SG-48195", customer: "Nana mint Ahmedou", module: "pharmacy", items: 1, amount: 680, payment: "bankily", status: "delivered", driver: "Yahya S.", city: "kiffa", minutesAgo: 85 },
  { id: "SG-48194", customer: "Abdallahi Ould M.", module: "marketplace", items: 4, amount: 15300, payment: "card", status: "preparing", driver: null, city: "nouakchott", minutesAgo: 92 },
  { id: "SG-48193", customer: "Lalla mint Sidi", module: "food", items: 2, amount: 980, payment: "bankily", status: "onTheWay", driver: "Moussa D.", city: "nouakchott", minutesAgo: 97 },
  { id: "SG-48192", customer: "Mahfoud Ould Ely", module: "taxi", items: 1, amount: 760, payment: "cash", status: "delivered", driver: "Amadou F.", city: "rosso", minutesAgo: 104 },
  { id: "SG-48191", customer: "Vatma mint Baba", module: "grocery", items: 9, amount: 4820, payment: "sedad", status: "delivered", driver: "Demba B.", city: "nouakchott", minutesAgo: 112 },
  { id: "SG-48190", customer: "Cheikhna Ould A.", module: "wallet", items: 1, amount: 10000, payment: "bankily", status: "delivered", driver: null, city: "nouadhibou", minutesAgo: 121 },
  { id: "SG-48189", customer: "Toutou mint Vall", module: "billing", items: 1, amount: 2100, payment: "masrivi", status: "delivered", driver: null, city: "atar", minutesAgo: 130 },
  { id: "SG-48188", customer: "Sneiba mint Deh", module: "food", items: 4, amount: 1890, payment: "card", status: "pending", driver: null, city: "kiffa", minutesAgo: 142 },
];
