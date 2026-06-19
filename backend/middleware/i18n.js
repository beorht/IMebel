import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let __filename_i18n;
let __dirname_i18n;
try {
  __filename_i18n = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_i18n = path.dirname(__filename_i18n);
} catch (err) {
  __dirname_i18n = process.cwd();
}

const localesDir = path.resolve(__dirname_i18n, '../locales');
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

export const supportedLocales = ['en', 'ru', 'uz'];
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
