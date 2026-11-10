import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FolderClock,
  Layers,
  RefreshCw,
  Search,
  ServerCrash,
  User
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import RecordCard from '../components/records/RecordCard';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import { formatDate, formatDateTime, RECORD_CATEGORIES } from '../utils/formatters';

export default function MedicalRecordsTimelinePage() {
  const { patientId: routePatientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState(routePatientId || 'DEMO-ABHA-1001');
  const [patients, setPatients] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [viewMode, setViewMode] = useState('timeline'); // timeline | hospital | type
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    apiRequest('/patients')
      .then((res) => setPatients(res.patients || []))
      .catch(() => {});
  }, []);

  const runFetch = useCallback(
    async (targetId) => {
      const cleaned = String(targetId || '').trim().toUpperCase();
      if (!cleaned) return;
      if (user?.role !== 'doctor') {
        setFetchError({
          code: 'FORBIDDEN_ROLE',
          message: 'Only Doctor accounts can fetch combined clinical records.'
        });
        return;
      }

      setFetching(true);
      setFetchError(null);
      try {
        const res = await apiRequest('/records/fetch', {
          method: 'POST',
          body: {
            patientId: cleaned
          }
        });
        setResult(res);
      } catch (err) {
        setResult(null);
        setFetchError({
          code: err.code,
          message: err.message
        });
      } finally {
        setFetching(false);
      }
    },
    [user?.role]
  );

  useEffect(() => {
    if (routePatientId) {
      setSelectedPatientId(routePatientId.toUpperCase());
      runFetch(routePatientId);
    }
  }, [routePatientId, runFetch]);

  const handleFetchClick = (e) => {
    e.preventDefault();
    const cleaned = selectedPatientId.trim().toUpperCase();
    if (!cleaned) return;
    if (routePatientId !== cleaned) {
      navigate(`/records/${cleaned}`);
    } else {
      runFetch(cleaned);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!result?.records) return [];
    return result.records.filter((r) => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (hospitalFilter !== 'ALL' && r.hospitalName !== hospitalFilter) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const match =
          r.title.toLowerCase().includes(q) ||
          r.doctorName?.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.hospitalName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [result, categoryFilter, hospitalFilter, searchText]);

  const groupedByHospital = useMemo(() => {
    const groups = {};
    for (const r of filteredRecords) {
      if (!groups[r.hospitalName]) groups[r.hospitalName] = [];
      groups[r.hospitalName].push(r);
    }
    return Object.entries(groups);
  }, [filteredRecords]);

  const groupedByType = useMemo(() => {
    const groups = {};
    for (const r of filteredRecords) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }
    return Object.entries(groups);
  }, [filteredRecords]);

  const availableHospitalNames = useMemo(() => {
    if (!result?.records) return [];
    return [...new Set(result.records.map((r) => r.hospitalName))];
  }, [result]);

  return (
    <DashboardLayout title="Medical Records Retrieval & Timeline">
      <div className="space-y-6">
        {/* Patient Selector & Fetch Trigger */}
        <div className="card p-5">
          <form onSubmit={handleFetchClick} className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select or Enter Patient ABHA-Style ID to Retrieve Across Connected Hospitals
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={patients.some((p) => p.patientId === selectedPatientId) ? selectedPatientId : ''}
                  onChange={(e) => {
                    if (e.target.value) setSelectedPatientId(e.target.value);
                  }}
                  className="input-field sm:w-64"
                >
                  <option value="">Quick choose demo patient...</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.patientId} — {p.fullName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  placeholder="DEMO-ABHA-1001"
                  className="input-field font-mono uppercase flex-1"
                />
              </div>
            </div>
            <button type="submit" disabled={fetching} className="btn-primary px-5 shrink-0">
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'Fetching Hospital APIs...' : 'Fetch Combined Records'}
            </button>
          </form>
        </div>

        {fetching && <LoadingSpinner label="Contacting connected hospital REST APIs & merging history..." />}

        {/* Error State */}
        {fetchError && !fetching && (
          <div className="card p-6 border-rose-200 bg-rose-50/70 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Unable to Retrieve Medical Records</h3>
                <p className="text-xs text-slate-700 mt-1">{fetchError.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Successful Retrieval Results */}
        {result && !fetching && (
          <div className="space-y-6">
            {/* Patient Banner */}
            <div className="card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {result.patient.patientId}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      Combined Multi-Hospital Timeline
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{result.patient.fullName}</h2>
                  <p className="text-xs text-slate-500">
                    {result.patient.age} yrs • {result.patient.gender} • Blood Group {result.patient.bloodGroup} •{' '}
                    Retrieved at {formatDateTime(result.summary.retrievedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{result.summary.totalRecords}</div>
                  <div className="text-[11px] text-slate-500">Total Reports</div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-teal-50 border border-teal-200">
                  <div className="text-lg font-bold text-teal-700">
                    {result.summary.successfulHospitals.length}
                  </div>
                  <div className="text-[11px] text-teal-700">Online Sources</div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="text-lg font-bold text-rose-700">
                    {result.summary.unavailableHospitals.length}
                  </div>
                  <div className="text-[11px] text-rose-700">Unavailable</div>
                </div>
              </div>
            </div>

            {/* Hospital API Retrieval Breakdown (Module 5 Requirement) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Successful Hospitals */}
              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Successful Hospital API Responses ({result.summary.successfulHospitals.length})
                </h3>
                {result.summary.successfulHospitals.length === 0 ? (
                  <p className="text-xs text-slate-500">No hospital endpoints responded successfully.</p>
                ) : (
                  <div className="space-y-2">
                    {result.summary.successfulHospitals.map((h) => (
                      <div
                        key={h.hospitalId}
                        className="rounded-lg bg-teal-50/50 border border-teal-200 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{h.hospitalName}</div>
                          <div className="font-mono text-[11px] text-slate-500 truncate">{h.endpoint}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-teal-700">{h.recordsRetrieved} record(s)</div>
                          <div className="text-[11px] text-slate-500">{h.latencyMs}ms</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unavailable / Disabled Hospitals */}
              <div className="card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ServerCrash className="h-4 w-4" />
                  Unavailable / Disabled Hospitals ({result.summary.unavailableHospitals.length})
                </h3>
                {result.summary.unavailableHospitals.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-3 text-xs text-slate-600">
                    All connected hospital APIs responded normally.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.summary.unavailableHospitals.map((h) => (
                      <div
                        key={h.hospitalId}
                        className="rounded-lg bg-rose-50/70 border border-rose-200 px-3 py-2 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{h.hospitalName}</span>
                          <StatusBadge status={h.status} />
                        </div>
                        <div className="text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{h.errorMessage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* View Switcher & Filters */}
            <div className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    viewMode === 'timeline' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Chronological Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('hospital')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    viewMode === 'hospital' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  By Hospital
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('type')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    viewMode === 'type' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  By Report Type
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Filter reports..."
                    className="input-field pl-8 py-1.5 text-xs w-44"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-field py-1.5 text-xs w-44"
                >
                  <option value="ALL">All Categories</option>
                  {RECORD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="input-field py-1.5 text-xs w-48"
                >
                  <option value="ALL">All Hospitals</option>
                  {availableHospitalNames.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Records List / Views */}
            {filteredRecords.length === 0 ? (
              <EmptyState
                icon={FolderClock}
                title="No matching records to display"
                description="Try clearing filters or check whether connected hospitals are online."
              />
            ) : viewMode === 'timeline' ? (
              <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
                {filteredRecords.map((rec) => (
                  <div key={rec.recordId} className="relative">
                    <div className="absolute -left-6 sm:-left-8 top-5 h-5 w-5 rounded-full bg-white border-4 border-blue-600 shadow-sm" />
                    <div className="mb-1 text-xs font-semibold text-blue-700">
                      {formatDate(rec.reportDate)} • {rec.hospitalName}
                    </div>
                    <RecordCard record={rec} />
                  </div>
                ))}
              </div>
            ) : viewMode === 'hospital' ? (
              <div className="space-y-6">
                {groupedByHospital.map(([hospName, recs]) => (
                  <div key={hospName} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        {hospName} ({recs.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {recs.map((rec) => (
                        <RecordCard key={rec.recordId} record={rec} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {groupedByType.map(([catName, recs]) => (
                  <div key={catName} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        {catName} ({recs.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {recs.map((rec) => (
                        <RecordCard key={rec.recordId} record={rec} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

