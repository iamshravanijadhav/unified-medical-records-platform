import { firebaseAuth, isFirebaseClientConfigured } from '../config/firebase';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

const TOKEN_STORAGE_KEY = 'umrap_demo_token';

export function getStoredDemoToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setStoredDemoToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function getActiveAuthToken() {
  if (isFirebaseClientConfigured && firebaseAuth?.currentUser) {
    return firebaseAuth.currentUser.getIdToken();
  }
  return getStoredDemoToken();
}

export async function apiRequest(endpoint, { method = 'GET', body = null, skipAuth = false } = {}) {
  const headers = {
    Accept: 'application/json'
  };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = await getActiveAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    const err = new Error(
      `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the Express backend is running.`
    );
    err.status = 0;
    err.code = 'BACKEND_UNREACHABLE';
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data.code || 'API_ERROR';
    error.data = data;
    throw error;
  }

  return data;
}

