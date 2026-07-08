# Design Audit — SougApp Admin

**Date:** 2026-07-06
**URL:** http://localhost:5173
**Scope:** Full app (login + 9 protected pages via source review)
**Mode:** Source-augmented (auth-gated pages reviewed from code + rendered login page)

---

## Phase 1: First Impression

### Login Page

The site communicates **corporate efficiency with regional identity** — a Mauritania-inspired green/gold palette ("Desert Night") paired with IBM Plex Sans gives it a serious, admin-focused character. Not trying to be flashy, not trying to be friendly. It's a back office.

I notice the layout is simple and focused — centered card, clear form, clean background. The type choice is the strongest signal; IBM Plex Sans has a journalistic, authoritative weight.

The first 3 things my eye goes to are:
1. **"SougApp Admin"** — the H1 title (brand, clear, prominent)
2. **The email input field** — the cursor is there (task-ready)
3. **"Se connecter" button** — the dark rectangle anchors the bottom of the card

The visual hierarchy is honest — brand first, then action. This is correct for a login page.

**Page Area Test:**
- Header area (the card top): "SougApp Admin" + subtitle — instantly clear
- Form area: email + password inputs — instantly clear
- Action area: "Se connecter" button — instantly clear
- Error area: red error div at top of form — clear but shows only when errors fire

---

## Phase 2: Inferred Design System

### Actual Rendered System (vs. DESIGN.md)

| Token | DESIGN.md (documented) | Actual (rendered) | Verdict |
|-------|----------------------|-------------------|---------|
| Primary font | Inter | IBM Plex Sans + IBM Plex Sans Arabic | DESIGN.md outdated — actual choice supports Arabic properly |
| Primary color | Deep Navy #142965 | Teal/Green #0E7C66 (light) / #12B6A2 (dark) | Actual is richer, Mauritania-inspired |
| Secondary color | Teal #006684 | Gold #C28A2E (light) / #E0A93B (dark) | Actual has personality (flag colors) |
| Surface bg | #F8FAFC | rgb(244 246 245) warm paper | Close, actual slightly warmer |
| Bg color | — | Light + Dark theme CSS variables | DESIGN.md missing dark mode entirely |
| Card radius | rounded-lg (0.5rem) | rounded-2xl (1.125rem) | Actual is rounder |
| Header | Glassmorphism (80% + blur) | bg-white, static | DESIGN.md header spec not implemented |
| Text hierarchy | h1: 32px/700 | h1: 24px/700 (login) / 28px/700 on dashboard | Different sizes in different contexts |

**System strengths:** CSS variable-based theming with light/dark swap is well-architected. RTL + Arabic support is thorough. The "Desert Night" palette has genuine regional character. IBM Plex Sans Arabic is a thoughtful choice.

**System weakness:** Only the Dashboard and its ui subcomponents use the CSS variable system. All other pages use hardcoded Tailwind slate colors — the variable system is half-adopted.

### Fonts
- Primary: "IBM Plex Sans", "IBM Plex Sans Arabic" (RTL)
- Mono: "IBM Plex Mono"
- Font count: 2 (excellent)
- Body text: 16px ✓
- Tabular numbers utility class ✓

### Colors (Light Theme)
- bg: rgb(244 246 245) — warm paper
- surface: white
- text: rgb(14 29 24) — near-black with warmth
- muted: rgb(92 110 104) — sage gray
- faint: rgb(140 156 150) — pale sage
- primary: rgb(14 124 102) — teal green
- gold: rgb(194 138 46)
- 9 module/service accent colors
- Full dark theme swap via `.dark` class

### Spacing
- Card padding: p-5 (1.25rem) — matches DESIGN.md
- Page padding in layout: p-6 (1.5rem)
- Login card: p-8 (2rem)
- Stack: space-y-6 page level, space-y-4 form level
- Max content: 1440px

---

## Phase 3: Page-by-Page Visual Audit

### Login Page

