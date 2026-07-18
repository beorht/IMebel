import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import downloadRouter from './routes/download.js';
import generateRouter from './routes/generate.js';
import templatesRouter from './routes/templates.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import { i18nMiddleware } from './middleware/i18n.js';
import { requireAuth, attachUser } from './middleware/requireAuth.js';

let __filename_server;
let __dirname_server;
try {
  __filename_server = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
  __dirname_server = path.dirname(__filename_server);
} catch (err) {
  __dirname_server = process.cwd();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname_server, '../frontend/views'));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'));
app.use(i18nMiddleware);
app.use(attachUser);
app.use(express.static(path.resolve(__dirname_server, '../frontend')));
app.use('/public', express.static(path.resolve(__dirname_server, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'IMebel',
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'IMebel — Login',
  });
});

app.use('/download', downloadRouter);
app.use('/api/generate', requireAuth, generateRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

const isMainModule = process.argv[1] && __dirname_server === path.dirname(process.argv[1]);
if (isMainModule) {
  app.listen(PORT, () => {
    const provider = process.env.AI_PROVIDER || 'mock';
    console.log(`🚀 IMebel running at http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: ${provider}`);
  });
}

export default app;
