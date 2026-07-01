'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Scale, ShieldCheck, AlertOctagon, BookOpen, Plus, X } from 'lucide-react';
import { LaborLawService, ComplianceRecordService } from '../services';
import type { LaborLaw, ComplianceRecord, Jurisdiction, Severity, Toast } from '../types';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

type LawStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'action_required';

const STATUS_STYLES: Record<string, string> = {
  compliant: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  non_compliant: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  pending_review: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  action_required: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

const JURISDICTIONS: Jurisdiction[] = ['federal', 'state', 'local', 'international'];
const STATUSES: LawStatus[] = ['compliant', 'non_compliant', 'pending_review', 'action_required'];
const RISK_LEVELS: Severity[] = ['low', 'medium', 'high', 'critical'];

const RISK_META: Record<string, { label: string; color: string; bar: string; width: string }> = {
  low: { label: 'Low', color: 'text-emerald-600', bar: 'bg-emerald-500', width: 'w-[20%]' },
  medium: { label: 'Medium', color: 'text-amber-600', bar: 'bg-amber-500', width: 'w-[50%]' },
  high: { label: 'High', color: 'text-orange-600', bar: 'bg-orange-500', width: 'w-[75%]' },
  critical: { label: 'Critical', color: 'text-rose-600', bar: 'bg-rose-500', width: 'w-[100%]' },
};

function formatLabel(value?: string): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lawField(law: LaborLaw, key: string): any {
  return (law as unknown as Record<string, unknown>)[key];
}

export default function LaborLawCompliancePage() {
  const { loading: authLoading } = useCurrentUser();
  const [laws, setLaws] = useState<LaborLaw[]>([]);
  const [, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lawsData, recordsData] = await Promise.all([
        LaborLawService.getLaborLaws(),
        ComplianceRecordService.getRecords(),
      ]);
      setLaws(lawsData);
      setRecords(recordsData);
    } catch {
      notify('error', 'Failed to load labor law data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add law form
  const [lawName, setLawName] = useState('');
  const [category, setCategory] = useState('');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('federal');
  const [status, setStatus] = useState<LawStatus>('compliant');
  const [riskLevel, setRiskLevel] = useState<Severity>('low');
  const [referenceUrl, setReferenceUrl] = useState('');

  const resetForm = () => {
    setLawName('');
    setCategory('');
    setJurisdiction('federal');
    setStatus('compliant');
    setRiskLevel('low');
    setReferenceUrl('');
  };

  const submitLaw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await LaborLawService.createLaborLaw({
        lawName,
        category,
        jurisdiction,
        referenceUrl: referenceUrl || undefined,
        ...({ status, riskLevel } as unknown as Partial<LaborLaw>),
      } as Partial<LaborLaw>);
      setShowModal(false);
      resetForm();
      await fetchData();
      notify('success', 'Labor law added');
    } catch {
      notify('error', 'Failed to add labor law');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived risk: highest risk among active laws
  const riskOrder = ['low', 'medium', 'high', 'critical'];
  const activeLaws = laws.filter((l) => l.isActive !== false);
  const highestRisk = activeLaws.reduce<string>((acc, l) => {
    const r = String(lawField(l, 'riskLevel') ?? 'low');
    return riskOrder.indexOf(r) > riskOrder.indexOf(acc) ? r : acc;
  }, 'low');
  const nonCompliantCount = laws.filter(
    (l) => String(lawField(l, 'status')) === 'non_compliant'
  ).length;
  const risk = RISK_META[highestRisk] ?? RISK_META.low;

  // Regulatory updates derived from laws sorted by lastAuditDate desc
  const recentUpdates = [...laws]
    .filter((l) => lawField(l, 'lastAuditDate') || l.lastAmendmentDate)
    .sort((a, b) => {
      const da = new Date(
        String(lawField(a, 'lastAuditDate') ?? a.lastAmendmentDate ?? 0)
      ).getTime();
      const db = new Date(
        String(lawField(b, 'lastAuditDate') ?? b.lastAmendmentDate ?? 0)
      ).getTime();
      return db - da;
    })
    .slice(0, 3);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading labor law compliance…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Labor Law Compliance
          </h1>
          <p className="text-slate-500 text-sm">Monitor adherence to labor laws and regulations.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Law
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto pb-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Compliance Status</h3>
            {laws.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                No labor laws tracked yet. Use &quot;Add Law&quot; to start.
              </div>
            ) : (
              <div className="space-y-4">
                {laws.map((item) => {
                  const st = String(lawField(item, 'status') ?? 'pending_review');
                  const auditDate = lawField(item, 'lastAuditDate') as string | undefined;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        {st === 'compliant' ? (
                          <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <AlertOctagon className="w-6 h-6 text-amber-500" />
                        )}
                        <div>
                          <div className="font-bold">{item.lawName}</div>
                          <div className="text-sm text-slate-500">
                            {auditDate
                              ? `Last Audit: ${new Date(auditDate).toLocaleDateString()}`
                              : formatLabel(item.category)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${STATUS_STYLES[st] ?? STATUS_STYLES.pending_review}`}
                      >
                        {formatLabel(st)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6" />
              <h3 className="font-bold text-lg">Regulatory Updates</h3>
            </div>
            <div className="space-y-4 text-indigo-100 text-sm">
              {recentUpdates.length === 0 ? (
                <p className="text-indigo-200">No recent regulatory activity recorded.</p>
              ) : (
                recentUpdates.map((l) => {
                  const d = lawField(l, 'lastAuditDate') ?? l.lastAmendmentDate;
                  return (
                    <div key={l.id} className="p-3 bg-white/10 rounded-xl">
                      <span className="font-bold block text-white mb-1">{l.lawName}</span>
                      {formatLabel(l.category)}
                      {d ? ` · Updated ${new Date(String(d)).toLocaleDateString()}` : ''}
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/dashboard/compliance/regulatory-reports"
              className="w-full mt-4 py-2 bg-white text-indigo-900 rounded-lg font-bold hover:bg-slate-50 block text-center"
            >
              View All Updates
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Risk Assessment</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Legal Risk Level</span>
              <span className={`text-sm font-bold ${risk.color}`}>{risk.label}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
              <div className={`${risk.bar} h-full ${risk.width} rounded-full`}></div>
            </div>
            <p className="text-xs text-slate-400">
              Highest risk among {activeLaws.length} active law{activeLaws.length === 1 ? '' : 's'}
              {nonCompliantCount > 0 ? ` · ${nonCompliantCount} non-compliant` : ''}.
            </p>
          </div>
        </div>
      </div>

      {/* Add Law Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={submitLaw}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-500" /> Add Labor Law
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Law Name
                </label>
                <input
                  required
                  value={lawName}
                  onChange={(e) => setLawName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <input
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {JURISDICTIONS.map((j) => (
                      <option key={j} value={j}>
                        {formatLabel(j)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LawStatus)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as Severity)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                >
                  {RISK_LEVELS.map((r) => (
                    <option key={r} value={r}>
                      {formatLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reference URL (optional)
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add Law'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
