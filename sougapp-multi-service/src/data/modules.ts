import {
  UtensilsCrossed,
  ShoppingBasket,
  Store,
  Pill,
  Package,
  Car,
  Wallet,
  ReceiptText,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "food"
  | "grocery"
  | "marketplace"
  | "pharmacy"
  | "parcel"
  | "taxi"
  | "wallet"
  | "billing"
  | "booking";

export interface ModuleDef {
  key: ModuleKey;
  icon: LucideIcon;
  /** Tailwind text color utility bound to the module accent token. */
  text: string;
  bg: string;
  ring: string;
}

export const MODULES: ModuleDef[] = [
  { key: "food", icon: UtensilsCrossed, text: "text-food", bg: "bg-food", ring: "ring-food/30" },
  { key: "grocery", icon: ShoppingBasket, text: "text-grocery", bg: "bg-grocery", ring: "ring-grocery/30" },
  { key: "marketplace", icon: Store, text: "text-marketplace", bg: "bg-marketplace", ring: "ring-marketplace/30" },
  { key: "pharmacy", icon: Pill, text: "text-pharmacy", bg: "bg-pharmacy", ring: "ring-pharmacy/30" },
  { key: "parcel", icon: Package, text: "text-parcel", bg: "bg-parcel", ring: "ring-parcel/30" },
  { key: "taxi", icon: Car, text: "text-taxi", bg: "bg-taxi", ring: "ring-taxi/30" },
  { key: "wallet", icon: Wallet, text: "text-wallet", bg: "bg-wallet", ring: "ring-wallet/30" },
  { key: "billing", icon: ReceiptText, text: "text-billing", bg: "bg-billing", ring: "ring-billing/30" },
  { key: "booking", icon: CalendarCheck, text: "text-booking", bg: "bg-booking", ring: "ring-booking/30" },
];

export const MODULE_MAP: Record<ModuleKey, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDef>;
