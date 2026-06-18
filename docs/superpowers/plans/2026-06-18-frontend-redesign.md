# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark app-layout (sidebar+output) with a light-theme landing page (navbar + hero + stats + features + AI section + form + results + gallery + footer) matching Variant A of `docs/design-spec.md`.

**Architecture:** Pure custom CSS rewrite — zero new dependencies. All EJS templates restructured; `style.css` fully replaced. `main.js` logic unchanged, only DOM selectors updated where IDs change. CSS built section-by-section across tasks, each task appending to `style.css`.

**Tech Stack:** Node.js + Express + EJS + vanilla CSS + vanilla JS (Inter font, already loaded)

---

## File Map

| File | Action |
|---|---|
| `frontend/css/style.css` | Full rewrite (built up task by task) |
| `frontend/views/index.ejs` | New structure: 9 sections |
| `frontend/views/partials/header.ejs` | Navbar: white bg, orange logo |
| `frontend/views/partials/sidebar.ejs` | Becomes `#form-section` (form card) |
| `frontend/views/partials/output.ejs` | Becomes `#results-section` (hidden until generation) |
| `frontend/js/main.js` | 4 line changes: new IDs + scroll-to-results |

---

## Task 1: CSS Tokens, Base, Buttons & Container

**Files:**
- Overwrite: `frontend/css/style.css`

- [ ] **Step 1: Replace style.css with new base**

```css
/* ─── Reset ─── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* ─── Tokens ─── */
:root {
  --background:         #ffffff;
  --foreground:         #0a0f1e;
  --primary:            #e07428;
  --primary-dark:       #c2410c;
  --primary-foreground: #ffffff;
  --muted:              #f1f5f9;
  --muted-foreground:   #64748b;
  --border:             #e5e7eb;
  --border-orange:      #fed7aa;
  --radius:             0.5rem;
  --destructive:        #dc2626;

  --grad:               linear-gradient(to right, #ea580c, #d97706);
  --grad-hover:         linear-gradient(to right, #c2410c, #b45309);
  --grad-hero:          linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%);
  --grad-cta:           linear-gradient(to bottom, #ffffff, #fff7ed);

  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:   0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
  --shadow-xl:   0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
  --shadow-2xl:  0 25px 50px rgba(0,0,0,0.2);
  --shadow-orange: 0 8px 24px rgba(234, 88, 12, 0.25);

  --transition: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Base ─── */
html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }
button { cursor: pointer; font-family: inherit; }
img { display: block; max-width: 100%; }

/* ─── Container ─── */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ─── Buttons ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 32px;
  background: var(--grad);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-orange);
  transition: all var(--transition);
}
.btn-primary:hover {
  background: var(--grad-hover);
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(234, 88, 12, 0.35);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 32px;
  background: #fff;
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: 2px solid var(--border-orange);
  cursor: pointer;
  transition: all var(--transition);
}
.btn-outline:hover { background: #fff7ed; }

/* ─── Section header ─── */
.section-header { text-align: center; margin-bottom: 48px; }
.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--foreground);
}
@media (min-width: 768px) { .section-title { font-size: 2.5rem; } }
.section-sub {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.75;
}

/* ─── Spinner ─── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

/* ─── Lightbox ─── */
@keyframes lb-fade { from { opacity: 0; } to { opacity: 1; } }
.lightbox {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: lb-fade 0.2s ease;
}
.lightbox img {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: var(--shadow-2xl);
}
.lightbox-close {
  position: absolute; top: 16px; right: 20px;
  width: 40px; height: 40px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  color: #fff; font-size: 1.4rem; line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.lightbox-close:hover { background: rgba(255,255,255,0.15); }
```

- [ ] **Step 2: Start dev server and verify no crash**

