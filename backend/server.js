import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import downloadRouter from './routes/download.js';
import generateRouter from './routes/generate.js';
import templatesRouter from './routes/templates.js';
import errorHandler from './middleware/errorHandler.js';
import { i18nMiddleware } from './middleware/i18n.js';

const __filename_server = fileURLToPath(import.meta.url);
const __dirname_server = path.dirname(__filename_server);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname_server, '../frontend/views'));

app.use(express.json());
app.use(cookieParser());
app.use(i18nMiddleware);
app.use(express.static(path.resolve(__dirname_server, '../frontend')));
app.use('/public', express.static(path.resolve(__dirname_server, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'IMebel',
  });
});

app.use('/download', downloadRouter);
app.use('/api/generate', generateRouter);
app.use('/api/templates', templatesRouter);

app.use(errorHandler);

/*
app.listen(PORT, () => {
  const provider = process.env.AI_PROVIDER || 'mock';
  console.log(`🚀 IMebel running at http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${provider}`);
});
*/


export default app;
