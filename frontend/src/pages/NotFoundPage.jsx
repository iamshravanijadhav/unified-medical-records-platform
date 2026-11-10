import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        The route you tried to open does not exist on the Unified Medical Records Access Platform.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}

