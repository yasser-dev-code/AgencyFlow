import { useState } from 'react';
import { authApi } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, Button, Card } from '../components/ui/Primitives';
import { Field, TextInput, Select } from '../components/ui/Form';

export default function Settings() {
  const { t, language, setLanguage, languages } = useLanguage();
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const data = await authApi.updateProfile({ name });
      setUser(data?.user ?? null);
      setProfileMsg(t('common.saved'));
      toast.success(t('common.saved'));
    } catch {
      setProfileMsg(t('errors.generic'));
      toast.error(t('errors.generic'));
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg('');
    setPwError('');
    try {
      await authApi.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      setPwMsg(t('settings.passwordUpdated'));
      toast.success(t('settings.passwordUpdated'));
    } catch (err) {
      setPwError(err?.response?.data?.message || t('errors.generic'));
      toast.error(err?.response?.data?.message || t('errors.generic'));
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('settings.profile')}</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label={t('settings.yourName')}>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </Field>
            <Field label={t('settings.yourEmail')}>
              <TextInput value={user?.email || ''} disabled readOnly className="bg-slate-50 text-slate-500" />
            </Field>
            {profileMsg && <p className="text-sm text-emerald-600">{profileMsg}</p>}
            <Button type="submit" loading={profileSaving}>
              {t('common.save')}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('settings.changePassword')}</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <Field label={t('settings.currentPassword')}>
              <TextInput
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </Field>
            <Field label={t('settings.newPassword')}>
              <TextInput
                type="password"
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </Field>
            {pwError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{pwError}</p>}
            {pwMsg && <p className="text-sm text-emerald-600">{pwMsg}</p>}
            <Button type="submit" loading={pwSaving}>
              {t('common.save')}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('settings.languageSection')}</h2>
          <p className="mb-3 text-sm text-slate-500">{t('settings.languageHelp')}</p>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="sm:w-56">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </Select>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('settings.appInfo')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">{t('common.appName')}</dt>
              <dd className="font-medium text-slate-800">{t('common.tagline')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">{t('settings.version')}</dt>
              <dd className="font-medium text-slate-800">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">{t('employees.role')}</dt>
              <dd className="font-medium text-slate-800">{t(`employees.roleLabel.${user?.role}`)}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
