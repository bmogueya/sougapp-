// =============================================================================
// orderStatus.ts — source de vérité UNIQUE pour les statuts de commande (DB).
//
// Le code manipulait auparavant 2 vocabulaires divergents pour les commandes
// réelles : la page admin Orders.tsx (accepted/ready/completed — jamais posés
// par aucune action) et le flux opérationnel (preparing/ready_for_delivery/
// delivering/delivered). Résultat : des statuts affichés en brut.
//
// Ce module couvre TOUTES les valeurs autorisées par la contrainte CHECK de
// public.orders (00_canonical_schema.sql) et fournit label FR + tonalité de
// badge cohérents partout.
//
// NB : les écrans mock (merchant/Orders.tsx, Dashboard) utilisent un type
// distinct `OrderStatus` (camelCase) de src/data/dashboard — hors périmètre,
// ils ne lisent pas la base.
// =============================================================================

export type OrderStatusKey =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'ready_for_delivery'
  | 'delivering'
  | 'on_the_way'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type OrderStatusTone = 'warning' | 'info' | 'success' | 'danger' | 'muted';

export interface OrderStatusMeta {
  label: string;
  tone: OrderStatusTone;
}

const META: Record<OrderStatusKey, OrderStatusMeta> = {
  pending:            { label: 'En attente',      tone: 'warning' },
  accepted:           { label: 'Acceptée',        tone: 'info' },
  preparing:          { label: 'En préparation',  tone: 'info' },
  ready:              { label: 'Prête',           tone: 'info' },
  ready_for_delivery: { label: 'Prête à livrer',  tone: 'info' },
  delivering:         { label: 'En livraison',    tone: 'warning' },
  on_the_way:         { label: 'En route',        tone: 'warning' },
  delivered:          { label: 'Livrée',          tone: 'success' },
  completed:          { label: 'Terminée',        tone: 'success' },
  cancelled:          { label: 'Annulée',         tone: 'danger' },
  failed:             { label: 'Échouée',         tone: 'danger' },
};

const FALLBACK: OrderStatusMeta = { label: 'Inconnu', tone: 'muted' };

/** Toutes les clés de statut connues (= contrainte CHECK de public.orders). */
export const ORDER_STATUS_KEYS = Object.keys(META) as OrderStatusKey[];

/** Métadonnées d'affichage pour un statut ; jamais de clé brute grâce au fallback. */
export function getOrderStatusMeta(status: string | null | undefined): OrderStatusMeta {
  if (!status) return FALLBACK;
  return META[status as OrderStatusKey] ?? FALLBACK;
}

/** Classes Tailwind (tokens du thème) pour chaque tonalité de badge. */
export const ORDER_STATUS_TONE_CLASS: Record<OrderStatusTone, string> = {
  warning: 'bg-warning/10 text-warning',
  info:    'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  danger:  'bg-danger/10 text-danger',
  muted:   'bg-surface-2 text-muted',
};
