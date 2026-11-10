import { LogOut, Menu, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onOpenSidebar, title }) {
  const { user, logout, systemInfo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
          {title || 'Unified Medical Records Access Platform'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            systemInfo.mode === 'firebase'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          {systemInfo.mode === 'firebase' ? 'Firebase Connected' : 'Local Demo Mode'}
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="hidden sm:flex items-center gap-2.5 text-left rounded-lg px-2 py-1 hover:bg-slate-100"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {(user?.name || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-slate-900 max-w-[160px] truncate">
              {user?.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {user?.role === 'hospital_admin' ? 'Hospital Admin' : 'Doctor'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

