# Simple Auth for User Testing — Design

## Purpose

Add the simplest possible account system so different testers can be distinguished from one another during user testing, and each image generation can be traced back to the user who created it. This is explicitly a testing-phase feature, not a production-hardened auth system.

## Scope

- Self-registration with username + password.
- Login/logout via a signed cookie holding the user id.
- Only `POST /api/generate` requires authentication. The homepage (`GET /`) and `GET /api/templates` stay public.
- Every successful generation is recorded against the authenticated user's id.
- Storage: a local SQLite file (`better-sqlite3`). This works for local/VM usage (`npm start`) where the process persists on disk. It is **not** persistent on Netlify Functions (ephemeral filesystem) — that gap is explicitly out of scope for this iteration; the user plans to address production storage separately when moving to Netlify.

Out of scope: password reset, email verification, roles/permissions, rate limiting, viewing generation history in the UI, session store other than a signed cookie, protecting `/api/templates` or the homepage.

## Data Model

New file: `backend/data/imebel.sqlite` (created on first run, gitignored).

```sql
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
```

## Components

- **`backend/db.js`** — opens/creates the SQLite file (defensive `__dirname` resolution, same pattern as other modules per CLAUDE.md), runs the `CREATE TABLE IF NOT EXISTS` statements on load, and exports prepared-statement helpers: `createUser(username, passwordHash)`, `findUserByUsername(username)`, `findUserById(id)`, `insertGeneration(userId, prompt, imagesJson)`.
- **`backend/controllers/authController.js`**
  - `register(req, res, next)` — validates `username`/`password` are non-empty strings, hashes the password with `bcrypt` (10 rounds), inserts the user, sets the session cookie, responds `{ success: true, username }`. Duplicate username → `409`.
  - `login(req, res, next)` — looks up user by username, compares password with `bcrypt.compare`, sets the session cookie on success, responds `{ success: true, username }`. Bad credentials → `401` (generic message, no hint which field was wrong).
  - `logout(req, res)` — clears the session cookie, responds `{ success: true }`.
- **`backend/routes/auth.js`** — `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, wired into `server.js` as `app.use('/api/auth', authRouter)`.
- **`backend/middleware/requireAuth.js`** — reads `req.signedCookies.uid`; if missing or the user id doesn't resolve via `findUserById`, responds `401 { error: 'Unauthorized' }`; otherwise sets `req.user = { id, username }` and calls `next()`.
- **`backend/server.js` changes:**
  - `cookieParser()` currently has no secret, so `signedCookies` is unusable as-is — change to `cookieParser(process.env.COOKIE_SECRET || 'dev-secret')`. Document `COOKIE_SECRET` in `.env` alongside the existing config vars.
  - Mount auth routes: `app.use('/api/auth', authRouter)`.
  - Protect generation: `app.use('/api/generate', requireAuth, generateRouter)`.
- **`generateController.createImage`** — after `generateImage(...)` succeeds and before `res.json(...)`, calls `insertGeneration(req.user.id, prompt, JSON.stringify(images))`.
- **Frontend:**
  - New `frontend/views/login.ejs` — one page with two plain-JS forms (login, register) posting via `fetch` to `/api/auth/login` / `/api/auth/register`; on success, redirect to `/`.
  - `frontend/js/main.js` — if a call to `/api/generate` returns `401`, show an inline message ("please sign in") linking to `/login`; no other changes needed since the browser sends cookies automatically.
  - `frontend/views/index.ejs` — add a small "Logout" control that POSTs to `/api/auth/logout` then reloads/redirects to `/login`.
  - `server.js` adds `GET /login` rendering the new view.

## Error Handling

| Case | Response |
|---|---|
| Register with taken username | `409 { error: 'Username already taken' }` |
| Register/login with missing fields | `400 { error: 'Username and password are required' }` |
| Login with wrong username or password | `401 { error: 'Invalid username or password' }` |
| `/api/generate` without valid session cookie | `401 { error: 'Unauthorized' }` |

## Testing Plan

No automated test runner exists in this project (per CLAUDE.md), so this is verified manually end-to-end in a browser:

1. Register a new user → redirected to `/`.
2. Log out → redirected to `/login`.
3. Attempt `POST /api/generate` while logged out → `401`.
4. Log back in → generate an image → confirm a row appears in `generations` for that `user_id` (inspect via `sqlite3 backend/data/imebel.sqlite "select * from generations;"`).
5. Register a second user with the same username → `409`.
6. Log in with a wrong password → `401`.

## New Dependencies

- `better-sqlite3` — synchronous SQLite driver, no separate server process.
- `bcrypt` — password hashing.

## Deployment Note

`backend/data/` must be added to `.gitignore` (the sqlite file itself, not the directory structure if empty). When this moves to Netlify, the SQLite file will not persist across cold starts — that will need a hosted DB (e.g., Turso/libSQL, Postgres) swapped in behind the same `db.js` interface. Not addressed now per user decision.
