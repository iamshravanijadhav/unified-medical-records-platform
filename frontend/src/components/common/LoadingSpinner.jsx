import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

