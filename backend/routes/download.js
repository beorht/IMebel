import { Router } from 'express';
import { downloadImage } from '../controllers/downloadController.js';

const router = Router();

router.get('/:filename', downloadImage);

export default router;