| Check | Status | Notes |
|-------|--------|-------|
| Clear focal point | PASS | Card centers on screen |
| Font count ≤3 | PASS | IBM Plex Sans only |
| Body text ≥16px | PASS | 16px |
| WCAG AA contrast | LIKELY PASS | High contrast: #0F172A on white |
| Heading hierarchy | PARTIAL | Only h1 on page, no skipped levels issue |
| Touch targets ≥44px | FAIL | Inputs 42px, button 44px (barely) |
| Focus ring visible | PASS | focus:ring-2 with outline-none |
| No horizontal scroll | PASS | |
| Form labels present | FAIL | Labels present but NOT associated (no htmlFor/id) |
| Autocomplete attributes | FAIL | Missing on email/password inputs |
| Forgot password | FAIL | No link present |
| Placeholder text | FAIL | Empty string on inputs |
| Console errors | PASS | Clean |
| Load time | FAIL | 3.25s total — slow for login |

### Dashboard (source)

| Check | Status | Notes |
|-------|--------|-------|
| Clear focal point | PASS | Board table is primary content |
| Typography system | PASS | CSS variables + font-mono for numbers |
| Consistent spacing | PASS | All gap/space from theme variables |
| Dark mode compatible | PASS | Uses CSS variables |
| Color encoding | PASS | Data visualization uses module accent colors |
| Responsive | PASS | grid-cols-1 → xl:grid-cols-3 |
| Skeleton/loading | PASS | "Chargement..." text fallback |
| Empty state quality | FAIL | Only text "Aucun..." — no illustration |
| Content above fold | PASS | Console header + KPI strip visible first |

### Users / Drivers / Finance / Modules Pages

| Check | Status | Notes |
|-------|--------|-------|
| Uses theme variables | FAIL | ALL use hardcoded slate/blue/green/orange Tailwind colors |
| Dark mode | FAIL | Will not switch to dark — colors are hardcoded |
| Consistent with Dashboard | FAIL | Different shadow/border/rounded values |
| Empty states | FAIL | Text-only "Aucun trouvé." |
| Table header contrast | PASS | bg-slate-50 headers readable |
| Row hover state | PASS | hover:bg-slate-50 |
| Action buttons | PASS | Consistent slate-900 button style |
| Search inputs | PARTIAL | Has focus ring but uses `focus:ring-blue-500` not theme primary |

### Sidebar (source)

| Check | Status | Notes |
|-------|--------|-------|
| Active state indicator | FAIL | No current-page highlight |
| Hover state | PASS | bg-slate-800 |
| Icons consistent | PASS | lucide-react, 20px |
| RTL support | PASS | ltr:left-0 / rtl:right-0 |
| Mobile behavior | FAIL | Sidebar always rendered, no collapse/hamburger |
| Brand visibility | PASS | "SougApp Admin" in sidebar header |

### Header (source)

| Check | Status | Notes |
|-------|--------|-------|
| Glassmorphism (per DESIGN.md) | FAIL | bg-white, no backdrop-blur |
| Language switcher | PASS | Fr/Ar/En, functional |
| Logout | PASS | Red hover, clear |
| Sticky | PASS | sticky top-0 z-10 |

---

## Phase 4: Interaction Flow

### Login Flow (from source code)

**Goodwill meter:** 70/100

1. **Login page load** → 70-15 = 55 (3.25s load time, drains goodwill)
2. **User enters email** → 55-5 = 50 (no autocomplete, no placeholder — small drain)
3. **User enters password** → 50-5 = 45 (label not associated — accessibility friction)
4. **User clicks "Se connecter"** → 45+5 = 50 (button is obvious, clear primary action)
5. **Error handling** → 50-10 = 40 (raw Supabase error message shown — not user-friendly)
6. **Successful login** → 40+10 = 50 (dashboard loads with data)

**FINAL: 50/100 — Needs work**

Biggest drains: 3.25s load time, missing autocomplete on password, no accessible labels.

---

## Phase 5: Cross-Page Consistency

### Major Inconsistency

The app has **two design systems living side by side**:

1. **CSS Variable Theme** — Used by: Dashboard, Card, DeltaPill, StatusBadge, Badge, Sparkline
   - Colors from `--text`, `--muted`, `--faint`, `--border`, `--surface`, `--bg`, `--primary`
   - Dark mode compatible
   - `2xl` radius on cards
   - `shadow-card` subtle shadows