```bash
npm run dev
```
Expected: `🚀 IMebel running at http://localhost:3000` — page may look unstyled, that's fine.

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "feat: replace CSS with light-theme design tokens and base styles"
```

---

## Task 2: Navbar

**Files:**
- Modify: `frontend/views/partials/header.ejs`
- Append: `frontend/css/style.css`

- [ ] **Step 1: Replace header.ejs**

```html
<header class="navbar">
  <div class="navbar-inner">
    <div class="navbar-left">
      <a href="/" class="logo">
        <svg class="logo-icon" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="url(#logo-g)"/>
          <path d="M9 25L13 16L18 20L23 11L27 25H9Z" fill="white" opacity="0.95"/>
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="36" y2="36">
              <stop stop-color="#ea580c"/>
              <stop offset="1" stop-color="#d97706"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="logo-text">IMebel</span>
      </a>
      <nav class="nav-links">
        <a href="#form-section" class="nav-link"><%= t('nav_generate') %></a>
        <a href="#gallery-section" class="nav-link"><%= t('nav_gallery') %></a>
        <a href="#features-section" class="nav-link"><%= t('nav_models') %></a>
      </nav>
    </div>
    <div class="navbar-right">
      <button class="lang-switch" data-locale="<%= locale === 'ru' ? 'en' : 'ru' %>" title="<%= t('lang_label') %>">
        <%= t('lang_switch') %>
      </button>
      <a href="#form-section" class="btn-nav-cta"><%= t('btn_generate') %></a>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Append navbar CSS to style.css**

```css
/* ─── Navbar ─── */
.navbar {
  position: sticky; top: 0; z-index: 50;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.navbar-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; height: 64px;
  align-items: center; justify-content: space-between;
}
.navbar-left  { display: flex; align-items: center; gap: 40px; }
.navbar-right { display: flex; align-items: center; gap: 12px; }

.logo { display: flex; align-items: center; gap: 10px; }
.logo-text { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

.nav-links { display: flex; align-items: center; gap: 24px; }
.nav-link {
  font-size: 0.875rem; font-weight: 500;
  color: var(--muted-foreground);
  transition: color var(--transition);
}
.nav-link:hover { color: var(--foreground); }

.lang-switch {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.75rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all var(--transition);
  letter-spacing: 0.04em;
}
.lang-switch:hover { border-color: var(--primary); color: var(--primary); }

.btn-nav-cta {
  padding: 8px 20px;
  background: var(--grad);
  color: #fff;
  font-size: 0.875rem; font-weight: 600;
  border-radius: var(--radius);
  border: none; cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 2px 8px rgba(234,88,12,0.2);
}
.btn-nav-cta:hover { background: var(--grad-hover); }
```

- [ ] **Step 3: Reload browser, verify navbar looks correct** — white bg, orange logo, nav links, CTA button.

- [ ] **Step 4: Commit**

```bash
git add frontend/views/partials/header.ejs frontend/css/style.css
git commit -m "feat: redesign navbar with light theme and orange branding"
```

---

## Task 3: index.ejs Full Structure

**Files:**
- Overwrite: `frontend/views/index.ejs`

- [ ] **Step 1: Replace index.ejs with new page structure**

