import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../src/app.js';
import { setRuntimePort } from '../src/config/env.js';
import { initFirebaseAdmin } from '../src/config/firebaseAdmin.js';
import { initializeDataStore, resetDemoStore } from '../src/repositories/dataStore.js';

let server;
let baseUrl;
let doctorToken;
let adminToken;

async function api(path, { method = 'GET', token = null, body = null, headers = {} } = {}) {
  const reqHeaders = { ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;
  if (body !== null && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: body !== null ? JSON.stringify(body) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return { status: res.status, headers: res.headers, data: json };
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, buffer };
}

before(async () => {
  process.env.DEMO_MODE = 'true';
  initFirebaseAdmin();
  await initializeDataStore();
  await resetDemoStore();

  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      setRuntimePort(addr.port);
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

after(async () => {
  await resetDemoStore();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Unified Medical Records Access Platform - Backend & Integration Tests', () => {
  test('1. Health endpoint reports status ok and explicit local-demo mode', async () => {
    const res = await api('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.status, 'ok');
    assert.equal(res.data.mode, 'local-demo');
  });

  test('2. Unauthorized requests without token are rejected with 401', async () => {
    const dashboardRes = await api('/api/dashboard/summary');
    assert.equal(dashboardRes.status, 401);

    const patientRes = await api('/api/patients/DEMO-ABHA-1001');
    assert.equal(patientRes.status, 401);

    const fetchRes = await api('/api/records/fetch', {
      method: 'POST',
      body: { patientId: 'DEMO-ABHA-1001' }
    });
    assert.equal(fetchRes.status, 401);

    const logsRes = await api('/api/logs');
    assert.equal(logsRes.status, 401);

    const hospListRes = await api('/api/hospitals');
    assert.equal(hospListRes.status, 401);

    const hospEndpointRes = await api('/api/hospitals/sunrise/records/DEMO-ABHA-1001');
    assert.equal(hospEndpointRes.status, 401);
  });

  test('3. Authentication: invalid login returns 401, valid doctor & admin logins succeed', async () => {
    const badLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'doctor@unifiedhealth.demo', password: 'WrongPassword!' }
    });
    assert.equal(badLogin.status, 401);

    const docLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'doctor@unifiedhealth.demo', password: 'DemoDoctor@123' }
    });
    assert.equal(docLogin.status, 200);
    assert.ok(docLogin.data.token);
    assert.equal(docLogin.data.user.role, 'doctor');
    doctorToken = docLogin.data.token;

    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@unifiedhealth.demo', password: 'DemoAdmin@123' }
    });
    assert.equal(adminLogin.status, 200);
    assert.ok(adminLogin.data.token);
    assert.equal(adminLogin.data.user.role, 'hospital_admin');
    adminToken = adminLogin.data.token;
  });

  test('4. Doctor registration validates input and registers a new demo doctor', async () => {
    const invalidReg = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Dr. Test', email: 'not-an-email', password: '123' }
    });
    assert.equal(invalidReg.status, 400);

    const validReg = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Dr. Kavita Rao (Test)',
        email: `kavita.${Date.now()}@unifiedhealth.demo`,
        password: 'TestUser@123',
        role: 'doctor',
        specialization: 'Cardiology'
      }
    });
    assert.equal(validReg.status, 201);
    assert.equal(validReg.data.user.role, 'doctor');
    assert.ok(validReg.data.token);
  });

  test('5. Role-based access control blocks doctor from registering hospitals and blocks admin from clinical fetch', async () => {
    const docCreateHosp = await api('/api/hospitals', {
      method: 'POST',
      token: doctorToken,
      body: { name: 'Unauthorized Clinic', location: 'Mumbai' }
    });
    assert.equal(docCreateHosp.status, 403);

    const adminFetchRecords = await api('/api/records/fetch', {
      method: 'POST',
      token: adminToken,
      body: { patientId: 'DEMO-ABHA-1002' }
    });
    assert.equal(adminFetchRecords.status, 403);
  });

  test('6. Patient search returns hospital breakdown for valid ID (without consent fields) and 404 for invalid ID', async () => {
    const validSearch = await api('/api/patients/DEMO-ABHA-1001', { token: doctorToken });
    assert.equal(validSearch.status, 200);
    assert.equal(validSearch.data.patient.patientId, 'DEMO-ABHA-1001');
    assert.equal(validSearch.data.totalAvailableReports, 6);
    assert.equal(validSearch.data.availableHospitals.length, 3);
    assert.equal(validSearch.data.consentStatus, undefined);
    assert.equal(validSearch.data.consent, undefined);

    const invalidSearch = await api('/api/patients/DEMO-ABHA-9999', { token: doctorToken });
    assert.equal(invalidSearch.status, 404);
  });

  test('7. Separate demo hospital REST APIs return independent schemas for each hospital', async () => {
    const sunrise = await api('/api/hospitals/sunrise/records/DEMO-ABHA-1001', { token: doctorToken });
    assert.equal(sunrise.status, 200);
    assert.equal(sunrise.data.schemaFormat, 'sunrise-his-v2');
    assert.equal(sunrise.data.recordCount, 2);

    const citycare = await api('/api/hospitals/citycare/records/DEMO-ABHA-1001', { token: doctorToken });
    assert.equal(citycare.status, 200);
    assert.equal(citycare.data.schemaFormat, 'citycare-ehr-v1');
    assert.equal(citycare.data.recordCount, 2);

    const aarogya = await api('/api/hospitals/aarogya/records/DEMO-ABHA-1001', { token: doctorToken });
    assert.equal(aarogya.status, 200);
    assert.equal(aarogya.data.schemaFormat, 'aarogya-pacs-lis-v3');
    assert.equal(aarogya.data.recordCount, 2);
  });

  test('8. Removed Consent and Report Viewer endpoints return 404 ROUTE_NOT_FOUND', async () => {
    const listConsents = await api('/api/consents', { token: doctorToken });
    assert.equal(listConsents.status, 404);
    assert.equal(listConsents.data.code, 'ROUTE_NOT_FOUND');

    const reqConsent = await api('/api/consents/request', {
      method: 'POST',
      token: doctorToken,
      body: { patientId: 'DEMO-ABHA-1001' }
    });
    assert.equal(reqConsent.status, 404);
    assert.equal(reqConsent.data.code, 'ROUTE_NOT_FOUND');

    const respondConsent = await api('/api/consents/CONSENT-DEMO-1002/respond', {
      method: 'PATCH',
      token: doctorToken,
      body: { decision: 'approved' }
    });
    assert.equal(respondConsent.status, 404);

    const reportMeta = await api('/api/reports/AAR-REC-301', { token: doctorToken });
    assert.equal(reportMeta.status, 404);
    assert.equal(reportMeta.data.code, 'ROUTE_NOT_FOUND');

    const reportFile = await api('/api/reports/AAR-REC-301/file', { token: doctorToken });
    assert.equal(reportFile.status, 404);
    assert.equal(reportFile.data.code, 'ROUTE_NOT_FOUND');

    const reportFileDownload = await api('/api/reports/AAR-REC-302/file?download=1', { token: doctorToken });
    assert.equal(reportFileDownload.status, 404);
    assert.equal(reportFileDownload.data.code, 'ROUTE_NOT_FOUND');
  });

  test('9. Doctor fetches combined multi-hospital records with full metadata & chronological sorting', async () => {
    const combinedFetch = await api('/api/records/fetch', {
      method: 'POST',
      token: doctorToken,
      body: { patientId: 'DEMO-ABHA-1001' }
    });
    assert.equal(combinedFetch.status, 200);
    assert.equal(combinedFetch.data.summary.totalRecords, 6);
    assert.equal(combinedFetch.data.summary.successfulHospitals.length, 3);
    assert.equal(combinedFetch.data.summary.unavailableHospitals.length, 0);

    // Verify chronological descending order
    const dates = combinedFetch.data.records.map((r) => new Date(r.reportDate).getTime());
    for (let i = 1; i < dates.length; i++) {
      assert.ok(dates[i - 1] >= dates[i], 'Records must be sorted chronologically newest first');
    }

    // Verify full metadata and structured details are preserved directly in combined timeline payload
    for (const rec of combinedFetch.data.records) {
      assert.ok(rec.recordId);
      assert.ok(rec.title);
      assert.ok(rec.hospitalName);
      assert.ok(rec.category);
      assert.ok(rec.reportDate);
      assert.ok(rec.doctorName);
      assert.ok(rec.department);
      assert.ok(rec.fhirResourceType);
      assert.ok(Array.isArray(rec.sections));
    }

    const labRecord = combinedFetch.data.records.find((r) => r.recordId === 'AAR-REC-301');
    assert.ok(labRecord);
    assert.ok(Array.isArray(labRecord.labTable) && labRecord.labTable.length > 0);

    const rxRecord = combinedFetch.data.records.find((r) => r.recordId === 'SUN-REC-102');
    assert.ok(rxRecord);
    assert.ok(Array.isArray(rxRecord.medications) && rxRecord.medications.length > 0);

    const cardiologyRecord = combinedFetch.data.records.find((r) => r.recordId === 'SUN-REC-101');
    assert.ok(cardiologyRecord?.vitals?.bp);

    const fetch1003 = await api('/api/records/fetch', {
      method: 'POST',
      token: doctorToken,
      body: { patientId: 'DEMO-ABHA-1003' }
    });
    assert.equal(fetch1003.status, 200);
    assert.equal(fetch1003.data.summary.totalRecords, 4);
  });

  test('10. Role-based security blocks non-doctors from clinical retrieval and keeps patient list authenticated', async () => {
    const adminBlockedFetch = await api('/api/records/fetch', {
      method: 'POST',
      token: adminToken,
      body: { patientId: 'DEMO-ABHA-1001' }
    });
    assert.equal(adminBlockedFetch.status, 403);
    assert.equal(adminBlockedFetch.data.code, 'FORBIDDEN_ROLE');

    const doctorPatientList = await api('/api/patients', { token: doctorToken });
    assert.equal(doctorPatientList.status, 200);
    assert.ok(doctorPatientList.data.patients.length >= 5);
  });

  test('11. Hospital Management: Admin disables a hospital and simulates another offline; retrieval handles both gracefully', async () => {
    // Admin disables Sunrise
    const disableSunrise = await api('/api/hospitals/HOSP-SUNRISE/status', {
      method: 'PATCH',
      token: adminToken,
      body: { isEnabled: false }
    });
    assert.equal(disableSunrise.status, 200);
    assert.equal(disableSunrise.data.hospital.isEnabled, false);

    // Admin sets CityCare offline (simulated outage)
    const offlineCitycare = await api('/api/hospitals/HOSP-CITYCARE/status', {
      method: 'PATCH',
      token: adminToken,
      body: { systemStatus: 'offline' }
    });
    assert.equal(offlineCitycare.status, 200);
    assert.equal(offlineCitycare.data.hospital.systemStatus, 'offline');

    // Direct call to CityCare returns 503
    const directOffline = await api('/api/hospitals/citycare/records/DEMO-ABHA-1001', { token: doctorToken });
    assert.equal(directOffline.status, 503);

    // Combined fetch still succeeds with Aarogya (2 records) and lists Sunrise & CityCare as unavailable/disabled!
    const partialFetch = await api('/api/records/fetch', {
      method: 'POST',
      token: doctorToken,
      body: { patientId: 'DEMO-ABHA-1001' }
    });
    assert.equal(partialFetch.status, 200);
    assert.equal(partialFetch.data.summary.totalRecords, 2);
    assert.equal(partialFetch.data.summary.successfulHospitals.length, 1);
    assert.equal(partialFetch.data.summary.successfulHospitals[0].hospitalId, 'HOSP-AAROGYA');
    assert.equal(partialFetch.data.summary.unavailableHospitals.length, 2);

    // Admin can register a new hospital
    const registerHosp = await api('/api/hospitals', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Metro General Clinic',
        location: 'Hyderabad, Telangana',
        specialties: 'General Medicine, Pediatrics'
      }
    });
    assert.equal(registerHosp.status, 201);
    assert.ok(registerHosp.data.hospital.apiEndpoint.includes('/api/hospitals/'));
  });

  test('12. Dashboard summary and Activity Logs record events accurately without consent or viewer events', async () => {
    const dash = await api('/api/dashboard/summary', { token: doctorToken });
    assert.equal(dash.status, 200);
    assert.ok(dash.data.kpis.totalRegisteredHospitals >= 4);
    assert.equal(typeof dash.data.kpis.totalRecordRetrievals, 'number');
    assert.ok(dash.data.kpis.totalRecordRetrievals >= 2);
    assert.equal(dash.data.kpis.approvedConsents, undefined);
    assert.equal(dash.data.kpis.pendingConsents, undefined);

    const logs = await api('/api/logs', { token: doctorToken });
    assert.equal(logs.status, 200);
    assert.ok(logs.data.logs.some((l) => l.action === 'PATIENT_SEARCH'));
    assert.ok(logs.data.logs.some((l) => l.action === 'RECORDS_FETCHED'));
    assert.ok(logs.data.logs.some((l) => l.action === 'HOSPITAL_REGISTERED'));
    assert.ok(logs.data.logs.some((l) => l.action === 'HOSPITAL_STATUS_CHANGED'));
    assert.equal(
      logs.data.logs.some(
        (l) =>
          l.action.startsWith('CONSENT_') ||
          l.action === 'RECORDS_FETCH_BLOCKED' ||
          l.action === 'REPORT_VIEWED' ||
          l.action === 'REPORT_DOWNLOADED'
      ),
      false
    );
  });
});

