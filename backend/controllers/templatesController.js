import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getTemplates(req, res) {
  const filePath = path.resolve(__dirname, '../public/json_data/furniture_prompt_templates.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
}