```html
<!DOCTYPE html>
<html lang="<%= locale %>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>

  <%- include('partials/header') %>

  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <h1 class="hero-title">
            AI-генератор<br>
            <span class="hero-title-accent">мебельных</span><br>
            рендеров
          </h1>
          <p class="hero-subtitle">
            Опишите вашу мебель — получите профессиональные рендеры
            с трёх ракурсов за считанные секунды. Без дизайнера.
          </p>
          <div class="cta-buttons">
            <a href="#form-section" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Попробовать бесплатно
            </a>
            <a href="#features-section" class="btn-outline">Как это работает</a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-num">3</span>
              <span class="hero-stat-label">ракурса</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">15с</span>
              <span class="hero-stat-label">генерация</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">4</span>
              <span class="hero-stat-label">AI-модели</span>
            </div>
          </div>
        </div>
        <div class="hero-image-col">
          <div class="hero-image-wrap">
            <img src="/public/images/hf-1780085763806-0.png" alt="AI furniture render" />
          </div>
          <div class="hero-float-card">
            <div class="hero-float-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div class="hero-float-label">AI-рендер готов</div>
              <div class="hero-float-sub">front · side · top</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="stats-section">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">500+</div>
          <div class="stat-label">Проектов сгенерировано</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">3</div>
          <div class="stat-label">Ракурса на каждый рендер</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">4</div>
          <div class="stat-label">AI-провайдера</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features-section" id="features-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-sub">Три простых шага — от идеи до готовых рендеров</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3 class="feature-title">Выберите тип мебели</h3>
          <p class="feature-desc">Диван, шкаф, стол, кресло или кухонная мебель — выберите категорию и заполните параметры.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </div>
          <h3 class="feature-title">Настройте стиль и материал</h3>
          <p class="feature-desc">Укажите цвет, материал, дизайн-стиль и дополнительные детали. AI строит промпт автоматически.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h3 class="feature-title">Получите 3D-рендеры</h3>
          <p class="feature-desc">AI генерирует три ракурса одновременно: спереди, сбоку и сверху. Скачайте результат в один клик.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- AI Section -->
  <section class="ai-section">
    <div class="container">
      <div class="ai-card">
        <div class="section-header">
          <h2 class="section-title">Мощь искусственного интеллекта</h2>
          <p class="section-sub">Стабильная диффузия генерирует фотореалистичные рендеры по вашему описанию</p>
        </div>
        <div class="ai-grid">
          <div class="ai-feature-card">
            <div class="ai-icon-wrap ai-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 class="ai-feature-title">Три ракурса одновременно</h3>
            <p class="ai-feature-desc">Генерация front, side и top view происходит параллельно — вы получаете полный набор рендеров за один запрос.</p>
          </div>
          <div class="ai-feature-card">
            <div class="ai-icon-wrap ai-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <h3 class="ai-feature-title">Автоматический промпт</h3>
            <p class="ai-feature-desc">Заполните поля формы — система сама строит детальный промпт из ваших параметров мебели. Никаких подсказок не нужно.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Generation Form -->
  <section class="form-section" id="form-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Сгенерировать рендер</h2>
        <p class="section-sub">Заполните параметры и нажмите кнопку — результат появится ниже</p>
      </div>
      <%- include('partials/sidebar') %>
    </div>
  </section>

  <!-- Results -->
  <%- include('partials/output') %>

  <!-- Gallery -->
  <section class="gallery-section" id="gallery-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Примеры рендеров</h2>
        <p class="section-sub">Реальные результаты, сгенерированные нашей системой</p>
      </div>
      <div class="gallery-grid">
        <div class="gallery-item"><img src="/public/images/hf-1780082759356-0.png" alt="Furniture render" loading="lazy"/></div>
        <div class="gallery-item"><img src="/public/images/hf-1780083694116-0.png" alt="Furniture render" loading="lazy"/></div>
        <div class="gallery-item"><img src="/public/images/hf-1780085184536-0.png" alt="Furniture render" loading="lazy"/></div>
        <div class="gallery-item"><img src="/public/images/hf-1780085756772-0.png" alt="Furniture render" loading="lazy"/></div>
        <div class="gallery-item"><img src="/public/images/hf-1780085757640-0.png" alt="Furniture render" loading="lazy"/></div>
        <div class="gallery-item"><img src="/public/images/hf-1780085763806-0.png" alt="Furniture render" loading="lazy"/></div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="logo" style="margin-bottom:16px;">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="url(#footer-logo-g)"/>
              <path d="M9 25L13 16L18 20L23 11L27 25H9Z" fill="white" opacity="0.95"/>
              <defs>
                <linearGradient id="footer-logo-g" x1="0" y1="0" x2="36" y2="36">
                  <stop stop-color="#ea580c"/>
                  <stop offset="1" stop-color="#d97706"/>
                </linearGradient>
              </defs>
            </svg>
            <span style="font-size:1.1rem;font-weight:700;color:#fff;">IMebel</span>
          </div>
          <p class="footer-desc">AI-платформа для генерации профессиональных рендеров мебели.</p>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Навигация</div>
          <ul class="footer-links">
            <li><a href="#form-section"><%= t('nav_generate') %></a></li>
            <li><a href="#gallery-section"><%= t('nav_gallery') %></a></li>
            <li><a href="#features-section"><%= t('nav_models') %></a></li>
          </ul>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Провайдеры</div>
          <ul class="footer-links">
            <li><a href="#">Mock (встроенный)</a></li>
            <li><a href="#">HuggingFace</a></li>
            <li><a href="#">Pollinations</a></li>
            <li><a href="#">Local SD</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Технологии</div>
          <ul class="footer-links">
            <li><a href="#">Node.js + Express</a></li>
            <li><a href="#">EJS Templates</a></li>
            <li><a href="#">Stable Diffusion</a></li>
            <li><a href="#">HuggingFace SDK</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 IMebel. Все права защищены.</span>
      </div>
    </div>
  </footer>

  <script>window.__LOCALE__ = '<%= locale %>';</script>
  <script>window.__T__ = <%- JSON.stringify(translations) %>;</script>
  <script type="module" src="/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Reload browser** — page renders all sections (unstyled beyond base). No JS errors in console.

- [ ] **Step 3: Commit**

```bash
git add frontend/views/index.ejs
git commit -m "feat: restructure index.ejs as 9-section landing page"
```

---

## Task 4: Hero & Stats CSS

**Files:**
- Append: `frontend/css/style.css`

- [ ] **Step 1: Append hero + stats CSS to style.css**

```css
/* ─── Hero ─── */
.hero {
  background: var(--grad-hero);
  padding: 80px 0;
}
.hero-grid {
  display: grid;
  gap: 48px;
  align-items: center;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--foreground);
  margin-bottom: 20px;
}
.hero-title-accent { color: var(--primary); }
.hero-subtitle {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  line-height: 1.75;
  margin-bottom: 32px;
}
.cta-buttons { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}
.hero-stat { text-align: center; }
.hero-stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}
.hero-stat-label {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
.hero-stat-divider {
  width: 1px; height: 32px;
  background: var(--border);
}

.hero-image-col { position: relative; }
.hero-image-wrap {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}
.hero-image-wrap img { width: 100%; height: 100%; object-fit: cover; }

.hero-float-card {
  position: absolute;
  bottom: -20px; left: -20px;
  background: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 2px solid #ffedd5;
  display: flex; align-items: center; gap: 12px;
}
.hero-float-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hero-float-label { font-size: 0.875rem; font-weight: 600; color: var(--foreground); }
.hero-float-sub { font-size: 0.75rem; color: var(--muted-foreground); }

/* ─── Stats ─── */
.stats-section { background: #fff; padding: 64px 0; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;
}
.stat-card { padding: 24px; }
.stat-num {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 8px;
}
.stat-label { font-size: 1rem; color: var(--muted-foreground); }
```

- [ ] **Step 2: Reload — verify hero gradient, two-column layout on wide screen, float card, stats row.**

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "feat: add hero and stats section CSS"
```

---

## Task 5: Features & AI Section CSS

**Files:**
- Append: `frontend/css/style.css`

- [ ] **Step 1: Append features + AI CSS to style.css**

```css
/* ─── Features ─── */
.features-section { background: #fff; padding: 64px 0; }
.features-grid {
  display: grid;
  gap: 24px;
}
.feature-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  transition: all var(--transition);
}
.feature-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
.feature-icon-wrap {
  width: 48px; height: 48px;
  background: #fff7ed;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--primary);
  margin-bottom: 20px;
}
.feature-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 10px; }
.feature-desc { font-size: 0.9375rem; color: var(--muted-foreground); line-height: 1.7; }

/* ─── AI Section ─── */
.ai-section { background: #fff; padding: 64px 0; }
.ai-card {
  background: linear-gradient(135deg, #faf5ff, #eff6ff);
  border-radius: 20px;
  padding: 48px 40px;
}
.ai-grid { display: grid; gap: 20px; }
.ai-feature-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
}
.ai-icon-wrap {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.ai-icon-purple { background: #f3e8ff; color: #9333ea; }
.ai-icon-blue   { background: #eff6ff; color: #2563eb; }
.ai-feature-title { font-size: 1.0625rem; font-weight: 700; margin-bottom: 10px; }
.ai-feature-desc  { font-size: 0.9375rem; color: var(--muted-foreground); line-height: 1.7; }
```

- [ ] **Step 2: Reload — verify feature cards with hover border, purple-to-blue AI gradient card.**

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "feat: add features and AI section CSS"
```

---

## Task 6: Form Section (sidebar.ejs rewrite)

**Files:**
- Overwrite: `frontend/views/partials/sidebar.ejs`
- Append: `frontend/css/style.css`

- [ ] **Step 1: Rewrite sidebar.ejs as centered form card**

```html
<div class="form-card" id="generate-form">
  <div class="form-group">
    <label for="furniture-type"><%= t('furniture_type') %></label>
    <select id="furniture-type" class="form-control form-select">
      <option value="sofa"><%= t('furniture_sofa') %></option>
      <option value="wardrobe"><%= t('furniture_wardrobe') %></option>
      <option value="table"><%= t('furniture_table') %></option>
      <option value="chair"><%= t('furniture_chair') %></option>
      <option value="kitchen_furniture"><%= t('furniture_kitchen') %></option>
    </select>
  </div>

  <div class="form-group">
    <label for="furniture-design-style"><%= t('furniture_design_style') %></label>
    <input id="furniture-design-style" class="form-control form-input" type="text" placeholder="<%= t('furniture_placeholder_style') %>">
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="furniture-material"><%= t('furniture_material') %></label>
      <input id="furniture-material" class="form-control form-input" type="text" placeholder="<%= t('furniture_placeholder_material') %>">
    </div>
    <div class="form-group">
      <label for="furniture-color"><%= t('furniture_color') %></label>
      <input id="furniture-color" class="form-control form-input" type="text" placeholder="<%= t('furniture_placeholder_color') %>">
    </div>
  </div>

  <div class="form-group" id="furniture-type-specific">
    <label for="furniture-extra-field"><%= t('furniture_field_sofa') %></label>
    <input id="furniture-extra-field" class="form-control form-input" type="text" placeholder="<%= t('furniture_placeholder_sofa') %>">
  </div>

  <div class="form-group">
    <label for="furniture-extra-details">
      <%= t('furniture_extra_details') %>
      <span class="label-hint"><%= t('furniture_optional') %></span>
    </label>
    <textarea id="furniture-extra-details" class="form-control form-textarea" rows="2" placeholder="<%= t('furniture_extra_details_placeholder') %>"></textarea>
  </div>

  <div class="form-group">
    <label for="negative-prompt"><%= t('negative_prompt') %></label>
    <textarea id="negative-prompt" class="form-control form-textarea" rows="2" placeholder="<%= t('negative_prompt_placeholder') %>"></textarea>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="size"><%= t('size') %></label>
      <select id="size" class="form-control form-select">
        <option value="512x512"><%= t('size_512') %></option>
        <option value="768x768" selected><%= t('size_768') %></option>
        <option value="1024x1024"><%= t('size_1024') %></option>
      </select>
    </div>
    <div class="form-group">
      <label for="style"><%= t('style') %></label>
      <select id="style" class="form-control form-select">
        <option value="realistic"><%= t('style_realistic') %></option>
        <option value="anime"><%= t('style_anime') %></option>
        <option value="cyberpunk"><%= t('style_cyberpunk') %></option>
        <option value="digital-art"><%= t('style_digital_art') %></option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="quality">
      <%= t('quality') %>
      <span id="quality-value" class="slider-value">80</span>
    </label>
    <input type="range" id="quality" class="slider" min="1" max="100" value="80" />
    <div class="slider-labels">
      <span><%= t('quality_fast') %></span>
      <span><%= t('quality_best') %></span>
    </div>
  </div>

  <div class="form-group">
    <label for="count">
      <%= t('images') %>
      <span id="count-value" class="slider-value">1</span>
    </label>
    <input type="range" id="count" class="slider" min="1" max="4" value="1" />
    <div class="slider-labels"><span>1</span><span>4</span></div>
  </div>

  <button id="generate-btn" class="btn-generate">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 0 1 0 2h-7v7a1 1 0 0 1-2 0v-7H4a1 1 0 0 1 0-2h7V4a1 1 0 0 1 1-1z"/>
    </svg>
    <%= t('btn_generate') %>
  </button>
</div>
```

- [ ] **Step 2: Append form CSS to style.css**

```css
/* ─── Form Section ─── */
.form-section { background: var(--grad-cta); padding: 80px 0; }

.form-card {
  max-width: 680px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.label-hint { font-weight: 400; font-size: 0.75rem; color: var(--muted-foreground); }

.form-control {
  width: 100%;
  font-family: inherit;
  font-size: 0.9375rem;
  color: var(--foreground);
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.form-control::placeholder { color: var(--muted-foreground); }
.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(224, 116, 40, 0.15);
}

.form-input  { padding: 10px 14px; }
.form-select { padding: 10px 14px; appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
.form-textarea { padding: 10px 14px; resize: vertical; line-height: 1.6; min-height: 64px; }

.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }

/* Sliders */
.slider-value { color: var(--primary); font-size: 0.875rem; font-weight: 700; }
.slider {
  width: 100%; height: 6px;
  -webkit-appearance: none; appearance: none;
  background: var(--muted); border-radius: 4px;
  outline: none; cursor: pointer;
  border: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--primary); cursor: pointer;
  transition: transform var(--transition);
  box-shadow: 0 0 0 3px rgba(224,116,40,0.15);
}
.slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.slider::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--primary); border: none; cursor: pointer;
}
.slider-labels {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; color: var(--muted-foreground);
}

