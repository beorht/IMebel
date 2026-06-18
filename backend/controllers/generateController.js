import { generateImage } from '../services/providerService.js';
import { buildFurniturePrompt } from '../utils/promptBuilder.js';

export async function createImage(req, res, next) {
  try {
    const { furniture, negativePrompt, size, style, quality, count } = req.body;

    if (!furniture || !furniture.type || !furniture.fields) {
      const err = new Error('Furniture data is required');
      err.status = 400;
      return next(err);
    }

    const actualCount = Math.min(Math.max(parseInt(count, 10) || 1, 1), 4);
    const prompt = buildFurniturePrompt(furniture);

    const images = await generateImage(
      prompt,
      (negativePrompt || '').trim(),
      size || '768x768',
      style || 'realistic',
      parseInt(quality, 10) || 80,
      actualCount
    );

    res.json({ success: true, mode: 'furniture', images });
  } catch (err) {
    next(err);
  }
}
