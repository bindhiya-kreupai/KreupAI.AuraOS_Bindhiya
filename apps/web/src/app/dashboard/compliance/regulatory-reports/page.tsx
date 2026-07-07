'use client';

/**
 * Regulatory Reports (Labor Relations) — live view of regulatory compliance
 * records and scheduled/completed regulatory audits, backed by the compliance
 * APIs (/compliance/records, /compliance/audits, /compliance/settings). Users
 * can file a regulatory compliance record and mark a scheduled audit complete;
 * every action persists and refreshes.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Scale, FileCheck, AlertOctagon, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import {
  ComplianceRecordService,
  ComplianceAuditService,
  ComplianceSettingsService,
} from '../services';
import type { ComplianceRecord, ComplianceAudit, ComplianceSettings, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

type RecordRow = ComplianceRecord & { requirement?: string; createdAt?: string };
type AuditRow = ComplianceAudit & {
  auditName?: string;
  scheduledDate?: string;
  status: ComplianceAudit['status'];
};

const REGULATORY_TYPE = 'labor_law';

function formatLabel(value?: string): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_BADGE: Record<string, string> = {
  compliant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  non_compliant: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  pending_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  under_investigation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

export default function RegulatoryReportsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rec, aud, set] = await Promise.all([
        ComplianceRecordService.getRecords(),
        ComplianceAuditService.getAudits(),
        ComplianceSettingsService.getSettings().catch(() => null),
      ]);
      setRecords(rec as RecordRow[]);
      setAudits(aud as AuditRow[]);
      setSettings(set);
    } catch {
      setError('Failed to load regulatory data.');
      setRecords([]);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const regulatoryAudits = useMemo(
    () => audits.filter((a) => (a as { auditType?: string }).auditType === 'regulatory'),
    [audits]
  );

  const stats = useMemo(() => {
    const total = records.length;
    const compliant = records.filter(
      (r) => r.status === 'compliant' || r.status === 'resolved'
    ).length;
    const nonCompliant = records.filter((r) => r.status === 'non_compliant').length;
    const score = total > 0 ? Math.round((compliant / total) * 100) : 0;
    const scheduledAudits = regulatoryAudits.filter(
      (a) => a.status === 'scheduled' || a.status === 'in_progress'
    ).length;
    return { total, compliant, nonCompliant, score, scheduledAudits };
  }, [records, regulatoryAudits]);

  // File a regulatory record
  const [requirement, setRequirement] = useState('');
  const [lawName, setLawName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  const resetForm = () => {
    setRequirement('');
    setLawName('');
    setDueDate('');
    setResponsiblePerson('');
  };

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) {
      notify('warning', 'Requirement is required');
      return;
    }
    setSubmitting(true);
    try {
      await ComplianceRecordService.createRecord({
        requirement: requirement.trim(),
        lawName: lawName.trim() || undefined,
        complianceType: REGULATORY_TYPE,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        responsiblePerson: responsiblePerson.trim() || undefined,
        status: 'pending_review',
      } as Partial<ComplianceRecord>);
      notify('success', 'Regulatory record filed');
      resetForm();
      setShowForm(false);
      await load();
    } catch {
      notify('error', 'Failed to file record');
    } finally {
      setSubmitting(false);
    }
  };

  const markAuditComplete = async (audit: AuditRow) => {
    setMarkingId(audit.id);
    try {
      await ComplianceAuditService.updateAudit(audit.id, {
        status: 'completed',
        completionDate: new Date().toISOString(),
      });
      notify('success', 'Audit marked complete');
      await load();
    } catch {
      notify('error', 'Failed to update audit');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Regulatory Reports
          </h1>
          <p className="text-slate-500 text-sm">
            Track regulatory compliance records and audit filings
            {settings ? ` · reporting ${settings.regulatoryReportingFrequency}` : ''}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'File Regulatory Record'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submitRecord}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2">Requirement</label>
            <input
              required
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="e.g. Quarterly labour ministry filing"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Regulation / Law</label>
            <input
              value={lawName}
              onChange={(e) => setLawName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Responsible Person</label>
            <input
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" /> {submitting ? 'Filing…' : 'File Record'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliance Score</div>
          <div className="text-4xl font-bold text-emerald-600">{stats.score}%</div>
          <div className="text-xs text-slate-400 mt-1">{stats.total} records</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliant</div>
          <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">
            {stats.compliant}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Non-Compliant</div>
          <div className="text-4xl font-bold text-rose-600">{stats.nonCompliant}</div>
          <div className="text-xs text-amber-500 font-bold mt-1">
            {stats.nonCompliant > 0 ? 'Requires Attention' : 'All clear'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Scheduled Audits</div>
          <div className="text-4xl font-bold text-indigo-600">{stats.scheduledAudits}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading regulatory data…
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <AlertOctagon className="w-8 h-8 text-amber-500" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto pb-20">
          {/* Regulatory records */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Regulatory Records</h3>
            {records.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No records yet.</p>
            ) : (
              <div className="space-y-1">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        {r.requirement ?? r.requirementDescription ?? '—'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.lawName ? `${r.lawName} · ` : ''}Due {formatDate(r.dueDate)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        STATUS_BADGE[r.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {formatLabel(r.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regulatory audits */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Regulatory Audits</h3>
            {regulatoryAudits.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No regulatory audits scheduled.
              </p>
            ) : (
              <div className="space-y-1">
                {regulatoryAudits.map((a) => {
                  const done = a.status === 'completed' || a.status === 'closed';
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-full ${
                            done ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertOctagon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate">{a.auditName ?? 'Audit'}</div>
                          <div className="text-xs text-slate-500">
                            {formatLabel(a.status)} · {formatDate(a.scheduledDate)}
                          </div>
                        </div>
                      </div>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => void markAuditComplete(a)}
                          disabled={markingId === a.id}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 disabled:opacity-50 shrink-0"
                        >
                          {markingId === a.id ? 'Saving…' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
