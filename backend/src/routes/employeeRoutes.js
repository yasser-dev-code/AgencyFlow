import { Router } from 'express';
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/schemas.js';

const router = Router();

// Employee management is admin-only.
router.use(authenticate, authorize('ADMIN'));

router.get('/', listEmployees);
router.post('/', validate(createEmployeeSchema), createEmployee);
router.put('/:id', validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
