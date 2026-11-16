import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/http.js';

// All numbers come from real database queries - nothing is hardcoded.
export const getStats = asyncHandler(async (_req, res) => {
  const [
    totalClients,
    activeCampaigns,
    totalEmployees,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    tasksByPriority,
    campaignsByStatus,
    recentClients
  ] = await Promise.all([
    prisma.client.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: 'TODO' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.campaign.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, company: true, status: true, createdAt: true }
    })
  ]);

  const data = {
    totals: {
      clients: totalClients,
      activeCampaigns,
      employees: totalEmployees,
      completedTasks,
      pendingTasks
    },
    tasksByStatus: [
      { status: 'TODO', count: pendingTasks },
      { status: 'IN_PROGRESS', count: inProgressTasks },
      { status: 'COMPLETED', count: completedTasks }
    ],
    tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count._all })),
    campaignsByStatus: campaignsByStatus.map((c) => ({ status: c.status, count: c._count._all })),
    recentClients
  };

  return sendSuccess(res, { data });
});
