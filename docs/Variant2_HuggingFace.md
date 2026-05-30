# Вариант 2 — HuggingFace API + Node.js

## Регистрация

Создать аккаунт.

Получить token.

`.env`

``` env
HF_TOKEN=your_token
```

## Backend

``` bash
npm install axios dotenv
```

Service:

``` js
import axios from "axios";

export async function generateHF(prompt){

 const response = await axios.post(
 "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
 {
   inputs:prompt
 },
 {
   headers:{
     Authorization:
     `Bearer ${process.env.HF_TOKEN}`
   },
   responseType:"arraybuffer"
 });

 return response.data;

}
```

## Save Binary

``` js
fs.writeFileSync(
 "./public/images/image.png",
 response
);
```

## Error Handling

``` js
try{

}catch(error){

 console.log(error);

}
```

## Ограничения

-   Queue
-   Rate limits
-   Timeouts
