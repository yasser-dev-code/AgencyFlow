import { Menu, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { t, language, setLanguage, languages } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
          <Globe className="ml-1 h-4 w-4 text-slate-400" />
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                language === lang.code ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{t(`employees.roleLabel.${user?.role}`)}</p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          title={t('common.logout')}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
}
