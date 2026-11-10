import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import ToastContainer from './components/common/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import ActivityLogsPage from './pages/ActivityLogsPage';
import DashboardPage from './pages/DashboardPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import HospitalManagementPage from './pages/HospitalManagementPage';
import LoginPage from './pages/LoginPage';
import MedicalRecordsTimelinePage from './pages/MedicalRecordsTimelinePage';
import NotFoundPage from './pages/NotFoundPage';
import PatientProfilePage from './pages/PatientProfilePage';
import PatientSearchPage from './pages/PatientSearchPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/search"
            element={
              <ProtectedRoute>
                <PatientSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:patientId"
            element={
              <ProtectedRoute>
                <PatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <MedicalRecordsTimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records/:patientId"
            element={
              <ProtectedRoute>
                <MedicalRecordsTimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <HospitalManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <ActivityLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

