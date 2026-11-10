import {
  Activity,
  Building2,
  ClipboardList,
  FileSearch,
  FolderClock,
  LayoutDashboard,
  Settings,
  UserCheck,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user, systemInfo } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients/search', label: 'Patient Search', icon: FileSearch },
    { to: '/records', label: 'Medical Records', icon: FolderClock },
    { to: '/hospitals', label: 'Hospital Network', icon: Building2 },
    { to: '/logs', label: 'Access & Activity Logs', icon: ClipboardList },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
    { to: '/settings', label: 'Settings & Diagnostics', icon: Settings }
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-white">MedAccess</div>
              <div className="text-[11px] text-slate-400">Unified Records MVP</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="rounded-lg bg-slate-800/80 border border-slate-700/70 px-3 py-2 text-xs">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              Signed In Role
            </div>
            <div className="mt-0.5 font-medium text-white flex items-center justify-between">
              <span>{user?.role === 'hospital_admin' ? 'Hospital Admin' : 'Doctor'}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  systemInfo.mode === 'firebase'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {systemInfo.mode === 'firebase' ? 'Firebase' : 'Demo Mode'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="font-medium text-slate-300">College MVP Exchange Layer</div>
          <div className="mt-0.5">Synthetic data & fictional ABHA IDs only.</div>
        </div>
      </aside>
    </>
  );
}

