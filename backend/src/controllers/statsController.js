import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/http.js';

// All numbers come from real database queries - nothing is hardcoded.
export const getStats = asyncHandler(async (_req, res) => {
  const now = new Date();

  const [
    totalClients,
    activeCampaigns,
    totalEmployees,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    tasksByPriority,
    campaignsByStatus,
    recentClients,
    recentTasks
  ] = await Promise.all([
    prisma.client.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: 'TODO' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { dueDate: { lt: now }, status: { not: 'COMPLETED' } } }),
    prisma.task.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.campaign.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, company: true, status: true, createdAt: true }
    }),
    prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedTo: { select: { name: true } },
        campaign: { select: { name: true } }
      }
    })
  ]);

  const data = {
    totals: {
      clients: totalClients,
      activeCampaigns,
      employees: totalEmployees,
      completedTasks,
      pendingTasks,
      overdueTasks
    },
    tasksByStatus: [
      { status: 'TODO', count: pendingTasks },
      { status: 'IN_PROGRESS', count: inProgressTasks },
      { status: 'COMPLETED', count: completedTasks }
    ],
    tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count._all })),
    campaignsByStatus: campaignsByStatus.map((c) => ({ status: c.status, count: c._count._all })),
    recentClients,
    recentTasks
  };

  return sendSuccess(res, { data });
});
