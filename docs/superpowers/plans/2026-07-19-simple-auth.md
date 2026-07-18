# Simple Auth for User Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let testers self-register/log in with username+password, gate `POST /api/generate` behind that login, and record every generation against the logged-in user's id.

**Architecture:** A local SQLite file (`better-sqlite3`) stores `users` and `generations`. Login/register set a signed cookie (`uid`, via the project's existing `cookie-parser`) holding the user id. A `requireAuth` middleware protects `/api/generate`; a non-blocking `attachUser` middleware makes the current user available to every EJS view for the header UI.

**Tech Stack:** `better-sqlite3` (sync SQLite driver), `bcrypt` (password hashing), existing Express 4 + `cookie-parser` + EJS stack.

## Global Constraints

- No test runner is configured in this project (per `CLAUDE.md`) — every task is verified with manual `curl`/browser steps, not an automated suite.
- ESM only (`"type": "module"` in `package.json`) — all new files use `import`/`export`, never `require`.
- Every module that resolves its own directory must use the existing defensive pattern already used across the codebase:
  ```js
  import path from 'path';
  import { fileURLToPath } from 'url';
  let __dirname_mod;
  try {
    const __filename_mod = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
    __dirname_mod = path.dirname(__filename_mod);
  } catch (err) {
    __dirname_mod = process.cwd();
  }
  ```
- Only `POST /api/generate` requires auth. `GET /`, `GET /api/templates`, `GET /login` stay public.
- SQLite file lives at `backend/data/imebel.sqlite`, must be gitignored, not committed.
- Out of scope (do not build): password reset, email verification, roles, rate limiting, viewing history in the UI, Netlify-persistent storage.

---

### Task 1: Add dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `better-sqlite3` and `bcrypt` importable from any backend module.

- [ ] **Step 1: Install packages**

Run: `npm install better-sqlite3 bcrypt`

Expected: `package.json` dependencies gain `"better-sqlite3": "^..."` and `"bcrypt": "^..."`, and `package-lock.json` updates.

- [ ] **Step 2: Verify both load under ESM**

Run:
```bash
node --input-type=module -e "import Database from 'better-sqlite3'; import bcrypt from 'bcrypt'; console.log(typeof Database, typeof bcrypt.hash);"
```
Expected output: `function function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add better-sqlite3 and bcrypt dependencies for user auth"
```

---

### Task 2: Database module (`backend/db.js`)

**Files:**
- Create: `backend/db.js`
- Modify: `.gitignore`

**Interfaces:**
- Produces (consumed by Tasks 3, 4, 5):
  - `createUser(username: string, passwordHash: string): { id: number, username: string, createdAt: string }`
  - `findUserByUsername(username: string): { id: number, username: string, passwordHash: string } | undefined`
  - `findUserById(id: number): { id: number, username: string } | undefined`
  - `insertGeneration(userId: number, prompt: string, imagesJson: string): void`

- [ ] **Step 1: Add gitignore entry**

Edit `.gitignore`, append:
```
backend/data/
```

- [ ] **Step 2: Write `backend/db.js`**

```js
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let __dirname_db;
try {
  const __filename_db = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_db = path.dirname(__filename_db);
} catch (err) {
  __dirname_db = process.cwd();
}

const dataDir = path.resolve(__dirname_db, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'imebel.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    images_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const insertUserStmt = db.prepare(
  'INSERT INTO users (username, password_hash) VALUES (?, ?)'
);
const findUserByUsernameStmt = db.prepare(
  'SELECT id, username, password_hash AS passwordHash FROM users WHERE username = ?'
);
const findUserByIdStmt = db.prepare(
  'SELECT id, username FROM users WHERE id = ?'
);
const insertGenerationStmt = db.prepare(
  'INSERT INTO generations (user_id, prompt, images_json) VALUES (?, ?, ?)'
);

export function createUser(username, passwordHash) {
  const info = insertUserStmt.run(username, passwordHash);
  return { id: info.lastInsertRowid, username };
}

export function findUserByUsername(username) {
  return findUserByUsernameStmt.get(username);
}

export function findUserById(id) {
  return findUserByIdStmt.get(id);
}

export function insertGeneration(userId, prompt, imagesJson) {
  insertGenerationStmt.run(userId, prompt, imagesJson);
}

export default db;
```

- [ ] **Step 3: Verify manually**

Run:
```bash
node --input-type=module -e "
import { createUser, findUserByUsername, findUserById } from './backend/db.js';
const u = createUser('smoketest_' + Date.now(), 'hash123');
console.log('created:', u);
console.log('byUsername:', findUserByUsername(u.username));
console.log('byId:', findUserById(u.id));
"
```
Expected: three log lines, all showing matching `id`/`username`, and `backend/data/imebel.sqlite` now exists on disk (`ls backend/data`).

- [ ] **Step 4: Commit**

```bash
git add backend/db.js .gitignore
git commit -m "Add SQLite-backed user/generation storage module"
```

---

### Task 3: Register/login/logout endpoints

**Files:**
- Create: `backend/controllers/authController.js`
- Create: `backend/routes/auth.js`
- Modify: `backend/server.js`
- Modify: `.env` (append `COOKIE_SECRET`)

**Interfaces:**
- Consumes: `createUser`, `findUserByUsername` from `backend/db.js` (Task 2).
- Produces (consumed by Task 4's `requireAuth`/`attachUser` and Task 6's frontend):
  - `POST /api/auth/register` — body `{ username, password }` → `201 { success: true, username }`, sets signed cookie `uid`.
  - `POST /api/auth/login` — body `{ username, password }` → `200 { success: true, username }`, sets signed cookie `uid`.
  - `POST /api/auth/logout` — `200 { success: true }`, clears cookie `uid`.
  - Cookie contract: `res.cookie('uid', String(userId), { signed: true, httpOnly: true, sameSite: 'lax' })` — later middleware reads it back as `req.signedCookies.uid` (a string; must be parsed with `Number(...)` before passing to `findUserById`).

- [ ] **Step 1: Append cookie secret to `.env`**

Append to `.env`:
```
# Signs the auth session cookie — change this before any real deployment
COOKIE_SECRET=dev-secret-change-me
```

- [ ] **Step 2: Write `backend/controllers/authController.js`**

```js
import bcrypt from 'bcrypt';
import { createUser, findUserByUsername } from '../db.js';

const SALT_ROUNDS = 10;

function setSessionCookie(res, userId) {
  res.cookie('uid', String(userId), {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
  });
}

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      const err = new Error('Username and password are required');
      err.status = 400;
      return next(err);
    }

    if (findUserByUsername(username)) {
      const err = new Error('Username already taken');
      err.status = 409;
      return next(err);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = createUser(username, passwordHash);

    setSessionCookie(res, user.id);
    res.status(201).json({ success: true, username: user.username });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      const err = new Error('Username and password are required');
      err.status = 400;
      return next(err);
    }

    const user = findUserByUsername(username);
    if (!user) {
      const err = new Error('Invalid username or password');
      err.status = 401;
      return next(err);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      const err = new Error('Invalid username or password');
      err.status = 401;
      return next(err);
    }

    setSessionCookie(res, user.id);
    res.json({ success: true, username: user.username });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('uid');
  res.json({ success: true });
}
```

- [ ] **Step 3: Write `backend/routes/auth.js`**

```js
import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;
```

- [ ] **Step 4: Wire into `backend/server.js`**

In `backend/server.js`, change the cookie-parser line and add the router import/mount. Current code (from `backend/server.js`):

```js
import cookieParser from 'cookie-parser';
...
app.use(express.json());
app.use(cookieParser());
```

Change to:

```js
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
...
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'));
```

And add, next to the other route mounts (`app.use('/download', downloadRouter);` etc.):

```js
app.use('/api/auth', authRouter);
```

- [ ] **Step 5: Verify manually with curl**

Run (server must be running via `npm start` in another terminal):
```bash
curl -i -c /tmp/imebel-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"tester1","password":"pass1234"}'
```
Expected: `HTTP/1.1 201 Created`, body `{"success":true,"username":"tester1"}`, and a `Set-Cookie: uid=...` header.

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"tester1","password":"pass1234"}'
```
Expected: `HTTP/1.1 409`.

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"tester1","password":"wrongpass"}'
```
Expected: `HTTP/1.1 401`.

