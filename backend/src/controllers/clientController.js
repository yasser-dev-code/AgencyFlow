import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, sendCreated, sendSuccess } from '../utils/http.js';

function clean(value) {
  return value === '' ? null : value;
}

export const listClients = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { campaigns: true } } }
  });
  return sendSuccess(res, { data: clients });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: { campaigns: { orderBy: { createdAt: 'desc' } } }
  });
  if (!client) throw new ApiError(404, 'Client not found.');
  return sendSuccess(res, { data: client });
});

export const createClient = asyncHandler(async (req, res) => {
  const body = req.body;
  const client = await prisma.client.create({
    data: {
      name: body.name,
      company: clean(body.company),
      email: clean(body.email),
      phone: clean(body.phone),
      notes: clean(body.notes),
      status: body.status ?? 'LEAD'
    }
  });
  return sendCreated(res, client);
});

export const updateClient = asyncHandler(async (req, res) => {
  const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Client not found.');
  const body = req.body;
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.company !== undefined && { company: clean(body.company) }),
      ...(body.email !== undefined && { email: clean(body.email) }),
      ...(body.phone !== undefined && { phone: clean(body.phone) }),
      ...(body.notes !== undefined && { notes: clean(body.notes) }),
      ...(body.status !== undefined && { status: body.status })
    }
  });
  return sendSuccess(res, { data: client });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Client not found.');
  await prisma.client.delete({ where: { id: req.params.id } });
  return sendSuccess(res, { message: 'Client deleted.' });
});
