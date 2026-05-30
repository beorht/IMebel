# IMebel

> Modern fullstack AI Image Generator for furniture design — dark UI, provider-agnostic backend.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-green)
![Express](https://img.shields.io/badge/express-4.21-000)

## Overview

**IMebel** is a production-ready web application for generating AI furniture images. Built with Node.js + Express on the backend and vanilla HTML/CSS/JS on the frontend. The architecture supports multiple AI providers via a unified provider pattern.

### Current AI Provider

- **HuggingFace** — `stabilityai/stable-diffusion-xl-base-1.0` via `@huggingface/inference` SDK

### Available Providers (configurable)

| Provider | `.env` value | Status |
|----------|-------------|--------|
| Mock (built-in) | `mock` | ✅ |
| HuggingFace | `huggingface` | ✅ |
| Pollinations | `pollinations` | ⚠️ rate-limited |
| Local SD | `local` | 🛠 requires GPU |

## Features

- Dark modern UI with responsive layout
- Prompt + Negative Prompt input
- Size, Style, Quality, Count controls
- Mock generation (works without any API key)
- Real generation via HuggingFace Inference API
- Image download endpoint
- Unified Provider Pattern — switch AI provider in `.env`

## Project Structure

```
.
├── backend/
│   ├── server.js                 # Express entry point
│   ├── routes/                   # Express routes
│   │   ├── generate.js           # POST /api/generate
│   │   └── download.js           # GET /download/:filename
│   ├── controllers/              # Request handlers
│   │   ├── generateController.js
│   │   └── downloadController.js
│   ├── services/                 # AI provider implementations
│   │   ├── providerService.js    # Unified switch
│   │   ├── mockService.js        # SVG placeholder generator
│   │   ├── huggingfaceService.js # HuggingFace Inference SDK
│   │   ├── pollinationsService.js
│   │   └── localService.js       # AUTOMATIC1111
│   ├── middleware/
│   │   └── errorHandler.js
│   └── public/images/            # Generated images output
├── frontend/
│   ├── views/                    # EJS templates
│   │   ├── index.ejs
│   │   └── partials/
│   ├── css/style.css             # Dark theme styles
│   └── js/main.js                # Client-side logic
└── .env                          # Configuration
```

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Configuration

Edit `.env`:

```env
# Choose provider: mock | huggingface | pollinations | local
AI_PROVIDER=huggingface

# HuggingFace — fine-grained token with inference.serverless.write
# https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained
HF_TOKEN=hf_your_token_here

# Local SD (AUTOMATIC1111)
SD_API_URL=http://127.0.0.1:7860

PORT=3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Frontend page |
| `POST` | `/api/generate` | Generate image(s) |
| `GET` | `/download/:filename` | Download image |

### POST /api/generate

```json
{
  "prompt": "cyberpunk city at night",
  "negativePrompt": "blurry, low quality",
  "size": "768x768",
  "style": "cyberpunk",
  "quality": 80,
  "count": 1
}
```

## Metrics

| Metric | Value |
|--------|-------|
| ⚡ API Latency (mock) | ~1.5s (simulated) |
| 🔌 API Latency (HF) | depends on provider (5-30s) |
| 📦 Bundle size (frontend) | ~10KB CSS + ~5KB JS |
| 🖼 Image formats | PNG (HF/local), JPEG (Pollinations) |
| 🔄 Provider switch | Zero downtime — change `.env` + restart |

## Adding a New Provider

1. Create `backend/services/yourService.js`
2. Implement `async function yourGenerate(prompt, negativePrompt, size, style, quality, count)`
3. Add the case in `backend/services/providerService.js`
4. Add config to `.env`

## License

MIT