- [ ] **Step 6: Commit**

```bash
git add backend/controllers/authController.js backend/routes/auth.js backend/server.js .env
git commit -m "Add register/login/logout endpoints with signed session cookie"
```

---

### Task 4: Auth middleware protecting `/api/generate`

**Files:**
- Create: `backend/middleware/requireAuth.js`
- Modify: `backend/server.js`

**Interfaces:**
- Consumes: `findUserById` from `backend/db.js` (Task 2); `req.signedCookies.uid` set by Task 3's login/register.
- Produces (consumed by Task 5 and Task 6's views):
  - `requireAuth(req, res, next)` — sets `req.user = { id: number, username: string }` or responds `401 { error: 'Unauthorized' }`.
  - `attachUser(req, res, next)` — always calls `next()`; sets `res.locals.user = { id, username }` if a valid session cookie is present, otherwise `res.locals.user = null`. Never blocks the request.

- [ ] **Step 1: Write `backend/middleware/requireAuth.js`**

```js
import { findUserById } from '../db.js';

function resolveUser(req) {
  const raw = req.signedCookies?.uid;
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) return null;
  return findUserById(id) || null;
}

export function requireAuth(req, res, next) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

export function attachUser(req, res, next) {
  res.locals.user = resolveUser(req);
  next();
}
```

- [ ] **Step 2: Wire into `backend/server.js`**

Current code:
```js
app.use('/download', downloadRouter);
app.use('/api/generate', generateRouter);
app.use('/api/templates', templatesRouter);
```

Change to (import `requireAuth` and `attachUser` from `./middleware/requireAuth.js`, apply `attachUser` globally so every view gets `res.locals.user`, and protect only `/api/generate`):

```js
import { requireAuth, attachUser } from './middleware/requireAuth.js';
...
app.use(attachUser); // add this near the other app.use(...) middleware, before routes are mounted
...
app.use('/download', downloadRouter);
app.use('/api/generate', requireAuth, generateRouter);
app.use('/api/templates', templatesRouter);
```

- [ ] **Step 3: Verify manually with curl**

Without a cookie:
```bash
curl -i -X POST http://localhost:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"furniture":{"type":"chair","fields":{"material":"wood"}}}'
```
Expected: `HTTP/1.1 401`, body `{"error":"Unauthorized"}`.

With the cookie saved in Task 3 Step 5:
```bash
curl -i -b /tmp/imebel-cookies.txt -X POST http://localhost:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"furniture":{"type":"chair","fields":{"material":"wood"}}}'
```
Expected: `HTTP/1.1 200`, body contains `"success":true`.

- [ ] **Step 4: Commit**

```bash
git add backend/middleware/requireAuth.js backend/server.js
git commit -m "Protect POST /api/generate behind session auth"
```

---

### Task 5: Record generations per user

**Files:**
- Modify: `backend/controllers/generateController.js`

**Interfaces:**
- Consumes: `insertGeneration(userId, prompt, imagesJson)` from `backend/db.js` (Task 2); `req.user.id` set by `requireAuth` (Task 4).

- [ ] **Step 1: Update `backend/controllers/generateController.js`**

Current file:
```js
import { generateImage } from '../services/providerService.js';

export async function createImage(req, res, next) {
  try {
    const { furniture, negativePrompt, size, style, quality, count } = req.body;

    if (!furniture || !furniture.type || !furniture.fields) {
      const err = new Error('Furniture data is required');
      err.status = 400;
      return next(err);
    }

    // Dynamic import to avoid module-level file reads in some serverless bundlers
    const { buildFurniturePrompt } = await import('../utils/promptBuilder.js');

    const actualCount = Math.min(Math.max(parseInt(count, 10) || 1, 1), 4);
    const prompt = buildFurniturePrompt(furniture);

    const images = await generateImage(
      prompt,
      (negativePrompt || '').trim(),
      size || '768x768',
      style || 'realistic',
      parseInt(quality, 10) || 80,
      actualCount
    );

    res.json({ success: true, mode: 'furniture', images });
  } catch (err) {
    next(err);
  }
}
```

Replace with:
```js
import { generateImage } from '../services/providerService.js';
import { insertGeneration } from '../db.js';

export async function createImage(req, res, next) {
  try {
    const { furniture, negativePrompt, size, style, quality, count } = req.body;

    if (!furniture || !furniture.type || !furniture.fields) {
      const err = new Error('Furniture data is required');
      err.status = 400;
      return next(err);
    }

    // Dynamic import to avoid module-level file reads in some serverless bundlers
    const { buildFurniturePrompt } = await import('../utils/promptBuilder.js');

    const actualCount = Math.min(Math.max(parseInt(count, 10) || 1, 1), 4);
    const prompt = buildFurniturePrompt(furniture);

    const images = await generateImage(
      prompt,
      (negativePrompt || '').trim(),
      size || '768x768',
      style || 'realistic',
      parseInt(quality, 10) || 80,
      actualCount
    );

    insertGeneration(req.user.id, prompt, JSON.stringify(images));

    res.json({ success: true, mode: 'furniture', images });
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 2: Verify manually**

Repeat the authenticated curl call from Task 4 Step 3, then inspect the database:
```bash
sqlite3 backend/data/imebel.sqlite "SELECT user_id, prompt FROM generations ORDER BY id DESC LIMIT 1;"
```
Expected: one row, `user_id` matching the `tester1` account's id (cross-check with `sqlite3 backend/data/imebel.sqlite "SELECT id FROM users WHERE username='tester1';"`).

- [ ] **Step 3: Commit**

```bash
git add backend/controllers/generateController.js
git commit -m "Record each generation against the authenticated user"
```

---

### Task 6: Login page and frontend wiring

**Files:**
- Create: `frontend/views/login.ejs`
- Modify: `backend/server.js` (add `GET /login` route)
- Modify: `frontend/views/partials/header.ejs`
- Modify: `frontend/js/main.js`

**Interfaces:**
- Consumes: `res.locals.user` (set by `attachUser`, Task 4) inside EJS views; `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` (Task 3); `res.status === 401` from `POST /api/generate` (Task 4).

- [ ] **Step 1: Add `GET /login` route in `backend/server.js`**

Current code:
```js
app.get('/', (req, res) => {
  res.render('index', {
    title: 'IMebel',
  });
});
```

Add immediately after it:
```js
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'IMebel — Login',
  });
});
```

- [ ] **Step 2: Write `frontend/views/login.ejs`**

```html
<!DOCTYPE html>
<html lang="<%= locale %>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <div class="container" style="max-width: 420px; margin: 80px auto;">
    <h1><%= t('nav_generate') %></h1>

    <form id="login-form" style="margin-bottom: 24px;">
      <h2>Login</h2>
      <input class="form-control form-input" type="text" id="login-username" placeholder="Username" required />
      <input class="form-control form-input" type="password" id="login-password" placeholder="Password" required />
      <button type="submit" class="btn-primary">Log in</button>
      <p id="login-error" style="color: #d33; display: none;"></p>
    </form>

    <form id="register-form">
      <h2>Register</h2>
      <input class="form-control form-input" type="text" id="register-username" placeholder="Username" required />
      <input class="form-control form-input" type="password" id="register-password" placeholder="Password" required />
      <button type="submit" class="btn-primary">Create account</button>
      <p id="register-error" style="color: #d33; display: none;"></p>
    </form>
  </div>

  <script>
    async function submitAuth(url, username, password, errorEl) {
      errorEl.style.display = 'none';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        errorEl.textContent = data.error || 'Something went wrong';
        errorEl.style.display = 'block';
        return;
      }
      window.location.href = '/';
    }

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      submitAuth(
        '/api/auth/login',
        document.getElementById('login-username').value.trim(),
        document.getElementById('login-password').value,
        document.getElementById('login-error')
      );
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      submitAuth(
        '/api/auth/register',
        document.getElementById('register-username').value.trim(),
        document.getElementById('register-password').value,
        document.getElementById('register-error')
      );
    });
  </script>
