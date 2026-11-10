export const RECORD_CATEGORIES = [
  'Blood Test Reports',
  'X-ray Reports',
  'MRI Reports',
  'CT Scan Reports',
  'Prescriptions',
  'Diagnosis',
  'Discharge Summaries',
  'Other Medical Documents'
];

export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getCategoryColorClass(category) {
  const map = {
    'Blood Test Reports': 'bg-rose-50 text-rose-700 border-rose-200',
    'X-ray Reports': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'MRI Reports': 'bg-violet-50 text-violet-700 border-violet-200',
    'CT Scan Reports': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Prescriptions: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Diagnosis: 'bg-blue-50 text-blue-700 border-blue-200',
    'Discharge Summaries': 'bg-amber-50 text-amber-700 border-amber-200',
    'Other Medical Documents': 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function formatActionLabel(action) {
  const labels = {
    PATIENT_SEARCH: 'Patient Search',
    PATIENT_SEARCH_NOT_FOUND: 'Patient Not Found',
    RECORDS_FETCHED: 'Combined Records Fetched',
    HOSPITAL_REGISTERED: 'Hospital Registered',
    HOSPITAL_UPDATED: 'Hospital Updated',
    HOSPITAL_STATUS_CHANGED: 'Hospital Status Changed',
    HOSPITAL_VERIFIED: 'Hospital Verified',
    USER_LOGIN: 'User Login',
    USER_REGISTERED: 'User Registered'
  };
  return labels[action] || action;
}

