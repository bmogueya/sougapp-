-- =============================================================================
-- 00_reset_before_canonical_DANGER.sql   ⚠️ DESTRUCTIF — EFFACE DES DONNÉES ⚠️
-- =============================================================================
-- À exécuter UNIQUEMENT si la base contient d'anciennes tables d'une génération
-- de schéma incompatible (ex: `orders` sans `store_id`, `merchants`, un
-- `products`/`categories` d'une autre forme) qui empêchent 00_canonical_schema
-- de s'appliquer proprement (car `create table if not exists` NE modifie PAS
-- une table préexistante).
--
-- NE PAS lancer sur une base de production contenant des données à conserver.
-- Réservé à une base reconstructible (dev / seed). Vérifiez AVANT d'exécuter.
--
-- Ordre : lancer CE fichier, PUIS 00_canonical_schema.sql.
-- =============================================================================

drop table if exists public.order_items   cascade;
drop table if exists public.transactions  cascade;
drop table if exists public.wallets        cascade;
drop table if exists public.coupons        cascade;
drop table if exists public.banners        cascade;
drop table if exists public.products       cascade;
drop table if exists public.categories     cascade;
drop table if exists public.orders         cascade;
drop table if exists public.stores         cascade;
drop table if exists public.merchants      cascade;   -- ancienne table (Jeu A)
drop table if exists public.modules        cascade;
-- profiles et zones : conservés (liés à auth.users / peu susceptibles de conflit).
-- Décommentez SEULEMENT si leur forme a aussi divergé :
-- drop table if exists public.zones     cascade;
-- drop table if exists public.profiles  cascade;

-- Types : supprimés seulement s'ils bloquent (ils sont recréés par le canonique).
-- drop type if exists transaction_type   cascade;
-- drop type if exists transaction_status cascade;
-- drop type if exists discount_type      cascade;
