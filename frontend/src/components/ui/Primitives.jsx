import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`${className} animate-spin text-brand-500`} aria-hidden="true" />;
}

export function PageLoading({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Spinner className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn text-slate-600 hover:bg-slate-100'
};

export function Button({ variant = 'primary', type = 'button', loading = false, className = '', children, ...props }) {
  return (
    <button type={type} className={`${VARIANTS[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner className="h-4 w-4 text-current" />}
      {children}
    </button>
  );
}

export function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ message, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      {Icon && (
        <div className="rounded-full bg-slate-100 p-3 text-slate-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-sm text-slate-500">{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

const TONES = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  blue: 'bg-sky-100 text-sky-700',
  indigo: 'bg-brand-100 text-brand-700'
};

export function Badge({ tone = 'slate', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.slate}`}>
      {children}
    </span>
  );
}

// Maps enum values to a consistent colour tone across the app.
export function statusTone(value) {
  switch (value) {
    case 'ACTIVE':
    case 'COMPLETED':
      return 'green';
    case 'IN_PROGRESS':
    case 'PAUSED':
      return 'amber';
    case 'HIGH':
      return 'red';
    case 'MEDIUM':
      return 'amber';
    case 'LOW':
    case 'DRAFT':
    case 'LEAD':
      return 'blue';
    case 'INACTIVE':
    case 'TODO':
      return 'slate';
    case 'ADMIN':
      return 'indigo';
    default:
      return 'slate';
  }
}

const STAT_ACCENTS = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  slate: 'bg-slate-100 text-slate-600'
};

export function StatCard({ label, value, icon: Icon, accent = 'brand', hint }) {
  return (
    <Card className="p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-xl p-3 ${STAT_ACCENTS[accent] || STAT_ACCENTS.brand}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
