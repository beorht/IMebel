# Вариант 3 — Pollinations AI + Node.js

## Zero Setup

URL:

``` txt
https://image.pollinations.ai/prompt/cat astronaut
```

## Backend Proxy

``` js
app.post("/generate", async(req,res)=>{

 const {prompt}=req.body;

 const url =
 `https://image.pollinations.ai/prompt/${
 encodeURIComponent(prompt)
 }`;

 res.json({image:url});

});
```

## Frontend Render

``` js
img.src = data.image;
```

## Download

``` js
const a =
document.createElement("a");

a.href=imageUrl;
a.download="image.png";

a.click();
```

## Плюсы

-   быстро
-   бесплатно
-   без GPU

## Минусы

-   меньше контроля
