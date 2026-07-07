# 📌 Plan de développement SougApp — ancré sur l'état réel du repo

> Ce document reprend le plan générique fourni et le **confronte au code réellement présent** dans ce dépôt (au 2026-07-07). Chaque axe indique : ce qui est **fait**, ce qui est **partiel**, ce qui **reste à faire**, avec la preuve dans le code. La roadmap est ensuite **re-priorisée** en fonction de ce qui bloque vraiment.
>
> **Légende :** ✅ fait · 🟡 partiel · 🔴 à faire / bloquant

---

## 🧭 En une ligne

Le socle est **solide** (monorepo React 19 + Vite + Flutter, 4 rôles, auth Supabase, design system tokenisé, dark mode, i18n FR/AR/EN, schéma canonique). Les manques sont surtout **opérationnels** : le **schéma Supabase n'est pas appliqué en ligne** (bloquant), **aucun CI/CD**, **tests limités aux atoms/lib**, **perf** (chunk > 500 kB) et **doc/branding** encore par défaut.

---

## 📊 État des lieux par axe

### 🛠️ Développement — 🟡 avancé
- ✅ Monorepo : `sougapp-multi-service` (web React 19 · Vite 8 · TS 6 · Tailwind 3) + `sougapp_mobile` (Flutter).
- ✅ 4 rôles avec layouts + routage protégé + lazy loading — [App.tsx](sougapp-multi-service/src/App.tsx) (`ProtectedRoute`, `React.lazy`).
- ✅ Pages livrées : Super-Admin (11), Merchant (5), Client (5), Driver (3).
- 🟡 Modules **Wallet / Billing / Booking** encore au stade vision (tables `wallets`/`transactions` présentes, écrans à construire).
- 🟢 Code propre : **0 `TODO`/`FIXME`** dans `src`.

### 🎨 UI/UX — ✅ bon socle
- ✅ Design system « Desert Night » 100 % tokenisé — [index.css](sougapp-multi-service/src/index.css) ; **0 couleur brute** `slate/gray/zinc`.
- ✅ Dark mode persistant + préférence système + anti-flash — [theme.ts](sougapp-multi-service/src/lib/theme.ts), [ThemeToggle.tsx](sougapp-multi-service/src/components/ThemeToggle.tsx).
- ✅ Dashboard « Le souk en direct » (board live, sparklines, chiffres tabulaires).
- 🟡 Toggle thème présent dans le chrome **admin** seulement — à propager aux chrome client/driver/merchant (trivial).
- 🟡 États d'écran (vide / chargement / erreur / succès) à auditer page par page.

### ⚡ Performances — 🟡 à optimiser
- ✅ Lazy loading des routes déjà en place.
- ✅ `vite.config.ts` avec alias `@` (la dette « pas de vite.config » est **résolue**) — [vite.config.ts](sougapp-multi-service/vite.config.ts).
- 🔴 **Chunk JS principal > 500 kB** (recharts + leaflet + supabase) : pas de `manualChunks` / découpage des libs lourdes.
- 🔴 Pas de couche de cache de données (pas de React Query / SWR) : appels Supabase directs, non mutualisés.
- 🟡 Optimisation images/polices non formalisée.

### 🐞 Qualité — ✅ sain
- ✅ Lint **oxlint** configuré (`npm run lint`).
- ✅ Build vert (`tsc -b && vite build`), TS 6.
- ✅ Aucune anomalie de dette majeure ouverte (schéma/statuts unifiés via [orderStatus.ts](sougapp-multi-service/src/lib/orderStatus.ts)).
- 🟡 README encore = **template Vite par défaut** (voir Documentation).

### 🧪 Tests — 🔴 insuffisants
- ✅ **40 tests / 9 fichiers, tous verts** (vérifié 2026-07-07, `npm test`).
- 🔴 Couverture limitée aux **atoms UI + lib** (Badge, Card, Sparkline, StatusBadge, DeltaPill, Modal, utils, orderStatus, theme).
- 🔴 **Aucun test de page / d'intégration** (Orders, Dashboard, parcours client/merchant/driver).
- 🔴 **Aucun test E2E** (pas de Playwright configuré dans le projet ; le dossier `.playwright-mcp/` à la racine ne sont que des snapshots de sessions QA MCP).

### 🔒 Sécurité — 🔴 point critique (fintech)
- ✅ RLS **définie** dans [00_canonical_schema.sql](sougapp-multi-service/supabase/00_canonical_schema.sql) via `get_my_role()` / `is_admin()` (anti-récursion).
- ✅ Secrets hors code : `.env.example` + `.env.local`.
- 🔴 **Schéma canonique NON appliqué au projet Supabase en ligne** (`lhmgzyjfstpzwtxsqiit`) → la base prod peut être en RLS permissive/absente. **Bloquant.**
- 🔴 Aucun audit sécurité (OWASP, IDOR, RBAC serveur, secrets/SCA) — cf. agent `cheikh-securite`.
- 🟡 Vérifier : `.env.local` bien gitignored ; aucune clé `service_role` exposée côté client ; webhooks paiement signés (cf. `ahmedou-paiements`).

### 📱 Responsive — 🟡 non validé
- ✅ Tailwind (mobile-first) sur toutes les pages.
- 🟡 Aucune validation multi-breakpoints documentée ; chrome client/driver (usage mobile) à tester sur petits écrans.

