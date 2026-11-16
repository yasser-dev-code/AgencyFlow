import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, sendCreated, sendSuccess } from '../utils/http.js';

const INCLUDE = { client: { select: { id: true, name: true, company: true } } };

export const listCampaigns = asyncHandler(async (req, res) => {
  const { search, status, clientId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) where.name = { contains: search, mode: 'insensitive' };
  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { startDate: 'desc' },
    include: { ...INCLUDE, _count: { select: { tasks: true } } }
  });
  return sendSuccess(res, { data: campaigns });
});

export const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { ...INCLUDE, tasks: { orderBy: { createdAt: 'desc' } } }
  });
  if (!campaign) throw new ApiError(404, 'Campaign not found.');
  return sendSuccess(res, { data: campaign });
});

async function assertClientExists(clientId) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new ApiError(400, 'Selected client does not exist.');
}

export const createCampaign = asyncHandler(async (req, res) => {
  const body = req.body;
  await assertClientExists(body.clientId);
  const campaign = await prisma.campaign.create({
    data: {
      name: body.name,
      platform: body.platform,
      budget: body.budget ?? 0,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status ?? 'DRAFT',
      clientId: body.clientId
    },
    include: INCLUDE
  });
  return sendCreated(res, campaign);
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Campaign not found.');
  const body = req.body;
  if (body.clientId) await assertClientExists(body.clientId);

  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.platform !== undefined) data.platform = body.platform;
  if (body.budget !== undefined) data.budget = body.budget;
  if (body.status !== undefined) data.status = body.status;
  if (body.clientId !== undefined) data.clientId = body.clientId;
  const startDate = body.startDate !== undefined ? new Date(body.startDate) : existing.startDate;
  const endDate = body.endDate !== undefined ? new Date(body.endDate) : existing.endDate;
  if (body.startDate !== undefined) data.startDate = startDate;
  if (body.endDate !== undefined) data.endDate = endDate;
  if (endDate < startDate) {
    throw new ApiError(400, 'End date must be on or after the start date.');
  }

  const campaign = await prisma.campaign.update({
    where: { id: req.params.id },
    data,
    include: INCLUDE
  });
  return sendSuccess(res, { data: campaign });
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Campaign not found.');
  await prisma.campaign.delete({ where: { id: req.params.id } });
  return sendSuccess(res, { message: 'Campaign deleted.' });
});
