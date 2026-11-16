import { Router } from 'express';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Both roles can read (scoped in the controller) and update task status.
router.get('/', listTasks);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);

// Only admins can create or delete tasks.
router.post('/', authorize('ADMIN'), validate(createTaskSchema), createTask);
router.delete('/:id', authorize('ADMIN'), deleteTask);

export default router;
