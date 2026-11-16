import { useEffect, useState } from 'react';
import { Users, Megaphone, CheckCircle2, Clock, UserCog, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { statsApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { Card, PageHeader, StatCard, EmptyState, Badge, statusTone, Skeleton } from '../components/ui/Primitives';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444'];

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    statsApi
      .get()
      .then((data) => active && setStats(data))
      .catch(() => active && setError(t('errors.loadFailed')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [t]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <EmptyState message={error} />;
  if (!stats) return <EmptyState message={t('dashboard.noData')} />;

  const { totals } = stats;

  const cards = [
    { label: t('dashboard.totalClients'), value: totals.clients, icon: Users, accent: 'brand' },
    { label: t('dashboard.activeCampaigns'), value: totals.activeCampaigns, icon: Megaphone, accent: 'sky' },
    { label: t('dashboard.completedTasks'), value: totals.completedTasks, icon: CheckCircle2, accent: 'green' },
    { label: t('dashboard.pendingTasks'), value: totals.pendingTasks, icon: Clock, accent: 'amber' },
    { label: t('dashboard.overdueTasks'), value: totals.overdueTasks ?? 0, icon: AlertTriangle, accent: 'rose' },
    { label: t('dashboard.employees'), value: totals.employees, icon: UserCog, accent: 'slate' }
  ];

  const taskStatusData = stats.tasksByStatus.map((row) => ({
    name: t(`tasks.statusLabel.${row.status}`),
    value: row.count
  }));
  const priorityData = stats.tasksByPriority.map((row) => ({
    name: t(`tasks.priorityLabel.${row.priority}`),
    value: row.count
  }));
  const campaignData = stats.campaignsByStatus.map((row) => ({
    name: t(`campaigns.statusLabel.${row.status}`),
    value: row.count
  }));

  return (
    <div>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.tasksByStatus')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.campaignsByStatus')}</h3>
          {campaignData.length === 0 ? (
            <EmptyState message={t('dashboard.noData')} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={campaignData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {campaignData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.tasksByPriority')}</h3>
          {priorityData.length === 0 ? (
            <EmptyState message={t('dashboard.noData')} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.recentClients')}</h3>
          {stats.recentClients.length === 0 ? (
            <EmptyState message={t('dashboard.noData')} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentClients.map((client) => (
                <li key={client.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{client.name}</p>
                    <p className="text-xs text-slate-500">{client.company || '—'}</p>
                  </div>
                  <Badge tone={statusTone(client.status)}>{t(`clients.statusLabel.${client.status}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.recentTasks')}</h3>
          {!stats.recentTasks || stats.recentTasks.length === 0 ? (
            <EmptyState message={t('dashboard.noData')} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {task.assignedTo?.name || t('tasks.unassigned')}
                      {task.campaign?.name ? ` · ${task.campaign.name}` : ''}
                    </p>
                  </div>
                  <Badge tone={statusTone(task.status)}>{t(`tasks.statusLabel.${task.status}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
