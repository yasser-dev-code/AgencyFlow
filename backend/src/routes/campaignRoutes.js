import { Router } from 'express';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createCampaignSchema, updateCampaignSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', listCampaigns);
router.get('/:id', getCampaign);
router.post('/', authorize('ADMIN'), validate(createCampaignSchema), createCampaign);
router.put('/:id', authorize('ADMIN'), validate(updateCampaignSchema), updateCampaign);
router.delete('/:id', authorize('ADMIN'), deleteCampaign);

export default router;
