import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let counter = 0;

const STYLES = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200', accent: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: AlertTriangle, ring: 'border-rose-200', accent: 'text-rose-600', bar: 'bg-rose-500' },
  info: { icon: Info, ring: 'border-sky-200', accent: 'text-sky-600', bar: 'bg-sky-500' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message, type = 'success', duration = 3500) => {
      if (!message) return;
      const id = ++counter;
      setToasts((list) => [...list.slice(-3), { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      notify,
      success: (m) => notify(m, 'success'),
      error: (m) => notify(m, 'error'),
      info: (m) => notify(m, 'info')
    }),
    [notify]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style = STYLES[toast.type] || STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={`toast-enter pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border bg-white p-3 pl-4 shadow-lg ${style.ring}`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${style.bar}`} aria-hidden="true" />
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.accent}`} />
              <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
