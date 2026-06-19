import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename_download = fileURLToPath(import.meta.url);
const __dirname_download = path.dirname(__filename_download);

const imagesDir = path.resolve(__dirname_download, '../public/images');

export function downloadImage(req, res, next) {
  const { filename } = req.params;

  const safeFilename = path.basename(filename);
  const filePath = path.join(imagesDir, safeFilename);

  if (fs.existsSync(filePath)) {
    return res.download(filePath, safeFilename, (err) => {
      if (err) {
        err.status = 500;
        next(err);
      }
    });
  }

  const placeholderPath = path.join(imagesDir, 'placeholder.svg');
  if (fs.existsSync(placeholderPath)) {
    return res.download(placeholderPath, safeFilename.replace(/\.\w+$/, '.svg'), (err) => {
      if (err) {
        err.status = 500;
        next(err);
      }
    });
  }

  const err = new Error('File not found');
  err.status = 404;
  next(err);
}
