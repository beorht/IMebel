import { generateImage } from '../services/providerService.js';

export async function createImage(req, res, next) {
  try {
    const { furniture, negativePrompt, size, style, quality, count } = req.body;

    if (!furniture || !furniture.type || !furniture.fields) {
      const err = new Error('Furniture data is required');
      err.status = 400;
      return next(err);
    }

    // Dynamic import to avoid module-level file reads in some serverless bundlers
    const { buildFurniturePrompt } = await import('../utils/promptBuilder.js');

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
