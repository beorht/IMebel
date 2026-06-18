# Frontend Redesign — Design Spec
**Date:** 2026-06-18  
**Approach:** Pure custom CSS rewrite (Подход 1)  
**Reference:** `docs/design-spec.md` — Variant A

---

## Goal

Refactor the current dark-theme app layout (sidebar + output panel) into a light-theme landing page with embedded generation form. All functionality stays the same; only the structure, theme, and visual language change.

---

## Design System (Variant A tokens)

Applied via CSS custom properties on `:root`:

```css
--background: #ffffff
--foreground: hsl(222.2, 84%, 4.9%)   /* cool near-black */
--primary: hsl(28, 80%, 52%)           /* ≈ #e07428, warm orange */
--primary-foreground: #ffffff
--secondary: hsl(210, 40%, 96.1%)      /* cool light gray */
--muted-foreground: hsl(215.4, 16.3%, 46.9%)
--accent: hsl(210, 40%, 96.1%)
--border: hsl(214.3, 31.8%, 91.4%)     /* ≈ #e5e7eb */
--radius: 0.5rem                        /* 8px */
--destructive: hsl(0, 84.2%, 60.2%)    /* #dc2626 */
```

Brand gradient: `linear-gradient(to right, #ea580c, #d97706)` (orange-600 → amber-600)  
Gradient hover: darken each stop by one Tailwind step.

Font stack: `Inter, ui-sans-serif, system-ui, sans-serif` (Inter already loaded).

---

## Files Changed

| File | Change |
|---|---|
| `frontend/css/style.css` | Full rewrite with new tokens and section styles |
| `frontend/views/index.ejs` | New page structure: 9 sections instead of app-layout |
| `frontend/views/partials/header.ejs` | Navbar: white bg, orange logo, new CTA button |
| `frontend/views/partials/sidebar.ejs` | Repurposed as generation form section (not a sidebar) |
| `frontend/views/partials/output.ejs` | Output section below form, no longer fullscreen |
| `frontend/js/main.js` | Minor DOM selector updates (new IDs/classes if needed) |

---

## Page Structure (top → bottom)

### 1. Navbar
```
sticky top-0 z-50, white bg, border-bottom, shadow-sm, height 64px
  .container (max-width: 1280px, mx-auto, px-24px)
    [left]  logo (orange gradient icon + "IMebel" bold) + nav links (Генератор, Галерея, Модели)
    [right] lang-switch button + avatar icon
```
- Logo gradient changes from indigo/purple → orange (`#ea580c` → `#d97706`)
- Nav links: `color: var(--muted-foreground)`, hover `color: var(--foreground)`
- Active link: `color: var(--primary)`

### 2. Hero Section
```
background: linear-gradient(135deg, #fff7ed, #ffffff, #fff7ed)  (orange-50 → white → orange-50)
padding: 80px 0 / 128px 0 (md)
  .container
    grid: 2 columns, gap 48px, align items center
      [left col]
        H1: 2.5rem–3.75rem, font-weight 700, line-height 1.2
          span.text-primary: highlighted word in orange
        p.lead: 1.125rem, muted color, leading 1.75, margin-bottom 32px
        .cta-buttons: flex row gap 16px
          btn-primary (orange gradient, px-32 py-16, rounded-xl, shadow)
          btn-outline (white bg, border-2 border-orange-200, hover bg-orange-50)
      [right col]
        .hero-image-wrap: aspect-square, rounded-2xl, overflow hidden, shadow-2xl
          img: object-cover
        .hero-float-card: absolute, bottom -24px, left -24px
          white bg, p-16, rounded-xl, shadow-lg, border-2 border-orange-100
          flex items-center gap-8
          "✓ AI-рендер за 15 сек"
```

### 3. Stats Section
```
background: white, padding 64px 0
  .container
    grid: 3 columns, gap 24px, text-center
      each stat:
        .stat-number: 3rem, font-weight 700, color var(--primary)
        .stat-label: 1rem, muted color
  Values: "500+" Проектов, "3" Ракурса, "4" AI-провайдера
```

### 4. How It Works (Features)
```
background: white, padding 64px 0
  .container
    .section-header: text-center, mb 48px
      H2: 2rem–2.5rem, font-weight 700
      p.section-sub: 1.125rem, muted
    grid: 3 columns, gap 32px
      each card:
        bg-white, rounded-xl, border 1px border-color
        hover: border-primary, shadow-lg
        transition: all 250ms
        p-32px
        .card-icon-wrap: 48x48, rounded-full or rounded-xl, bg-orange-100
          svg: color primary
        H3: 1.25rem, font-weight 700, mb 12px
        p: muted, leading 1.75
  Cards:
    1. Выбери тип мебели — иконка диван/кресло
    2. Настрой стиль и материал — иконка палитра/кисть
    3. Получи 3D-рендер — иконка изображение/звезда
```

