# iMebel — Design Specification

Extracted from two reference builds:
- **Variant A** → `preview-react-9bfmud-epwjr6wejrcu8ybmtexcju.onspace.build`
- **Variant B** → `preview-react-9bfnjs-fwakr2fg28zgjgzr8jzjxq.onspace.build`

Stack: React + Vite + Tailwind CSS + shadcn/ui design tokens.

---

## Design Tokens — CSS Custom Properties (`:root`)

Both variants use the same token names. Values differ slightly.

| Token | Variant A | Variant B |
|---|---|---|
| `--background` | `0 0% 100%` (white) | `0 0% 100%` (white) |
| `--foreground` | `222.2 84% 4.9%` (cool near-black) | `20 14.3% 4.1%` (warm near-black) |
| `--card` | `0 0% 100%` | `0 0% 100%` |
| `--primary` | `28 80% 52%` ≈ **#e07428** | `17 88% 48%` ≈ **#e54d1a** |
| `--primary-foreground` | `0 0% 100%` (white) | `0 0% 100%` (white) |
| `--secondary` | `210 40% 96.1%` (cool light gray) | `60 4.8% 95.9%` (warm light gray) |
| `--muted` | `210 40% 96.1%` | `60 4.8% 95.9%` |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `25 5.3% 44.7%` |
| `--accent` | `210 40% 96.1%` | `60 4.8% 95.9%` |
| `--destructive` | `0 84.2% 60.2%` (#dc2626) | `0 84.2% 60.2%` (#dc2626) |
| `--border` | `214.3 31.8% 91.4%` (#e5e7eb) | `20 5.9% 90%` (warm gray) |
| `--input` | same as border | same as border |
| `--ring` | same as primary | same as primary |
| `--radius` | `0.5rem` (8px) | `0.5rem` (8px) |

Usage in Tailwind: `hsl(var(--primary))`, `hsl(var(--primary) / 0.1)` etc.

---

## Color Palette

### Brand Colors

| Role | Tailwind class | Hex (approx) |
|---|---|---|
| Primary (Variant A) | `orange-600` range | `#e07428` / `hsl(28,80%,52%)` |
| Primary (Variant B) | `orange-600` range | `#e54d1a` / `hsl(17,88%,48%)` |
| Gradient accent | `from-orange-600 to-amber-600` | `#ea580c` → `#d97706` |
| Gradient hover | `from-orange-700 to-amber-700` | darker on hover |
| Gradient text | same gradient, `bg-clip-text text-transparent` | — |

### Neutral Palette

| Role | Tailwind | Notes |
|---|---|---|
| Page background | `bg-white` | — |
| Subtle section bg | `bg-orange-50` | warm tint |
| Muted text | `text-gray-600` / `text-muted-foreground` | — |
| Body text | `text-gray-900` / `text-foreground` | — |
| Disabled / light text | `text-gray-400` / `text-gray-500` | — |
| Navbar bg | `bg-white` with `border-b` | |
| Footer bg (A) | `bg-gray-900` text `text-gray-300` | |
| Footer bg (B) | `bg-slate-900` text `text-slate-400` | slightly different shade |

### Accent Palette (Variant A also uses)

| Role | Tailwind | Usage |
|---|---|---|
| AI / secondary feature | `purple-50`, `purple-100`, `purple-600` | AI assistant section |
| CTA secondary | `blue-50`, `blue-100`, `blue-600` | information blocks |
| Success | `green-100`, `green-500`, `green-600` | status indicators |

---

## Typography

Font stack: Tailwind default system sans-serif.
```
ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", ...
```
No custom web fonts loaded.

| Element | Classes |
|---|---|
| Hero H1 | `text-4xl md:text-6xl font-bold text-gray-900 leading-tight` |
| Hero H1 (B) | `text-4xl md:text-5xl lg:text-6xl font-bold leading-tight` |
| Section H2 | `text-3xl md:text-4xl font-bold mb-4` |
| Section H3 | `text-2xl md:text-3xl font-bold` |
| Card title | `text-xl font-bold` / `font-semibold` |
| Stat number | `text-3xl font-bold text-primary` / `text-5xl md:text-6xl font-bold` |
| Body / lead | `text-lg text-gray-600 leading-relaxed` / `text-lg text-muted-foreground` |
| Caption / label | `text-sm text-gray-600` / `text-xs text-gray-500` |
| Nav logo | `text-2xl font-bold text-primary` |
| Nav links | `text-foreground/70 hover:text-foreground transition-colors` |
| Footer heading | `font-semibold text-white mb-4` |
| Footer links | `text-gray-300 / text-slate-400 hover:text-primary transition-colors` |
| Section label | `text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4` |

---

## Spacing System

Container: `container mx-auto px-4` (max-width from Tailwind's container).

| Purpose | Values |
|---|---|
| Section vertical padding | `py-16`, `py-20`, `py-12`, `md:py-24`, `md:py-32` |
| Card padding | `p-6`, `p-8` |
| Navbar height | `h-16` (64px) |
| Gap between grid cols | `gap-8`, `gap-6`, `gap-12` |
| Inline gaps | `gap-2`, `gap-3`, `gap-4` |
| Footer padding | `py-12` |
| Section mb | `mb-12`, `mb-16` |

---

## Border Radius

| Component | Class | px |
|---|---|---|
| Default (tokens) | `rounded` = `--radius` | 8px |
| Cards, modals | `rounded-xl` | 12px |
| Hero image, profile card | `rounded-2xl` | 16px |
| Buttons (sm) | `rounded-lg` | 8px |
| Buttons (lg, B) | `rounded-xl` | 12px |
| Badges / pills | `rounded-full` | 9999px |
| Icon containers | `rounded-xl`, `rounded-full` | — |
| Input fields | `rounded-lg`, `rounded-xl` | — |

---

## Shadows

| Component | Shadow |
|---|---|
| Navbar | `shadow-sm` |
| Cards (hover) | `shadow-lg` |
| Hero image | `shadow-2xl` |
| Primary buttons | `shadow-md` |
| Gradient CTA buttons | `shadow-lg shadow-orange-500/30` |
| Floating card (hero) | `shadow-lg`, `shadow-2xl` |
| Icon badge | `shadow-md` |

---

## Components

### Navbar

```
sticky top-0 z-50 w-full border-b bg-white shadow-sm
  container mx-auto px-4
    flex h-16 items-center justify-between
      [logo: flex items-center gap-2, h-8 w-8 text-primary, text-2xl font-bold text-primary]
      [desktop nav: hidden md:flex items-center gap-6]
      [actions: flex items-center gap-3]
```

**Cart badge:** `absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-white`

**Variant B CTA button in nav:**
```
bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-lg font-medium
hover:from-orange-700 hover:to-amber-700 transition-all hidden sm:flex
```

### Hero Section

**Variant A:**
```
relative bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 md:py-32
  grid md:grid-cols-2 gap-12 items-center
```

**Variant B:**
```
relative bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden
  container mx-auto px-4 py-16 md:py-24
  grid md:grid-cols-2 gap-12 items-center
```

Floating card on image:
```
absolute -bottom-6 -left-6 bg-white p-4/p-6 rounded-xl shadow-lg/shadow-2xl border-2 border-orange-100
```

### Buttons

**Primary (gradient):**
```
bg-gradient-to-r from-orange-600 to-amber-600 text-white
px-6 py-3 rounded-xl font-semibold
hover:from-orange-700 hover:to-amber-700 transition-all
shadow-lg shadow-orange-500/30
```

**Primary (solid, Variant A):**
```
bg-primary text-primary-foreground h-14 text-lg (large CTA)
```

**Secondary / outline:**
```
bg-white text-foreground px-8 py-4 rounded-xl font-semibold
hover:bg-orange-50 transition-colors border-2 border-orange-200
```

**Disabled state:** `disabled:opacity-50 disabled:cursor-not-allowed`

### Cards (Product / Feature)

**Variant A:**
```
bg-white rounded-xl border border-border hover:border-primary
transition-all hover:shadow-lg group p-8
```

**Variant B product card:**
```
group flex gap-4 p-4 bg-orange-50 rounded-xl
border border-orange-100 hover:border-orange-200 transition-all
```

**Icon container:**
```
h-12 w-12 / w-10 h-10 rounded-full / rounded-xl
bg-orange-600 / bg-primary-100 flex items-center justify-center
```

### Input Fields

```
px-4 py-3 border border-border rounded-lg
focus:outline-none focus:ring-2 focus:ring-primary
```

Or custom class `.input-field` (Variant B).

Styled display field:
```
px-4 py-3 bg-orange-50 rounded-xl text-gray-800 min-h-[48px]
```

### Badges / Pills

```
text-sm font-medium px-3 py-1 rounded-full
bg-orange-100 text-orange-700
bg-blue-100 text-blue-700
bg-green-100 text-green-600
bg-white/20 backdrop-blur-sm (on dark/gradient bg)
```

### AI Chat Component (Variant B)

Container:
```
bg-white border border-border rounded-2xl px-4 py-3
```

Send button:
```
bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3
rounded-lg font-medium hover:from-orange-700 hover:to-amber-700
transition-all disabled:opacity-50 flex items-center gap-2 shadow-md
```

### Section Backgrounds (alternating)

| Section | Background |
|---|---|
| Page | `bg-white` |
| Hero | `bg-gradient-to-br from-orange-50 via-[white/amber-50] to-orange-[50/100]` |
| Features | `bg-white` |
| AI section (A) | `bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl` |
| CTA/Stats | `bg-gradient-to-b from-white to-orange-50` |
| Reviews/Green | `bg-gradient-to-br from-green-50 to-emerald-50` |
| Auth/Modal bg | `bg-gradient-to-br from-orange-50 via-white to-amber-50` |
| Footer (A) | `bg-gray-900` |
| Footer (B) | `bg-slate-900` |

### Footer

```
bg-gray-900 / bg-slate-900 text-gray-300 / text-white mt-16
  container mx-auto px-4 py-12
    grid grid-cols-1 md:grid-cols-4 gap-8
  border-t border-gray-800 / border-slate-800 mt-8 pt-8
    text-center text-sm (copyright)
```

---

## Animations & Transitions

| Animation | Usage |
|---|---|
| `transition-colors` | Links, nav items |
| `transition-all` | Buttons, cards, borders |
| `hover:shadow-lg` | Cards on hover |
| `hover:border-primary` | Feature cards |
| `group-hover:scale-110 transition-transform` | Icon containers in quick links |
| `group-hover:gap-3 transition-all` | Arrow icons in CTA links |
| `animate-spin` | Loading spinners |
| `@keyframes accordion-down/up` | Accordion components |
| `@keyframes enter/exit` | Modal/toast entry |
| `@keyframes bounce`, `@keyframes pulse` | Tailwind animate utilities |

---

## Layout Grids

| Section | Grid |
|---|---|
| Hero | `grid md:grid-cols-2 gap-12 items-center` |
| Stats | `grid grid-cols-3 gap-6` (A) / `grid md:grid-cols-3` (B) |
| Features | `grid md:grid-cols-3 gap-8` (B) / `md:grid-cols-4` (A footer) |
| AI cards | `grid md:grid-cols-2 gap-6` |
| Products | `grid sm:grid-cols-2 gap-4` |
| Quick links | `grid grid-cols-2 gap-3` |

---

## Key Differentiators Between Variants

| Feature | Variant A | Variant B |
|---|---|---|
| Primary hue | Warm orange `hsl(28,80%,52%)` | Red-orange `hsl(17,88%,48%)` |
| AI section accent | purple + blue | all-orange/amber |
| Footer shade | `gray-900` | `slate-900` |
| Border tint | neutral gray | `border-orange-100/200` throughout |
| Foreground hue | cool (blue-tinted) | warm (amber-tinted) |
| Button style | mix of solid + gradient | consistently gradient |
| Button shadow | minimal | `shadow-lg shadow-orange-500/30` |
| Hero bg | `via-white` (lighter) | `via-amber-50` (warmer) |
| Nav CTA | none | gradient button in header |
| Profile / dashboard | no | yes (full user profile page) |
| AI chat | embedded widget | full page chat panel |
