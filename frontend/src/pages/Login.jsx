import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Primitives';
import { Field, TextInput } from '../components/ui/Form';

export default function Login() {
  const { t, language, setLanguage, languages } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError(t('auth.invalid'));
      else if (!err?.response) setError(t('auth.networkError'));
      else setError(err?.response?.data?.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo.svg" alt="AgencyFlow" className="h-14 w-14" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{t('common.appName')}</h1>
          <p className="text-sm text-slate-500">{t('common.tagline')}</p>
        </div>

        <div className="mb-4 flex justify-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                language === lang.code ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t('auth.welcome')}</h2>
          <p className="mb-5 text-sm text-slate-500">{t('auth.subtitle')}</p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label={t('auth.email')}>
              <TextInput
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                placeholder="admin@agencyflow.local"
                required
              />
            </Field>
            <Field label={t('auth.password')}>
              <TextInput
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
