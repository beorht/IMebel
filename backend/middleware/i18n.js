import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../locales');
const cache = {};

function loadLocale(locale) {
  if (cache[locale]) return cache[locale];
  const filePath = path.join(localesDir, `${locale}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    cache[locale] = data;
    return data;
  } catch {
    return {};
  }
}

export const supportedLocales = ['en', 'ru'];
export const defaultLocale = 'en';

export function i18nMiddleware(req, res, next) {
  let locale = defaultLocale;

  const cookieLocale = req.cookies?.locale;
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    locale = cookieLocale;
  }

  const translations = loadLocale(locale);

  res.locals.locale = locale;
  res.locals.t = (key) => translations[key] || key;
  res.locals.translations = translations;

  next();
}
