import { Router } from 'express';
import { getTemplates } from '../controllers/templatesController.js';

const router = Router();
router.get('/', getTemplates);

export default router;
