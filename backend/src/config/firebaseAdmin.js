import admin from 'firebase-admin';
import { env, hasFirebaseCredentials } from './env.js';

let firestoreDb = null;
let firebaseAuth = null;
let mode = 'local-demo';
let initMessage = 'Firebase credentials not provided. Running in clearly labeled Local Demo Mode.';

/**
 * Initializes Firebase Admin SDK if credentials exist and DEMO_MODE is not forced.
 * Never silently fakes Firebase when credentials are absent; sets explicit system mode.
 */
export function initFirebaseAdmin() {
  if (env.forceDemoMode) {
    mode = 'local-demo';
    initMessage = 'DEMO_MODE=true is set. Running in Local Demo Mode with synthetic data.';
    return { mode, firestoreDb: null, firebaseAuth: null, initMessage };
  }

  if (!hasFirebaseCredentials()) {
    mode = 'local-demo';
    initMessage = 'Firebase Admin credentials missing. Running in Local Demo Mode with synthetic data.';
    return { mode, firestoreDb: null, firebaseAuth: null, initMessage };
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: env.firebasePrivateKey
        })
      });
    }

    firestoreDb = admin.firestore();
    firebaseAuth = admin.auth();
    mode = 'firebase';
    initMessage = `Connected to Firebase Project (${env.firebaseProjectId}) with Firestore & Auth.`;
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization failed, falling back to Local Demo Mode:', error.message);
    firestoreDb = null;
    firebaseAuth = null;
    mode = 'local-demo';
    initMessage = `Firebase initialization failed (${error.message}). Fallback to Local Demo Mode.`;
  }

  return { mode, firestoreDb, firebaseAuth, initMessage };
}

export function getFirebaseState() {
  return {
    mode,
    isFirebaseMode: mode === 'firebase',
    firebaseConfigured: mode === 'firebase',
    firestoreDb,
    firebaseAuth,
    initMessage
  };
}