/* Generate button */
.btn-generate {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 16px;
  background: var(--grad);
  color: #fff;
  font-size: 1rem; font-weight: 700;
  border: none; border-radius: 12px; cursor: pointer;
  box-shadow: var(--shadow-orange);
  transition: all var(--transition);
  margin-top: 4px;
}
.btn-generate:hover {
  background: var(--grad-hover);
  box-shadow: 0 12px 32px rgba(234,88,12,0.35);
  transform: translateY(-1px);
}
.btn-generate:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
```

- [ ] **Step 3: Reload — verify centered form card, orange focus ring on inputs, orange slider thumb, gradient generate button.**

- [ ] **Step 4: Commit**

```bash
git add frontend/views/partials/sidebar.ejs frontend/css/style.css
git commit -m "feat: redesign form as centered card with light theme"
```

---

## Task 7: Results Section (output.ejs rewrite + JS update)

**Files:**
- Overwrite: `frontend/views/partials/output.ejs`
- Modify: `frontend/js/main.js` (4 targeted lines)
- Append: `frontend/css/style.css`

- [ ] **Step 1: Rewrite output.ejs**

```html
<section class="results-section" id="results-section" style="display:none;">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Результаты</h2>
    </div>
    <main class="output-area" id="output-area">
      <div class="output-placeholder" id="placeholder">
        <div class="placeholder-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <p class="placeholder-text"><%= t('placeholder_title') %></p>
        <p class="placeholder-sub"><%= t('placeholder_sub') %></p>
      </div>
    </main>
  </div>
