# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # production — node backend/server.js (listens only when run directly, see note below)
npm run dev      # development — node --watch (auto-restarts on file change)
```

No test runner is configured. There is no lint script; the project uses plain ESM Node.js.

## Configuration

All runtime config lives in `.env`:

```
AI_PROVIDER=mock|huggingface|pollinations|local
HF_TOKEN=hf_...          # required when AI_PROVIDER=huggingface; comma-separate multiple tokens for rotation on rate limits
SD_API_URL=http://...    # required when AI_PROVIDER=local
PORT=3000
```

Switching providers requires only changing `AI_PROVIDER` and restarting.

## Architecture

**Stack:** Node.js (ESM `"type": "module"`), Express 4, EJS templates, vanilla JS frontend.

**Dual deployment target:** `backend/server.js` builds and exports the Express `app` but only calls `app.listen()` when the file is run directly (`node backend/server.js`), not when imported. This lets the same `app` be reused two ways:
- Locally / on a VM: `npm start` runs `backend/server.js` directly, which binds to `PORT`.
- On Netlify: `functions/server.js` imports `app` and wraps it with `serverless-http` as a Netlify Function (see `netlify.toml`, which redirects all `/*` traffic to `/.netlify/functions/server`). No port is bound in this path.

Because of this, every module that needs its own directory path resolves `__dirname` defensively (`typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url)`, falling back to `process.cwd()`) — this pattern repeats across `server.js`, `promptBuilder.js`, `templatesController.js`, `i18n.js`, `huggingfaceService.js`, and `downloadController.js` because Netlify's bundler doesn't guarantee normal ESM `__dirname` semantics.

**Request flow:**

```
POST /api/generate
  → routes/generate.js
  → controllers/generateController.js       # validates furniture.type/fields, clamps count to 1-4
      → utils/promptBuilder.js (dynamically imported, not at module load — see below)
      → services/providerService.js         # routes to active provider by AI_PROVIDER
          → services/{mock,huggingface,pollinations,local}Service.js
      → responds with { success, mode: 'furniture', images: [{ id, url, prompt, size, style, quality, date }] }
```

- `generateController.createImage` builds a single prompt via `buildFurniturePrompt` and calls the provider once with `count` (1–4), producing that many independent images — there is no multi-angle (front/side/top) generation in the current flow, despite `promptBuilder.js` still exporting an unused `buildFurnitureViewPrompts` helper for that purpose.
- `providerService.js` reads `AI_PROVIDER` once at module load time (not per-request), so provider selection is static per process lifetime.
- `promptBuilder.js` is dynamically `import()`-ed inside `createImage` (not imported at the top of the controller) specifically to avoid eagerly reading `furniture_prompt_templates.json` at module load in serverless bundlers. It searches several candidate paths for `furniture_prompt_templates.json` and falls back to a small built-in `defaultTemplates` object (chair/table/sofa) if the file is missing or fails to parse — `templatesController.js` (`GET /api/templates`) does the same candidate-path search/fallback independently.
- Templates use `{field}` placeholders; unresolved placeholders are stripped before generation.
- `mockService` returns inline base64 SVG data URLs (no filesystem writes). `huggingfaceService` and `localService` write generated images to `backend/public/images/` and return `/public/images/<file>` URLs; `downloadController` serves `GET /download/:filename` from that same directory, falling back to `placeholder.svg` if the requested file doesn't exist.

**i18n:** Cookie-based locale switching (`locale` cookie, `backend/middleware/i18n.js`). Supported: `en`, `ru`, `uz`. Translation files in `backend/locales/`. The `t(key)` helper is available in all EJS templates via `res.locals`.

**Frontend:** Static files served from `frontend/`. EJS views in `frontend/views/`. The frontend calls `GET /api/templates` to load furniture type options, then `POST /api/generate` with a `furniture: { type, fields }` payload.

## Auth (testing feature)

Added for user testing — self-registration with username/password, gating only `POST /api/generate`:

- `backend/db.js` opens/creates `backend/data/imebel.sqlite` (gitignored, not persistent on Netlify's ephemeral filesystem — local/VM use only for now) and exposes `createUser`/`findUserByUsername`/`findUserById`/`insertGeneration`.
- `backend/routes/auth.js` + `backend/controllers/authController.js`: `POST /api/auth/{register,login,logout}`, hashing passwords with `bcrypt` and setting a signed `uid` cookie (`cookieParser(process.env.COOKIE_SECRET)`).
- `backend/middleware/requireAuth.js` exports `requireAuth` (blocks `/api/generate` with `401` if no valid session) and `attachUser` (non-blocking, sets `res.locals.user` for every view so the header can show login/logout state).
- `generateController.createImage` records every successful generation into the `generations` table against `req.user.id`.
- `GET /`, `GET /api/templates`, and `GET /login` remain public.

## Adding a Provider

1. Create `backend/services/yourService.js` — export `async function yourGenerate(prompt, negativePrompt, size, style, quality, count)` returning an array of image objects (`{ id, url, prompt, size, style, quality, date }`).
2. Add a `case` in `backend/services/providerService.js`.
3. Set `AI_PROVIDER=your` in `.env`.

## Other directories

- `backup/` is a snapshot of an earlier version of this app (own `package.json`, docs) — not part of the active codebase.
- `docs/` holds provider setup guides and design/spec docs, including `docs/superpowers/` (plans/specs from prior sessions).
