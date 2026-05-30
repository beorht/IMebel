import { generateImage } from '../services/providerService.js';
import { buildFurnitureViewPrompts } from '../utils/promptBuilder.js';

export async function createImage(req, res, next) {
  try {
    const { furniture, negativePrompt, size, style, quality, count } = req.body;

    if (!furniture || !furniture.type || !furniture.fields) {
      const err = new Error('Furniture data is required');
      err.status = 400;
      return next(err);
    }

    const actualCount = Math.min(Math.max(parseInt(count, 10) || 1, 1), 4);
    const viewPrompts = buildFurnitureViewPrompts(furniture);

    const items = await Promise.all(
      Array.from({ length: actualCount }, async () => {
        const results = await Promise.all(
          ['front', 'side', 'top'].map(async (angle) => {
            const images = await generateImage(
              viewPrompts[angle],
              (negativePrompt || '').trim(),
              size || '768x768',
              style || 'realistic',
              parseInt(quality, 10) || 80,
              1
            );
            return { ...images[0], angle };
          })
        );
        return { views: results };
      })
    );

    res.json({ success: true, mode: 'furniture', items });
  } catch (err) {
    next(err);
  }
}