</section>
```

- [ ] **Step 2: Update main.js — 4 targeted changes**

Find and replace these lines in `frontend/js/main.js`:

**Line 1** — top of file, add `resultsSection` reference after `outputArea`:
```js
// BEFORE:
const outputArea = document.getElementById('output-area');

// AFTER:
const outputArea = document.getElementById('output-area');
const resultsSection = document.getElementById('results-section');
```

**Line 2** — in `showLoading()`, show results section before appending loading element:
```js
// BEFORE (top of showLoading):
function showLoading() {
  placeholder.style.display = 'none';

// AFTER:
function showLoading() {
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  placeholder.style.display = 'none';
```

**Line 3** — `btn-download` in renderImageCard: update class to include new download button styles. Find the `card.innerHTML` template string in `renderImageCard` and update the card-body section:
```js
// BEFORE (in card.innerHTML, the card-body section):
    <div class="image-card-body">
      <div class="image-card-title" title="${view.prompt}">${view.prompt}</div>
      <div class="image-card-meta">
        <span>${view.size || ''}</span>
        <span>${view.date || ''}</span>
      </div>
    </div>

// AFTER:
    <div class="image-card-body">
      <div class="image-card-title" title="${view.prompt}">${view.prompt}</div>
      <div class="image-card-meta">
        <span>${view.size || ''}</span>
        <span>${view.date || ''}</span>
      </div>
      ${imgSrc ? `<button class="btn-download" data-filename="${view.id}.png" data-imgurl="${imgSrc}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Скачать
      </button>` : ''}
    </div>
```

- [ ] **Step 3: Append results + image card CSS to style.css**

```css
/* ─── Results Section ─── */
.results-section { background: #fff; padding: 64px 0; }

.output-area { width: 100%; }

.output-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 64px 24px;
  color: var(--muted-foreground); text-align: center;
}
.placeholder-icon {
  width: 80px; height: 80px;
  background: var(--muted); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); margin-bottom: 8px;
}
.placeholder-text { font-size: 1.0625rem; font-weight: 500; color: var(--foreground); }
.placeholder-sub  { font-size: 0.875rem; }

/* Image grid */
.output-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

/* Image card entrance */
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.image-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all var(--transition);
  animation: card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.image-card:nth-child(2) { animation-delay: 0.06s; }
.image-card:nth-child(3) { animation-delay: 0.12s; }
.image-card:nth-child(4) { animation-delay: 0.18s; }
.image-card:nth-child(5) { animation-delay: 0.24s; }
.image-card:nth-child(6) { animation-delay: 0.30s; }

.image-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}

