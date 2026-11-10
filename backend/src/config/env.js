import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let runtimePort = Number(process.env.PORT) || 5000;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  get port() {
    return runtimePort;
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  exchangeGatewayKey: process.env.EXCHANGE_GATEWAY_KEY || 'demo-exchange-gateway-key-2026',
  forceDemoMode: process.env.DEMO_MODE === 'true',
  jwtSecret: process.env.JWT_SECRET || 'demo-local-dev-secret-change-in-production',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  internalApiBaseUrl: process.env.INTERNAL_API_BASE_URL || ''
};

export function setRuntimePort(port) {
  if (port && Number(port) > 0) {
    runtimePort = Number(port);
  }
}

export function getInternalBaseUrl() {
  if (env.internalApiBaseUrl) {
    return env.internalApiBaseUrl.replace(/\/$/, '');
  }
  return `http://127.0.0.1:${runtimePort}`;
}

export function hasFirebaseCredentials() {
  return Boolean(
    env.firebaseProjectId &&
    env.firebaseClientEmail &&
    env.firebasePrivateKey &&
    env.firebasePrivateKey.includes('BEGIN PRIVATE KEY')
  );
}

