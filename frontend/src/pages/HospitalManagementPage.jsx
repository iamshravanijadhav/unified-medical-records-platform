import {
  Building2,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Power,
  Server,
  ShieldAlert,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import { formatDate, formatDateTime } from '../utils/formatters';

export default function HospitalManagementPage() {
  const { user, addToast } = useAuth();
  const isAdmin = user?.role === 'hospital_admin';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [sharedRecordsModal, setSharedRecordsModal] = useState(null);

  const [formState, setFormState] = useState({
    name: '',
    location: '',
    specialties: '',
    contactEmail: ''
  });
  const [saving, setSaving] = useState(false);

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/hospitals');
      setHospitals(res.hospitals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const openRegister = () => {
    setFormState({ name: '', location: '', specialties: '', contactEmail: '' });
    setShowRegisterModal(true);
  };

  const openEdit = (h) => {
    setFormState({
      name: h.name,
      location: h.location,
      specialties: (h.specialties || []).join(', '),
      contactEmail: h.contactEmail || ''
    });
    setEditingHospital(h);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.location.trim()) {
      addToast('Hospital name and location are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiRequest('/hospitals', { method: 'POST', body: formState });
      addToast('Demo hospital registered successfully.', 'success');
      setShowRegisterModal(false);
      await loadHospitals();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingHospital) return;
    setSaving(true);
    try {
      await apiRequest(`/hospitals/${editingHospital.hospitalId}`, {
        method: 'PUT',
        body: formState
      });
      addToast('Hospital details updated.', 'success');
      setEditingHospital(null);
      await loadHospitals();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (hospital, updates) => {
    try {
      await apiRequest(`/hospitals/${hospital.hospitalId}/status`, {
        method: 'PATCH',
        body: updates
      });
      addToast(`Updated ${hospital.name} status.`, 'success');
      await loadHospitals();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleViewShared = async (hospital) => {
    try {
      const res = await apiRequest(`/hospitals/${hospital.hospitalId}/shared-records`);
      setSharedRecordsModal(res);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <DashboardLayout title="Hospital Network & API Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Connected Demo Hospital Nodes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each hospital operates an independent REST API endpoint consumed by the central retrieval engine.
            </p>
          </div>

          {isAdmin && (
            <button type="button" onClick={openRegister} className="btn-primary text-xs self-start">
              <Plus className="h-4 w-4" />
              Register New Hospital
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Role-Based Access Control (Read-Only View):</strong> You are signed in as a <strong>Doctor</strong>. Doctors can inspect live hospital endpoint statuses and shared record inventories. To register hospitals, edit details, disable connections, or simulate hospital outages, sign in as the <strong>Demo Hospital Administrator</strong> (<code>admin@unifiedhealth.demo</code>).
            </span>
          </div>
        )}

        {loading && <LoadingSpinner label="Loading connected hospital registry..." />}
        {error && !loading && (
          <div className="card p-5 border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {hospitals.map((h) => (
              <div key={h.hospitalId} className="card p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {h.hospitalId}
                          </span>
                          <StatusBadge status={h.isEnabled ? 'enabled' : 'disabled'} />
                          <StatusBadge status={h.systemStatus} />
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-slate-900">{h.name}</h3>
                        <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {h.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-blue-600" />
                        Demo API Endpoint:
                      </span>
                      <span className="font-mono text-[11px] text-slate-800">{h.apiEndpoint}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Indexed Synthetic Records:</span>
                      <span className="font-bold text-slate-900">{h.recordsCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Logged Exchange Retrievals:</span>
                      <span className="font-semibold text-teal-700">{h.sharedEventsCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(h.specialties || []).map((sp) => (
                      <span
                        key={sp}
                        className="px-2 py-0.5 rounded bg-blue-50/70 border border-blue-100 text-[11px] font-medium text-blue-800"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewShared(h)}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Shared Records
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(h)}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusToggle(h, { isEnabled: !h.isEnabled })}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          h.isEnabled
                            ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {h.isEnabled ? 'Disable Link' : 'Enable Link'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusToggle(h, {
                            systemStatus: h.systemStatus === 'online' ? 'offline' : 'online'
                          })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          h.systemStatus === 'online'
                            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
                        }`}
                      >
                        {h.systemStatus === 'online' ? (
                          <>
                            <WifiOff className="h-3.5 w-3.5" />
                            Simulate Outage
                          </>
                        ) : (
                          <>
                            <Wifi className="h-3.5 w-3.5" />
                            Bring Online
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register / Edit Modal */}
      {(showRegisterModal || editingHospital) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingHospital ? 'Edit Hospital Details' : 'Register New Demo Hospital'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setEditingHospital(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={editingHospital ? handleEditSubmit : handleRegisterSubmit}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name *</label>
                <input
                  value={formState.name}
                  onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Lifecare Multispeciality Hospital"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  value={formState.location}
                  onChange={(e) => setFormState((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Koramangala, Bengaluru"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialties (comma-separated)
                </label>
                <input
                  value={formState.specialties}
                  onChange={(e) => setFormState((p) => ({ ...p, specialties: e.target.value }))}
                  placeholder="Cardiology, Radiology, Pathology"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gateway Contact Email</label>
                <input
                  type="email"
                  value={formState.contactEmail}
                  onChange={(e) => setFormState((p) => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="api@hospital-demo.health"
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setEditingHospital(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? 'Saving...' : editingHospital ? 'Save Changes' : 'Register Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Records View Modal */}
      {sharedRecordsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {sharedRecordsModal.hospital.name} — Shared Records Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  {sharedRecordsModal.totalSharedRecords} synthetic record(s) exposed via {sharedRecordsModal.hospital.apiEndpoint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSharedRecordsModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Indexed Synthetic Records
                </h4>
                {sharedRecordsModal.sharedRecords.length === 0 ? (
                  <p className="text-xs text-slate-500">No synthetic records hosted at this node yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sharedRecordsModal.sharedRecords.map((rec) => (
                      <div
                        key={rec.recordId}
                        className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{rec.title}</div>
                          <div className="text-slate-500 mt-0.5">
                            Patient: <span className="font-mono text-blue-700">{rec.patientId}</span> •{' '}
                            {rec.category} • {formatDate(rec.reportDate)}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          {rec.recordId}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recent Share Events
                </h4>
                {sharedRecordsModal.recentShareActivity.length === 0 ? (
                  <p className="text-xs text-slate-500">No exchange retrieval events recorded yet.</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {sharedRecordsModal.recentShareActivity.map((log) => (
                      <div key={log.logId} className="rounded bg-slate-50 px-3 py-2 flex justify-between gap-2">
                        <span className="text-slate-700">{log.summary}</span>
                        <span className="text-slate-500 shrink-0">{formatDateTime(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

