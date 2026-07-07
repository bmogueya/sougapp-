<div align="center">

# SougApp 🇲🇷

**Plateforme multi-services pour la Mauritanie** — food, grocery, marketplace, pharmacie, colis, taxi, wallet, facturation & réservations, depuis une seule infrastructure.

</div>

---

## 📦 Monorepo

```
sougApp4/
├── sougapp-multi-service/   # App web multi-rôles — React 19 · Vite 8 · Tailwind 3 · Supabase
├── sougapp_mobile/          # App mobile — Flutter (iOS · Android)
├── Architecture.md          # Architecture (vision cible ↔ implémentation réelle)
└── PLAN.md                  # Feuille de route ancrée sur l'état du repo
```

| Application | Stack | Détails |
|---|---|---|
| **Web** — `sougapp-multi-service` | React 19 · Vite 8 · TypeScript · Tailwind 3 · Supabase | Sert 4 rôles (Client, Super-Admin/Dispatcher, Marchand, Livreur) via layouts protégés. Voir son [README](sougapp-multi-service/README.md). |
| **Mobile** — `sougapp_mobile` | Flutter (Dart) | Même backend Supabase. |

**Backend / données :** Supabase (Auth + PostgreSQL + RLS). Schéma canonique unique : [`sougapp-multi-service/supabase/00_canonical_schema.sql`](sougapp-multi-service/supabase/00_canonical_schema.sql).

**Langues :** FR · AR (RTL) · EN — devise **MRU**.

---

## 🚀 Démarrer (app web)

```bash
cd sougapp-multi-service
npm install
cp .env.example .env.local   # renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

Détails complets (config, scripts, structure) : [`sougapp-multi-service/README.md`](sougapp-multi-service/README.md).

---

## 📚 Documentation

- **[Architecture.md](Architecture.md)** — vision multi-services + état réel de l'implémentation.
- **[PLAN.md](PLAN.md)** — feuille de route re-priorisée (état des lieux par axe, sprints).
