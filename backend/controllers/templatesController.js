import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename_templates = fileURLToPath(import.meta.url);
const __dirname_templates = path.dirname(__filename_templates);

export function getTemplates(req, res) {
  const filePath = path.resolve(__dirname_templates, '../public/json_data/furniture_prompt_templates.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
}