### 🌍 Internationalisation — 🟡 fonctionnel mais fragile
- ✅ 3 locales **FR / AR / EN** — [i18n/config.ts](sougapp-multi-service/src/i18n/config.ts) (~252 lignes).
- ✅ Hook RTL CSS (`:root[dir="rtl"]` dans index.css) + bascule `dir`/`lang` sur changement de langue — [Header.tsx](sougapp-multi-service/src/components/Header.tsx).
- 🔴 Langue **non persistée** (`lng: "fr"` en dur, pas de détecteur localStorage/navigateur) et `dir` **non appliqué au boot** → premier rendu en LTR même si AR choisi.
- 🟡 Switch de langue câblé dans le **Header admin** seulement — à propager aux autres chrome.
- 🟡 Audit des textes en dur non externalisés requis (cf. `khadijetou-localisation`).

### ♿ Accessibilité — 🔴 non auditée
- 🟡 A11y partielle (ex. `ThemeToggle` a des labels).
- 🔴 Aucun audit **WCAG 2.2** : navigation clavier, contrastes, `aria-*` sur formulaires/tableaux, lecteurs d'écran.

### 📚 Documentation — 🟡 partielle
- ✅ [Architecture.md](Architecture.md) **à jour** (réconciliée vision ↔ réalité, aujourd'hui).
- 🔴 README = template Vite (à remplacer par un vrai README SougApp : install, config `.env`, lancement, scripts).
- 🔴 Pas de doc API/composants, ni guide utilisateur, ni runbook de déploiement.

### 🚀 Préparation MVP — 🔴 pas prêt
- Bloqueurs avant toute pré-prod : schéma en ligne + CI/CD + tests de parcours + audit sécu. Voir roadmap.

---

## 📅 Roadmap re-priorisée

> Réordonnée pour **débloquer d'abord** ce qui empêche une mise en production fiable, puis élargir. Un « Sprint 0 » est ajouté car plusieurs bloqueurs ne figuraient pas dans le plan générique.

### 🔴 Sprint 0 — Débloquer (fondations prod)
1. **Appliquer `00_canonical_schema.sql`** au projet Supabase en ligne, puis lancer les *security advisors*. *(cf. `samba-devops` / `demba-backend`)*
2. **Mettre en place la CI** (`.github/workflows`) : `lint` + `build` + `test` à chaque push/PR.
3. **README SougApp** réel (install, `.env`, `npm run dev/build/test`).
4. **Branding** : remplacer le favicon Vite par le logo SougApp + logo dans Login/Sidebar.

### 🎨 Sprint 1 — Expérience & i18n robuste
- Persistance de la langue + `dir` appliqué au boot + propagation du switch langue et du dark toggle aux chrome client/driver/merchant.
- Audit des états d'écran (vide/chargement/erreur/succès) sur les pages métier.
- Passe responsive sur les parcours mobile (client, driver).
- Audit i18n : détecter/externaliser les textes en dur (`khadijetou-localisation`).

### ⚡ Sprint 2 — Performance & Qualité
- Code-splitting des libs lourdes (`manualChunks` : recharts, leaflet, supabase) → viser < 500 kB/chunk.
- Introduire une couche de cache de données (React Query ou équivalent) sur les lectures Supabase.
- Tests de **pages/intégration** (Orders, Dashboard, parcours panier→commande) + premier flux **E2E**.
- Optimisation images/polices.

### 🔒 Sprint 3 — Sécurité & Accessibilité
- Audit sécurité complet (`cheikh-securite`) : RLS effectives, IDOR, RBAC, secrets/SCA, webhooks paiement signés (`ahmedou-paiements`).
- Audit **WCAG 2.2** + corrections (clavier, contrastes, ARIA, lecteurs d'écran).
- Conformité comptable/wallet si le module Wallet entre en périmètre (`salka-comptable`).

### 🚀 Sprint 4 — Livraison MVP
- Doc API/composants + guide utilisateur + runbook de déploiement (`fatimetou-redactrice-technique`).
- Recette fonctionnelle (UAT) et smoke tests (`yahya-testeur-qa`).
- Pré-production → déploiement MVP → monitoring & correctifs post-déploiement (`samba-devops`).

---

## 🎯 Top 5 des actions immédiates

| # | Action | Pourquoi | Piste |
|---|---|---|---|
| 1 | Appliquer le schéma canonique Supabase en ligne | Bloquant : sécurité RLS + colonnes attendues par le code | SQL Editor du projet `lhmgzyjfstpzwtxsqiit` |
| 2 | Mettre en place la CI (lint+build+test) | Verrouiller la qualité (40 tests déjà verts à automatiser) | `.github/workflows/ci.yml` |
| 3 | Remplacer le README template par un vrai README | Onboarding dev / config `.env` | Documentation |
| 4 | Intégrer le logo SougApp (favicon + Login/Sidebar) | Branding / crédibilité MVP | dépose les fichiers image dans le repo |
| 5 | Persister la langue + `dir` RTL au boot | Bug UX AR : premier rendu LTR | i18n + `main.tsx` |

---

## 🏁 Résultat attendu

Une application **stable, rapide, sécurisée, évolutive et prête pour la production**, multilingue (FR·AR·EN), responsive (mobile·tablette·desktop) et conforme WCAG 2.2 — **atteint via la roadmap ci-dessus, en commençant par lever les bloqueurs du Sprint 0.**
