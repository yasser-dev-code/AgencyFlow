import { Router } from 'express';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', authorize('ADMIN'), validate(createClientSchema), createClient);
router.put('/:id', authorize('ADMIN'), validate(updateClientSchema), updateClient);
router.delete('/:id', authorize('ADMIN'), deleteClient);

export default router;
