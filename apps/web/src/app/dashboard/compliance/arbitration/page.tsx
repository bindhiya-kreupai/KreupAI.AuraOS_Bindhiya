'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, CalendarCheck, Briefcase, X } from 'lucide-react';
import { ArbitrationService } from '../services';
import type { Arbitration, ArbitrationStatus, Toast } from '../types';
import { ToastContainer } from '../components/Toast';

type DisputeType = Arbitration['disputeType'];

// The API may return flat helper fields alongside the nested type shape.
type ArbitrationRow = Omit<Arbitration, 'claimAmount'> & {
  arbitratorName?: string;
  claimAmount?: unknown;
  currency?: string;
};

interface ArbFormState {
  caseTitle: string;
  claimantName: string;
  respondentName: string;
  disputeType: DisputeType;
  arbitratorName: string;
  venue: string;
}

const EMPTY_FORM: ArbFormState = {
  caseTitle: '',
  claimantName: '',
  respondentName: '',
  disputeType: 'labor',
  arbitratorName: '',
  venue: '',
};

const STATUS_OPTIONS: ArbitrationStatus[] = [
  'filed',
  'hearing_scheduled',
  'in_progress',
  'award_pending',
  'completed',
];

const STATUS_STYLES: Record<string, string> = {
  filed: 'bg-slate-100 text-slate-600',
  hearing_scheduled: 'bg-indigo-100 text-indigo-600',
  in_progress: 'bg-amber-100 text-amber-600',
  award_pending: 'bg-purple-100 text-purple-600',
  completed: 'bg-emerald-100 text-emerald-600',
  appealed: 'bg-rose-100 text-rose-600',
};

const arbitratorName = (a: ArbitrationRow): string =>
  a.arbitratorName || a.arbitrator?.arbitratorName || '—';

const claimAmountLabel = (a: ArbitrationRow): string => {
  const raw = a.claimAmount;
  if (raw && typeof raw === 'object') {
    const obj = raw as { amount?: number; currency?: string };
    if (typeof obj.amount === 'number') {
      return `${obj.currency ?? ''} ${obj.amount.toLocaleString()}`.trim();
    }
  }
  if (typeof raw === 'number') {
    return `${a.currency ?? ''} ${raw.toLocaleString()}`.trim();
  }
  return '—';
};

export default function ArbitrationPage() {
  const [arbitrations, setArbitrations] = useState<ArbitrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ArbFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    fetchArbitrations();
  }, []);

  const fetchArbitrations = async () => {
    setLoading(true);
    try {
      const data = await ArbitrationService.getArbitrations();
      setArbitrations(data as ArbitrationRow[]);
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to load arbitration cases.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ArbitrationService.createArbitration({
        caseTitle: form.caseTitle,
        claimantName: form.claimantName,
        respondentName: form.respondentName,
        disputeType: form.disputeType,
        arbitratorName: form.arbitratorName,
        venue: form.venue,
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      notify('success', 'Arbitration case created.');
      await fetchArbitrations();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to create arbitration case.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: ArbitrationStatus) => {
    setBusyId(id);
    try {
      await ArbitrationService.updateArbitration(id, { status });
      notify('success', 'Case status updated.');
      await fetchArbitrations();
    } catch (error) {
      console.error('Error:', error);
      notify('error', 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  };

  const countBy = (status: string) => arbitrations.filter((a) => a.status === status).length;
  const fmtStatus = (s: string) => s.replace(/_/g, ' ');

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-indigo-500" />
            Arbitration
          </h1>
          <p className="text-slate-500 text-sm">
            Manage cases referred to third-party arbitration.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          New Arbitration
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 shrink-0">
        {STATUS_OPTIONS.map((s) => (
          <div
            key={s}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="text-slate-500 text-xs font-bold capitalize">{fmtStatus(s)}</div>
            <div className="text-2xl font-bold">{countBy(s)}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 overflow-auto">
        <h3 className="font-bold text-lg mb-4">Case Docket</h3>
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading cases&hellip;</div>
        ) : arbitrations.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No arbitration cases found.</div>
        ) : (
          <div className="space-y-3">
            {arbitrations.map((c) => (
              <div
                key={c.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{c.arbitrationCode}</span>
                    <div className="font-bold">{c.caseTitle}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span>
                      {c.claimantName} v. {c.respondentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {arbitratorName(c)}
                    </span>
                    {c.venue && (
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3" /> {c.venue}
                      </span>
                    )}
                    <span className="capitalize">{fmtStatus(c.disputeType)}</span>
                    <span>{claimAmountLabel(c)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold capitalize ${STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {fmtStatus(c.status)}
                  </span>
                  <select
                    value={c.status}
                    disabled={busyId === c.id}
                    onChange={(e) => updateStatus(c.id, e.target.value as ArbitrationStatus)}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {fmtStatus(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">New Arbitration</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Case Title</label>
              <input
                required
                value={form.caseTitle}
                onChange={(e) => setForm({ ...form, caseTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Claimant Name</label>
                <input
                  required
                  value={form.claimantName}
                  onChange={(e) => setForm({ ...form, claimantName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Respondent Name</label>
                <input
                  required
                  value={form.respondentName}
                  onChange={(e) => setForm({ ...form, respondentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Dispute Type</label>
                <select
                  value={form.disputeType}
                  onChange={(e) => setForm({ ...form, disputeType: e.target.value as DisputeType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="labor">Labor</option>
                  <option value="contract">Contract</option>
                  <option value="disciplinary">Disciplinary</option>
                  <option value="termination">Termination</option>
                  <option value="grievance">Grievance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Arbitrator Name</label>
                <input
                  value={form.arbitratorName}
                  onChange={(e) => setForm({ ...form, arbitratorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Venue</label>
              <input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
