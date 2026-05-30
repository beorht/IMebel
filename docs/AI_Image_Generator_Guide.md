# AI Image Generator Guide (Node.js)

Полное руководство по реализации генерации изображений.

## Варианты реализации

1. [Вариант 1 — Local Stable Diffusion](./Variant1_Local_SD.md)
2. [Вариант 2 — HuggingFace API](./Variant2_HuggingFace.md)
3. [Вариант 3 — Pollinations AI](./Variant3_Pollinations.md)

---

## Общая архитектура

``` txt
Frontend
   ↓
Node.js Express Backend
   ↓
AI Provider
```

Структура:

``` txt
project/
├── frontend/
│   ├── views/
│   ├── css/
│   └── js/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── public/images/
└── .env
```

## Unified Provider Pattern

`.env`

``` env
AI_PROVIDER=local
```

providerService.js

``` js
switch(process.env.AI_PROVIDER){

 case "local":
   return localGenerate(prompt);

 case "huggingface":
   return hfGenerate(prompt);

 case "pollinations":
   return pollGenerate(prompt);

}
```

## Security

-   использовать dotenv
-   не хранить токены в Git
-   validation input
-   rate limiter

## Production

-   nginx reverse proxy
-   pm2
-   logs
-   queue system

## Сравнение

| Feature | Local | HF | Pollinations |
| :--- | :--- | :--- | :--- |
| GPU | Да | Нет | Нет |
| Цена | Free | Free tier | Free |
| Контроль | High | Medium | Low |
| Setup | Hard | Medium | Easy |
