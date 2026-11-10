import { Building2, Mail, Save, Shield, Stethoscope, UserCheck } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import { formatDateTime } from '../utils/formatters';

export default function DoctorProfilePage() {
  const { user, refreshProfile, addToast, systemInfo } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    medicalLicenseId: user?.medicalLicenseId || '',
    specialization: user?.specialization || '',
    hospitalAffiliation: user?.hospitalAffiliation || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/auth/me', {
        method: 'PUT',
        body: form
      });
      await refreshProfile();
      addToast('Profile details saved successfully.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="User Profile & Credentials">
      <div className="max-w-3xl space-y-6">
        <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
              {(user?.name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </span>
                <span className="inline-flex items-center gap-1 capitalize font-semibold text-blue-700">
                  <Shield className="h-3.5 w-3.5" /> {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 sm:text-right">
            <div>Auth Provider: {systemInfo.mode === 'firebase' ? 'Firebase Auth' : 'Local Demo Mode'}</div>
            <div className="mt-0.5">Joined: {formatDateTime(user?.createdAt)}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            Edit Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration / License ID
              </label>
              <input
                value={form.medicalLicenseId}
                onChange={(e) => setForm((p) => ({ ...p, medicalLicenseId: e.target.value }))}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5 text-slate-400" /> Specialization
                </span>
              </label>
              <input
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Hospital Affiliation
                </span>
              </label>
              <input
                value={form.hospitalAffiliation}
                onChange={(e) => setForm((p) => ({ ...p, hospitalAffiliation: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

