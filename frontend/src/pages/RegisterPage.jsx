import { Activity, AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, systemInfo } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    medicalLicenseId: '',
    specialization: 'Internal Medicine',
    hospitalAffiliation: 'Sunrise Multispeciality Hospital',
    phone: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full card p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create Platform Account</h1>
              <p className="text-xs text-slate-500">
                Mode: {systemInfo.mode === 'firebase' ? 'Firebase Authentication' : 'Local Demo Mode'}
              </p>
            </div>
          </div>
          <Link to="/login" className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: 'doctor' }))}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    form.role === 'doctor'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Doctor</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Search patients & fetch records</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: 'hospital_admin' }))}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    form.role === 'hospital_admin'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">Hospital Admin</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Manage hospitals & API nodes</div>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Sneha Deshpande"
                className="input-field"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="sneha@hospital-demo.org"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="medicalLicenseId" className="block text-xs font-semibold text-slate-700 mb-1">
                {form.role === 'doctor' ? 'Medical Registration ID (Demo)' : 'Admin Employee ID (Demo)'}
              </label>
              <input
                id="medicalLicenseId"
                name="medicalLicenseId"
                value={form.medicalLicenseId}
                onChange={handleChange}
                placeholder="DEMO-MCI-2026-001"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="hospitalAffiliation" className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital Affiliation
              </label>
              <input
                id="hospitalAffiliation"
                name="hospitalAffiliation"
                value={form.hospitalAffiliation}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 mt-2">
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