</body>
</html>
```

- [ ] **Step 3: Add login/logout control to `frontend/views/partials/header.ejs`**

Current `navbar-right` block:
```html
    <div class="navbar-right">
      <select class="lang-select" id="lang-select" title="<%= t('lang_label') %>">
        <option value="en" <%= locale === 'en' ? 'selected' : '' %>>EN</option>
        <option value="ru" <%= locale === 'ru' ? 'selected' : '' %>>RU</option>
        <option value="uz" <%= locale === 'uz' ? 'selected' : '' %>>UZ</option>
      </select>
      <a href="#form-section" class="btn-nav-cta"><%= t('btn_generate') %></a>
    </div>
```

Replace with:
```html
    <div class="navbar-right">
      <select class="lang-select" id="lang-select" title="<%= t('lang_label') %>">
        <option value="en" <%= locale === 'en' ? 'selected' : '' %>>EN</option>
        <option value="ru" <%= locale === 'ru' ? 'selected' : '' %>>RU</option>
        <option value="uz" <%= locale === 'uz' ? 'selected' : '' %>>UZ</option>
      </select>
      <% if (user) { %>
        <span class="nav-link"><%= user.username %></span>
        <button id="logout-btn" class="btn-outline" type="button">Logout</button>
      <% } else { %>
        <a href="/login" class="btn-outline">Login</a>
      <% } %>
      <a href="#form-section" class="btn-nav-cta"><%= t('btn_generate') %></a>
    </div>
