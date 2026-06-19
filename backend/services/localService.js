import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename_localService = fileURLToPath(import.meta.url);
const __dirname_localService = path.dirname(__filename_localService);
const outputDir = path.resolve(__dirname_localService, '../public/images');

const SD_API_URL = process.env.SD_API_URL || 'http://127.0.0.1:7860';

export async function localGenerate(prompt, negativePrompt, size, style, quality, count) {
  const [width, height] = size.split('x').map(Number);
  const steps = Math.max(10, Math.round((quality / 100) * 50));

  const results = [];

  for (let i = 0; i < count; i++) {
    const payload = {
      prompt,
      negative_prompt: negativePrompt || '',
      steps,
      width,
      height,
      batch_size: 1,
      seed: -1,
    };

    const response = await axios.post(`${SD_API_URL}/sdapi/v1/txt2img`, payload);
    const imageData = response.data.images[0];
    const buffer = Buffer.from(imageData, 'base64');

    const filename = `sd-${Date.now()}-${i}.png`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, buffer);

    results.push({
      id: filename.replace('.png', ''),
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
