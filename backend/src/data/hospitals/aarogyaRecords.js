/**
 * Independent Data Source: Aarogya Diagnostic Centre (Bengaluru)
 * Simulates a Diagnostic & Radiology PACS/LIS API with its own native schema.
 * Note: Synthetic DEMO reports and generated demo scan images only.
 */

export const AAROGYA_HOSPITAL_INFO = {
  hospitalId: 'HOSP-AAROGYA',
  slug: 'aarogya',
  name: 'Aarogya Diagnostic Centre',
  location: 'Indiranagar, Bengaluru, Karnataka',
  specialties: ['Pathology & Hematology', 'Digital Radiography (X-Ray)', 'MRI Imaging', 'CT Scan']
};

export const aarogyaNativeRecords = [
  {
    labRef: 'AAR-REC-301',
    abhaId: 'DEMO-ABHA-1001',
    testName: 'Complete Blood Count (CBC) & Lipid Profile (DEMO)',
    modality: 'Blood Test Reports',
    reportTimestamp: '2026-08-12T08:15:00.000Z',
    pathologist: 'Dr. Shalini Hegde (MD, Pathology)',
    format: 'PDF',
    labSection: 'Hematology & Biochemistry',
    findings_summary: 'Synthetic CBC & Lipid panel values within demo reference ranges.',
    labTable: [
      { parameter: 'Hemoglobin (Demo)', value: '14.2 g/dL', reference: '13.0 - 17.0 g/dL', flag: 'Normal' },
      { parameter: 'Total WBC Count (Demo)', value: '6,800 /uL', reference: '4,000 - 11,000 /uL', flag: 'Normal' },
      { parameter: 'Platelet Count (Demo)', value: '245,000 /uL', reference: '150,000 - 450,000 /uL', flag: 'Normal' },
      { parameter: 'Total Cholesterol (Demo)', value: '188 mg/dL', reference: '< 200 mg/dL', flag: 'Desirable' },
      { parameter: 'LDL Cholesterol (Demo)', value: '108 mg/dL', reference: '< 130 mg/dL', flag: 'Near Optimal' },
      { parameter: 'HDL Cholesterol (Demo)', value: '48 mg/dL', reference: '> 40 mg/dL', flag: 'Normal' }
    ],
    sections: [
      { heading: 'Laboratory Disclaimer', body: 'All numerical values above are synthetic sample numbers created strictly for academic MVP demonstration.' }
    ]
  },
  {
    labRef: 'AAR-REC-302',
    abhaId: 'DEMO-ABHA-1001',
    testName: 'Chest X-Ray PA View (DEMO Synthetic Imaging)',
    modality: 'X-ray Reports',
    reportTimestamp: '2026-09-03T11:45:00.000Z',
    pathologist: 'Dr. Arvind Krishnan (MD, Radiodiagnosis)',
    format: 'IMAGE',
    labSection: 'Digital Radiography',
    findings_summary: 'Synthetic chest radiograph metadata summary showing clear lung fields and normal cardiothoracic ratio (Demo).',
    sections: [
      { heading: 'Synthetic Radiology Template Note', body: 'Demo chest radiography record metadata. This entry is an educational sample and NOT a medical diagnostic film.' }
    ]
  },
  {
    labRef: 'AAR-REC-303',
    abhaId: 'DEMO-ABHA-1002',
    testName: 'HbA1c, Fasting Glucose & Thyroid Panel (DEMO)',
    modality: 'Blood Test Reports',
    reportTimestamp: '2026-07-01T07:50:00.000Z',
    pathologist: 'Dr. Shalini Hegde (MD, Pathology)',
    format: 'PDF',
    labSection: 'Clinical Biochemistry',
    findings_summary: 'Synthetic metabolic & thyroid panel sample report.',
    labTable: [
      { parameter: 'Fasting Blood Glucose (Demo)', value: '104 mg/dL', reference: '70 - 110 mg/dL', flag: 'Normal' },
      { parameter: 'HbA1c (Demo)', value: '6.1 %', reference: '< 6.5 %', flag: 'Monitored' },
      { parameter: 'TSH (Demo)', value: '2.4 mIU/L', reference: '0.4 - 4.2 mIU/L', flag: 'Normal' }
    ],
    sections: [
      { heading: 'Laboratory Disclaimer', body: 'Synthetic educational dataset. Not valid for clinical decision-making.' }
    ]
  },
  {
    labRef: 'AAR-REC-304',
    abhaId: 'DEMO-ABHA-1002',
    testName: 'Lumbar Spine MRI Screening Scan (DEMO Synthetic Imaging)',
    modality: 'MRI Reports',
    reportTimestamp: '2026-09-15T14:10:00.000Z',
    pathologist: 'Dr. Arvind Krishnan (MD, Radiodiagnosis)',
    format: 'IMAGE',
    labSection: '1.5T MRI Suite',
    findings_summary: 'Synthetic sagittal spine MRI findings summary preserving normal lumbar lordosis (Demo).',
    sections: [
      { heading: 'Synthetic Imaging Note', body: 'Demo MRI metadata record for Unified Medical Records Access Platform MVP.' }
    ]
  },
  {
    labRef: 'AAR-REC-305',
    abhaId: 'DEMO-ABHA-1003',
    testName: 'Brain MRI Non-Contrast Scan (DEMO Synthetic Imaging)',
    modality: 'MRI Reports',
    reportTimestamp: '2026-04-18T15:30:00.000Z',
    pathologist: 'Dr. Arvind Krishnan (MD, Radiodiagnosis)',
    format: 'IMAGE',
    labSection: 'Neuro-MRI Unit',
    findings_summary: 'Synthetic axial brain MRI findings summary without acute intracranial abnormality (Demo).',
    sections: [
      { heading: 'Synthetic Imaging Note', body: 'Synthetic demo MRI record metadata. Not a real patient MRI.' }
    ]
  },
  {
    labRef: 'AAR-REC-306',
    abhaId: 'DEMO-ABHA-1003',
    testName: 'Comprehensive Metabolic & Liver Function Panel (DEMO)',
    modality: 'Blood Test Reports',
    reportTimestamp: '2026-08-25T08:40:00.000Z',
    pathologist: 'Dr. Shalini Hegde (MD, Pathology)',
    format: 'PDF',
    labSection: 'Biochemistry Lab',
    findings_summary: 'Synthetic hepatic & renal panel test sheet.',
    labTable: [
      { parameter: 'Serum Creatinine (Demo)', value: '0.9 mg/dL', reference: '0.7 - 1.3 mg/dL', flag: 'Normal' },
      { parameter: 'ALT / SGPT (Demo)', value: '26 U/L', reference: '7 - 56 U/L', flag: 'Normal' },
      { parameter: 'AST / SGOT (Demo)', value: '24 U/L', reference: '10 - 40 U/L', flag: 'Normal' },
      { parameter: 'Total Bilirubin (Demo)', value: '0.7 mg/dL', reference: '0.2 - 1.2 mg/dL', flag: 'Normal' }
    ],
    sections: [
      { heading: 'Laboratory Disclaimer', body: 'Synthetic academic demonstration report only.' }
    ]
  },
  {
    labRef: 'AAR-REC-307',
    abhaId: 'DEMO-ABHA-1005',
    testName: 'Abdominal Contrast CT Scan (DEMO Synthetic Imaging)',
    modality: 'CT Scan Reports',
    reportTimestamp: '2026-10-01T10:05:00.000Z',
    pathologist: 'Dr. Arvind Krishnan (MD, Radiodiagnosis)',
    format: 'IMAGE',
    labSection: 'Multi-Slice CT Unit',
    findings_summary: 'Synthetic abdominal CT scan findings summary showing unremarkable solid organs (Demo).',
    sections: [
      { heading: 'Synthetic Imaging Note', body: 'Synthetic demo CT metadata record for multi-hospital timeline testing.' }
    ]
  }
];

