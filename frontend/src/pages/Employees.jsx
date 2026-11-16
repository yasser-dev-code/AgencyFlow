import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { employeesApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader, Button, Card, Badge, statusTone, EmptyState, Spinner } from '../components/ui/Primitives';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Field, TextInput, Select } from '../components/ui/Form';

const EMPTY = { name: '', email: '', password: '', role: 'EMPLOYEE' };
const ROLES = ['ADMIN', 'EMPLOYEE'];

export default function Employees() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setEmployees(await employeesApi.list());
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(employee) {
    setEditing(employee);
    setForm({ name: employee.name || '', email: employee.email || '', password: '', role: employee.role || 'EMPLOYEE' });
    setFormError('');
    setModalOpen(true);
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      // Never send an empty password when editing (means "keep current").
      if (editing && !payload.password) delete payload.password;
      if (editing) await employeesApi.update(editing.id, payload);
      else await employeesApi.create(payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || t('errors.generic'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await employeesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || t('errors.generic'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle')}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t('employees.add')}
          </Button>
        }
      />

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState message={t('employees.empty')} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('employees.name')}</th>
                  <th className="px-4 py-3">{t('employees.email')}</th>
                  <th className="px-4 py-3">{t('employees.role')}</th>
                  <th className="px-4 py-3">{t('employees.tasks')}</th>
                  <th className="px-4 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(emp.role)}>{t(`employees.roleLabel.${emp.role}`)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp._count?.assignedTasks ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(emp)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label={t('common.edit')}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(emp)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label={t('common.delete')}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t('employees.edit') : t('employees.add')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button form="employee-form" type="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="employee-form" onSubmit={submit} className="space-y-4">
          <Field label={t('employees.name')}>
            <TextInput value={form.name} onChange={update('name')} required minLength={2} />
          </Field>
          <Field label={t('employees.email')}>
            <TextInput type="email" value={form.email} onChange={update('email')} required />
          </Field>
          <Field label={t('employees.password')} hint={editing ? t('employees.passwordHelp') : undefined}>
            <TextInput type="password" value={form.password} onChange={update('password')} required={!editing} minLength={8} />
          </Field>
          <Field label={t('employees.role')}>
            <Select value={form.role} onChange={update('role')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`employees.roleLabel.${r}`)}
                </option>
              ))}
            </Select>
          </Field>
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
