# SougApp — Application web multi-services 🇲🇷

Interface web **multi-rôles** de SougApp, la plateforme multi-services mauritanienne (food, grocery, marketplace, pharmacie, colis, taxi, wallet, facturation, réservations).

Une **seule application React** sert quatre rôles via des layouts et des routes protégés : **Client**, **Super-Admin / Dispatcher**, **Marchand** et **Livreur**.

> Vue d'ensemble de l'architecture : [`../Architecture.md`](../Architecture.md) · Feuille de route : [`../PLAN.md`](../PLAN.md)

---

## 🧱 Stack

| Domaine | Technologie |
|---|---|
| UI | React 19 · TypeScript 6 · Tailwind CSS 3 (`darkMode: "class"`) |
| Build / dev | Vite 8 |
| Routage | react-router-dom 7 (routes en lazy loading) |
| Backend / données | Supabase (Auth + PostgreSQL + RLS) — `@supabase/supabase-js` 2 |
| Graphiques / cartes | recharts 3 · leaflet / react-leaflet |
| i18n | i18next 26 + react-i18next 17 — **FR / AR / EN** + RTL, devise **MRU** |
| Icônes | lucide-react |
| Tests | Vitest 4 + Testing Library |
| Lint | oxlint |

Design system « **Desert Night** » piloté par tokens dans [`src/index.css`](src/index.css) (vert drapeau `#0E7C66` + or `#C28A2E`, accents par service `--m-*`, thèmes clair/sombre, IBM Plex Sans/Mono).

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js ≥ 20** (testé sous Node 22)
- npm
- Un projet **Supabase** (URL + clé anon)

### Installation

```bash
npm install
```

### Configuration

Copier le modèle d'environnement et renseigner les valeurs de votre projet Supabase :

```bash
cp .env.example .env.local
```

```dotenv
# .env.local
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publishable
```

> ⚠️ `.env.local` est **git-ignoré** — n'y mettez jamais la clé `service_role`, seulement la clé **anon/publishable** (côté client).

### Base de données

Appliquer le schéma canonique (source de vérité unique, idempotent) au projet Supabase, via le **SQL Editor** ou la CLI Supabase :

```
supabase/00_canonical_schema.sql
```

Puis lancer les *security advisors* Supabase pour vérifier les policies RLS.

### Lancer

```bash
npm run dev        # serveur de développement (HMR)
```

---

## 📜 Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite (HMR) |
| `npm run build` | Build de production (`tsc -b && vite build`) |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Analyse statique (oxlint) |
| `npm test` | Suite de tests (Vitest, une passe) |
| `npm run test:watch` | Tests en mode watch |

---

## 🗂️ Structure

```
src/
├── main.tsx              # Point d'entrée
├── App.tsx               # Routage + gardes de rôle (lazy loading)
├── contexts/
│   └── AuthContext.tsx   # Session Supabase + rôle utilisateur
├── layouts/              # SuperAdmin · Merchant · Client · Driver
├── pages/
│   ├── (super-admin)     # Dashboard, Users, Merchants, Orders, Finance, Zones…
│   ├── merchant/         # Dashboard, Products, Categories, Orders, Settings
│   ├── client/           # Home, Search, StoreView, Cart, Profile
│   └── driver/           # Dashboard, History, Profile
├── components/           # Chrome (Header, Sidebar, ThemeToggle) + modales
│   └── ui/               # Atomes design system (Card, Badge, Sparkline…)
├── lib/                  # supabase, theme, orderStatus, utils
├── data/                 # Données de démo (dashboard, modules…)
└── i18n/config.ts        # Ressources FR / AR / EN
supabase/
└── 00_canonical_schema.sql   # Schéma + RLS (source de vérité)
```

### Rôles & routes

| Rôle | Préfixe | Layout |
|---|---|---|
| Client | `/app` | `ClientLayout` |
| Super-Admin / Dispatcher | `/` | `SuperAdminLayout` |
| Marchand | `/merchant` | `MerchantLayout` |
| Livreur | `/driver` | `DriverLayout` |

L'accès est contrôlé par `ProtectedRoute` selon le `role` du profil Supabase.

---

## 🌍 Internationalisation

Trois langues : **Français**, **العربية** (RTL), **English**. Le changement de langue bascule `dir`/`lang` du document. Toutes les valeurs monétaires sont en **MRU** avec chiffres tabulaires.

---

## 🧪 Tests & qualité

```bash
npm test        # Vitest (jsdom + Testing Library)
npm run lint    # oxlint
npm run build   # vérifie aussi les types (tsc -b)
```

---

## 📱 Application mobile

L'app mobile (Flutter) vit dans [`../sougapp_mobile`](../sougapp_mobile) et consomme le même backend Supabase.

---

## 🚢 Déploiement

Voir [docs/deployment.md](docs/deployment.md)

![CI](https://github.com/YOUR_USER/sougapp/actions/workflows/ci.yml/badge.svg)

## 🧱 Stack finale

| Domaine | Technologie |
|---------|-------------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 3 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Monitoring | Sentry |
| CI/CD | GitHub Actions + Vercel |
