# Pollinations AI — полная документация API

## Обзор

Pollinations AI — бесплатный API для генерации изображений, текста, аудио и видео с использованием современных AI-моделей. Поддерживает 25+ моделей (OpenAI, Claude, Gemini, Flux, Veo и др.).

**Базовые URL:**
- `https://gen.pollinations.ai` — новый рекомендуемый endpoint
- `https://image.pollinations.ai` — legacy endpoint (всё ещё работает)
- `https://text.pollinations.ai` — текстовая генерация

**Лицензия:** MIT

---

## Генерация изображений

### Эндпоинт

```
GET https://image.pollinations.ai/prompt/{prompt}
```

### Параметры (query string)

| Параметр | Тип | Описание | По умолчанию |
|---|---|---|---|
| `prompt` | string | Описание изображения (обязательный) | — |
| `model` | string | AI-модель: `flux`, `turbo`, `kontext` | `flux` |
| `width` | integer | Ширина в пикселях | 1024 |
| `height` | integer | Высота в пикселях | 1024 |
| `seed` | integer | Seed для воспроизводимости | random |
| `nologo` | boolean | Убрать водяной знак | false |
| `key` | string | API-ключ | — |

### Примеры запросов

**Простая генерация:**
```
GET https://image.pollinations.ai/prompt/a%20beautiful%20sunset
```

**С параметрами:**
```
GET https://image.pollinations.ai/prompt/cyberpunk%20city?width=1920&height=1080&seed=42&model=flux
```

**С API-ключом:**
```
GET https://image.pollinations.ai/prompt/a%20cat?key=YOUR_KEY
```

### Пример на Python

```python
import requests
from urllib.parse import quote

def generate_image(prompt, api_key=None, width=1024, height=1024, model="flux", seed=None):
    encoded_prompt = quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
    
    params = {
        "width": width,
        "height": height,
        "model": model,
    }
    if api_key:
        params["key"] = api_key
    if seed is not None:
        params["seed"] = seed
    
    response = requests.get(url, params=params, timeout=90)
    
    if response.status_code == 200:
        return response.content
    else:
        raise Exception(f"API error: {response.status_code}")

# Использование
image_data = generate_image("a cat playing piano", width=1920, height=1080)
with open("image.jpg", "wb") as f:
    f.write(image_data)
```

### Доступные модели

```
GET https://image.pollinations.ai/models
```

Возвращает JSON-список доступных моделей, например:
```json
["flux", "turbo", "stable-diffusion"]
```

---

## Генерация изображений (новый API)

### Эндпоинт

```
GET https://gen.pollinations.ai/image/{prompt}
```

### Пример

```bash
curl 'https://gen.pollinations.ai/image/a%20beautiful%20sunset' -o image.jpg
```

С API-ключом:
```bash
curl 'https://gen.pollinations.ai/image/a%20cat?key=YOUR_KEY'
```

### Image-to-Image (модель kontext)

```
GET https://gen.pollinations.ai/image/{prompt}?image={image_url}&model=kontext
```

Параметры:
- `image` — URL входного изображения
- `prompt` — описание трансформации
- `model` — обязателен `kontext`

---

## Генерация текста

### Простой запрос

```
GET https://text.pollinations.ai/{prompt}
```

### С параметрами

```
GET https://text.pollinations.ai/{prompt}?model=openai&temperature=0.7&seed=42
```

### OpenAI-совместимый endpoint (POST)

```
POST https://text.pollinations.ai/openai
```

```json
{
  "model": "openai",
  "messages": [
    {"role": "system", "content": "You are a friendly teacher."},
    {"role": "user", "content": "Explain gravity in simple terms."}
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "stream": false
}
```

---

## Аудио (Text-to-Speech)

```
GET https://text.pollinations.ai/{prompt}?model=openai-audio&voice=nova
```

### Доступные голоса

