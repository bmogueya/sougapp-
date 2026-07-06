# SougApp Design System — "Desert Night"

## Origins

Mauritania's flag — a gold star and crescent on deep green — is the emotional
anchor. Desert Night distills those national colours into a calm, command-center
palette that works from Nouakchott to Nouadhibou.

## Typography

- **Primary:** IBM Plex Sans — crisp, legible, excellent Latin coverage
- **Arabic:** IBM Plex Sans Arabic — properly weighted for RTL, falls back to
  IBM Plex Sans for mixed text
- **Numeric/monospace:** IBM Plex Mono — used for order IDs, reference numbers,
  and data displays (`font-mono`)

Chosen over Inter because IBM Plex has a dedicated Arabic cut with correct
letterforms, bidirectional balancing, and appropriate line height for Arabic
readability (1.7 in RTL mode).

## Color Palette

Every colour is a CSS variable (space-separated RGB channels) so Tailwind's
`/ <alpha-value>` works and dark/light mode swaps by rewriting variables.

### Surface & Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg` | #F4F6F5 | #091411 | Page background |
| `--surface` | #FFFFFF | #0F1E1A | Card, modal, table body |
| `--surface-2` | #F8FAF9 | #152925 | Table header, sidebar hover |
| `--overlay` | #FFFFFF | #12231F | Dialog backdrop inset |
| `--border` | #E2E7E4 | #20352F | Dividers, input borders |
| `--border-strong` | #D0D7D3 | #2D473F | Scrollbar, active borders |

### Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--text` | #0E1D18 | #E8EFEC | Body, headings |
| `--muted` | #5C6E68 | #8FA69E | Labels, secondary info |
| `--faint` | #8C9C96 | #688078 | Placeholders, icons |

### Accents

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | #0E7C66 | #12B6A2 | Buttons, links, focus rings |
| `--primary-strong` | #0A5E4E | #148A99 | Button hover |
| `--primary-foreground` | #FFFFFF | #041410 | Text on primary buttons |
| `--gold` | #C28A2E | #E0A93B | Star accent, highlights |
| `--success` | #168F4A | #22B460 | Active status badges |
| `--warning` | #C28A2E | #E0A93B | Pending status badges |
| `--danger` | #D0383D | #E55A5F | Inactive/error states |
| `--info` | #2D6CDF | #6096F6 | Info banners |

### Service Module Accents (the Constellation)

Each business module gets its own semantic colour:

| Service | Light | Dark |
|---------|-------|------|
| Food | #D56C2F | #E88242 |
| Grocery | #2E8D4A | #34B064 |
| Marketplace | #0E7C66 | #12B6A2 |
| Pharmacy | #D0383D | #E55A5F |
| Parcel | #A8762E | #D0984A |
| Taxi | #C28A2E | #E0A93B |
| Wallet | #6C4ED6 | #8A6EF6 |
| Billing | #2D6CDF | #6096F6 |
| Booking | #C2428A | #E060A8 |

## Spacing & Sizing

- **Page max-width**: `max-w-4xl mx-auto` for settings, full-width for tables
- **Card padding**: `p-6` (1.5rem)
- **Table cell padding**: `px-6 py-4`
- **Gap between sections**: `space-y-6`

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-xl` | 14px (0.875rem) | Login panel, inputs |
| `rounded-2xl` | 18px (1.125rem) | Cards, modals, table containers |
| `rounded-lg` | 8px | Buttons, badges, small elements |
| `rounded-full` | 9999px | Status badges, toggle switches |

## Shadows

| Token | Definition | Usage |
|-------|------------|-------|
| `shadow-card` | `0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)` | Cards, tables |
| `shadow-raised` | `0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.08)` | Modals, dropdowns |
| `shadow-glow` | `0 0 0 1px rgb(var(--primary) / 0.25), 0 8px 30px -8px rgb(var(--primary) / 0.35)` | Active/focused elements |

## Motion

- **Page entry**: `animate-fade-in-up` — 0.5s cubic-bezier(0.22, 1, 0.36, 1)
- **Loading pulse**: `animate-pulse-soft` — 2.4s ease-in-out infinite
- **Button transitions**: `transition-colors` (NOT `transition-all`)
- **Modal open**: `animate-in fade-in zoom-in-95` (Tailwind animate-in plugin)
- **Backdrop blur**: `backdrop-blur-sm` on modals
- `prefers-reduced-motion` is respected — all animation/transition durations
  reduced to 0.001ms

## Accessibility

- Visible `focus-visible` ring: `2px solid rgb(var(--primary))` with 2px offset
- `::selection` uses primary at 25% opacity
- Labels use `htmlFor`/`id` pairing on all form inputs
- `autocomplete` attributes on email/password fields
- RTL support via `dir="rtl"` switching IBM Plex Sans Arabic

## Component Patterns

### Buttons
- Primary: `bg-primary hover:bg-primary-strong text-primary-foreground`
- Ghost: `text-muted hover:bg-surface-2`
- Disabled: `opacity-50 cursor-not-allowed`

### Form Inputs
- `border border-border bg-surface text-text rounded-lg`
- Focus: `focus:ring-2 focus:ring-primary outline-none`

### Cards
- `bg-surface rounded-2xl shadow-card border border-border overflow-hidden`

### Tables
- Header: `bg-surface-2 text-muted font-medium border-b border-border`
- Row: `border-b border-border hover:bg-surface-2 transition-colors`

### Status Badges
- Active: `bg-success/10 text-success`
- Pending: `bg-warning/10 text-warning`
- Inactive: `bg-danger/10 text-danger`

### Toggle Switch
- Track off: `bg-border`
- Track on: `bg-primary`
- Thumb: `bg-surface`
- Thumb border: `border-border`

## Dark Mode

Enabled by `.dark` class on `<html>`. All tokens swap via CSS variable
redefinition — no utility class changes needed. The dark palette is a
"desert night" inversion: warm darks with teal/gold accents instead of
pure black/blue.

## File Structure

```
src/
├── index.css          — Token definitions, base styles, scrollbars
├── tailwind.config.ts — Token → utility mapping
└── components/
    └── ui/            — Shared primitives (Card, Modal, Button, etc.)
```
