import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let __filename_promptBuilder;
let __dirname_promptBuilder;
try {
  __filename_promptBuilder = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_promptBuilder = path.dirname(__filename_promptBuilder);
} catch (err) {
  __dirname_promptBuilder = process.cwd();
}

const candidatePaths = [
  path.resolve(__dirname_promptBuilder, '../public/json_data/furniture_prompt_templates.json'),
  path.resolve(__dirname_promptBuilder, '../frontend/public/json_data/furniture_prompt_templates.json'),
  path.resolve(process.cwd(), 'frontend/public/json_data/furniture_prompt_templates.json'),
  path.resolve(process.cwd(), 'public/json_data/furniture_prompt_templates.json'),
];

let templatesData = null;

function resolveTemplatesPath() {
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function loadTemplates() {
  if (templatesData) return templatesData;
  const p = resolveTemplatesPath();
  if (!p) {
    // Fallback to an empty structure to avoid throwing during module import in serverless envs
    templatesData = { templates: {} };
    return templatesData;
  }

  try {
    templatesData = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (err) {
    templatesData = { templates: {} };
  }
  return templatesData;
}

export function buildFurniturePrompt(furniture) {
  const { type, fields } = furniture;
  const data = loadTemplates();
  const template = data.templates[type];
  if (!template) throw new Error(`Unknown furniture type: ${type}`);

  let prompt = template.prompt_template;
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
  }

  prompt = prompt.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();

  return prompt;
}

const VIEW_SUFFIX = {
  front: 'Generate FRONT VIEW ONLY. Single furniture product render isolated on white background.',
  side: 'Generate SIDE VIEW ONLY. Single furniture product render isolated on white background.',
  top: 'Generate TOP VIEW ONLY. Single furniture product render isolated on white background.',
};

export function buildFurnitureViewPrompts(furniture) {
  const basePrompt = buildFurniturePrompt(furniture);

  const cleanBase = basePrompt
    .replace(/\s*Generate\s+(consistent\s+)?FRONT\s+VIEW,\s*SIDE\s+VIEW,\s*TOP\s+VIEW\.?\s*$/i, '')
    .replace(/\s*Generate\s+FRONT\s+VIEW,\s*SIDE\s+VIEW,\s*TOP\s+VIEW\.?\s*$/i, '')
    .trim();

  return {
    front: `${cleanBase}. ${VIEW_SUFFIX.front}`,
    side: `${cleanBase}. ${VIEW_SUFFIX.side}`,
    top: `${cleanBase}. ${VIEW_SUFFIX.top}`,
  };
}