2. **Hardcoded Tailwind Slate** — Used by: Login, Sidebar, Header, Users, Drivers, Finance, Modules
   - `text-slate-900`, `bg-slate-50`, `border-slate-200`, `bg-white`
   - Dark mode incompatible
   - `xl` radius on cards
   - `shadow-sm` different shadow

This means the Dashboard looks polished and thematic, while all other pages look like generic Tailwind starter templates. The user experience is jarring — a beautiful dashboard surrounded by generic CRUD pages.

---

## Phase 6: Score and Findings

### Scores

| Category | Grade | Weight |
|----------|-------|--------|
| Visual Hierarchy | B+ | 15% |
| Typography | A- | 15% |
| Spacing & Layout | B- | 15% |
| Color & Contrast | C | 10% |
| Interaction States | C+ | 10% |
| Responsive | C+ | 10% |
| Content & Microcopy | B | 10% |
| AI Slop | A | 5% |
| Motion & Animation | B+ | 5% |
| Performance Feel | C+ | 5% |

**Design Score: C+** (weighted: 2.90/4.0)
**AI Slop Score: A** (no AI-generated patterns detected)

The C+ is primarily dragged down by the severe inconsistency between the Dashboard's themed design and the hardcoded slate colors everywhere else.

### All Findings

#### FINDING-001 — HIGH: Design system inconsistency (half the app uses hardcoded colors)
**Category:** Color & Contrast / Spacing & Layout
**Pages affected:** Login, Sidebar, Header, Users, Drivers, Finance, Modules
**Issue:** 7 of 10 pages use hardcoded Tailwind slate colors (`text-slate-900`, `bg-slate-50`, `border-slate-200`) instead of CSS variable theme colors (`text`, `bg`, `border`, `surface`). This breaks dark mode and visual cohesion.
**Fix:** Replace hardcoded slate/blue/green/orange colors with theme CSS variable equivalents in all pages.
**Source:** `src/pages/Login.tsx`, `src/pages/Users.tsx`, `src/pages/Drivers.tsx`, `src/pages/Finance.tsx`, `src/pages/Modules.tsx`, `src/components/Sidebar.tsx`, `src/components/Header.tsx`

#### FINDING-002 — HIGH: DESIGN.md outdated
**Category:** Documentation
**Issue:** DESIGN.md specifies Inter font and Navy/Teal palette. Actual implementation uses IBM Plex Sans and Green/Gold "Desert Night." The document needs to reflect the real system.
**Fix:** Update DESIGN.md to match the implemented "Desert Night" system.

#### FINDING-003 — HIGH: Login form labels not associated with inputs
**Category:** Interaction States / Accessibility
**Pages affected:** Login
**Issue:** Labels have no `htmlFor` and inputs have no `id`. Screen readers cannot associate labels with inputs.
**Fix:** Add matching `id`/`htmlFor` pairs to inputs and labels.
**Source:** `src/pages/Login.tsx:46-54`

#### FINDING-004 — MEDIUM: No autocomplete on login form
**Category:** Interaction States
**Pages affected:** Login
**Issue:** Email and password inputs lack `autocomplete` attributes. Browsers won't suggest saved credentials.
**Fix:** Add `autocomplete="email"` and `autocomplete="current-password"`.
**Source:** `src/pages/Login.tsx:49-68`

#### FINDING-005 — MEDIUM: No active state on sidebar navigation
**Category:** Interaction States
**Pages affected:** Sidebar (all pages)
**Issue:** Current page is not highlighted in the sidebar. Users cannot tell where they are.
**Fix:** Use `useLocation()` to detect current route and apply `bg-slate-800/primary-container` to active link.
**Source:** `src/components/Sidebar.tsx`

#### FINDING-006 — MEDIUM: Login page load time 3.25s
**Category:** Performance
**Pages affected:** Login
**Issue:** Login page takes 3.25s to load. LCP likely >2.5s. Slowest element: font loading + JS bundle.
**Fix:** Font preloading, code splitting, defer non-critical JS.

