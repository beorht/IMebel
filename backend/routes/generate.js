import { Router } from 'express';
import { createImage } from '../controllers/generateController.js';

const router = Router();

router.post('/', createImage);

export default router;
