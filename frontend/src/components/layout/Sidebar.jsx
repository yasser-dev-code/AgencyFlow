import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, CheckSquare, UserCog, Settings, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

function buildItems(t, isAdmin) {
  return [
    { to: '/', key: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/clients', key: 'clients', icon: Users },
    { to: '/campaigns', key: 'campaigns', icon: Megaphone },
    { to: '/tasks', key: 'tasks', icon: CheckSquare },
    { to: '/employees', key: 'employees', icon: UserCog, adminOnly: true },
    { to: '/settings', key: 'settings', icon: Settings }
  ].filter((item) => !item.adminOnly || isAdmin);
}

export default function Sidebar({ open, onClose }) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const items = buildItems(t, isAdmin);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/logo.svg" alt="AgencyFlow" className="h-9 w-9" />
          <div>
            <p className="text-base font-bold leading-tight">{t('common.appName')}</p>
            <p className="text-xs text-slate-400">{t('common.tagline')}</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={key}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4">
          <NavLink to="/privacy" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">
            {t('nav.privacy')}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
