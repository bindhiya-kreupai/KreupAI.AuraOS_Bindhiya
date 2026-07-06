'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  UploadCloud,
  X,
  Loader2,
} from 'lucide-react';
import { ComplianceAuditService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface AuditRow {
  id: string;
  auditCode?: string;
  auditName?: string;
  auditType?: string;
  status?: string;
  scheduledDate?: string;
  complianceScore?: number;
  findingsCount?: number;
  criticalCount?: number;
}

const AUDIT_TYPES = ['internal', 'external', 'regulatory', 'surprise', 'follow_up'];

function statusBadge(status?: string) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-600';
    case 'in_progress':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}

export default function ComplianceAuditsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const [form, setForm] = useState({
    auditName: '',
    auditType: 'internal',
    scheduledDate: '',
    scope: '',
  });

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ComplianceAuditService.getAudits();
      setAudits(data as unknown as AuditRow[]);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to load audits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const completed = audits.filter((a) => (a.status || '').toLowerCase() === 'completed');
  const overallCompliance = completed.length
    ? Math.round(completed.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / completed.length)
    : 0;
  const openNonConformities = audits
    .filter((a) => (a.status || '').toLowerCase() !== 'completed')
    .reduce((sum, a) => sum + (a.findingsCount || 0), 0);
  const now = Date.now();
  const nextAudit = audits
    .filter((a) => a.scheduledDate && new Date(a.scheduledDate).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.auditName.trim() || !form.scheduledDate) {
      notify('warning', 'Audit name and scheduled date are required');
      return;
    }
    setSubmitting(true);
    try {
      await ComplianceAuditService.createAudit({
        auditName: form.auditName,
        auditType: form.auditType,
        scheduledDate: form.scheduledDate,
        scope: form.scope,
      });
      setShowCreate(false);
      setForm({ auditName: '', auditType: 'internal', scheduledDate: '', scope: '' });
      notify('success', 'Audit scheduled');
      await fetchAudits();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to schedule audit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-500" />
            Compliance Audits
          </h1>
          <p className="text-slate-500 text-sm">
            Internal and external audit management, checklists, and evidence.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={authLoading || !user}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Calendar className="w-4 h-4" /> Schedule Audit
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Overall Compliance</div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold">{overallCompliance}%</div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${overallCompliance}%` }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Open Non-Conformities</div>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold">{openNonConformities}</div>
          <div className="text-xs text-amber-600 mt-1">Across active audits</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Next Audit</div>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold">
            {nextAudit?.scheduledDate
              ? new Date(nextAudit.scheduledDate).toLocaleDateString()
              : '—'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {nextAudit?.auditName || 'None scheduled'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        {/* Active Audits */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Active &amp; Upcoming Audits</h3>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 flex items-center justify-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading audits&hellip;
              </div>
            ) : audits.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No audits found.</div>
            ) : (
              audits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex flex-col p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-sm">
                        {audit.auditName || audit.auditCode || 'Audit'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                          {audit.auditType || 'internal'}
                        </span>
                        {audit.scheduledDate && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {new Date(audit.scheduledDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusBadge(audit.status)}`}
                    >
                      {audit.status || 'scheduled'}
                    </span>
                  </div>
                  {typeof audit.complianceScore === 'number' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Compliance Score</span>
                        <span className="font-bold">{audit.complianceScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${audit.complianceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evidence Locker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Evidence Locker</h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center mb-6">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
              Upload Documents
            </div>
            <div className="text-xs text-slate-400 mt-1">Policy docs, logs, screenshots</div>
          </div>

          <h4 className="font-bold text-slate-500 uppercase mb-3 text-xs">Recent Files</h4>
          <div className="text-sm text-slate-400 text-center py-6">No evidence uploaded yet.</div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">Schedule Audit</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Audit Name
                </label>
                <input
                  value={form.auditName}
                  onChange={(e) => setForm({ ...form, auditName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Audit Type
                </label>
                <select
                  value={form.auditType}
                  onChange={(e) => setForm({ ...form, auditType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                >
                  {AUDIT_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Scope
                </label>
                <input
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