```

- [ ] **Step 4: Add logout handler in `frontend/js/main.js`**

Add near the top, after the `langSelect` block (after line 61 in the current file):
```js
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  });
}
```

- [ ] **Step 5: Handle 401 from `/api/generate` in `frontend/js/main.js`**

Current code inside `generateImages()`:
```js
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) throw new Error('API error');

    const data = await res.json();
```

Replace with (adds an explicit 401 branch before the generic error path, so an unauthenticated tester sees a login prompt instead of the mock-image fallback):
```js
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 401) {
      if (loadingEl) { loadingEl.remove(); loadingEl = null; }
      outputArea.insertAdjacentHTML('beforeend', '<p style="color:#d33;">Please <a href="/login">sign in</a> to generate images.</p>');
      generateBtn.disabled = false;
      generateBtn.innerHTML = `${__('btn_generate')}`;
      return;
    }

    if (!res.ok) throw new Error('API error');

    const data = await res.json();
```

- [ ] **Step 6: Verify manually in browser**

1. Start the server: `npm start`.
2. Visit `http://localhost:3000/` while logged out (clear cookies first) — header shows "Login" link, no username.
3. Click Login → go to `/login` → register a new user (e.g. `browsertester`/`pass1234`) → redirected to `/`.
4. Header now shows the username and a Logout button.
5. Fill the furniture form and click Generate → images render normally (no 401 message).
6. Click Logout → redirected to `/login`; header on `/` now shows "Login" again.
7. On `/`, open browser dev tools console and run `fetch('/api/generate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({furniture:{type:'chair',fields:{material:'wood'}}})}).then(r=>r.status)` while logged out — Expected: `401`.

