'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Lock,
  Users,
  FileText,
  EyeOff,
  CheckCircle,
  X,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { POSHService } from '../services';
import type { POSHComplaint, POSHCommittee, CommitteeMember, Toast } from '../types';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

const STATUS_STYLES: Record<string, string> = {
  received: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  under_investigation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inquiry_committee_formed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hearing_scheduled: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  appealed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const;

function formatLabel(value?: string): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function POSHPage() {
  const { loading: authLoading } = useCurrentUser();
  const [complaints, setComplaints] = useState<POSHComplaint[]>([]);
  const [committees, setCommittees] = useState<POSHCommittee[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [complaintsData, committeesData] = await Promise.all([
        POSHService.getComplaints(),
        POSHService.getCommittees(),
      ]);
      setComplaints(complaintsData);
      setCommittees(committeesData);
    } catch {
      notify('error', 'Failed to load POSH data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Complaint form
  const [respondentName, setRespondentName] = useState('');
  const [respondentDepartment, setRespondentDepartment] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [severity, setSeverity] = useState<(typeof SEVERITY_OPTIONS)[number]>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complainantName, setComplainantName] = useState('');

  const resetComplaintForm = () => {
    setRespondentName('');
    setRespondentDepartment('');
    setIncidentLocation('');
    setIncidentDescription('');
    setSeverity('medium');
    setIsAnonymous(false);
    setComplainantName('');
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Partial<POSHComplaint> = {
        respondentName,
        respondentDepartment,
        incidentLocation,
        incidentDescription,
        severity,
        isAnonymous,
        incidentDate: new Date().toISOString(),
      };
      if (!isAnonymous && complainantName.trim()) {
        payload.complainantName = complainantName.trim();
      }
      await POSHService.createComplaint(payload);
      setShowComplaintModal(false);
      resetComplaintForm();
      await fetchData();
      notify('success', 'Complaint filed securely');
    } catch {
      notify('error', 'Failed to file complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Committee form
  const [committeeName, setCommitteeName] = useState('');
  const [committeeLocation, setCommitteeLocation] = useState('');

  const submitCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await POSHService.createCommittee({
        committeeName,
        location: committeeLocation,
        members: [],
      });
      setShowCommitteeModal(false);
      setCommitteeName('');
      setCommitteeLocation('');
      await fetchData();
      notify('success', 'Committee created');
    } catch {
      notify('error', 'Failed to create committee');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCommittee = committees.find((c) => c.isActive) ?? committees[0];
  const iccMembers: CommitteeMember[] = activeCommittee?.members ?? [];

  const totalCasesHandled = committees.reduce((sum, c) => sum + (c.casesHandled ?? 0), 0);
  const totalCasesResolved = committees.reduce((sum, c) => sum + (c.casesResolved ?? 0), 0);
  const resolutionRate =
    totalCasesHandled > 0 ? Math.round((totalCasesResolved / totalCasesHandled) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading POSH portal…</p>
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
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            POSH Compliance
          </h1>
          <p className="text-slate-500 text-sm">
            Prevention of Sexual Harassment - Internal Committee Portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPolicyModal(true)}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl"
          >
            <FileText className="w-4 h-4" /> Policy Doc
          </button>
          <button
            onClick={() => setShowComplaintModal(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20"
          >
            <Lock className="w-4 h-4" /> Secure Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto pb-20">
        {/* ICC Committee */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Internal Complaints Committee (ICC)
            </h3>
            {activeCommittee && (
              <span className="text-xs text-slate-500">
                {activeCommittee.committeeName} · {activeCommittee.location}
              </span>
            )}
          </div>

          {!activeCommittee ? (
            <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm mb-4">
                No Internal Complaints Committee configured yet.
              </p>
              <button
                onClick={() => setShowCommitteeModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                <Plus className="w-4 h-4" /> Create Committee
              </button>
            </div>
          ) : iccMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              Committee exists but has no members assigned yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {iccMembers.map((c) => (
                <div
                  key={c.memberId}
                  className="flex items-center gap-3 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {(c.memberName ?? '?').substring(0, 1)}
                  </div>
                  <div>
                    <div className="font-bold">{c.memberName}</div>
                    <div className="text-xs text-slate-500">{formatLabel(c.role)}</div>
                    {c.organization && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 mt-1 inline-block">
                        {c.organization}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Case Resolution</h3>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex items-center justify-center mb-4">
              <span className="text-3xl font-black text-emerald-600">{resolutionRate}%</span>
            </div>
            <p className="text-sm text-center text-slate-500 mb-4">
              {totalCasesResolved} of {totalCasesHandled} cases resolved across committees
            </p>
            <Link
              href="/dashboard/compliance"
              className="w-full text-center py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" /> View Training Records
            </Link>
          </div>
        </div>

        {/* Confidential Reports / Complaints list */}
        <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-rose-800 dark:text-rose-400 flex items-center gap-2">
              <EyeOff className="w-5 h-5" /> Confidential Reports Area
            </h3>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> File Complaint
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-900/50 p-6 flex flex-col items-center justify-center text-center">
              <Lock className="w-12 h-12 text-rose-300 mb-4" />
              <h4 className="font-bold text-lg text-slate-700 dark:text-slate-300">
                No Active Reports
              </h4>
              <p className="text-slate-500 text-sm max-w-md mt-2">
                There are currently no filed POSH complaints. Use &quot;Secure Report&quot; to
                submit one confidentially.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-900/50 divide-y divide-slate-100 dark:divide-slate-800">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{c.complaintCode}</span>
                        {c.isAnonymous && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Anonymous
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        Respondent: {c.respondentName}
                        {c.respondentDepartment ? ` · ${c.respondentDepartment}` : ''}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Severity: {formatLabel(c.severity)}
                        {c.incidentDate
                          ? ` · Incident: ${new Date(c.incidentDate).toLocaleDateString()}`
                          : ''}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${STATUS_STYLES[c.status] ?? STATUS_STYLES.received}`}
                  >
                    {formatLabel(c.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submitComplaint}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-500" /> File Confidential Complaint
              </h3>
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Respondent Name
                </label>
                <input
                  required
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Respondent Department
                </label>
                <input
                  value={respondentDepartment}
                  onChange={(e) => setRespondentDepartment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Incident Location
                </label>
                <input
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Incident Description
                </label>
                <textarea
                  required
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as (typeof SEVERITY_OPTIONS)[number])}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                File anonymously (identity withheld)
              </label>
              {!isAnonymous && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name (optional)
                  </label>
                  <input
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Submit Securely'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Committee Modal */}
      {showCommitteeModal && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submitCommittee}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Create ICC
              </h3>
              <button
                type="button"
                onClick={() => setShowCommitteeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Committee Name
                </label>
                <input
                  required
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  required
                  value={committeeLocation}
                  onChange={(e) => setCommitteeLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCommitteeModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Policy Info Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> POSH Policy
              </h3>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                The organisation&apos;s POSH policy is maintained centrally in the Documents /
                Policy Acknowledgement module.
              </p>
              <p>
                Employees are required to acknowledge the policy. Review acknowledgement status
                below.
              </p>
              <Link
                href="/dashboard/compliance/policy-acknowledgement"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                <FileText className="w-4 h-4" /> Go to Policy Acknowledgement
              </Link>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
