# IMebel — Quick Reference

## Запуск

```bash
npm install    # один раз
npm start      # http://localhost:3000
```

## .env

```env
AI_PROVIDER=mock | huggingface | pollinations | local
HF_TOKEN=hf_fine_grained_token
PORT=3000
```

## Структура

```
backend/
  server.js              — Express, роуты, статика
  routes/generate.js     — POST /api/generate
  routes/download.js     — GET /download/:filename
  controllers/           — обработчики запросов
  services/              — провайдеры (mock, hf, pollinations, local)
  middleware/            — errorHandler
  public/images/         — сгенерированные изображения
frontend/
  views/                 — EJS шаблоны
  css/style.css          — тёмная тема
  js/main.js             — логика клиента
```

## API

| POST /api/generate | |
|---|---|
| Body | `{ prompt, negativePrompt, size, style, quality, count }` |
| Response | `{ success: true, images: [{ id, url, prompt, size, date }] }` |

| GET /download/:filename | скачивание файла из backend/public/images/ |

## Переключение провайдера

1. Поменять `AI_PROVIDER` в `.env`
2. Перезапустить сервер

## Быстрые ссылки

- HuggingFace token: https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained
- Документация: `/docs/AI_Image_Generator_Guide.md`
