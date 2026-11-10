import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFirebaseState } from '../config/firebaseAdmin.js';
import { createInitialSeedData } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEMO_STATE_FILE = path.resolve(__dirname, '../../data/demo-runtime-state.json');

let memoryState = null;

function ensureDemoDirectory() {
  const dir = path.dirname(DEMO_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDemoState() {
  if (memoryState) return memoryState;

  try {
    if (fs.existsSync(DEMO_STATE_FILE)) {
      const raw = fs.readFileSync(DEMO_STATE_FILE, 'utf-8');
      memoryState = JSON.parse(raw);
      return memoryState;
    }
  } catch (err) {
    console.warn('[DataStore] Failed reading local demo state file, re-seeding:', err.message);
  }

  memoryState = createInitialSeedData();
  saveDemoState();
  return memoryState;
}

function saveDemoState() {
  if (!memoryState) return;
  try {
    ensureDemoDirectory();
    fs.writeFileSync(DEMO_STATE_FILE, JSON.stringify(memoryState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DataStore] Could not persist demo state file:', err.message);
  }
}

function isFirestoreActive() {
  const { isFirebaseMode, firestoreDb } = getFirebaseState();
  return isFirebaseMode && Boolean(firestoreDb);
}

function getDb() {
  return getFirebaseState().firestoreDb;
}

/**
 * Seeds Firestore collections on first run if empty (only when Firebase Admin is configured).
 */
export async function initializeDataStore() {
  if (!isFirestoreActive()) {
    loadDemoState();
    return { mode: 'local-demo', seeded: true };
  }

  const db = getDb();
  const seed = createInitialSeedData();

  const hospitalsSnap = await db.collection('hospitals').limit(1).get();
  if (hospitalsSnap.empty) {
    console.log('[DataStore] Seeding Firestore collections with synthetic demo MVP data...');
    const batch = db.batch();

    for (const hosp of seed.hospitals) {
      batch.set(db.collection('hospitals').doc(hosp.hospitalId), hosp);
    }
    for (const patient of seed.patients) {
      batch.set(db.collection('patients').doc(patient.patientId), patient);
    }
    for (const meta of seed.medicalRecordsMetadata) {
      batch.set(db.collection('medicalRecordsMetadata').doc(meta.recordId), meta);
    }
    for (const doc of seed.doctors) {
      const { passwordHash, ...publicDoctor } = doc;
      batch.set(db.collection('doctors').doc(doc.uid), publicDoctor);
    }
    for (const log of seed.accessLogs) {
      batch.set(db.collection('accessLogs').doc(log.logId), log);
    }

    await batch.commit();
  }

  return { mode: 'firebase', seeded: true };
}

export async function resetDemoStore() {
  if (isFirestoreActive()) {
    throw new Error('Demo store reset is only available in Local Demo Mode.');
  }
  memoryState = createInitialSeedData();
  saveDemoState();
  return { reset: true, timestamp: new Date().toISOString() };
}

// ---------------- DOCTORS / USERS ----------------

export async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (isFirestoreActive()) {
    const snap = await getDb().collection('doctors').where('email', '==', normalized).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data();
  }
  const state = loadDemoState();
  return state.doctors.find((d) => d.email.toLowerCase() === normalized) || null;
}

export async function findUserById(uid) {
  if (isFirestoreActive()) {
    const doc = await getDb().collection('doctors').doc(uid).get();
    return doc.exists ? doc.data() : null;
  }
  const state = loadDemoState();
  return state.doctors.find((d) => d.uid === uid) || null;
}

export async function createUserProfile(userProfile) {
  if (isFirestoreActive()) {
    const { passwordHash, ...safeProfile } = userProfile;
    await getDb().collection('doctors').doc(safeProfile.uid).set(safeProfile);
    return safeProfile;
  }
  const state = loadDemoState();
  state.doctors.push(userProfile);
  saveDemoState();
  return userProfile;
}

export async function updateUserProfile(uid, updates) {
  if (isFirestoreActive()) {
    const ref = getDb().collection('doctors').doc(uid);
    await ref.set(updates, { merge: true });
    const updated = await ref.get();
    return updated.data();
  }
  const state = loadDemoState();
  const idx = state.doctors.findIndex((d) => d.uid === uid);
  if (idx === -1) return null;
  state.doctors[idx] = { ...state.doctors[idx], ...updates };
  saveDemoState();
  return state.doctors[idx];
}

// ---------------- HOSPITALS ----------------

export async function listHospitals() {
  if (isFirestoreActive()) {
    const snap = await getDb().collection('hospitals').get();
    return snap.docs.map((d) => d.data());
  }
  return [...loadDemoState().hospitals];
}

export async function findHospitalById(hospitalId) {
  if (isFirestoreActive()) {
    const doc = await getDb().collection('hospitals').doc(hospitalId).get();
    return doc.exists ? doc.data() : null;
  }
  return loadDemoState().hospitals.find((h) => h.hospitalId === hospitalId) || null;
}

export async function findHospitalBySlug(slug) {
  const normalized = slug.trim().toLowerCase();
  if (isFirestoreActive()) {
    const snap = await getDb().collection('hospitals').where('slug', '==', normalized).limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  }
  return loadDemoState().hospitals.find((h) => h.slug.toLowerCase() === normalized) || null;
}

export async function createHospital(hospital) {
  if (isFirestoreActive()) {
    await getDb().collection('hospitals').doc(hospital.hospitalId).set(hospital);
    return hospital;
  }
  const state = loadDemoState();
  state.hospitals.push(hospital);
  if (!state.customHospitalRecords) state.customHospitalRecords = {};
  state.customHospitalRecords[hospital.slug] = [];
  saveDemoState();
  return hospital;
}

export async function updateHospital(hospitalId, updates) {
  if (isFirestoreActive()) {
    const ref = getDb().collection('hospitals').doc(hospitalId);
    const existing = await ref.get();
    if (!existing.exists) return null;
    await ref.set(updates, { merge: true });
    const fresh = await ref.get();
    return fresh.data();
  }
  const state = loadDemoState();
  const idx = state.hospitals.findIndex((h) => h.hospitalId === hospitalId);
  if (idx === -1) return null;
  state.hospitals[idx] = { ...state.hospitals[idx], ...updates };
  saveDemoState();
  return state.hospitals[idx];
}

export function getCustomHospitalRecords(slug) {
  if (isFirestoreActive()) return [];
  const state = loadDemoState();
  return (state.customHospitalRecords && state.customHospitalRecords[slug]) || [];
}

// ---------------- PATIENTS ----------------

export async function listPatients() {
  if (isFirestoreActive()) {
    const snap = await getDb().collection('patients').get();
    return snap.docs.map((d) => d.data());
  }
  return [...loadDemoState().patients];
}

export async function findPatientById(patientId) {
  const normalized = patientId.trim().toUpperCase();
  if (isFirestoreActive()) {
    const doc = await getDb().collection('patients').doc(normalized).get();
    return doc.exists ? doc.data() : null;
  }
  return loadDemoState().patients.find((p) => p.patientId.toUpperCase() === normalized) || null;
}

// ---------------- MEDICAL RECORDS METADATA ----------------

export async function listRecordsMetadata(patientId = null) {
  if (isFirestoreActive()) {
    const col = getDb().collection('medicalRecordsMetadata');
    const snap = patientId
      ? await col.where('patientId', '==', patientId.toUpperCase()).get()
      : await col.get();
    return snap.docs.map((d) => d.data());
  }
  const all = loadDemoState().medicalRecordsMetadata;
  if (!patientId) return [...all];
  return all.filter((r) => r.patientId.toUpperCase() === patientId.trim().toUpperCase());
}

// ---------------- ACCESS LOGS ----------------

export async function listAccessLogs({ patientId = null, action = null } = {}) {
  let logs = [];
  if (isFirestoreActive()) {
    const snap = await getDb().collection('accessLogs').get();
    logs = snap.docs.map((d) => d.data());
  } else {
    logs = [...loadDemoState().accessLogs];
  }

  return logs
    .filter((l) => (!patientId || l.patientId?.toUpperCase().includes(patientId.trim().toUpperCase())))
    .filter((l) => (!action || l.action === action))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function appendAccessLog(logEntry) {
  if (isFirestoreActive()) {
    await getDb().collection('accessLogs').doc(logEntry.logId).set(logEntry);
    return logEntry;
  }
  const state = loadDemoState();
  state.accessLogs.unshift(logEntry);
  // Keep local demo log history bounded cleanly
  if (state.accessLogs.length > 500) {
    state.accessLogs = state.accessLogs.slice(0, 500);
  }
  saveDemoState();
  return logEntry;
}

