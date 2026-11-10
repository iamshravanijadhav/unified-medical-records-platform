import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-slate-50/60 border border-dashed border-slate-300 rounded-xl">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

