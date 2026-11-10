import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { firebaseAuth, isFirebaseClientConfigured } from '../config/firebase';
import { apiRequest, getStoredDemoToken, setStoredDemoToken } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [systemInfo, setSystemInfo] = useState({
    mode: 'local-demo',
    firebaseConfigured: false,
    backendConnected: true,
    modeDescription: 'Checking backend connection...'
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkHealthAndSession = useCallback(async () => {
    try {
      const health = await apiRequest('/health', { skipAuth: true });
      setSystemInfo({
        mode: health.mode,
        firebaseConfigured: Boolean(health.firebaseConfigured),
        backendConnected: true,
        modeDescription: health.modeDescription || ''
      });

      if (health.mode === 'firebase' && isFirebaseClientConfigured && firebaseAuth) {
        return; // Firebase auth listener handles session
      }

      const token = getStoredDemoToken();
      if (token) {
        try {
          const me = await apiRequest('/auth/me');
          setUser(me.user);
        } catch {
          setStoredDemoToken('');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setSystemInfo((prev) => ({
        ...prev,
        backendConnected: false,
        modeDescription: err.message
      }));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFirebaseClientConfigured && firebaseAuth) {
      const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        try {
          const health = await apiRequest('/health', { skipAuth: true });
          setSystemInfo({
            mode: health.mode,
            firebaseConfigured: Boolean(health.firebaseConfigured),
            backendConnected: true,
            modeDescription: health.modeDescription || ''
          });

          if (health.mode === 'firebase' && fbUser) {
            const me = await apiRequest('/auth/me');
            setUser(me.user);
          } else if (health.mode === 'local-demo') {
            await checkHealthAndSession();
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
      return () => unsub();
    }

    checkHealthAndSession();
    return undefined;
  }, [checkHealthAndSession]);

  const login = async ({ email, password }) => {
    if (systemInfo.mode === 'firebase' && isFirebaseClientConfigured && firebaseAuth) {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { idToken },
        skipAuth: true
      });
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name}`, 'success');
      return res.user;
    }

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true
    });
    setStoredDemoToken(res.token);
    setUser(res.user);
    addToast(`Signed in as ${res.user.name}`, 'success');
    return res.user;
  };

  const register = async (formData) => {
    if (systemInfo.mode === 'firebase' && isFirebaseClientConfigured && firebaseAuth) {
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );
      await updateProfile(cred.user, { displayName: formData.name });
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          medicalLicenseId: formData.medicalLicenseId,
          specialization: formData.specialization,
          hospitalAffiliation: formData.hospitalAffiliation,
          phone: formData.phone
        }
      });
      setUser(res.user);
      addToast('Account registered via Firebase Auth!', 'success');
      return res.user;
    }

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: formData,
      skipAuth: true
    });
    setStoredDemoToken(res.token);
    setUser(res.user);
    addToast('Account created in Local Demo Mode!', 'success');
    return res.user;
  };

  const logout = async () => {
    if (isFirebaseClientConfigured && firebaseAuth?.currentUser) {
      await signOut(firebaseAuth);
    }
    setStoredDemoToken('');
    setUser(null);
    addToast('Signed out safely.', 'info');
  };

  const refreshProfile = async () => {
    const res = await apiRequest('/auth/me');
    setUser(res.user);
    return res.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        systemInfo,
        toasts,
        addToast,
        dismissToast,
        login,
        register,
        logout,
        refreshProfile,
        recheckSystem: checkHealthAndSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