#### FINDING-007 — MEDIUM: Focus ring uses blue-500 instead of theme primary
**Category:** Color & Contrast
**Pages affected:** Login, Users, Drivers, Finance
**Issue:** All pages use `focus:ring-blue-500` in inputs but the theme uses teal/green primary color. Inconsistent brand signal.
**Fix:** Use `focus:ring-primary` or `focus:ring-[rgb(var(--primary))]` consistently.

#### FINDING-008 — MEDIUM: No password reset / forgot password flow
**Category:** Content & Microcopy
**Pages affected:** Login
**Issue:** No "forgot password" link. Users who forget their password have no recovery path.
**Fix:** Add "Mot de passe oublié?" link directing to Supabase password reset.

#### FINDING-009 — MEDIUM: No mobile navigation collapse
**Category:** Responsive
**Pages affected:** All protected pages
**Issue:** Sidebar is always visible (w-64). On mobile viewports (<768px) this takes 256px leaving only ~119px for content on a 375px phone screen.
**Fix:** Implement sidebar collapse to hamburger menu on mobile.

#### FINDING-010 — POLISH: Inputs lack placeholder text
**Category:** Content & Microcopy
**Pages affected:** Login
**Issue:** Email and password inputs have empty placeholder strings. Visual friction — the field looks empty.
**Fix:** Add `placeholder="ex: admin@sougapp.mr"` and `placeholder="••••••••"`.

#### FINDING-011 — POLISH: Card border-radius inconsistency
**Category:** Spacing & Layout
**Pages affected:** All
**Issue:** Three different card radii: `rounded-2xl` (Card component), `rounded-xl` (login, users, drivers pages), `rounded-lg` (DESIGN.md spec).
**Fix:** Standardize on one radius (recommend `rounded-2xl` for consistency with Card component).

#### FINDING-012 — POLISH: Empty states are text-only
**Category:** Content & Microcopy
**Pages affected:** Users, Drivers, Finance, Dashboard
**Issue:** Empty states show only "Aucun utilisateur trouvé." / "Chargement..." text. No illustration, no guidance, no CTA.
**Fix:** Add illustration, friendly message, and primary action button.

#### FINDING-013 — POLISH: Login page has no logo/brand image
**Category:** Visual Hierarchy
**Pages affected:** Login
**Issue:** No logo, icon, or brand mark. Only text "SougApp Admin." Feels bare.
**Fix:** Add SVG logo or icon mark above the H1.

#### FINDING-014 — POLISH: Hardcoded font-mono in chart component
**Category:** Typography
**Pages affected:** Dashboard
**Issue:** Chart tick labels use inline `fontFamily: "IBM Plex Mono"` instead of Tailwind's `font-mono`.
**Fix:** Reference Tailwind font-mono config.

#### FINDING-015 — POLISH: `transition-all` on buttons
**Category:** Motion & Animation
**Pages affected:** Login, Users, Drivers
**Issue:** Buttons use `transition-all` which animates ALL properties. Should list specific properties.
**Fix:** Use `transition-colors` instead (per Dashboard button pattern).

---

## Summary

| Metric | Value |
|--------|-------|
| Total findings | 15 |
| High impact | 3 |
| Medium impact | 6 |
| Polish | 6 |
| Design Score | C+ (2.90/4.0) |
| AI Slop Score | A |
| Key weakness | Design system inconsistency — Dashboard uses beautiful CSS variable theme, rest of app uses hardcoded Tailwind slate |
| Key strength | IBM Plex Sans + Arabic, "Desert Night" color palette, RTL support, dark mode architecture |

---

## Quick Wins (≤30 min each)

1. **FINDING-003 (30min):** Add `id` to inputs and `htmlFor` to labels in Login.tsx
2. **FINDING-004 (5min):** Add `autocomplete` attributes to login form
3. **FINDING-007 (15min):** Replace `focus:ring-blue-500` with `focus:ring-primary` across all pages
4. **FINDING-005 (20min):** Add active route detection to Sidebar
5. **FINDING-010 (5min):** Add placeholder text to login inputs
6. **FINDING-011 (15min):** Standardize card border-radius to `rounded-2xl`

The biggest win (FINDING-001, migrating 7 pages to CSS variable theming) is ~2h work but delivers the most impact — it would bring the Design Score up to a B+.
