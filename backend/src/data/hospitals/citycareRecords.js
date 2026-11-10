/**
 * Independent Data Source: CityCare Medical Centre (Pune)
 * Simulates a distinct EHR vendor schema with different field names than Sunrise.
 * Note: Synthetic DEMO records only — not real clinical data.
 */

export const CITYCARE_HOSPITAL_INFO = {
  hospitalId: 'HOSP-CITYCARE',
  slug: 'citycare',
  name: 'CityCare Medical Centre',
  location: 'Shivajinagar, Pune, Maharashtra',
  specialties: ['Pulmonology', 'Neurology', 'General Medicine', 'Preventive Health']
};

export const citycareNativeRecords = [
  {
    entryId: 'CC-REC-201',
    patientIdentifier: 'DEMO-ABHA-1001',
    reportTitle: 'Acute Bronchitis Inpatient Discharge Summary (DEMO)',
    categoryCode: 'Discharge Summaries',
    visitDate: '2026-09-05T15:40:00.000Z',
    clinicianName: 'Dr. Vikram Sethi (MD, Pulmonology)',
    attachmentType: 'PDF',
    unit: 'Pulmonology Ward',
    summaryText: '3-day observation for seasonal bronchial irritation; recovered well (Demo).',
    sections: [
      { heading: 'Admission Summary (Demo)', body: 'Patient presented with persistent seasonal cough and mild wheeze. Responded smoothly to nebulization and supportive care.' },
      { heading: 'Discharge Status (Demo)', body: 'Room air SpO2 99%, afebrile, discharged with short step-down inhaler guidance.' }
    ]
  },
  {
    entryId: 'CC-REC-202',
    patientIdentifier: 'DEMO-ABHA-1001',
    reportTitle: 'Pulmonary Recovery Inhaler & Taper Prescription (DEMO)',
    categoryCode: 'Prescriptions',
    visitDate: '2026-10-12T12:10:00.000Z',
    clinicianName: 'Dr. Vikram Sethi (MD, Pulmonology)',
    attachmentType: 'PDF',
    unit: 'Pulmonology OPD',
    summaryText: 'Outpatient follow-up respiratory medication plan (Synthetic Demo).',
    medications: [
      { name: 'Demo-Inhaler Budesonide 200mcg', dosage: '1 puff twice daily with spacer', duration: '14 days' },
      { name: 'Demo-Syrup Ambroxol Sugar-Free', dosage: '5ml if needed for congestion', duration: '5 days' }
    ],
    sections: [
      { heading: 'Clinician Remark (Demo)', body: 'Demonstrated spacer technique during OPD visit. Avoid cold dust exposure.' }
    ]
  },
  {
    entryId: 'CC-REC-203',
    patientIdentifier: 'DEMO-ABHA-1003',
    reportTitle: 'Migraine & Neurological Consultation Note (DEMO)',
    categoryCode: 'Diagnosis',
    visitDate: '2026-04-19T11:20:00.000Z',
    clinicianName: 'Dr. Farhan Ali (DM, Neurology)',
    attachmentType: 'PDF',
    unit: 'Neurology Clinic',
    summaryText: 'Episodic tension-migraine evaluation following screen fatigue (Demo).',
    sections: [
      { heading: 'Clinical Narrative (Demo)', body: 'Patient reported intermittent unilateral headaches associated with irregular sleep. Neurological exam unremarkable.' },
      { heading: 'Guidance (Demo)', body: 'Advised trigger diary, hydration, and ergonomic screen breaks. Synthetic demo entry only.' }
    ]
  },
  {
    entryId: 'CC-REC-204',
    patientIdentifier: 'DEMO-ABHA-1003',
    reportTitle: 'Annual Fitness & Immunization Certificate (DEMO)',
    categoryCode: 'Other Medical Documents',
    visitDate: '2026-08-29T09:15:00.000Z',
    clinicianName: 'Dr. Meenal Joshi (MBBS, Preventive Health)',
    attachmentType: 'PDF',
    unit: 'Preventive Wellness Wing',
    summaryText: 'Synthetic preventive vaccination & general physical fitness record.',
    sections: [
      { heading: 'Immunization Record (Demo)', body: 'Annual Quadrivalent Influenza Demo Vaccine logged; Tdap booster verified up to date.' }
    ]
  },
  {
    entryId: 'CC-REC-205',
    patientIdentifier: 'DEMO-ABHA-1004',
    reportTitle: 'Vitamin D & Bone Support Prescription (DEMO)',
    categoryCode: 'Prescriptions',
    visitDate: '2026-09-01T16:50:00.000Z',
    clinicianName: 'Dr. Meenal Joshi (MBBS, General Medicine)',
    attachmentType: 'PDF',
    unit: 'General OPD',
    summaryText: 'Nutritional supplementation plan (Synthetic Demo).',
    medications: [
      { name: 'Demo-Tab Calcium Citrate + D3', dosage: '1 tablet after lunch', duration: '45 days' }
    ],
    sections: [
      { heading: 'Note (Demo)', body: 'Synthetic demo prescription created for multi-hospital aggregation test.' }
    ]
  },
  {
    entryId: 'CC-REC-206',
    patientIdentifier: 'DEMO-ABHA-1005',
    reportTitle: 'Gastroenterology Follow-Up Clinical Note (DEMO)',
    categoryCode: 'Diagnosis',
    visitDate: '2026-10-03T13:05:00.000Z',
    clinicianName: 'Dr. Farhan Ali (MD, Internal Medicine)',
    attachmentType: 'PDF',
    unit: 'GI Outpatient Clinic',
    summaryText: 'Post-surgery digestive recovery checkup (Synthetic Demo).',
    sections: [
      { heading: 'Follow-Up Findings (Demo)', body: 'Normal appetite restored; surgical scar healed cleanly with no abdominal tenderness.' }
    ]
  }
];

