import crypto from 'crypto';

/**
 * Deterministic password hashing helper for Local Demo Mode accounts.
 */
export function hashDemoPassword(password) {
  return crypto.createHash('sha256').update(`umrap-demo-salt:${password}`).digest('hex');
}

export function createInitialSeedData() {
  const now = '2026-11-01T09:00:00.000Z';

  const doctors = [
    {
      uid: 'doc-demo-1',
      name: 'Dr. Aditi Sharma (Demo Doctor)',
      email: 'doctor@unifiedhealth.demo',
      passwordHash: hashDemoPassword('DemoDoctor@123'),
      role: 'doctor',
      medicalLicenseId: 'DEMO-MCI-2026-8841',
      specialization: 'Internal Medicine & Family Care',
      hospitalAffiliation: 'Sunrise Multispeciality Hospital',
      phone: '+91-98000-10001 (Demo)',
      isDemoAccount: true,
      createdAt: '2026-01-15T08:00:00.000Z'
    },
    {
      uid: 'doc-demo-2',
      name: 'Dr. Rohan Mehta (Demo Doctor)',
      email: 'doctor2@unifiedhealth.demo',
      passwordHash: hashDemoPassword('DemoDoctor@123'),
      role: 'doctor',
      medicalLicenseId: 'DEMO-MCI-2026-9120',
      specialization: 'Emergency & Acute Medicine',
      hospitalAffiliation: 'CityCare Medical Centre',
      phone: '+91-98000-10002 (Demo)',
      isDemoAccount: true,
      createdAt: '2026-02-10T08:00:00.000Z'
    },
    {
      uid: 'admin-demo-1',
      name: 'Sanjay Kulkarni (Demo Hospital Admin)',
      email: 'admin@unifiedhealth.demo',
      passwordHash: hashDemoPassword('DemoAdmin@123'),
      role: 'hospital_admin',
      medicalLicenseId: 'DEMO-HOSP-ADMIN-01',
      specialization: 'Health Information Exchange Operations',
      hospitalAffiliation: 'Platform Hospital Network',
      phone: '+91-98000-20001 (Demo)',
      isDemoAccount: true,
      createdAt: '2026-01-10T08:00:00.000Z'
    }
  ];

  const hospitals = [
    {
      hospitalId: 'HOSP-SUNRISE',
      slug: 'sunrise',
      name: 'Sunrise Multispeciality Hospital',
      location: 'Andheri West, Mumbai, Maharashtra',
      apiEndpoint: '/api/hospitals/sunrise/records/:patientId',
      systemStatus: 'online',
      isEnabled: true,
      specialties: ['Cardiology', 'Orthopedics', 'Internal Medicine', 'General Surgery'],
      contactEmail: 'gateway@sunrise-demo.health',
      isDemo: true,
      updatedAt: now
    },
    {
      hospitalId: 'HOSP-CITYCARE',
      slug: 'citycare',
      name: 'CityCare Medical Centre',
      location: 'Shivajinagar, Pune, Maharashtra',
      apiEndpoint: '/api/hospitals/citycare/records/:patientId',
      systemStatus: 'online',
      isEnabled: true,
      specialties: ['Pulmonology', 'Neurology', 'General Medicine', 'Preventive Health'],
      contactEmail: 'his-api@citycare-demo.health',
      isDemo: true,
      updatedAt: now
    },
    {
      hospitalId: 'HOSP-AAROGYA',
      slug: 'aarogya',
      name: 'Aarogya Diagnostic Centre',
      location: 'Indiranagar, Bengaluru, Karnataka',
      apiEndpoint: '/api/hospitals/aarogya/records/:patientId',
      systemStatus: 'online',
      isEnabled: true,
      specialties: ['Pathology & Hematology', 'Digital X-Ray', 'MRI Imaging', 'CT Scan'],
      contactEmail: 'pacs-lis@aarogya-demo.health',
      isDemo: true,
      updatedAt: now
    }
  ];

  const patients = [
    {
      patientId: 'DEMO-ABHA-1001',
      fullName: 'Aarav Kulkarni (Demo)',
      age: 42,
      gender: 'Male',
      dob: '1984-04-12',
      bloodGroup: 'O+',
      city: 'Mumbai, Maharashtra',
      phoneMasked: '+91-98XXX-XX101',
      emergencyNote: 'No known allergies (Synthetic Demo Profile)',
      isDemo: true
    },
    {
      patientId: 'DEMO-ABHA-1002',
      fullName: 'Priya Nair (Demo)',
      age: 35,
      gender: 'Female',
      dob: '1991-09-23',
      bloodGroup: 'A+',
      city: 'Bengaluru, Karnataka',
      phoneMasked: '+91-98XXX-XX102',
      emergencyNote: 'Routine endocrine follow-up (Synthetic Demo Profile)',
      isDemo: true
    },
    {
      patientId: 'DEMO-ABHA-1003',
      fullName: 'Rohan Deshmukh (Demo)',
      age: 29,
      gender: 'Male',
      dob: '1997-01-17',
      bloodGroup: 'B+',
      city: 'Pune, Maharashtra',
      phoneMasked: '+91-98XXX-XX103',
      emergencyNote: 'Episodic migraine tracking (Synthetic Demo Profile)',
      isDemo: true
    },
    {
      patientId: 'DEMO-ABHA-1004',
      fullName: 'Meera Iyer (Demo)',
      age: 51,
      gender: 'Female',
      dob: '1975-11-08',
      bloodGroup: 'AB+',
      city: 'Mumbai, Maharashtra',
      phoneMasked: '+91-98XXX-XX104',
      emergencyNote: 'Orthopedic rehab follow-up (Synthetic Demo Profile)',
      isDemo: true
    },
    {
      patientId: 'DEMO-ABHA-1005',
      fullName: 'Vikram Joshi (Demo)',
      age: 46,
      gender: 'Male',
      dob: '1980-06-30',
      bloodGroup: 'O-',
      city: 'Pune, Maharashtra',
      phoneMasked: '+91-98XXX-XX105',
      emergencyNote: 'Post-surgical follow-up (Synthetic Demo Profile)',
      isDemo: true
    }
  ];

  // Metadata index stored in Firestore / dataStore (actual records still live in each hospital's own data source & API!)
  const medicalRecordsMetadata = [
    { recordId: 'SUN-REC-101', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Diagnosis', title: 'Cardiology Outpatient Evaluation Summary (DEMO)', reportDate: '2026-08-14T10:30:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-102', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Prescriptions', title: 'Antihypertensive & Preventive Care Prescription (DEMO)', reportDate: '2026-08-14T11:00:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-103', patientId: 'DEMO-ABHA-1002', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Discharge Summaries', title: 'Day-Care Observation Discharge Summary (DEMO)', reportDate: '2026-07-02T17:15:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-104', patientId: 'DEMO-ABHA-1002', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Prescriptions', title: 'Endocrinology Follow-Up Prescription (DEMO)', reportDate: '2026-09-18T09:45:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-105', patientId: 'DEMO-ABHA-1004', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Diagnosis', title: 'Orthopedic Knee Pain Clinical Assessment (DEMO)', reportDate: '2026-05-21T14:20:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-106', patientId: 'DEMO-ABHA-1005', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Discharge Summaries', title: 'Post-Laparoscopic Procedure Discharge Summary (DEMO)', reportDate: '2026-06-11T16:00:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'SUN-REC-107', patientId: 'DEMO-ABHA-1004', hospitalId: 'HOSP-SUNRISE', hospitalSlug: 'sunrise', hospitalName: 'Sunrise Multispeciality Hospital', category: 'Other Medical Documents', title: 'Physiotherapy Rehabilitation Exercise Plan (DEMO)', reportDate: '2026-06-05T11:30:00.000Z', fileFormat: 'PDF', isDemo: true },

    { recordId: 'CC-REC-201', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Discharge Summaries', title: 'Acute Bronchitis Inpatient Discharge Summary (DEMO)', reportDate: '2026-09-05T15:40:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'CC-REC-202', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Prescriptions', title: 'Pulmonary Recovery Inhaler & Taper Prescription (DEMO)', reportDate: '2026-10-12T12:10:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'CC-REC-203', patientId: 'DEMO-ABHA-1003', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Diagnosis', title: 'Migraine & Neurological Consultation Note (DEMO)', reportDate: '2026-04-19T11:20:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'CC-REC-204', patientId: 'DEMO-ABHA-1003', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Other Medical Documents', title: 'Annual Fitness & Immunization Certificate (DEMO)', reportDate: '2026-08-29T09:15:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'CC-REC-205', patientId: 'DEMO-ABHA-1004', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Prescriptions', title: 'Vitamin D & Bone Support Prescription (DEMO)', reportDate: '2026-09-01T16:50:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'CC-REC-206', patientId: 'DEMO-ABHA-1005', hospitalId: 'HOSP-CITYCARE', hospitalSlug: 'citycare', hospitalName: 'CityCare Medical Centre', category: 'Diagnosis', title: 'Gastroenterology Follow-Up Clinical Note (DEMO)', reportDate: '2026-10-03T13:05:00.000Z', fileFormat: 'PDF', isDemo: true },

    { recordId: 'AAR-REC-301', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'Blood Test Reports', title: 'Complete Blood Count (CBC) & Lipid Profile (DEMO)', reportDate: '2026-08-12T08:15:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'AAR-REC-302', patientId: 'DEMO-ABHA-1001', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'X-ray Reports', title: 'Chest X-Ray PA View (DEMO Synthetic Imaging)', reportDate: '2026-09-03T11:45:00.000Z', fileFormat: 'IMAGE', isDemo: true },
    { recordId: 'AAR-REC-303', patientId: 'DEMO-ABHA-1002', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'Blood Test Reports', title: 'HbA1c, Fasting Glucose & Thyroid Panel (DEMO)', reportDate: '2026-07-01T07:50:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'AAR-REC-304', patientId: 'DEMO-ABHA-1002', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'MRI Reports', title: 'Lumbar Spine MRI Screening Scan (DEMO Synthetic Imaging)', reportDate: '2026-09-15T14:10:00.000Z', fileFormat: 'IMAGE', isDemo: true },
    { recordId: 'AAR-REC-305', patientId: 'DEMO-ABHA-1003', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'MRI Reports', title: 'Brain MRI Non-Contrast Scan (DEMO Synthetic Imaging)', reportDate: '2026-04-18T15:30:00.000Z', fileFormat: 'IMAGE', isDemo: true },
    { recordId: 'AAR-REC-306', patientId: 'DEMO-ABHA-1003', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'Blood Test Reports', title: 'Comprehensive Metabolic & Liver Function Panel (DEMO)', reportDate: '2026-08-25T08:40:00.000Z', fileFormat: 'PDF', isDemo: true },
    { recordId: 'AAR-REC-307', patientId: 'DEMO-ABHA-1005', hospitalId: 'HOSP-AAROGYA', hospitalSlug: 'aarogya', hospitalName: 'Aarogya Diagnostic Centre', category: 'CT Scan Reports', title: 'Abdominal Contrast CT Scan (DEMO Synthetic Imaging)', reportDate: '2026-10-01T10:05:00.000Z', fileFormat: 'IMAGE', isDemo: true }
  ];

  const accessLogs = [
    {
      logId: 'LOG-SEED-101',
      actorId: 'doc-demo-1',
      actorName: 'Dr. Aditi Sharma (Demo Doctor)',
      actorRole: 'doctor',
      patientId: 'DEMO-ABHA-1002',
      hospitalSource: 'Sunrise Multispeciality Hospital, Aarogya Diagnostic Centre',
      action: 'RECORDS_FETCHED',
      summary: 'Retrieved 4 synthetic records from 2 connected hospital endpoints',
      timestamp: '2026-11-05T09:20:00.000Z'
    },
    {
      logId: 'LOG-SEED-102',
      actorId: 'doc-demo-1',
      actorName: 'Dr. Aditi Sharma (Demo Doctor)',
      actorRole: 'doctor',
      patientId: 'DEMO-ABHA-1001',
      hospitalSource: 'Patient Discovery Index',
      action: 'PATIENT_SEARCH',
      summary: 'Discovered 6 record reference(s) across 3 hospital(s)',
      timestamp: '2026-11-06T11:30:00.000Z'
    },
    {
      logId: 'LOG-SEED-103',
      actorId: 'doc-demo-2',
      actorName: 'Dr. Rohan Mehta (Demo Doctor)',
      actorRole: 'doctor',
      patientId: 'DEMO-ABHA-1003',
      hospitalSource: 'CityCare Medical Centre, Aarogya Diagnostic Centre',
      action: 'RECORDS_FETCHED',
      summary: 'Retrieved 4 synthetic records across 2 connected hospital endpoints',
      timestamp: '2026-11-07T14:05:00.000Z'
    },
    {
      logId: 'LOG-SEED-104',
      actorId: 'admin-demo-1',
      actorName: 'Sanjay Kulkarni (Demo Hospital Admin)',
      actorRole: 'hospital_admin',
      patientId: 'N/A',
      hospitalSource: 'Aarogya Diagnostic Centre',
      action: 'HOSPITAL_VERIFIED',
      summary: 'Verified demo diagnostic PACS/LIS connector endpoint online',
      timestamp: '2026-11-08T08:45:00.000Z'
    }
  ];

  // Dynamic hospital records store (for hospitals registered after startup by Admin)
  const customHospitalRecords = {};

  return {
    doctors,
    hospitals,
    patients,
    medicalRecordsMetadata,
    accessLogs,
    customHospitalRecords
  };
}

