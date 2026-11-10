import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3.5 shadow-lg bg-white ${
              isSuccess
                ? 'border-teal-200 text-slate-900'
                : isError
                ? 'border-rose-200 text-slate-900'
                : 'border-blue-200 text-slate-900'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            ) : isError ? (
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

