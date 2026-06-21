# MuniTwin AI — Design System

Inspired by NASA JPL (jpl.nasa.gov). Values extracted from the live site.

---

## Colors

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#0d0f12` | page background |
| `bg-surface` | `#1a1d23` | cards, panels, sidebar |
| `bg-subtle` | `#f4f5f7` | light sections |
| `text-primary` | `#ffffff` | text on dark |
| `text-secondary` | `#9ca3af` | labels, meta, captions |
| `text-dark` | `#111827` | text on light |
| `accent` | `#2563eb` | CTA, links, brand — civic blue replacing JPL red |
| `accent-hover` | `#1d4ed8` | hover state |
| `border-dark` | `#2a2d35` | dividers on dark surfaces |
| `border-light` | `#e5e7eb` | dividers on light surfaces |

### Status colors (JPL red recycled as critical)

| Status | Hex | Tailwind approx |
|---|---|---|
| `critical` | `#e4002b` | — (custom, exact JPL red) |
| `warning` | `#f59e0b` | `amber-500` |
| `ok` | `#10b981` | `emerald-500` |

---

## Typography

Font: **Inter** (Google Fonts — free substitute for JPL's Helvetica Now).

| Role | Weight | Size |
|---|---|---|
| Hero headline | 800 | 4–6rem |
| Section title | 700 | 2–2.5rem |
| Card title | 600 | 1.125–1.25rem |
| Body | 400 | 1rem |
| Label / caption | 500 | 0.75rem, uppercase, tracked |

---

## Key Component Patterns

**Hero**
Full-viewport section. Dark background with subtle coordinate-grid overlay (CSS, no image required). White headline, secondary text in `text-secondary`, single primary CTA button.

**Cards (dark)**
`bg-surface` background, no visible border (use shadow or subtle inner border). Image or icon at top, title + body below. Status badge top-right when applicable.

**Status badge**
Small pill: `rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide`.
Color from status palette above. Background at 15% opacity, text at full color.

**Button — primary**
`bg-accent text-white font-semibold px-6 py-3`. Minimal border-radius (`rounded`). No shadow. Hover: `bg-accent-hover`.

**Button — ghost**
Transparent, `border border-white/30 text-white`. Hover: `bg-white/10`.

**Nav**
Dark (`bg-base`), sticky. Logo left, actions right. Becomes `bg-surface` on scroll (JS class toggle). Height: `56px`.

**Map sidebar**
`bg-surface`, fixed width `320px`, full height minus nav. Internal sections separated by `border-dark` dividers. Scrollable independently from map.

---

## Tile Layer

CartoDB Dark Matter (free, no API key):
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
Attribution: © OpenStreetMap contributors © CARTO
