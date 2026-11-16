export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input className={`input ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea className={`input ${className}`} rows={rows} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`input ${className}`} {...props}>
      {children}
    </select>
  );
}
