import { getGenerationsByUser } from '../db.js';

export function getHistory(req, res) {
  const rows = getGenerationsByUser(req.user.id);

  const generations = rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    images: JSON.parse(row.imagesJson),
    createdAt: row.createdAt,
  }));

  res.json({ success: true, generations });
}