- `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

---

## Vision & Multimodal

Анализ изображений через OpenAI-совместимый POST-запрос:

```json
{
  "model": "openai",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "What's in this image?"},
      {"type": "image_url", "image_url": {"url": "https://example.com/photo.jpg"}}
    ]
  }]
}
```

**Модели:** `openai`, `openai-large`, `claude-hybridspace`

---

## API-ключи

### Типы ключей

| Тип | Префикс | Назначение | Rate Limits |
|---|---|---|---|
| Secret (серверный) | `sk_` | Server-side only | Без лимитов |
| Publishable (клиентский) | `pk_` | Browser, демо, прототипы | 1 pollen/hour per IP+key |

### Получение ключей

- Регистрация: https://enter.pollinations.ai
- Аутентификация: https://auth.pollinations.ai

### Передача ключа

```
GET https://image.pollinations.ai/prompt/{prompt}?key=sk_...
```

> **Важно:** Никогда не публикуйте `sk_` ключи в клиентском коде, Git-репозиториях или публичных URL. Используйте переменные окружения.

### Ограничение scope ключа

При создании ключа можно ограничить доступ только определёнными моделями (например, только Flux).

---

## Rate Limits (ограничения частоты)

| Тир | Лимит | Модели | Доступ |
|---|---|---|---|
| Anonymous | 1 запрос / 15 сек | Базовые | Без регистрации |
| Seed | 1 запрос / 5 сек | Стандартные | Бесплатная регистрация |
| Flower | 1 запрос / 3 сек | Продвинутые | Платный |
| Nectar | Без лимитов | Все | Enterprise |

### Рекомендации по работе с rate limits

- Используйте exponential backoff при получении ошибки 429
- Кешируйте результаты для повторных запросов
- Регистрируйтесь для повышения лимитов

---

## Pollen (кредиты)

- $1 ≈ 1 Pollen
- Можно заработать бесплатные кредиты
- Light-использование часто бесплатное
- Pay-As-You-Go модель

---

## Real-time Feeds (стримы)

### Лента изображений (SSE)

```
GET https://image.pollinations.ai/feed
```

```python
import sseclient
import requests
import json

response = requests.get(
    "https://image.pollinations.ai/feed",
    stream=True,
    headers={"Accept": "text/event-stream"}
)

client = sseclient.SSEClient(response)
for event in client.events():
    data = json.loads(event.data)
    print(f"New image: {data['prompt']}")
    print(f"URL: {data['imageURL']}")
```

---

## React-интеграция

```bash
npm install @pollinations/react
```

### Хуки

```jsx
import { usePollinationsImage, usePollinationsText, usePollinationsChat } from '@pollinations/react';

// Изображение
const imageUrl = usePollinationsImage('sunset over mountains', {
  width: 1024,
  height: 1024,
  model: 'flux',
  seed: 42
});

// Текст
const text = usePollinationsText('Write a haiku about AI', {
  model: 'openai',
  seed: 42
});
```

---

## Лучшие практики

1. **Кодируйте промпт:** Используйте `urllib.parse.quote()` (Python) или `encodeURIComponent()` (JS) вместо ручной замены пробелов
2. **Используйте seed:** Передавайте как query-параметр `?seed=42` для воспроизводимости
3. **Указывайте размер:** `?width=1920&height=1080` вместо значений по умолчанию
4. **Кешируйте результаты:** Сохраняйте ответы локально для повторных запросов
5. **Обрабатывайте ошибки:** Реализуйте retry с exponential backoff
6. **Проверяйте Content-Type:** Убедитесь, что ответ — изображение, а не JSON с ошибкой
7. **Не передавайте seed текстом в промпт** — используйте параметр `?seed=`

---

## Ссылки

| Ресурс | URL |
|---|---|
| Документация | https://gen.pollinations.ai/docs |
| GitHub | https://github.com/pollinations/pollinations |
| API-ключи | https://enter.pollinations.ai |
| Аутентификация | https://auth.pollinations.ai |
| React Playground | https://react-hooks.pollinations.ai |
| Community (X) | @pollinations_ai |

---

## Применение в проекте Architect

Текущий код использует:
- **Старый endpoint:** `image.pollinations.ai/p/{prompt}` (legacy, рекомендуется `gen.pollinations.ai/image/{prompt}`)
- **Наивное кодирование:** `prompt.replace(' ', '%20')` вместо `urllib.parse.quote()`
- **Seed как текст промпта:** `seed 123456` вместо параметра `?seed=123456`
- **Без параметров:** не используются `width`, `height`, `model`, `nologo`
- **Timeout 90 секунд** — достаточный для慢な моделей
- **`time.sleep(5)`** между запросами — вместо обработки 429 с backoff
