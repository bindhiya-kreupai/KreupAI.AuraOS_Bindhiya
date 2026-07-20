'use client';

import React, { useState } from 'react';
import { Ear, Shield, Lock, Send, Info, CheckCircle, Search } from 'lucide-react';
import { WhistleblowerService } from '../services';
import type { WhistleblowerReport, Severity, Toast } from '../types';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

type AllegationType = WhistleblowerReport['allegationType'];
type ReporterIdentity = WhistleblowerReport['reporterIdentity'];

const ALLEGATION_TYPES: AllegationType[] = [
  'fraud',
  'corruption',
  'misconduct',
  'safety_violation',
  'legal_violation',
  'ethical_violation',
  'other',
];
const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];
const IDENTITIES: ReporterIdentity[] = ['anonymous', 'confidential', 'disclosed'];

function formatLabel(value?: string): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function WhistleblowerPage() {
  const { loading: authLoading } = useCurrentUser();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  // Report form
  const [subject, setSubject] = useState('');
  const [allegationType, setAllegationType] = useState<AllegationType>('fraud');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [locationOfIncident, setLocationOfIncident] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [reporterIdentity, setReporterIdentity] = useState<ReporterIdentity>('anonymous');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const resetForm = () => {
    setSubject('');
    setAllegationType('fraud');
    setSeverity('medium');
    setDetailedDescription('');
    setLocationOfIncident('');
    setDateOfIncident('');
    setReporterIdentity('anonymous');
    setReporterName('');
    setReporterContact('');
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        subject,
        allegationType,
        severity,
        detailedDescription,
        locationOfIncident,
        dateOfIncident: dateOfIncident ? new Date(dateOfIncident).toISOString() : undefined,
        reporterIdentity,
      };
      if (reporterIdentity !== 'anonymous') {
        if (reporterName.trim()) payload.reporterName = reporterName.trim();
        if (reporterContact.trim()) payload.reporterContact = reporterContact.trim();
      }
      const created = await WhistleblowerService.createReport(payload);
      setSubmittedCode(created.reportCode);
      resetForm();
      notify('success', 'Report submitted securely');
    } catch {
      notify('error', 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  // Track case
  const [trackCode, setTrackCode] = useState('');
  const [trackedReport, setTrackedReport] = useState<Pick<
    WhistleblowerReport,
    'reportCode' | 'subject' | 'status' | 'submittedDate'
  > | null>(null);

  const trackReport = async () => {
    if (!trackCode.trim()) {
      notify('warning', 'Enter a case ID to track');
      return;
    }
    setTracking(true);
    setTrackedReport(null);
    try {
      const report = await WhistleblowerService.getReportByCode(trackCode.trim());
      if (!report) {
        notify('error', 'No report found for that case ID');
        return;
      }
      setTrackedReport({
        reportCode: report.reportCode,
        subject: report.subject,
        status: report.status,
        submittedDate: report.submittedDate,
      });
    } catch {
      notify('error', 'Failed to look up report');
    } finally {
      setTracking(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading whistleblower portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ear className="w-6 h-6 text-indigo-500" />
            Whistleblower Portal
          </h1>
          <p className="text-slate-500 text-sm">
            Anonymous reporting for ethics violations and fraud.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 h-full min-h-0">
        {/* Reporting Form */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex gap-3">
              <Shield className="w-8 h-8 text-indigo-600 shrink-0" />
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
                  Your Identity is Protected
                </h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-400 mt-1">
                  Choose Anonymous to withhold your identity entirely. Confidential and Disclosed
                  options let you optionally share contact details for follow-up.
                </p>
              </div>
            </div>

            {submittedCode && (
              <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  <CheckCircle className="w-5 h-5" /> Report Submitted
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  Save your case ID to track status later:
                </p>
                <p className="mt-2 text-2xl font-black tracking-wider text-emerald-900 dark:text-emerald-200 select-all">
                  {submittedCode}
                </p>
              </div>
            )}

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  placeholder="Brief summary of the concern"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Allegation Type
                  </label>
                  <select
                    value={allegationType}
                    onChange={(e) => setAllegationType(e.target.value as AllegationType)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {ALLEGATION_TYPES.map((a) => (
                      <option key={a} value={a}>
                        {formatLabel(a)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Severity)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Details
                </label>
                <textarea
                  required
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
                  placeholder="Describe the incident. Provide dates, names, and specifics if possible..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Location of Incident
                  </label>
                  <input
                    value={locationOfIncident}
                    onChange={(e) => setLocationOfIncident(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    value={dateOfIncident}
                    onChange={(e) => setDateOfIncident(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Reporter Identity
                </label>
                <select
                  value={reporterIdentity}
                  onChange={(e) => setReporterIdentity(e.target.value as ReporterIdentity)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                >
                  {IDENTITIES.map((i) => (
                    <option key={i} value={i}>
                      {formatLabel(i)}
                    </option>
                  ))}
                </select>
              </div>

              {reporterIdentity !== 'anonymous' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Your Name
                    </label>
                    <input
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Contact
                    </label>
                    <input
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> What happens next?
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm opacity-90 marker:font-bold">
              <li>Report is securely sent to the Ethics Committee.</li>
              <li>A unique Case ID is generated for you.</li>
              <li>Use this ID to track status later.</li>
              <li>Investigation begins per policy timelines.</li>
            </ol>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold mb-4">Track Existing Report</h3>
            <input
              type="text"
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value)}
              placeholder="Enter Case ID"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 mb-2 outline-none"
            />
            <button
              onClick={trackReport}
              disabled={tracking}
              className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" /> {tracking ? 'Checking…' : 'Track Case Status'}
            </button>

            {trackedReport && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm space-y-1">
                <div className="font-bold">{trackedReport.reportCode}</div>
                <div className="text-slate-600 dark:text-slate-300">{trackedReport.subject}</div>
                <div>
                  <span className="text-slate-500">Status: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatLabel(trackedReport.status)}
                  </span>
                </div>
                {trackedReport.submittedDate && (
                  <div className="text-xs text-slate-400">
                    Submitted {new Date(trackedReport.submittedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
