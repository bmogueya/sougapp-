# Migrations archivées (obsolètes)

Ces fichiers (`schema.sql`, `01→13`, `init_database.sql`, `_apply_hardening_bundle.sql`)
sont **conservés pour référence historique uniquement**. Ils avaient divergé sur 3
générations de schéma et ne correspondaient plus au code de l'application
(modèle `merchants` obsolète, `orders.store_id` absent, définitions
`products`/`orders`/`categories` incompatibles entre fichiers, policies `USING (true)`).

➤ **La source de vérité est désormais [`../00_canonical_schema.sql`](../00_canonical_schema.sql)**,
régénéré à partir des requêtes réelles de `src/**` (idempotent, superset, RLS sécurisées).

Ne pas appliquer ces fichiers sur la base. Archivé le 2026-07-06.