.image-card-preview {
  position: relative;
  width: 100%; aspect-ratio: 1;
  overflow: hidden;
  background: var(--muted);
  display: flex; align-items: center; justify-content: center;
}
.image-card-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-clickable { cursor: pointer; }
.img-clickable:hover img { filter: brightness(1.05); }

.img-angle {
  position: absolute; top: 8px; left: 8px;
  font-size: 0.625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #fff; background: rgba(0,0,0,0.5);
  padding: 3px 8px; border-radius: 4px;
  pointer-events: none;
}

.image-card-body {
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.image-card-title {
  font-size: 0.8125rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.image-card-meta {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; color: var(--muted-foreground);
}
.btn-download {
  width: 100%; padding: 8px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: var(--muted); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--muted-foreground);
  font-size: 0.8125rem; font-weight: 500; cursor: pointer;
  transition: all var(--transition); font-family: inherit;
}
.btn-download:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

/* Loading AI */
@keyframes ai-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(224, 116, 40, 0.4); }
  50%  { box-shadow: 0 0 0 16px rgba(224, 116, 40, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 116, 40, 0); }
}
@keyframes ai-ring {
  to { transform: rotate(360deg); }
}
.loading-ai {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 20px; padding: 80px 40px;
}
.loading-ai-ring {
  position: relative; width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
}
.loading-ai-ring::before {
  content: ''; position: absolute; inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--primary);
  border-right-color: var(--primary);
  animation: ai-ring 0.9s linear infinite;
}
.loading-ai-icon {
  width: 58px; height: 58px; border-radius: 50%;
  background: var(--grad);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 800; color: #fff;
  animation: ai-pulse 2s ease-in-out infinite;
}
.loading-ai-text {
  font-size: 0.875rem; color: var(--muted-foreground); font-weight: 500;
}
```

- [ ] **Step 4: Reload, click "Сгенерировать" (dev server must be running). Verify results section scrolls into view and shows loading ring in orange.**

- [ ] **Step 5: Commit**

```bash
git add frontend/views/partials/output.ejs frontend/js/main.js frontend/css/style.css
git commit -m "feat: redesign results section and update JS for scroll-to-results"
```

---

## Task 8: Gallery, Footer & Responsive CSS

**Files:**
- Append: `frontend/css/style.css`

- [ ] **Step 1: Append gallery + footer CSS to style.css**

```css
/* ─── Gallery ─── */
.gallery-section { background: var(--grad-cta); padding: 64px 0; }
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.gallery-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  aspect-ratio: 1;
  background: var(--muted);
}
.gallery-item:hover {
  box-shadow: var(--shadow-lg);
  transform: scale(1.02);
}
.gallery-item img { width: 100%; height: 100%; object-fit: cover; }

