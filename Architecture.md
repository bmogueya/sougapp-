# Architecture.md – SougApp (Mauritanie 🇲🇷)

SougApp est une plateforme multi-services conçue pour la Mauritanie. Son architecture modulaire s'inspire de **6amMart** : exploiter plusieurs activités depuis une seule infrastructure.

> **Lecture du document.** Ce fichier décrit à la fois **la vision cible** (les 9 modules, les services backend, les zones) et **l'état actuel réellement implémenté** dans ce dépôt. Les sections marquées 🧭 sont la *cible* (roadmap) ; la section [✅ État actuel de l'implémentation](#-état-actuel-de-limplémentation) documente ce qui existe et tourne aujourd'hui. En cas de contradiction, **l'état actuel fait foi**.

---

## 🇲🇷 Vision 🧭

Une plateforme multi-services unique regroupant :

- 🍔 Food Delivery
- 🛒 Grocery
- 🏪 Marketplace
- 💊 Pharmacie
- 📦 Livraison de colis
- 🚕 Taxi & Transport
- 💳 Wallet
- 📱 Paiement de factures
- 🎟️ Réservations

## 🏗️ Architecture Multi-Modules 🧭

```
SougApp Platform
├── Food Module
├── Grocery Module
├── Marketplace Module
├── Pharmacy Module
├── Parcel Module
├── Taxi Module
├── Wallet Module
├── Billing Module
└── Booking Module
```

Chaque module possède : Dashboard dédié · Produits dédiés · Catégories dédiées · Rapports dédiés · Configuration dédiée. *Concept inspiré des modules dynamiques de 6amMart.*

---

## 📱 Applications

SougApp expose ses services via une **application web multi-rôles** (React/Vite) et une **application mobile** (Flutter). Les tableaux ci-dessous décrivent les fonctionnalités cibles par rôle.

### 👤 Application Client (Customer App)

Interface principale des utilisateurs finaux : elle centralise l'accès à tous les modules et simplifie la commande de bout en bout.

| Fonctionnalité | Description |
|---|---|
| Changement de module | Basculer entre les services (Food, Grocery, etc.). |
| Géolocalisation | Localisation précise pour la livraison et la recherche à proximité. |
| Recherche globale | Recherche unifiée de produits et services à travers les modules. |
| Wallet | Portefeuille numérique pour des paiements rapides et sécurisés. |
| Historique | Accès aux commandes passées et aux transactions. |
| Notifications | Alertes temps réel sur le statut des commandes, promotions, etc. |
| Coupons | Codes promotionnels et réductions. |
| Favoris | Enregistrement des marchands et produits préférés. |
| Avis & notation | Noter les services et les marchands. |
| Livraison programmée | Planification des livraisons à l'avance. |
| Plusieurs adresses | Gestion de multiples adresses de livraison. |

*Inspiré de l'application client de 6amMart.*

### 🚚 Application Livreur (Driver App)

Outil de gestion des opérations de livraison (repas, colis, courses taxi) : optimisation des itinéraires, communication et suivi des revenus.

| Fonctionnalité | Description |
|---|---|
| Statut Online / Offline | Disponibilité du livreur pour les missions. |
| Acceptation des missions | Accepter ou refuser les demandes de livraison/course. |
| Tracking GPS | Suivi temps réel de la position et de l'itinéraire. |
| Cash in Hand | Gestion des paiements en espèces collectés. |
| Historique | Vue d'ensemble des missions complétées. |
| Revenus | Suivi détaillé des gains et des commissions. |
| Notifications | Alertes pour les nouvelles missions et mises à jour. |

*Inspiré de l'application Deliveryman de 6amMart.*

### 🏪 Application Marchand (Merchant App)

Pour les partenaires commerciaux (restaurants, pharmacies, boutiques, épiceries) : gestion produits/stocks, exécution des commandes, promotions et POS intégré.

| Fonctionnalité | Description |
|---|---|
| Gestion des produits | Ajout, modification et suppression des articles. |
| Gestion des stocks | Suivi temps réel des niveaux de stock. |
| Gestion des commandes | Réception, traitement et suivi des commandes clients. |
| Promotions | Création et gestion des offres et réductions. |
| Statistiques | Données de vente et de performance. |
| POS intégré | Point de vente pour les transactions en magasin. |

*Inspiré de l'application Vendor de 6amMart.*

---

## 🖥️ Panels Web

### 🧑‍💼 Super Admin Panel

Centre de contrôle principal : supervision globale, configuration système et gestion des ressources critiques.

| Fonctionnalité | Description |
|---|---|
| Dashboard Global | Métriques clés et performances de la plateforme. |
| Revenus | Suivi des flux de revenus et transactions financières. |
| Commandes | Gestion et suivi de toutes les commandes. |
| Utilisateurs | Administration des comptes clients, livreurs et marchands. |
| Livreurs | Profils, disponibilité et performances des livreurs. |
| Marchands | Administration des partenaires et de leurs offres. |
| Transactions | Historique et gestion des transactions financières. |
| Business Setup | Paramètres généraux de l'entreprise. |
| Paramètres système | Configurations techniques et opérationnelles. |
| Zones | Définition et gestion des zones géographiques. |
| Langues | Options linguistiques de la plateforme. |
| Commissions | Taux de commission marchands et livreurs. |
| Paiements | Méthodes de paiement et processus de règlement. |
| Notifications | Push, SMS et email. |
| Gestion Modules | Activation/désactivation des modules (Food, Grocery, etc.). |

*Inspiré du Super Admin Panel de 6amMart.*

### 🚦 Dispatcher Panel

Interface logistique spécifique à la Mauritanie : gestion proactive des livraisons et courses.

| Fonctionnalité | Description |
|---|---|
| Affectation manuelle | Attribution directe des missions aux livreurs. |
| Affectation automatique | Optimisation des affectations par algorithmes. |
| Visualisation GPS | Suivi temps réel des livreurs sur carte. |
| Gestion des incidents | Résolution des problèmes de livraison. |
| Centre d'appel | Communication avec clients et livreurs. |

### 🏪 Merchant Panel

Autonomie opérationnelle pour les partenaires commerciaux.

| Fonctionnalité | Description |
|---|---|
| Gestion des commandes | Suivi et traitement des commandes reçues. |
| Produits | Ajout, modification et gestion des articles. |
| Employés | Accès et rôles des employés du marchand. |
| Rapports | Rapports de vente et de performance. |
| Promotions | Offres promotionnelles spécifiques au marchand. |
| Coupons | Coupons de réduction pour les clients. |

*Inspiré du Vendor Panel de 6amMart.*

### 💰 Finance Panel

Visibilité complète sur transactions, commissions et paiements ; réconciliation et trésorerie.

| Fonctionnalité | Description |
|---|---|
| Wallet | Soldes et transactions du portefeuille numérique. |
| Cash Collected | Montants en espèces collectés par les livreurs. |
| Cash In Hand | Liquidités disponibles. |
| Commissions | Calcul et suivi des commissions. |
| Paiements | Paiements effectués et reçus. |
| Reversements marchands | Traitement des paiements aux marchands. |
| Rapports financiers | Rapports détaillés sur la santé financière. |

---

## 🌍 Gestion des Zones 🧭

```
Zone Management
Nouakchott
├── Tevragh Zeina
├── Ksar
├── Sebkha
├── Arafat
├── Riyadh
├── Dar Naim
└── Teyarett

Nouadhibou · Rosso · Kaédi · Atar
```

Chaque zone possède : Tarification · Livreurs · Marchands · Promotions. *Inspiré du Zone Setup de 6amMart.*

---

## ⚙️ Services Backend (domaines fonctionnels) 🧭

Ces domaines décrivent les responsabilités serveur. **Dans l'implémentation actuelle, ils sont assurés par Supabase** (Auth + PostgreSQL + politiques RLS + Edge Functions), et non par des microservices dédiés — voir l'état actuel plus bas.

| Domaine | Responsabilités |
|---|---|
| Auth | Login · Register · OTP · JWT |
| User | Clients · Marchands · Livreurs · Employés |
| Product | Produits · Variantes · Attributs · Catégories |
| Order | Création · Affectation · Suivi |
| Delivery | Dispatch · Tracking · Livraisons |
| Wallet | Solde · Transactions · Cashback · Loyauté |
| Payment | Cash · Wallet · Mobile Money |
| Promotion | Coupons · Cashback · Bannières · Campagnes |
| Notification | Push · SMS · Email · WhatsApp |

## 🔄 Cycle de Commande 🧭

1. Client commande
2. Marchand confirme
3. Livreur assigné
4. Préparation
5. Livraison
6. Paiement
7. Évaluation

*Inspiré du workflow de confirmation/livraison de 6amMart.*

---

## ✅ État actuel de l'implémentation

Le dépôt est un **monorepo** contenant deux applications :

```
sougApp4/
├── sougapp-multi-service/   # App web multi-rôles (React 19 + Vite 8)
└── sougapp_mobile/          # App mobile (Flutter)
```

### 🧩 App web — `sougapp-multi-service`

Une **seule application React** sert les quatre rôles via des layouts et routes protégés (pas d'apps séparées) :

| Rôle | Préfixe de route | Layout | Pages implémentées |
|---|---|---|---|
| Client | `/app` | `ClientLayout` | Home · Search · StoreView (`store/:id`) · Cart · Profile |
| Super-Admin / Dispatcher | `/` | `SuperAdminLayout` | Dashboard · Users · Drivers · Merchants · Orders · Dispatch · Promotions · Zones · Modules · Finance · Settings |
| Marchand | `/merchant` | `MerchantLayout` | Dashboard · Products · Categories · Orders · Settings |
| Livreur | `/driver` | `DriverLayout` | Dashboard · History · Profile |

Authentification et garde d'accès : `AuthContext` (Supabase Auth) + `ProtectedRoute` (contrôle par `role`). Les pages sont chargées en *lazy loading* (`React.lazy` + `Suspense`).

**Stack web réelle :**

- **React 19** + **Vite 8** + **TypeScript 6**
- **Tailwind CSS 3** (`darkMode: "class"`) — design system « Desert Night » piloté par tokens dans `src/index.css` (vert drapeau `#0E7C66` + or `#C28A2E`, accents par service `--m-*`, thèmes clair/sombre, polices IBM Plex Sans/Mono, chiffres tabulaires). Bascule de thème persistée + système via `src/lib/theme.ts` et `ThemeToggle`.
- **react-router-dom 7** pour le routage
- **@supabase/supabase-js 2** (auth + accès données)
- **recharts 3** (graphiques) · **leaflet / react-leaflet** (cartes/zones)
- **i18next 26 + react-i18next 17** — trilingue **FR / AR / EN** avec **RTL**, devise **MRU**
- **lucide-react** (icônes) · `clsx` + `tailwind-merge`
- Qualité : **Vitest 4** + Testing Library (tests), **oxlint** (lint)

### 🗄️ Base de données — Supabase (PostgreSQL)

La base est **Supabase / PostgreSQL** (et non MySQL/Redis/MongoDB). La source de vérité unique est **`sougapp-multi-service/supabase/00_canonical_schema.sql`** (idempotent, RLS activée). Companion destructif optionnel : `00_reset_before_canonical_DANGER.sql`.

**Tables canoniques :** `profiles` · `zones` · `modules` · `stores` · `categories` · `products` · `orders` · `order_items` · `wallets` · `transactions` · `banners` · `coupons`.

- **Sécurité (RLS) :** politiques par rôle basées sur les helpers `get_my_role()` / `is_admin()` (évitent la récursion RLS).
- **Rôles applicatifs :** `super_admin` · `dispatcher` · `merchant` · `customer` · `driver`.
- **Statuts de commande :** vocabulaire unifié dans `src/lib/orderStatus.ts` (source unique alignée sur la contrainte `CHECK` de `orders`, libellés FR, tonalités par tokens).

> ⚠️ Le schéma canonique doit être **appliqué au projet Supabase en ligne** (SQL Editor ou `supabase db`) pour prendre effet ; le code web/mobile en dépend.

### 📱 App mobile — `sougapp_mobile`

Application **Flutter** (Dart) avec scaffolding iOS / Android / Web / Desktop. Se connecte au même backend Supabase.

### 🧭 Écart vision ↔ réalité (roadmap)

- Les **9 modules** sont déclarés (`src/data/modules.ts`) ; le parcours transactionnel réel s'appuie sur `stores` → `products` → `orders`. Les modules **Wallet / Billing / Booking** restent surtout au stade vision (tables `wallets`/`transactions` présentes, écrans dédiés à construire).
- **Redis / MongoDB / microservices NestJS·Laravel** : cible d'architecture non retenue à ce jour — remplacés par Supabase (Postgres + RLS + Edge Functions).
- **Next.js** n'est pas utilisé : le web est une SPA **Vite**.

---

## ☁️ Stack Technique

| Couche | 🧭 Vision d'origine | ✅ Implémentation actuelle |
|---|---|---|
| Mobile | Flutter | **Flutter** |
| Frontend web | React · Next.js | **React 19 · Vite 8 · Tailwind 3** (SPA, pas de Next.js) |
| Backend | NestJS · Laravel | **Supabase** (Auth + PostgreSQL + RLS + Edge Functions) |
| Base de données | MySQL · Redis · MongoDB | **Supabase / PostgreSQL** |
| i18n | — | **FR / AR / EN + RTL**, devise MRU |
| Infrastructure | Docker · Nginx · GitHub Actions | à définir (build Vite ; CI/CD à formaliser) |
