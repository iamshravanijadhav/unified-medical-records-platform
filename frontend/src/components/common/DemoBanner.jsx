import { Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DemoBanner({ compact = false }) {
  const { systemInfo } = useAuth();

  return (
    <div
      className={`rounded-lg border px-3.5 py-2.5 text-xs flex items-start sm:items-center justify-between gap-3 ${
        systemInfo.mode === 'firebase'
          ? 'bg-blue-50/80 border-blue-200 text-blue-900'
          : 'bg-amber-50/90 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-start sm:items-center gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong>College MVP Demo Environment:</strong> Uses fictional ABHA-style IDs and synthetic hospital records for educational demonstration only (real-world healthcare deployment requires patient authorization, privacy safeguards, and live ABDM integration).
          {!compact && (
            <span className="ml-1.5 font-semibold">
              Active Backend Mode: {systemInfo.mode === 'firebase' ? 'Firebase Auth & Firestore' : 'Local Demo Mode (Synthetic Store)'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

