import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let __filename_hf;
let __dirname_hf;
try {
  __filename_hf = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_hf = path.dirname(__filename_hf);
} catch (err) {
  __dirname_hf = process.cwd();
}
const outputDir = path.resolve(__dirname_hf, '../public/images');

// Parse comma-separated tokens into a pool
function buildTokenPool() {
  const raw = process.env.HF_TOKEN || '';
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && t !== 'your_token_here');
}

const tokenPool = buildTokenPool();
let poolIndex = 0;

function nextClient() {
  if (tokenPool.length === 0) return null;
  const token = tokenPool[poolIndex % tokenPool.length];
  poolIndex = (poolIndex + 1) % tokenPool.length;
  return new HfInference(token);
}

function isRateLimitError(err) {
  return (
    err?.message?.includes('429') ||
    err?.message?.toLowerCase().includes('rate limit') ||
    err?.message?.toLowerCase().includes('too many requests') ||
    err?.status === 429
  );
}

export async function hfGenerate(prompt, negativePrompt, size, style, quality, count) {
  if (tokenPool.length === 0) {
    throw new Error('HF_TOKEN not configured in .env');
  }

  const [width, height] = size.split('x').map(Number);
  const numInferenceSteps = Math.max(10, Math.round((quality / 100) * 50));
  const results = [];

  for (let i = 0; i < count; i++) {
    let blob;
    let lastErr;

    // Try each token in the pool before giving up
    for (let attempt = 0; attempt < tokenPool.length; attempt++) {
      const client = nextClient();
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
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (err.message?.includes('permission') || err.message?.includes('403')) {
          throw new Error(
            'HF token lacks Inference Providers permission. ' +
            'Create a token at: https://huggingface.co/settings/tokens/new?' +
            'ownUserPermissions=inference.serverless.write&tokenType=fineGrained'
          );
        }
        if (isRateLimitError(err) && attempt < tokenPool.length - 1) {
          continue; // try next token
        }
        throw err;
      }
    }

    if (lastErr) throw lastErr;

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