/* ─── Footer ─── */
.footer { background: #111827; color: #d1d5db; }
.footer .container { padding-top: 48px; padding-bottom: 48px; }

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 0;
}
.footer-desc { font-size: 0.875rem; line-height: 1.7; color: #9ca3af; }
.footer-heading { font-weight: 600; color: #fff; margin-bottom: 16px; font-size: 0.9375rem; }
.footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-links a { font-size: 0.875rem; color: #9ca3af; transition: color var(--transition); }
.footer-links a:hover { color: #fff; }
.footer-bottom {
  border-top: 1px solid #1f2937;
  margin-top: 32px; padding-top: 28px;
  text-align: center; font-size: 0.875rem; color: #6b7280;
}

/* ─── Responsive ─── */
@media (min-width: 768px) {
  .hero { padding: 128px 0; }
  .hero-grid { grid-template-columns: 1fr 1fr; }
  .hero-title { font-size: 3.75rem; }
  .features-grid { grid-template-columns: repeat(3, 1fr); }
  .ai-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 0; }
  .output-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
  .btn-nav-cta { display: none; }
  .hero-float-card { display: none; }
  .form-card { padding: 24px 20px; }
  .ai-card { padding: 32px 20px; }
}

@media (max-width: 480px) {
  .container { padding: 0 16px; }
  .cta-buttons { flex-direction: column; }
  .btn-primary, .btn-outline { width: 100%; justify-content: center; }
  .output-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; }
  .footer-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-stats { gap: 16px; }
  .stat-num { font-size: 2rem; }
}
```

- [ ] **Step 2: Full page review at 1280px, 768px, 480px widths.** Check:
  - Hero two columns collapse to single on mobile
  - Gallery grid adapts
  - Footer 4-col → 2-col → 1-col
  - Form rows collapse to single column on 480px
  - Results grid: 3 → 2 → 1 columns

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "feat: add gallery, footer, and responsive breakpoints"
```

---

## Task 9: Final Polish & Smoke Test

**Files:**
- No new files; fix any visual regressions found

- [ ] **Step 1: Run dev server and walk through full user flow**

```bash
npm run dev
```

1. Open `http://localhost:3000`
2. Navbar — logo, links, CTA button visible
3. Hero — gradient background, two columns, float card (desktop)
4. Stats — 3 numbers in orange
5. Features — 3 cards, hover shows orange border
6. AI section — purple-blue gradient card
7. Form — centered card, all fields work, slider thumb orange
8. Click "Сгенерировать" with a field filled — results section scrolls into view, orange loading ring shows
9. Gallery — 6 images in grid
10. Footer — dark, 4 columns

- [ ] **Step 2: Fix any visual issues found** (edit the relevant CSS rule in style.css)

- [ ] **Step 3: Final commit**

```bash
git add -u
git commit -m "feat: complete frontend redesign — light theme, landing page structure"
```

---

## Quick Reference — ID/Class Contracts

The following IDs in `main.js` must exist in the EJS templates exactly as listed:

| ID | Template | Purpose |
|---|---|---|
| `#output-area` | `output.ejs` | Container for grid + loading |
| `#placeholder` | `output.ejs` | Hidden on generation |
| `#results-section` | `output.ejs` | Section shown on generate |
| `#generate-btn` | `sidebar.ejs` | Trigger button |
| `#generate-form` | `sidebar.ejs` | Form card wrapper |
| `#quality`, `#quality-value` | `sidebar.ejs` | Quality slider |
| `#count`, `#count-value` | `sidebar.ejs` | Count slider |
| `#furniture-type` | `sidebar.ejs` | Type select |
| `#furniture-type-specific` | `sidebar.ejs` | Dynamic field wrapper |
| `#furniture-extra-field` | `sidebar.ejs` | Dynamic field input |
| `#furniture-design-style` | `sidebar.ejs` | Style input |
| `#furniture-material` | `sidebar.ejs` | Material input |
| `#furniture-color` | `sidebar.ejs` | Color input |
| `#furniture-extra-details` | `sidebar.ejs` | Details textarea |
| `#negative-prompt` | `sidebar.ejs` | Negative prompt textarea |
| `#size`, `#style` | `sidebar.ejs` | Size/style selects |
| `.lang-switch` | `header.ejs` | Language toggle |
| `.btn-download` | rendered by JS | Download trigger (event delegation on `#output-area`) |
