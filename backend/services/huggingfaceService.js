import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/images');

let hf = null;

function getClient() {
  const token = process.env.HF_TOKEN;
  if (!token || token === 'your_token_here') {
    return null;
  }
  if (!hf) {
    hf = new HfInference(token);
  }
  return hf;
}

export async function hfGenerate(prompt, negativePrompt, size, style, quality, count) {
  const client = getClient();
  if (!client) {
    throw new Error('HF_TOKEN not configured in .env');
  }

  const [width, height] = size.split('x').map(Number);
  const numInferenceSteps = Math.max(10, Math.round((quality / 100) * 50));

  const results = [];

  for (let i = 0; i < count; i++) {
    let blob;
    try {
      blob = await client.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt || undefined,
          width,
          height,
          num_inference_steps: numInferenceSteps,
          seed: Math.floor(Math.random() * 2147483647),
        },
      });
    } catch (err) {
      if (err.message?.includes('permission') || err.message?.includes('403')) {
        throw new Error(
          'HF_TOKEN does not have Inference Providers permission. ' +
          'Create a new token at: ' +
          'https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained'
        );
      }
      throw err;
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const filename = `hf-${Date.now()}-${i}.png`;
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
