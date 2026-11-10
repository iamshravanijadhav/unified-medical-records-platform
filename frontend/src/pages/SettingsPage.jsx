import { Database, RefreshCw, Server, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

export default function SettingsPage() {
  const { addToast, systemInfo } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/settings/status');
      setStatus(res);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await apiRequest('/settings/reset-demo', { method: 'POST' });
      addToast(res.message, 'success');
      await loadSettings();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <DashboardLayout title="Platform Settings & System Diagnostics">
      <div className="max-w-4xl space-y-6">
        {loading && <LoadingSpinner label="Checking backend architecture status..." />}

        {status && !loading && (
          <>
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Authentication & Database Mode</h2>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Platform Stage:</span>
                  <span className="font-semibold text-slate-900">{status.platform.stage}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Active Storage & Auth Mode:</span>
                  <span className="font-mono font-bold text-blue-700">{status.platform.mode}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Firebase Credentials Configured:</span>
                  <span className="font-semibold text-slate-900">
                    {status.platform.firebaseConfigured ? 'Yes (Live Firestore & Auth)' : 'No (Using Local Demo Mode)'}
                  </span>
                </div>
                <p className="pt-2 border-t border-slate-200 text-slate-600">
                  {status.platform.modeDescription}
                </p>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">
                  ABDM / HL7 FHIR Architecture Readiness
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="rounded-lg border border-slate-200 p-3.5">
                  <div className="font-semibold text-slate-900">ABDM Gateway & Production Authorization Requirements</div>
                  <div className="text-slate-600 mt-0.5">{status.architectureReadiness.abdmGateway}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3.5">
                  <div className="font-semibold text-slate-900">Interoperability Adapter Layer</div>
                  <div className="text-slate-600 mt-0.5">{status.architectureReadiness.fhirAdapterLayer}</div>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Server className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Demo Hospital Microservice Endpoints
                </h2>
              </div>

              <div className="space-y-2">
                {status.architectureReadiness.hospitalEndpoints.map((h) => (
                  <div
                    key={h.hospitalId}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{h.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{h.endpoint}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.isEnabled ? 'enabled' : 'disabled'} />
                      <StatusBadge status={h.systemStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {systemInfo.mode === 'local-demo' && (
              <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-amber-200 bg-amber-50/40">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4 text-amber-600" />
                    Reset Local Demo Environment
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Restores the 3 demo hospitals, 5 synthetic patients, and activity logs back to default seed state for clean faculty demonstrations.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleResetDemo}
                  className="btn-secondary text-xs shrink-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  {resetting ? 'Resetting...' : 'Reset Demo State'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

