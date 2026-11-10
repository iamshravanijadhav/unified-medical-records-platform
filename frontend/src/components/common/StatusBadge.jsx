export default function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();

  const styles = {
    online: 'bg-teal-50 text-teal-700 border-teal-200',
    enabled: 'bg-blue-50 text-blue-700 border-blue-200',
    offline: 'bg-rose-50 text-rose-700 border-rose-200',
    unavailable: 'bg-rose-50 text-rose-700 border-rose-200',
    disabled: 'bg-slate-100 text-slate-600 border-slate-300',
    system: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const labels = {
    online: 'Online',
    offline: 'Offline / Unavailable',
    unavailable: 'Unavailable',
    disabled: 'Disabled',
    enabled: 'Connected',
    system: 'System Event'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          normalized === 'online' || normalized === 'enabled'
            ? 'bg-teal-500'
            : normalized === 'offline' || normalized === 'unavailable'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {labels[normalized] || status}
    </span>
  );
}

