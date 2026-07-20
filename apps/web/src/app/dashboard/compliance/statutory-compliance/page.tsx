'use client';

/**
 * Statutory Compliance (Labor Relations) — live statutory compliance tracking
 * backed by the compliance APIs. Statutory obligations are modelled as
 * compliance records (tax / safety / labour-law types) via /compliance/records,
 * and reporting cadence / retention config persist through /compliance/settings.
 * All buttons perform real, tenant-scoped writes and refresh.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Scale, Save, CheckCircle2, Loader2, Plus, X, ShieldCheck } from 'lucide-react';
import { ComplianceRecordService, ComplianceSettingsService } from '../services';
import type { ComplianceRecord, ComplianceSettings, ComplianceType, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

type RecordRow = ComplianceRecord & { requirement?: string };

const STATUTORY_TYPES: { value: ComplianceType; label: string }[] = [
  { value: 'tax', label: 'Tax' },
  { value: 'labor_law', label: 'Labour Law' },
  { value: 'safety', label: 'Safety' },
  { value: 'environmental', label: 'Environmental' },
];
const STATUTORY_TYPE_SET = new Set(STATUTORY_TYPES.map((t) => t.value));
const FREQUENCIES: ComplianceSettings['regulatoryReportingFrequency'][] = [
  'monthly',
  'quarterly',
  'annually',
];

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
};

export default function StatutoryCompliancePage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  // Local editable settings
  const [frequency, setFrequency] =
    useState<ComplianceSettings['regulatoryReportingFrequency']>('quarterly');
  const [retentionYears, setRetentionYears] = useState<number>(7);
  const [reminderDays, setReminderDays] = useState<number>(7);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rec, set] = await Promise.all([
        ComplianceRecordService.getRecords(),
        ComplianceSettingsService.getSettings(),
      ]);
      const statutory = (rec as RecordRow[]).filter((r) =>
        STATUTORY_TYPE_SET.has(r.complianceType as ComplianceType)
      );
      setRecords(statutory);
      setSettings(set);
      setFrequency(set.regulatoryReportingFrequency ?? 'quarterly');
      setRetentionYears(set.dataRetentionPeriod ?? 7);
      setReminderDays(set.complianceReminderDaysBefore ?? 7);
      setAlertsEnabled(set.enableComplianceAlerts ?? true);
    } catch {
      setError('Failed to load statutory compliance data.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = records.length;
    const compliant = records.filter(
      (r) => r.status === 'compliant' || r.status === 'resolved'
    ).length;
    const pending = records.filter((r) => r.status === 'pending_review').length;
    const score = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, pending, score };
  }, [records]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await ComplianceSettingsService.updateSettings({
        regulatoryReportingFrequency: frequency,
        dataRetentionPeriod: retentionYears,
        complianceReminderDaysBefore: reminderDays,
        enableComplianceAlerts: alertsEnabled,
      });
      setSettings(updated);
      notify('success', 'Statutory settings saved');
    } catch {
      notify('error', 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // File statutory obligation
  const [requirement, setRequirement] = useState('');
  const [complianceType, setComplianceType] = useState<ComplianceType>('tax');
  const [dueDate, setDueDate] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  const resetForm = () => {
    setRequirement('');
    setComplianceType('tax');
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
        complianceType,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        responsiblePerson: responsiblePerson.trim() || undefined,
        status: 'pending_review',
      } as Partial<ComplianceRecord>);
      notify('success', 'Statutory obligation filed');
      resetForm();
      setShowForm(false);
      await load();
    } catch {
      notify('error', 'Failed to file obligation');
    } finally {
      setSubmitting(false);
    }
  };

  const markCompliant = async (record: RecordRow) => {
    setUpdatingId(record.id);
    try {
      await ComplianceRecordService.updateRecord(record.id, {
        status: 'compliant',
        completedDate: new Date().toISOString(),
      });
      notify('success', 'Marked compliant');
      await load();
    } catch {
      notify('error', 'Failed to update record');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Statutory Compliance
          </h1>
          <p className="text-slate-500 text-sm">
            Track statutory obligations and configure reporting cadence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'File Obligation'}
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
              placeholder="e.g. Provident Fund monthly challan"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Type</label>
            <select
              value={complianceType}
              onChange={(e) => setComplianceType(e.target.value as ComplianceType)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            >
              {STATUTORY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
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
          <div className="md:col-span-2">
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
              <CheckCircle2 className="w-4 h-4" /> {submitting ? 'Filing…' : 'File Obligation'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliance Score</div>
          <div className="text-4xl font-bold text-emerald-600">{stats.score}%</div>
          <div className="text-xs text-slate-400 mt-1">{stats.total} obligations</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Pending Review</div>
          <div className="text-4xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliant</div>
          <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">
            {stats.compliant}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading statutory data…
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Obligations list */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Statutory Obligations</h3>
            {records.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No statutory obligations recorded yet.
              </p>
            ) : (
              <div className="space-y-1">
                {records.map((r) => {
                  const done = r.status === 'compliant' || r.status === 'resolved';
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {r.requirement ?? r.requirementDescription ?? '—'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatLabel(r.complianceType)} · Due {formatDate(r.dueDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            STATUS_BADGE[r.status] ?? 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {formatLabel(r.status)}
                        </span>
                        {!done && (
                          <button
                            type="button"
                            onClick={() => void markCompliant(r)}
                            disabled={updatingId === r.id}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 disabled:opacity-50"
                          >
                            {updatingId === r.id ? 'Saving…' : 'Mark Compliant'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Reporting Configuration</h3>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Reporting Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(
                      e.target.value as ComplianceSettings['regulatoryReportingFrequency']
                    )
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {formatLabel(f)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Data Retention (years)
                </label>
                <input
                  type="number"
                  min={1}
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Reminder (days before due)
                </label>
                <input
                  type="number"
                  min={0}
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500"
                />
                <span className="text-sm font-bold">Enable compliance alerts</span>
              </label>
              {settings?.lastModified && (
                <p className="text-xs text-slate-400">
                  Last saved {formatDate(settings.lastModified)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={savingSettings}
              className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingSettings ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
