'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, FileSignature, Scale, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FormModal, Field, inputClass } from '../components/FormModal';
import { useConstructionToasts } from '../hooks/useConstructionToasts';

const GRIEVANCE_ENDPOINT = '/api/v1/er-compliance/grievances';

interface Grievance {
  id: string;
  caseNumber: string;
  subject: string;
  grievanceType: string;
  severity: string;
  status: string;
  channel: string;
  raisedAt?: string;
  assigneeId?: string | null;
}

const SEVERITY_STYLE: Record<string, string> = {
  HIGH: 'bg-rose-50 text-rose-500',
  CRITICAL: 'bg-rose-50 text-rose-500',
};

const STATUS_STYLE: Record<string, string> = {
  RESOLVED: 'bg-emerald-100 text-emerald-600',
  CLOSED: 'bg-emerald-100 text-emerald-600',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-600',
  OPEN: 'bg-amber-100 text-amber-600',
};

export default function UnionsPage() {
  const { toasts, pushToast, dismissToast } = useConstructionToasts();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    grievanceType: 'WORKPLACE',
    severity: 'MEDIUM',
    channel: 'UNION',
    description: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GRIEVANCE_ENDPOINT}?pageSize=50`, { credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Failed to load grievances');
      }
      const items = body?.data?.items ?? body?.items ?? [];
      setGrievances(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grievances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      pushToast('error', 'Subject is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(GRIEVANCE_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'raise',
          caseNumber: `GRV-${Date.now()}`,
          channel: form.channel,
          grievanceType: form.grievanceType,
          severity: form.severity,
          subject: form.subject.trim(),
          description: form.description.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Failed to raise grievance');
      }
      pushToast('success', 'Grievance raised successfully');
      setModalOpen(false);
      setForm({
        subject: '',
        grievanceType: 'WORKPLACE',
        severity: 'MEDIUM',
        channel: 'UNION',
        description: '',
      });
      await load();
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to raise grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (g: Grievance) => {
    pushToast(
      'info',
      `${g.caseNumber} • ${g.grievanceType} • ${g.status} • assignee: ${g.assigneeId ?? 'unassigned'}`
    );
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {loading && <LoadingOverlay message="Loading grievances..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Union Management
          </h1>
          <p className="text-slate-500 text-sm">
            Grievance logs, CBA negotiations, and steward contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
            <FileSignature className="w-4 h-4" /> CBA Renewal Tracking
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Raise Grievance
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={() => void load()} className="ml-auto font-bold underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
          <h3 className="font-bold text-lg mb-2">Grievances</h3>
          {!loading && grievances.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 text-center">
              No grievances on record. Raise one to get started.
            </div>
          ) : (
            grievances.map((g) => (
              <div
                key={g.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      SEVERITY_STYLE[g.severity] ?? 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{g.subject}</h3>
                    <div className="text-xs text-slate-500 font-bold mb-1">
                      {g.caseNumber} • {g.grievanceType} • {g.channel}
                    </div>
                    {g.raisedAt && (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        Raised {new Date(g.raisedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      STATUS_STYLE[g.status] ?? 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {g.status}
                  </span>
                  <button
                    onClick={() => handleViewDetails(g)}
                    className="text-xs font-bold text-indigo-500 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Grievance Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold">{grievances.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Open</span>
                <span className="font-bold text-amber-600">
                  {
                    grievances.filter((g) => g.status === 'OPEN' || g.status === 'IN_PROGRESS')
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Resolved</span>
                <span className="font-bold text-emerald-600">
                  {
                    grievances.filter((g) => g.status === 'RESOLVED' || g.status === 'CLOSED')
                      .length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Labour Relations</h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                Grievances are tracked through the ER compliance workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title="Raise Grievance"
        submitLabel="Raise Grievance"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRaise}
      >
        <Field label="Subject">
          <input
            className={inputClass}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Overtime pay dispute"
            required
          />
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={form.grievanceType}
            onChange={(e) => setForm({ ...form, grievanceType: e.target.value })}
          >
            <option value="WORKPLACE">Workplace</option>
            <option value="PAY">Pay</option>
            <option value="SAFETY">Safety</option>
            <option value="DISCIPLINARY">Disciplinary</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Severity">
          <select
            className={inputClass}
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </Field>
        <Field label="Channel">
          <select
            className={inputClass}
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          >
            <option value="UNION">Union</option>
            <option value="DIRECT">Direct</option>
            <option value="HOTLINE">Hotline</option>
            <option value="HR">HR</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
      </FormModal>
    </div>
  );
}
