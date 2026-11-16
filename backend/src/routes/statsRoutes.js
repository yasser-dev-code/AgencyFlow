import { Router } from 'express';
import { getStats } from '../controllers/statsController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/', getStats);

export default router;
