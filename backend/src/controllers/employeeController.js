import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, sendCreated, sendSuccess } from '../utils/http.js';
import { hashPassword } from '../utils/password.js';

const SELECT = { id: true, name: true, email: true, role: true, createdAt: true };

export const listEmployees = asyncHandler(async (_req, res) => {
  const employees = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { ...SELECT, _count: { select: { assignedTasks: true } } }
  });
  return sendSuccess(res, { data: employees });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const body = req.body;
  const passwordHash = await hashPassword(body.password);
  const employee = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role ?? 'EMPLOYEE'
    },
    select: SELECT
  });
  return sendCreated(res, employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Employee not found.');
  const body = req.body;

  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.role !== undefined) data.role = body.role;
  if (body.password) data.passwordHash = await hashPassword(body.password);

  const employee = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: SELECT
  });
  return sendSuccess(res, { data: employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Employee not found.');
  await prisma.user.delete({ where: { id: req.params.id } });
  return sendSuccess(res, { message: 'Employee deleted.' });
});
