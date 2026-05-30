# Вариант 1 — Local Stable Diffusion + Node.js

## Требования

### Минимум

-   Windows/Linux
-   Python 3.10+
-   Git
-   Node.js 20+
-   RAM 16 GB

### Рекомендуется

-   NVIDIA GPU
-   8–12GB VRAM

## Установка

### Python

``` bash
python --version
```

### Git

``` bash
git --version
```

### AUTOMATIC1111

``` bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
```

Запуск:

``` bash
webui-user.bat
```

## Включение API

В `webui-user.bat`:

``` txt
set COMMANDLINE_ARGS=--api
```

API:

``` txt
http://127.0.0.1:7860
```

Проверка:

``` txt
http://127.0.0.1:7860/docs
```

## Backend

Установка:

``` bash
npm init -y
npm install express axios dotenv uuid
```

server.js

``` js
import express from "express";

const app = express();

app.use(express.json());

app.listen(3000);
```

## Service Layer

services/imageService.js

``` js
import axios from "axios";

export async function generate(prompt){

 const response = await axios.post(
 "http://127.0.0.1:7860/sdapi/v1/txt2img",
 {
   prompt,
   steps:20,
   width:512,
   height:512
 });

 return response.data;
}
```

## Controller

``` js
export async function generateImage(req,res){

 const {prompt}=req.body;

 const data = await generate(prompt);

 res.json(data);

}
```

## Frontend

``` html
<textarea id="prompt"></textarea>
<button onclick="generate()">
Generate
</button>
```

``` js
async function generate(){

 const prompt =
 document.getElementById("prompt").value;

 const res = await fetch("/generate",{
   method:"POST",
   headers:{
      "Content-Type":"application/json"
   },
   body:JSON.stringify({prompt})
 });

}
```

## Сохранение изображений

``` js
import fs from "fs";

fs.writeFileSync(path, buffer);
```

## Download Endpoint

``` js
app.get("/download/:filename",(req,res)=>{

 const file =
 `./public/images/${req.params.filename}`;

 res.download(file);

});
```

## Troubleshooting

### CUDA out of memory

Уменьшить:

-   width
-   height
-   batch size
