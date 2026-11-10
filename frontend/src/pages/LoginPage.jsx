import { Activity, AlertCircle, Building2, Lock, Mail, ShieldCheck, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

export default function LoginPage() {
  const { user, login, systemInfo, recheckSystem } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    apiRequest('/auth/demo-info', { skipAuth: true })
      .then((res) => setDemoAccounts(res.demoAccounts || []))
      .catch(() => setDemoAccounts([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword(role === 'hospital_admin' ? 'DemoAdmin@123' : 'DemoDoctor@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Informational Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Activity className="h-4 w-4" />
            Unified Medical Records Access Platform (MVP)
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Connected Clinical History Across Hospitals
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Authorized clinicians search by fictional ABHA-style IDs, query connected demo hospital APIs, and aggregate blood reports, X-rays, MRIs, prescriptions, and discharge summaries in one unified timeline.
          </p>

          <div className="card p-4 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                System Authentication Status
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  !systemInfo.backendConnected
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : systemInfo.mode === 'firebase'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {!systemInfo.backendConnected
                  ? 'Backend Offline'
                  : systemInfo.mode === 'firebase'
                  ? 'Firebase Auth Active'
                  : 'Local Demo Mode Active'}
              </span>
            </div>
            <p className="text-xs text-slate-600">{systemInfo.modeDescription}</p>
            {!systemInfo.backendConnected && (
              <button
                type="button"
                onClick={recheckSystem}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Retry Backend Connection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl p-3.5">
              <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">Role-Based Auth & Audit</div>
                <div className="mt-0.5">Authenticated doctor/admin access with full activity logging.</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl p-3.5">
              <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">3 Demo Hospital APIs</div>
                <div className="mt-0.5">Sunrise, CityCare & Aarogya Diagnostic endpoints.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-6">
          <div className="card p-6 sm:p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Sign In to Platform</h2>
              <p className="mt-1 text-sm text-slate-500">
                Access as a Doctor or Hospital Administrator
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@unifiedhealth.demo"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Quick-Fill Section (visible only when Local Demo Mode reports demo accounts) */}
            {demoAccounts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-2.5">
                  Quick-Fill Demo Accounts (Local Demo Mode):
                </div>
                <div className="space-y-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemoAccount(acc.email, acc.role)}
                      className="w-full text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 px-3 py-2 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                          {acc.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                      </div>
                      <span className="text-[11px] font-medium text-blue-600 shrink-0">Use</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-slate-600">
              Need a new doctor or hospital admin account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

