import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let __filename_templates;
let __dirname_templates;
try {
  __filename_templates = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_templates = path.dirname(__filename_templates);
} catch (err) {
  __dirname_templates = process.cwd();
}

export function getTemplates(req, res) {
  const filePath = path.resolve(__dirname_templates, '../public/json_data/furniture_prompt_templates.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
}
