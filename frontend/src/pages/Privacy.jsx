import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();
  const paragraphs = t('privacy.body');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> {t('nav.dashboard')}
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">{t('privacy.title')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('privacy.subtitle')}</p>
      <div className="card mt-8 space-y-4 p-6">
        {Array.isArray(paragraphs) &&
          paragraphs.map((para, index) => (
            <p key={index} className="text-sm leading-relaxed text-slate-600">
              {para}
            </p>
          ))}
      </div>
    </div>
  );
}
