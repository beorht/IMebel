import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let __filename_pollinationsService;
let __dirname_pollinationsService;
try {
  __filename_pollinationsService = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_pollinationsService = path.dirname(__filename_pollinationsService);
} catch (err) {
  __dirname_pollinationsService = process.cwd();
}
const outputDir = path.resolve(__dirname_pollinationsService, '../public/images');

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err) {
  // No response means the request never completed (DNS, TCP/TLS reset, timeout).
  // A 5xx response means the upstream server itself failed transiently.
  return !err.response || err.response.status >= 500;
}

async function fetchImageWithRetry(url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS && isRetryable(err)) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function pollGenerate(prompt, negativePrompt, size, style, quality, count) {
  const encoded = encodeURIComponent(prompt);
  const baseUrl = `https://image.pollinations.ai/prompt/${encoded}`;

  const [width, height] = size.split('x');

  const results = [];
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() + i;
    const seed = Math.floor(Math.random() * 2147483647);
    const remoteUrl = `${baseUrl}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const response = await fetchImageWithRetry(remoteUrl);
    const filename = `poll-${timestamp}.jpg`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, response.data);

    results.push({
      id: filename.replace('.jpg', ''),
      url: `/public/images/${filename}`,
      prompt: prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt,
      size,
      style,
      quality,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    });
  }

  return results;
}
