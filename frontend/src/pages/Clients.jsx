import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { clientsApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Button, Card, Badge, statusTone, EmptyState, Spinner } from '../components/ui/Primitives';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Field, TextInput, Textarea, Select } from '../components/ui/Form';

const EMPTY = { name: '', company: '', email: '', phone: '', notes: '', status: 'LEAD' };
const STATUSES = ['LEAD', 'ACTIVE', 'INACTIVE'];

export default function Clients() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
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
      if (search) params.search = search;
      if (status) params.status = status;
      setClients(await clientsApi.list(params));
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [search, status, t]);

  useEffect(() => {
    const id = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(id);
  }, [load, search]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(client) {
    setEditing(client);
    setForm({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
      status: client.status || 'LEAD'
    });
    setFormError('');
    setModalOpen(true);
  }

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) await clientsApi.update(editing.id, form);
      else await clientsApi.create(form);
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

  async function confirmDelete() {
    setDeleting(true);
    try {
      await clientsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(t('common.deleted'));
      await load();
    } catch {
      setError(t('errors.generic'));
      toast.error(t('errors.generic'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t('clients.title')}
        subtitle={t('clients.subtitle')}
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t('clients.add')}
            </Button>
          )
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            className="pl-9"
            placeholder={t('clients.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="">{t('common.all')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`clients.statusLabel.${s}`)}
            </option>
          ))}
        </Select>
      </Card>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState message={t('clients.empty')} icon={Users} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('clients.name')}</th>
                  <th className="px-4 py-3">{t('clients.company')}</th>
                  <th className="px-4 py-3">{t('clients.email')}</th>
                  <th className="px-4 py-3">{t('clients.phone')}</th>
                  <th className="px-4 py-3">{t('clients.status')}</th>
                  {isAdmin && <th className="px-4 py-3 text-right">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{client.name}</td>
                    <td className="px-4 py-3 text-slate-600">{client.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{client.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(client.status)}>{t(`clients.statusLabel.${client.status}`)}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(client)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label={t('common.edit')}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(client)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label={t('common.delete')}>
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
        title={editing ? t('clients.edit') : t('clients.add')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button form="client-form" type="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="client-form" onSubmit={submit} className="space-y-4">
          <Field label={t('clients.name')}>
            <TextInput value={form.name} onChange={update('name')} required minLength={2} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('clients.company')}>
              <TextInput value={form.company} onChange={update('company')} />
            </Field>
            <Field label={t('clients.status')}>
              <Select value={form.status} onChange={update('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`clients.statusLabel.${s}`)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('clients.email')}>
              <TextInput type="email" value={form.email} onChange={update('email')} />
            </Field>
            <Field label={t('clients.phone')}>
              <TextInput value={form.phone} onChange={update('phone')} />
            </Field>
          </div>
          <Field label={t('clients.notes')}>
            <Textarea value={form.notes} onChange={update('notes')} />
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
