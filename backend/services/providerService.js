import { mockGenerate } from './mockService.js';
import { localGenerate } from './localService.js';
import { hfGenerate } from './huggingfaceService.js';
import { pollGenerate } from './pollinationsService.js';

const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

export async function generateImage(prompt, negativePrompt, size, style, quality, count) {
  switch (provider) {
    case 'local':
      return localGenerate(prompt, negativePrompt, size, style, quality, count);

    case 'huggingface':
      return hfGenerate(prompt, negativePrompt, size, style, quality, count);

    case 'pollinations':
      return pollGenerate(prompt, negativePrompt, size, style, quality, count);

    case 'mock':
    default:
      return mockGenerate(prompt, negativePrompt, size, style, quality, count);
  }
}