- [ ] **Step 7: Commit**

```bash
git add frontend/views/login.ejs backend/server.js frontend/views/partials/header.ejs frontend/js/main.js
git commit -m "Add login page and wire logout/401 handling into the frontend"
```

---

### Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Document the new auth flow**

Add a new `## Auth (testing feature)` section to `CLAUDE.md`, after the existing `## Architecture` section, containing:

```markdown
## Auth (testing feature)

Added for user testing — self-registration with username/password, gating only `POST /api/generate`:

- `backend/db.js` opens/creates `backend/data/imebel.sqlite` (gitignored, not persistent on Netlify's ephemeral filesystem — local/VM use only for now) and exposes `createUser`/`findUserByUsername`/`findUserById`/`insertGeneration`.
- `backend/routes/auth.js` + `backend/controllers/authController.js`: `POST /api/auth/{register,login,logout}`, hashing passwords with `bcrypt` and setting a signed `uid` cookie (`cookieParser(process.env.COOKIE_SECRET)`).
- `backend/middleware/requireAuth.js` exports `requireAuth` (blocks `/api/generate` with `401` if no valid session) and `attachUser` (non-blocking, sets `res.locals.user` for every view so the header can show login/logout state).
- `generateController.createImage` records every successful generation into the `generations` table against `req.user.id`.
- `GET /`, `GET /api/templates`, and `GET /login` remain public.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Document the auth flow in CLAUDE.md"
```
