'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Gavel, Plus, X, Loader2 } from 'lucide-react';
import { GrievanceService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface GrievanceRow {
  id: string;
  caseNumber?: string;
  subject?: string;
  grievanceType?: string;
  severity?: string;
  status?: string;
  complainantId?: string;
  raisedAt?: string;
  assigneeId?: string;
  outcome?: string;
  description?: string;
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function statusBadgeClass(status?: string) {
  switch (status) {
    case 'ESCALATED':
      return 'bg-rose-100 text-rose-600';
    case 'RESOLVED':
    case 'CLOSED':
      return 'bg-emerald-100 text-emerald-600';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-indigo-100 text-indigo-600';
  }
}

export default function GrievanceManagementPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [grievances, setGrievances] = useState<GrievanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<GrievanceRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const [form, setForm] = useState({
    subject: '',
    grievanceType: '',
    severity: 'MEDIUM',
    description: '',
  });

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GrievanceService.getGrievances();
      setGrievances(data as unknown as GrievanceRow[]);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to load grievances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const openCount = grievances.filter(
    (g) => g.status === 'OPEN' || g.status === 'IN_PROGRESS'
  ).length;
  const pendingReview = grievances.filter((g) => g.status === 'OPEN').length;
  const escalatedCount = grievances.filter((g) => g.status === 'ESCALATED').length;
  const resolvedCount = grievances.filter((g) => g.status === 'RESOLVED').length;

  const stats = [
    { label: 'Open Cases', val: openCount, color: 'text-indigo-500' },
    { label: 'Pending Review', val: pendingReview, color: 'text-amber-500' },
    { label: 'Escalated', val: escalatedCount, color: 'text-rose-500' },
    { label: 'Resolved', val: resolvedCount, color: 'text-emerald-500' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.grievanceType.trim()) {
      notify('warning', 'Subject and grievance type are required');
      return;
    }
    setSubmitting(true);
    try {
      await GrievanceService.createGrievance({
        subject: form.subject,
        grievanceType: form.grievanceType,
        severity: form.severity,
        description: form.description,
      } as Parameters<typeof GrievanceService.createGrievance>[0]);
      setShowCreate(false);
      setForm({ subject: '', grievanceType: '', severity: 'MEDIUM', description: '' });
      notify('success', 'Grievance created');
      await fetchGrievances();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to create grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setSubmitting(true);
    try {
      await GrievanceService.updateGrievance(id, { status });
      notify('success', 'Status updated');
      setSelected((s) => (s ? { ...s, status } : s));
      await fetchGrievances();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-indigo-500" />
            Grievance Management
          </h1>
          <p className="text-slate-500 text-sm">
            Track and resolve employee grievances efficiently.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={authLoading || !user}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> New Grievance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg">Active Cases</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1">
          {loading ? (
            <div className="p-10 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading grievances&hellip;
            </div>
          ) : grievances.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No grievances found.</div>
          ) : (
            grievances.map((g) => (
              <div
                key={g.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {g.caseNumber || g.id.slice(0, 8)}
                      </span>
                      <span className="font-bold">{g.grievanceType || 'Grievance'}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {g.subject}
                      {g.raisedAt ? ` • Filed: ${new Date(g.raisedAt).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadgeClass(g.status)}`}
                  >
                    {g.status || 'OPEN'}
                  </span>
                  <button
                    onClick={() => setSelected(g)}
                    className="text-sm font-bold text-slate-500 hover:text-indigo-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Grievance</h3>
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
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Grievance Type
                </label>
                <input
                  value={form.grievanceType}
                  onChange={(e) => setForm({ ...form, grievanceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Severity
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
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
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">{selected.caseNumber || 'Grievance Details'}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div>
                <span className="font-bold text-slate-500">Subject: </span>
                {selected.subject || '—'}
              </div>
              <div>
                <span className="font-bold text-slate-500">Type: </span>
                {selected.grievanceType || '—'}
              </div>
              <div>
                <span className="font-bold text-slate-500">Severity: </span>
                {selected.severity || '—'}
              </div>
              <div>
                <span className="font-bold text-slate-500">Raised: </span>
                {selected.raisedAt ? new Date(selected.raisedAt).toLocaleString() : '—'}
              </div>
              <div>
                <span className="font-bold text-slate-500">Outcome: </span>
                {selected.outcome || '—'}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={selected.status || 'OPEN'}
                  onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
