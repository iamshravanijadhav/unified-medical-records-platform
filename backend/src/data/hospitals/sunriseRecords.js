/**
 * Independent Data Source: Sunrise Multispeciality Hospital (Mumbai)
 * Simulates a legacy Hospital Information System (HIS) with its own native JSON schema.
 * Note: Synthetic DEMO records only — not real clinical data.
 */

export const SUNRISE_HOSPITAL_INFO = {
  hospitalId: 'HOSP-SUNRISE',
  slug: 'sunrise',
  name: 'Sunrise Multispeciality Hospital',
  location: 'Andheri West, Mumbai, Maharashtra',
  specialties: ['Cardiology', 'Orthopedics', 'Internal Medicine', 'General Surgery']
};

export const sunriseNativeRecords = [
  {
    record_id: 'SUN-REC-101',
    abha_ref: 'DEMO-ABHA-1001',
    doc_title: 'Cardiology Outpatient Evaluation Summary (DEMO)',
    doc_type: 'Diagnosis',
    issued_at: '2026-08-14T10:30:00.000Z',
    physician: 'Dr. Ananya Verma (MD, Cardiology)',
    file_type: 'PDF',
    department: 'Cardiology',
    findings_summary: 'Routine preventive blood pressure evaluation (Synthetic Demo Entry).',
    vitals: { bp: '128/82 mmHg', pulse: '74 bpm', spo2: '98%' },
    sections: [
      { heading: 'Chief Reason for Visit (Demo)', body: 'Routine annual cardiovascular wellness review and baseline blood pressure check.' },
      { heading: 'Synthetic Assessment Note', body: 'Mild Stage-1 elevated reading noted on initial check; advised lifestyle tracking and lipid review. This is a fictional college MVP demo note and not clinical advice.' },
      { heading: 'Follow-Up Recommendation (Demo)', body: 'Continue home BP diary and review lipid profile results in 4 weeks.' }
    ]
  },
  {
    record_id: 'SUN-REC-102',
    abha_ref: 'DEMO-ABHA-1001',
    doc_title: 'Antihypertensive & Preventive Care Prescription (DEMO)',
    doc_type: 'Prescriptions',
    issued_at: '2026-08-14T11:00:00.000Z',
    physician: 'Dr. Ananya Verma (MD, Cardiology)',
    file_type: 'PDF',
    department: 'Cardiology',
    findings_summary: 'Sample synthetic outpatient medication schedule for educational MVP.',
    medications: [
      { name: 'Demo-Tab Telmisartan 20mg', dosage: '1 tablet once daily (Morning)', duration: '30 days' },
      { name: 'Demo-Cap Omega-3 Fatty Acid', dosage: '1 capsule after dinner', duration: '30 days' }
    ],
    sections: [
      { heading: 'Prescription Notes (Demo)', body: 'Synthetic prescription sample generated for Unified Medical Records Access Platform testing. Not for medical use.' }
    ]
  },
  {
    record_id: 'SUN-REC-103',
    abha_ref: 'DEMO-ABHA-1002',
    doc_title: 'Day-Care Observation Discharge Summary (DEMO)',
    doc_type: 'Discharge Summaries',
    issued_at: '2026-07-02T17:15:00.000Z',
    physician: 'Dr. Rajesh Kapoor (MD, Internal Medicine)',
    file_type: 'PDF',
    department: 'Internal Medicine',
    findings_summary: 'Short day-care hydration and observation stay completed (Synthetic Demo).',
    sections: [
      { heading: 'Admission & Stay Overview (Demo)', body: 'Admitted for 8-hour day-care observation following mild dehydration episode. Vitals remained stable throughout stay.' },
      { heading: 'Condition at Discharge (Demo)', body: 'Alert, afebrile, oral hydration tolerated well. Demo discharge documentation only.' }
    ]
  },
  {
    record_id: 'SUN-REC-104',
    abha_ref: 'DEMO-ABHA-1002',
    doc_title: 'Endocrinology Follow-Up Prescription (DEMO)',
    doc_type: 'Prescriptions',
    issued_at: '2026-09-18T09:45:00.000Z',
    physician: 'Dr. Kavita Menon (DM, Endocrinology)',
    file_type: 'PDF',
    department: 'Endocrinology',
    findings_summary: 'Synthetic routine glycemic maintenance plan.',
    medications: [
      { name: 'Demo-Tab Metformin SR 500mg', dosage: '1 tablet after dinner', duration: '60 days' },
      { name: 'Demo-Tab Cholecalciferol 60K', dosage: '1 tablet once weekly', duration: '8 weeks' }
    ],
    sections: [
      { heading: 'Dietary Guidance (Demo)', body: 'Balanced high-fiber meals and 30 minutes brisk walking daily (Synthetic Demo text).' }
    ]
  },
  {
    record_id: 'SUN-REC-105',
    abha_ref: 'DEMO-ABHA-1004',
    doc_title: 'Orthopedic Knee Pain Clinical Assessment (DEMO)',
    doc_type: 'Diagnosis',
    issued_at: '2026-05-21T14:20:00.000Z',
    physician: 'Dr. Siddharth Rao (MS, Orthopedics)',
    file_type: 'PDF',
    department: 'Orthopedics',
    findings_summary: 'Mild patellofemoral strain evaluation (Synthetic Demo).',
    sections: [
      { heading: 'Examination Summary (Demo)', body: 'Mild tenderness around left anterior knee following recreational jogging; full range of motion preserved.' },
      { heading: 'Plan (Demo)', body: 'Conservative physiotherapy and quadriceps strengthening exercises recommended.' }
    ]
  },
  {
    record_id: 'SUN-REC-106',
    abha_ref: 'DEMO-ABHA-1005',
    doc_title: 'Post-Laparoscopic Procedure Discharge Summary (DEMO)',
    doc_type: 'Discharge Summaries',
    issued_at: '2026-06-11T16:00:00.000Z',
    physician: 'Dr. Neha Kulkarni (MS, General Surgery)',
    file_type: 'PDF',
    department: 'General Surgery',
    findings_summary: 'Uncomplicated recovery after elective minimally invasive procedure (Demo).',
    sections: [
      { heading: 'Hospital Course (Demo)', body: 'Post-operative period remained uneventful. Clean incision sites with normal ambulation.' },
      { heading: 'Discharge Instructions (Demo)', body: 'Keep dressing dry for 48 hours and return for suture inspection on Day 7.' }
    ]
  },
  {
    record_id: 'SUN-REC-107',
    abha_ref: 'DEMO-ABHA-1004',
    doc_title: 'Physiotherapy Rehabilitation Exercise Plan (DEMO)',
    doc_type: 'Other Medical Documents',
    issued_at: '2026-06-05T11:30:00.000Z',
    physician: 'Dr. Siddharth Rao (MS, Orthopedics)',
    file_type: 'PDF',
    department: 'Physiotherapy & Rehab',
    findings_summary: '4-week guided home mobility protocol (Synthetic Demo).',
    sections: [
      { heading: 'Rehabilitation Schedule (Demo)', body: 'Week 1-2: Straight-leg raises (3x10), isometric quad sets. Week 3-4: Low-resistance stationary cycling.' }
    ]
  }
];

