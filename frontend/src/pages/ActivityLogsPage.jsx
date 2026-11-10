import { ClipboardList, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiRequest } from '../services/apiClient';
import { formatActionLabel, formatDateTime } from '../utils/formatters';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patientFilter, setPatientFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (patientFilter.trim()) params.set('patientId', patientFilter.trim());
      if (actionFilter) params.set('action', actionFilter);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/logs${q}`);
      setLogs(res.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientFilter, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <DashboardLayout title="Access & Audit Activity Logs">
      <div className="space-y-6">
        <div className="card p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Patient ID</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  placeholder="e.g. DEMO-ABHA-1001"
                  className="input-field pl-8 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="input-field text-xs"
              >
                <option value="">All Actions</option>
                <option value="PATIENT_SEARCH">Patient Search</option>
                <option value="RECORDS_FETCHED">Records Fetched</option>
                <option value="HOSPITAL_REGISTERED">Hospital Registered</option>
                <option value="HOSPITAL_UPDATED">Hospital Updated</option>
                <option value="HOSPITAL_STATUS_CHANGED">Hospital Status Changed</option>
                <option value="USER_LOGIN">User Login</option>
              </select>
            </div>
          </div>

          <button type="button" onClick={loadLogs} className="btn-secondary text-xs shrink-0">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Logs
          </button>
        </div>

        {loading && <LoadingSpinner label="Loading platform audit logs..." />}
        {error && !loading && (
          <div className="card p-5 border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>
        )}

        {!loading && !error && logs.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No audit events match your filters"
            description="Clear filters or perform a patient search / record retrieval."
          />
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Doctor / Actor</th>
                    <th className="py-3 px-4 font-semibold">Patient ID</th>
                    <th className="py-3 px-4 font-semibold">Hospital Source</th>
                    <th className="py-3 px-4 font-semibold">Action Performed</th>
                    <th className="py-3 px-4 font-semibold">Event Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-blue-700">{log.patientId}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-[200px]">{log.hospitalSource}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatActionLabel(log.action)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

