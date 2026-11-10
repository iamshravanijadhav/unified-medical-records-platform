import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Droplets,
  FolderClock,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

export default function PatientProfilePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPatient = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/patients/${encodeURIComponent(patientId)}?logSearch=false`);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  return (
    <DashboardLayout title={`Patient Profile • ${patientId}`}>
      <div className="space-y-6">
        <Link
          to="/patients/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Patient Search
        </Link>

        {loading && <LoadingSpinner label="Loading synthetic patient profile..." />}

        {error && !loading && (
          <div className="card p-5 border-rose-200 bg-rose-50 text-sm text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Demographics Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card p-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {data.patient.patientId}
                    </span>
                    <h2 className="mt-1.5 text-xl font-bold text-slate-900">{data.patient.fullName}</h2>
                    <p className="text-xs text-slate-500">Synthetic Demo Patient Record</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-500">Age / Gender</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {data.patient.age} yrs / {data.patient.gender}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-500 flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-rose-500" /> Blood Group
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">{data.patient.bloodGroup}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-500" /> City
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">{data.patient.city}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-teal-600" /> Contact (Masked)
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">{data.patient.phoneMasked}</div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Clinical Tag (Demo): </span>
                  {data.patient.emergencyNote}
                </div>
              </div>

              {/* Unified Record Retrieval Action Card */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderClock className="h-4 w-4 text-blue-600" />
                    Unified Record Retrieval
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {data.totalAvailableReports} Reports Available
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Query connected demo hospital APIs to retrieve, normalize, and combine all available reports into a single chronological medical timeline. Retrieval activity is logged automatically.
                </p>

                {user?.role === 'doctor' ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/records/${data.patient.patientId}`)}
                    className="btn-primary w-full"
                  >
                    <FolderClock className="h-4 w-4" />
                    Fetch & Open Combined Medical Records
                  </button>
                ) : (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                    Clinical record retrieval is restricted to accounts with the <strong>Doctor</strong> role.
                  </div>
                )}

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-500">
                  <strong>Demo Note:</strong> This educational MVP uses synthetic data without patient authorization workflows; production hospital deployment requires applicable patient authorization, privacy safeguards, and ABDM-compatible integration.
                </div>
              </div>
            </div>

            {/* Hospital Availability Breakdown */}
            <div className="lg:col-span-7 card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connected Hospital Coverage</h3>
                  <p className="text-xs text-slate-500">
                    {data.totalAvailableReports} synthetic records discovered across {data.availableHospitals.length} hospital source(s)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {data.availableHospitals.map((h) => (
                  <div
                    key={h.hospitalId}
                    className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm text-slate-900">{h.hospitalName}</span>
                        <StatusBadge status={!h.isEnabled ? 'disabled' : h.systemStatus} />
                      </div>
                      <div className="text-xs text-slate-500">{h.location}</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {h.reportCategories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-2xl font-bold text-slate-900">{h.availableRecordCount}</div>
                      <div className="text-[11px] text-slate-500">available report(s)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

