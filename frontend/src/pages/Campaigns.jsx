import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Megaphone } from 'lucide-react';
import { campaignsApi, clientsApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Button, Card, Badge, statusTone, EmptyState, Spinner } from '../components/ui/Primitives';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Field, TextInput, Select } from '../components/ui/Form';

const EMPTY = { name: '', clientId: '', platform: '', budget: '', startDate: '', endDate: '', status: 'DRAFT' };
const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];

const toDateInput = (value) => (value ? value.slice(0, 10) : '');

export default function Campaigns() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
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
      const [campaignData, clientData] = await Promise.all([campaignsApi.list(params), clientsApi.list()]);
      setCampaigns(campaignData);
      setClients(clientData);
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

  function openEdit(campaign) {
    setEditing(campaign);
    setForm({
      name: campaign.name || '',
      clientId: campaign.clientId || '',
      platform: campaign.platform || '',
      budget: campaign.budget ?? '',
      startDate: toDateInput(campaign.startDate),
      endDate: toDateInput(campaign.endDate),
      status: campaign.status || 'DRAFT'
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
      const payload = { ...form, budget: form.budget === '' ? 0 : Number(form.budget) };
      if (editing) await campaignsApi.update(editing.id, payload);
      else await campaignsApi.create(payload);
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
      await campaignsApi.remove(deleteTarget.id);
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
        title={t('campaigns.title')}
        subtitle={t('campaigns.subtitle')}
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t('campaigns.add')}
            </Button>
          )
        }
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput className="pl-9" placeholder={t('campaigns.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="">{t('common.all')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`campaigns.statusLabel.${s}`)}
            </option>
          ))}
        </Select>
      </Card>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState message={t('campaigns.empty')} icon={Megaphone} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('campaigns.name')}</th>
                  <th className="px-4 py-3">{t('campaigns.client')}</th>
                  <th className="px-4 py-3">{t('campaigns.platform')}</th>
                  <th className="px-4 py-3">{t('campaigns.budget')}</th>
                  <th className="px-4 py-3">{t('campaigns.startDate')}</th>
                  <th className="px-4 py-3">{t('campaigns.endDate')}</th>
                  <th className="px-4 py-3">{t('campaigns.status')}</th>
                  {isAdmin && <th className="px-4 py-3 text-right">{t('common.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.client?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.platform}</td>
                    <td className="px-4 py-3 text-slate-600">{Number(c.budget).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{toDateInput(c.startDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{toDateInput(c.endDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(c.status)}>{t(`campaigns.statusLabel.${c.status}`)}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label={t('common.edit')}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label={t('common.delete')}>
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
        title={editing ? t('campaigns.edit') : t('campaigns.add')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button form="campaign-form" type="submit" loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="campaign-form" onSubmit={submit} className="space-y-4">
          <Field label={t('campaigns.name')}>
            <TextInput value={form.name} onChange={update('name')} required minLength={2} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('campaigns.client')}>
              <Select value={form.clientId} onChange={update('clientId')} required>
                <option value="">{t('campaigns.selectClient')}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('campaigns.platform')}>
              <TextInput value={form.platform} onChange={update('platform')} required placeholder="Google Ads, Meta, LinkedIn…" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={t('campaigns.budget')}>
              <TextInput type="number" min="0" step="0.01" value={form.budget} onChange={update('budget')} />
            </Field>
            <Field label={t('campaigns.startDate')}>
              <TextInput type="date" value={form.startDate} onChange={update('startDate')} required />
            </Field>
            <Field label={t('campaigns.endDate')}>
              <TextInput type="date" value={form.endDate} onChange={update('endDate')} required />
            </Field>
          </div>
          <Field label={t('campaigns.status')}>
            <Select value={form.status} onChange={update('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`campaigns.statusLabel.${s}`)}
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
