-- =============================================================================
-- 07_orders_payment.sql
-- Ajoute le mode de paiement et les frais de livraison aux commandes.
--
-- NOTE : seul le paiement "cash" (à la livraison) est réglé automatiquement.
-- Les modes mobile-money (Bankily / Sedad / Masrivi) sont enregistrés comme
-- INTENTION de paiement ; l'intégration réelle des passerelles (initiation,
-- webhook signé, réconciliation) reste à faire et nécessite l'onboarding
-- provider. Voir l'agent "ahmedou-paiements".
-- =============================================================================

alter table public.orders
  add column if not exists payment_method text not null default 'cash'
    check (payment_method in ('cash', 'bankily', 'sedad', 'masrivi')),
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  add column if not exists delivery_fee decimal(10,2) not null default 0.00;
