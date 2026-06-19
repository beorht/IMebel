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

import { getDefaultTemplates } from '../utils/promptBuilder.js';

export function getTemplates(req, res) {
  const candidates = [
    path.resolve(__dirname_templates, '../public/json_data/furniture_prompt_templates.json'),
    path.resolve(__dirname_templates, '../frontend/public/json_data/furniture_prompt_templates.json'),
    path.resolve(process.cwd(), 'frontend/public/json_data/furniture_prompt_templates.json'),
    path.resolve(process.cwd(), 'public/json_data/furniture_prompt_templates.json'),
  ];

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) return res.json(getDefaultTemplates());

  try {
    const data = JSON.parse(fs.readFileSync(found, 'utf-8'));
    return res.json(data);
  } catch (err) {
    return res.json(getDefaultTemplates());
  }
}

