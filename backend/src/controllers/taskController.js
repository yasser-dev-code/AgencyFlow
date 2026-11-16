import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, sendCreated, sendSuccess } from '../utils/http.js';

const INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true } },
  campaign: { select: { id: true, name: true } }
};

function clean(value) {
  return value === '' || value === undefined ? null : value;
}

// Employees only see their own tasks; admins see everything.
function scopeWhere(user, extra = {}) {
  const where = { ...extra };
  if (user.role !== 'ADMIN') {
    where.assignedToId = user.id;
  }
  return where;
}

export const listTasks = asyncHandler(async (req, res) => {
  const { status, priority, campaignId } = req.query;
  const extra = {};
  if (status) extra.status = status;
  if (priority) extra.priority = priority;
  if (campaignId) extra.campaignId = campaignId;

  const tasks = await prisma.task.findMany({
    where: scopeWhere(req.user, extra),
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    include: INCLUDE
  });
  return sendSuccess(res, { data: tasks });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!task) throw new ApiError(404, 'Task not found.');
  if (req.user.role !== 'ADMIN' && task.assignedToId !== req.user.id) {
    throw new ApiError(403, 'You can only view your own tasks.');
  }
  return sendSuccess(res, { data: task });
});

export const createTask = asyncHandler(async (req, res) => {
  const body = req.body;
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: clean(body.description),
      status: body.status ?? 'TODO',
      priority: body.priority ?? 'MEDIUM',
      dueDate: clean(body.dueDate) ? new Date(body.dueDate) : null,
      assignedToId: clean(body.assignedToId),
      campaignId: clean(body.campaignId)
    },
    include: INCLUDE
  });
  return sendCreated(res, task);
});

async function assertCanModify(user, task) {
  if (user.role === 'ADMIN') return;
  // Employees may only update the status of tasks assigned to them.
  if (task.assignedToId !== user.id) {
    throw new ApiError(403, 'You can only update tasks assigned to you.');
  }
}

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Task not found.');
  await assertCanModify(req.user, existing);

  const body = req.body;
  if (req.user.role !== 'ADMIN') {
    // Restrict employees to status-only updates.
    const allowed = ['status'];
    const keys = Object.keys(body);
    if (keys.some((k) => !allowed.includes(k))) {
      throw new ApiError(403, 'Employees may only update task status.');
    }
  }

  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = clean(body.description);
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.dueDate !== undefined) data.dueDate = clean(body.dueDate) ? new Date(body.dueDate) : null;
  if (body.assignedToId !== undefined) data.assignedToId = clean(body.assignedToId);
  if (body.campaignId !== undefined) data.campaignId = clean(body.campaignId);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data,
    include: INCLUDE
  });
  return sendSuccess(res, { data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Task not found.');
  await prisma.task.delete({ where: { id: req.params.id } });
  return sendSuccess(res, { message: 'Task deleted.' });
});
