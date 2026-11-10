import {
  Activity,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileImage,
  FileText,
  Info,
  Pill,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatDateTime, getCategoryColorClass } from '../../utils/formatters';

export default function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false);
  const isImage = record.fileFormat === 'IMAGE';

  return (
    <div className="card overflow-hidden transition-colors hover:border-blue-300">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                isImage ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isImage ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColorClass(
                    record.category
                  )}`}
                >
                  {record.category}
                </span>
                {record.fileFormat && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
                    {record.fileFormat}
                  </span>
                )}
                {record.department && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50/70 text-blue-700 border border-blue-100">
                    {record.department}
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">{record.recordId}</span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-slate-900">
                {record.title}
              </h4>

              {record.findingsSummary && (
                <p className={`mt-1 text-xs text-slate-600 ${expanded ? '' : 'line-clamp-2'}`}>
                  {record.findingsSummary}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  {record.hospitalName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(record.reportDate)}
                </span>
                {record.doctorName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                    {record.doctorName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="btn-secondary py-1.5 px-3 text-xs w-full lg:w-auto"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Details
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-4 space-y-4">
          {/* Structured Metadata Grid */}
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Medical Record Metadata & Details
            </h5>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                <dt className="text-[11px] text-slate-500">Record Identifier</dt>
                <dd className="mt-0.5 font-mono font-semibold text-slate-900">{record.recordId}</dd>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                <dt className="text-[11px] text-slate-500">Hospital Source</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {record.hospitalName}
                  {record.hospitalId ? (
                    <span className="block font-mono text-[10px] font-normal text-slate-500">
                      {record.hospitalId}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                <dt className="text-[11px] text-slate-500">Report Type & Date</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {record.category}
                  <span className="block text-[11px] font-normal text-slate-500">
                    {formatDateTime(record.reportDate)}
                  </span>
                </dd>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                <dt className="text-[11px] text-slate-500">Clinician & Format</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {record.doctorName || 'Not specified'}
                  <span className="block text-[11px] font-normal text-slate-500">
                    {record.department || 'General'} • {record.fileFormat || 'PDF'} •{' '}
                    <span className="font-mono text-blue-700">{record.fhirResourceType || 'DocumentReference'}</span>
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Recorded Vitals */}
          {record.vitals && (
            <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 mb-1.5">
                <Activity className="h-3.5 w-3.5" />
                Recorded Vitals (Synthetic Demo)
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate-800">
                {record.vitals.bp && (
                  <span>
                    <strong>Blood Pressure:</strong> {record.vitals.bp}
                  </span>
                )}
                {record.vitals.pulse && (
                  <span>
                    <strong>Pulse:</strong> {record.vitals.pulse}
                  </span>
                )}
                {record.vitals.spo2 && (
                  <span>
                    <strong>SpO2:</strong> {record.vitals.spo2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Structured Lab Parameters Table */}
          {Array.isArray(record.labTable) && record.labTable.length > 0 && (
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Laboratory Values (Synthetic Demo)
              </h5>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Parameter</th>
                      <th className="py-2 px-3 font-semibold">Result</th>
                      <th className="py-2 px-3 font-semibold">Reference Range</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.labTable.map((row) => (
                      <tr key={row.parameter}>
                        <td className="py-2 px-3 font-medium text-slate-900">{row.parameter}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{row.value}</td>
                        <td className="py-2 px-3 text-slate-500">{row.reference}</td>
                        <td className="py-2 px-3 font-semibold text-teal-700">{row.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medication Schedule */}
          {Array.isArray(record.medications) && record.medications.length > 0 && (
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <Pill className="h-3.5 w-3.5 text-emerald-600" />
                Medication Schedule (Synthetic Demo)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {record.medications.map((med) => (
                  <div key={med.name} className="rounded-lg bg-white border border-slate-200 p-3 text-xs">
                    <div className="font-semibold text-slate-900">{med.name}</div>
                    <div className="text-slate-600 mt-0.5">{med.dosage}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Duration: {med.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical / Document Narrative Sections */}
          {Array.isArray(record.sections) && record.sections.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Clinical & Record Summary Notes (Demo)
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {record.sections.map((sec) => (
                  <div key={sec.heading} className="rounded-lg bg-white border border-slate-200 p-3 text-xs">
                    <div className="font-semibold text-slate-900">{sec.heading}</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2 text-[11px] text-amber-900">
            <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Educational MVP Data Notice:</strong> Synthetic hospital record metadata displayed for demonstration only — not clinical diagnosis or medical advice.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
