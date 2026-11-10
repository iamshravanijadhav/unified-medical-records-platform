import {
  Activity,
  ArrowRight,
  Building2,
  FileSearch,
  Files,
  FolderClock,
  Search,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import { formatActionLabel, formatDateTime } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickAbhaId, setQuickAbhaId] = useState('');

  useEffect(() => {
    apiRequest('/dashboard/summary')
      .then((res) => setSummary(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const cleaned = quickAbhaId.trim().toUpperCase();
    if (!cleaned) return;
    navigate(`/patients/search?q=${encodeURIComponent(cleaned)}`);
  };

  return (
    <DashboardLayout title="Clinical Overview Dashboard">
      {loading && <LoadingSpinner label="Loading platform dashboard metrics..." />}

      {error && !loading && (
        <div className="card p-5 border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>
      )}

      {summary && !loading && (
        <div className="space-y-6">
          {/* Welcome + Quick ABHA Search */}
          <div className="card p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white border-none">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Demo Exchange Overview • {user?.role === 'hospital_admin' ? 'Hospital Admin View' : 'Clinician View'}
                </div>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold">Welcome, {user?.name}</h2>
                <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                  Search any patient using their fictional ABHA-style ID to inspect hospital record availability and retrieve unified clinical history across connected hospitals.
                </p>
              </div>

              <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[380px]">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={quickAbhaId}
                    onChange={(e) => setQuickAbhaId(e.target.value)}
                    placeholder="Enter ID (e.g. DEMO-ABHA-1001)"
                    className="w-full rounded-lg bg-white/10 border border-white/20 pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-300 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 px-4 py-2 text-sm font-semibold text-white transition-colors shrink-0"
                >
                  Quick Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Patients Searched (Demo)
                </span>
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">
                {summary.kpis.totalPatientsSearched}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  / {summary.kpis.totalDemoPatients} sample patients
                </span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Connected Hospitals
                </span>
                <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">
                {summary.kpis.totalConnectedHospitals}
                <span className="ml-2 text-xs font-medium text-teal-600">
                  ({summary.kpis.totalOnlineHospitals} online)
                </span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Available Demo Records
                </span>
                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Files className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">
                {summary.kpis.totalAvailableRecords}
                <span className="ml-2 text-xs font-normal text-slate-500">across all nodes</span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Record Retrievals
                </span>
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FolderClock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">
                {summary.kpis.totalRecordRetrievals}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  combined fetches logged
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Charts + Recent Searches */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Records by Category */}
            <div className="lg:col-span-7 card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Synthetic Records by Category</h3>
                  <p className="text-xs text-slate-500">Distribution across 8 clinical document types (Demo)</p>
                </div>
                <Link to="/records" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Open Timeline →
                </Link>
              </div>
              <div className="space-y-3">
                {summary.recordsByCategory.map((item) => {
                  const pct = Math.round((item.count / Math.max(summary.kpis.totalAvailableRecords, 1)) * 100);
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{item.category}</span>
                        <span className="text-slate-500">{item.count} record(s)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(pct, 6)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Patient Searches */}
            <div className="lg:col-span-5 card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Patient Searches</h3>
                  <p className="text-xs text-slate-500">Quick jump back to recent lookups</p>
                </div>
                <Link to="/patients/search" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Search New →
                </Link>
              </div>

              {summary.recentSearches.length === 0 ? (
                <EmptyState
                  icon={FileSearch}
                  title="No searches recorded yet"
                  description="Search for DEMO-ABHA-1001 to start exploring."
                />
              ) : (
                <div className="space-y-2.5 flex-1">
                  {summary.recentSearches.map((item) => (
                    <button
                      key={item.patientId}
                      type="button"
                      onClick={() => navigate(`/patients/${item.patientId}`)}
                      className="w-full text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 p-3 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-semibold text-blue-700">{item.patientId}</div>
                        <div className="text-sm font-medium text-slate-900 truncate">{item.patientName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{formatDateTime(item.timestamp)}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {item.reportCount ?? 0} reports
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {item.hospitalCount ?? 0} hospital(s)
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hospital Node Status + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Connected Hospital APIs</h3>
                <Link to="/hospitals" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Manage →
                </Link>
              </div>
              <div className="space-y-2.5">
                {summary.hospitals.map((h) => (
                  <div
                    key={h.hospitalId}
                    className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{h.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">{h.apiEndpoint}</div>
                    </div>
                    <StatusBadge status={!h.isEnabled ? 'disabled' : h.systemStatus} />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Record Retrieval & Audit Activity</h3>
                </div>
                <Link to="/logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Full Audit Log →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-2.5 font-semibold">Action</th>
                      <th className="pb-2.5 font-semibold">Patient ID</th>
                      <th className="pb-2.5 font-semibold">Source</th>
                      <th className="pb-2.5 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.recentActivity.map((log) => (
                      <tr key={log.logId}>
                        <td className="py-2.5 pr-3 font-medium text-slate-900">
                          {formatActionLabel(log.action)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-blue-700">{log.patientId}</td>
                        <td className="py-2.5 pr-3 text-slate-600 max-w-[220px] truncate">{log.hospitalSource}</td>
                        <td className="py-2.5 text-slate-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <Link to="/patients/search" className="btn-primary text-xs py-1.5">
                  <FileSearch className="h-3.5 w-3.5" />
                  Search Patient
                </Link>
                <Link to="/records" className="btn-secondary text-xs py-1.5">
                  <FolderClock className="h-3.5 w-3.5" />
                  Fetch Medical Timeline
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

