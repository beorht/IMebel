# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # production — node backend/server.js
npm run dev      # development — node --watch (auto-restarts on file change)
```

No test runner is configured. There is no lint script; the project uses plain ESM Node.js.

## Configuration

All runtime config lives in `.env`:

```
AI_PROVIDER=mock|huggingface|pollinations|local
HF_TOKEN=hf_...          # required when AI_PROVIDER=huggingface
SD_API_URL=http://...    # required when AI_PROVIDER=local
PORT=3000
```

Switching providers requires only changing `AI_PROVIDER` and restarting.

## Architecture

**Stack:** Node.js (ESM `"type": "module"`), Express 4, EJS templates, vanilla JS frontend.

**Request flow:**

```
POST /api/generate
  → routes/generate.js
  → controllers/generateController.js
      → utils/promptBuilder.js        # builds 3 angle prompts (front/side/top)
      → services/providerService.js   # routes to active provider
          → services/{mock,huggingface,pollinations,local}Service.js
      → responds with { success, mode: 'furniture', items: [{ views: [{angle, ...image}] }] }
```

**Key design decisions:**

- `generateController` always generates three views per item (front, side, top) in parallel via `Promise.all`. The `count` param controls how many items (1–4), not how many images total — each item always produces 3 views.
- `providerService.js` reads `AI_PROVIDER` once at module load time (not per-request), so provider selection is static per process lifetime.
- Prompt construction: `promptBuilder.js` reads `backend/public/json_data/furniture_prompt_templates.json` at module load. Templates use `{field}` placeholders; unresolved placeholders are stripped before generation.
- Generated images are saved to `backend/public/images/` and served at `/public/images/`.

**i18n:** Cookie-based locale switching (`locale` cookie). Supported: `en`, `ru`. Translation files in `backend/locales/`. The `t(key)` helper is available in all EJS templates via `res.locals`.

**Frontend:** Static files served from `frontend/`. EJS views in `frontend/views/`. The frontend calls `GET /api/templates` to load furniture type options, then `POST /api/generate` with a `furniture: { type, fields }` payload.

## Adding a Provider

1. Create `backend/services/yourService.js` — export `async function yourGenerate(prompt, negativePrompt, size, style, quality, count)` returning an array of image objects.
2. Add a `case` in `backend/services/providerService.js`.
3. Set `AI_PROVIDER=your` in `.env`.
