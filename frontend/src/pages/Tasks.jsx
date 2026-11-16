import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, AlertTriangle } from 'lucide-react';
import { tasksApi, employeesApi, campaignsApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Button, Card, Badge, statusTone, EmptyState, Spinner } from '../components/ui/Primitives';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Field, TextInput, Textarea, Select } from '../components/ui/Form';

const EMPTY = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '', campaignId: '' };
const STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const toDateInput = (value) => (value ? value.slice(0, 10) : '');
const isOverdue = (task) =>
  !!task.dueDate && task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();

export default function Tasks() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (status) params.status = status;
      if (overdueOnly) params.overdue = 'true';
      const data = await tasksApi.list(params);
      setTasks(data);
      if (isAdmin) {
        const [emps, camps] = await Promise.all([employeesApi.list(), campaignsApi.list()]);
        setEmployees(emps);
        setCampaigns(camps);
      }
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [status, overdueOnly, isAdmin, t]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditing(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: toDateInput(task.dueDate),
      assignedToId: task.assignedToId || '',
      campaignId: task.campaignId || ''
    });
    setFormError('');
    setModalOpen(true);
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) await tasksApi.update(editing.id, form);
      else await tasksApi.create(form);
      setModalOpen(false);
      toast.success(editing ? t('common.updated') : t('common.created'));
      await load();
    } catch (err) {
      const message = err?.response?.data?.message || t('errors.generic');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(task, nextStatus) {
    const previous = task.status;
    setTasks((list) => list.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)));
    try {
      await tasksApi.update(task.id, { status: nextStatus });
      toast.success(t('common.statusUpdated'));
    } catch {
      setTasks((list) => list.map((item) => (item.id === task.id ? { ...item, status: previous } : item)));
      toast.error(t('errors.generic'));
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await tasksApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(t('common.deleted'));
      await load();
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t('tasks.title')}
        subtitle={t('tasks.subtitle')}
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t('tasks.add')}
            </Button>
          )
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-slate-600">{t('tasks.status')}</span>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
          <option value="">{t('common.all')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`tasks.statusLabel.${s}`)}
            </option>
          ))}
        </Select>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          {t('tasks.overdueOnly')}
        </label>
      </Card>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState message={t('tasks.empty')} icon={CheckSquare} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('tasks.taskTitle')}</th>
                  <th className="px-4 py-3">{t('tasks.priority')}</th>
                  <th className="px-4 py-3">{t('tasks.dueDate')}</th>
                  <th className="px-4 py-3">{t('tasks.assignedTo')}</th>
                  <th className="px-4 py-3">{t('tasks.campaign')}</th>
                  <th className="px-4 py-3">{t('tasks.status')}</th>
                  {isAdmin && <th className="px-4 py-3 text-right">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{task.title}</p>
                      {task.description && <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{task.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(task.priority)}>{t(`tasks.priorityLabel.${task.priority}`)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        {toDateInput(task.dueDate) || '—'}
                        {isOverdue(task) && <Badge tone="red">{t('common.overdue')}</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{task.assignedTo?.name || t('tasks.unassigned')}</td>
                    <td className="px-4 py-3 text-slate-600">{task.campaign?.name || t('tasks.noCampaign')}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={task.status}
                        onChange={(e) => changeStatus(task, e.target.value)}
                        className="w-40 py-1.5"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`tasks.statusLabel.${s}`)}
                          </option>
                        ))}
                      </Select>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(task)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label={t('common.edit')}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(task)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label={t('common.delete')}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t('tasks.edit') : t('tasks.add')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button form="task-form" type="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={submit} className="space-y-4">
          <Field label={t('tasks.taskTitle')}>
            <TextInput value={form.title} onChange={update('title')} required minLength={2} />
          </Field>
          <Field label={t('tasks.description')}>
            <Textarea value={form.description} onChange={update('description')} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('tasks.status')}>
              <Select value={form.status} onChange={update('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`tasks.statusLabel.${s}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('tasks.priority')}>
              <Select value={form.priority} onChange={update('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`tasks.priorityLabel.${p}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t('tasks.dueDate')}>
            <TextInput type="date" value={form.dueDate} onChange={update('dueDate')} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('tasks.assignedTo')}>
              <Select value={form.assignedToId} onChange={update('assignedToId')} disabled={!isAdmin}>
                <option value="">{t('tasks.unassigned')}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('tasks.campaign')}>
              <Select value={form.campaignId} onChange={update('campaignId')} disabled={!isAdmin}>
                <option value="">{t('tasks.noCampaign')}</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('common.confirmDelete')}
        message={t('common.deleteWarning')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
