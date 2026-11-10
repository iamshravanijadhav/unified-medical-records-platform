import {
  AlertCircle,
  ArrowRight,
  Building2,
  FileSearch,
  FolderClock,
  Search,
  User
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

const SAMPLE_IDS = [
  { id: 'DEMO-ABHA-1001', label: 'Aarav Kulkarni (3 Hospitals, 6 Reports)' },
  { id: 'DEMO-ABHA-1002', label: 'Priya Nair (2 Hospitals, 4 Reports)' },
  { id: 'DEMO-ABHA-1003', label: 'Rohan Deshmukh (2 Hospitals, 4 Reports)' },
  { id: 'DEMO-ABHA-1004', label: 'Meera Iyer (2 Hospitals, 3 Reports)' },
  { id: 'DEMO-ABHA-1005', label: 'Vikram Joshi (3 Hospitals, 3 Reports)' }
];

export default function PatientSearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = (searchParams.get('q') || '').trim().toUpperCase();

  const [query, setQuery] = useState(qParam);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  useEffect(() => {
    apiRequest('/patients')
      .then((res) => setAllPatients(res.patients || []))
      .catch(() => { })
      .finally(() => setLoadingDirectory(false));
  }, []);

  const executeSearch = useCallback(async (targetId) => {
    const cleaned = String(targetId || '').trim().toUpperCase();
    if (!cleaned) {
      setSearchError('Please enter a fictional ABHA-style ID (e.g., DEMO-ABHA-1001).');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await apiRequest(`/patients/${encodeURIComponent(cleaned)}?logSearch=true`);
      setSearchResult(res);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (qParam) {
      setQuery(qParam);
      executeSearch(qParam);
    }
  }, [qParam, executeSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = query.trim().toUpperCase();
    if (!cleaned) {
      setSearchError('Please enter a fictional ABHA-style ID (e.g., DEMO-ABHA-1001).');
      return;
    }
    if (cleaned === qParam) {
      executeSearch(cleaned);
    } else {
      setSearchParams({ q: cleaned });
    }
  };

  return (
    <DashboardLayout title="Patient Search & Discovery">
      <div className="space-y-6">
        {/* Search Card */}
        <div className="card p-5 sm:p-6">
          <div className="max-w-3xl">
            <h2 className="text-base font-bold text-slate-900">Search Patient by Fictional ABHA-Style ID</h2>
            <p className="mt-1 text-xs text-slate-500">
              Query the synthetic patient discovery index to inspect which connected hospitals hold matching records, then retrieve all available reports in one timeline.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter fictional ID e.g. DEMO-ABHA-1001"
                  className="input-field pl-10 font-mono uppercase"
                />
              </div>
              <button type="submit" disabled={searching} className="btn-primary px-5">
                <FileSearch className="h-4 w-4" />
                {searching ? 'Searching...' : 'Search Patient'}
              </button>
            </form>

            {/* Quick Click Sample IDs */}
            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Quick Sample Patient IDs (Demo):
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.id);
                      if (item.id === qParam) {
                        executeSearch(item.id);
                      } else {
                        setSearchParams({ q: item.id });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors"
                    title={item.label}
                  >
                    <span className="font-mono text-blue-700">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading or Error */}
        {searching && <LoadingSpinner label="Searching connected patient registry..." />}

        {searchError && !searching && (
          <div className="card p-5 border-rose-200 bg-rose-50 flex items-start gap-3 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Patient Lookup Failed</div>
              <div className="mt-0.5 text-xs">{searchError}</div>
            </div>
          </div>
        )}

        {/* Search Result Details */}
        {searchResult && !searching && (
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {searchResult.patient.patientId}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        DEMO SYNTHETIC PATIENT
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-slate-900">
                      {searchResult.patient.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {searchResult.patient.age} yrs • {searchResult.patient.gender} • Blood Group{' '}
                      <strong className="text-slate-700">{searchResult.patient.bloodGroup}</strong> •{' '}
                      {searchResult.patient.city}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/patients/${searchResult.patient.patientId}`)}
                    className="btn-secondary text-xs"
                  >
                    View Patient Profile
                  </button>

                  {user?.role === 'doctor' && (
                    <button
                      type="button"
                      onClick={() => navigate(`/records/${searchResult.patient.patientId}`)}
                      className="btn-primary text-xs"
                    >
                      <FolderClock className="h-4 w-4" />
                      Fetch & View Combined Records ({searchResult.totalAvailableReports})
                    </button>
                  )}
                </div>
              </div>

              {/* Hospitals Holding Records */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Hospitals Holding Matching Records ({searchResult.totalAvailableReports} Total Reports)
                </h4>

                {searchResult.availableHospitals.length === 0 ? (
                  <EmptyState
                    title="No hospital records indexed"
                    description="No connected hospitals currently hold records for this demo patient."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {searchResult.availableHospitals.map((h) => (
                      <div key={h.hospitalId} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {h.hospitalName}
                            </div>
                          </div>
                          <StatusBadge status={!h.isEnabled ? 'disabled' : h.systemStatus} />
                        </div>

                        <div className="text-xs text-slate-500">{h.location}</div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-slate-600">Available Reports:</span>
                          <span className="font-bold text-slate-900">{h.availableRecordCount}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {h.reportCategories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-700"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Directory of Synthetic Demo Patients */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Synthetic Demo Patient Directory</h3>
          <p className="text-xs text-slate-500 mb-4">
            Click any fictional patient below to inspect available hospitals and retrieve combined clinical records.
          </p>

          {loadingDirectory ? (
            <LoadingSpinner label="Loading demo patients..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2.5 font-semibold">ABHA-Style ID</th>
                    <th className="pb-2.5 font-semibold">Patient Name (Demo)</th>
                    <th className="pb-2.5 font-semibold">Demographics</th>
                    <th className="pb-2.5 font-semibold">Connected Sources</th>
                    <th className="pb-2.5 font-semibold">Reports</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allPatients.map((p) => (
                    <tr key={p.patientId} className="hover:bg-slate-50">
                      <td className="py-3 pr-3 font-mono font-semibold text-blue-700">{p.patientId}</td>
                      <td className="py-3 pr-3 font-medium text-slate-900">{p.fullName}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        {p.age}y / {p.gender} / {p.bloodGroup}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{p.hospitals.join(', ')}</td>
                      <td className="py-3 pr-3 font-semibold text-slate-900">{p.totalRecordsAvailable}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(p.patientId);
                            if (p.patientId === qParam) {
                              executeSearch(p.patientId);
                            } else {
                              setSearchParams({ q: p.patientId });
                            }
                          }}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Select
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