### 5. AI Section
```
background: white, padding 64px 0 (wrapping the inner gradient card)
  .container
    .ai-card: bg linear-gradient(to right, #faf5ff, #eff6ff), rounded-2xl, p-32px
      .section-header: text-center, mb 32px
      grid: 2 columns, gap 24px
        card 1: bg-white, rounded-xl, p-24px
          .icon-wrap: 48x48, bg-purple-100, rounded-full
            svg: text-purple-600
          H3, p.muted
          "Генерирует 3 ракурса одновременно (front, side, top)"
        card 2: bg-white, rounded-xl, p-24px
          .icon-wrap: 48x48, bg-blue-100, rounded-full
            svg: text-blue-600
          H3, p.muted
          "Строит промпт автоматически из параметров мебели"
```

### 6. Generation Form (main interactive block)
```
background: linear-gradient(to bottom, white, #fff7ed)
padding: 80px 0
  .container
    .section-header: text-center, mb 48px
      H2, p.section-sub
    .form-card: max-width 672px, mx-auto
      bg-white, rounded-2xl, border 1px border-color, p-32px
      shadow: 0 4px 16px rgba(0,0,0,0.08)
      [all current form fields, restyled:]
        labels: 0.875rem, font-weight 600, color foreground, mb 6px
        inputs/selects/textareas:
          px 16px, py 12px, border 1px border-color, rounded-lg
          focus: border-color primary, ring 2px primary/20
        sliders: track orange, thumb orange
        .form-row: 2 cols, gap 12px
      [generate button]
        full width, gradient orange-amber, py-16px, rounded-xl
        font-weight 700, shadow-lg shadow-orange-500/20
        hover: darken gradient stops
        disabled: opacity 0.6
```

### 7. Output / Results
```
Hidden by default. Shown below form after generation.
background: white, padding 48px 0
  .container
    H2: "Результаты", text-center, mb 32px
    .output-grid: grid 3 cols (front / side / top per item), gap 20px
      .image-card: bg-white, rounded-xl, border 1px border-color, overflow hidden
        hover: border-primary, shadow-lg, translateY(-4px)
        .image-preview: aspect-square, img object-cover
        .angle-badge: absolute top-6 left-6, bg black/50, text white, 0.6rem, rounded-4px
        .card-body: p-16px
          .card-title: 0.85rem, font-weight 600
          .btn-download: full width, bg-secondary, rounded-lg, hover bg-primary text-white
```

### 8. Examples Gallery
```
background: linear-gradient(to bottom, white, #fff7ed), padding 64px 0
  .container
    .section-header: text-center, mb 48px
    grid: auto-fill, minmax(200px, 1fr), gap 16px
      each: rounded-xl, overflow hidden, shadow-sm
        img: object-cover, w-full, aspect-square
        hover: shadow-lg, scale(1.02)
  Source: real PNGs from /public/images/ (hf-*.png files)
```

### 9. Footer
```
background: #111827 (gray-900), color #d1d5db (gray-300), margin-top auto
  .container, padding 48px 0
    grid: 4 columns, gap 32px
      col 1: logo + description text (slate)
      col 2: Навигация — Генератор / Галерея / Модели
      col 3: Провайдеры — Mock / HuggingFace / Pollinations / Local SD
      col 4: Технологии — Node.js / Express / EJS / AI
    border-top: 1px solid #1f2937 (gray-800), pt 32px, mt 32px
      copyright: text-center, 0.875rem
```

---

## CSS Architecture

Replace all dark-theme variables with light-theme tokens. Key groups:

```
:root { /* all design tokens */ }
/* Reset + base */
/* Navbar */
/* Hero */
/* Stats */
/* Features / Cards */
/* AI Section */
/* Form */
/* Output grid + image cards */
/* Gallery */
/* Footer */
/* Animations: card-in, spin, ai-pulse, lb-fade */
/* Lightbox (kept as-is) */
/* Responsive: 1024px, 768px, 480px */
```

Animations to keep: `card-in` (entrance), `spin` (spinner), `ai-pulse` (loading ring).  
New: smooth section reveals (optional — keep simple, not required).

---

## JS Changes

`frontend/js/main.js` — minimal changes:
- Update any selectors referencing `.sidebar`, `.output-area` to new IDs: `#generate-form`, `#output-section`
- Show/hide `#output-section` on generation complete (currently shows placeholder in output-area)
- No logic changes — form data collection, API call, image render all stay the same

---

## Constraints

- No new npm dependencies
- EJS server rendering stays (no client-side routing)
- i18n (`t()` helper) stays; all text keys reused
- `main.js` logic (API call, DOM render) stays; only selectors may change
- Generated images still served from `/public/images/`
- Lightbox behaviour unchanged
