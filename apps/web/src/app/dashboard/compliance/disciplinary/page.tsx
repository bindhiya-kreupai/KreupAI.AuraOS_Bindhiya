'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gavel, AlertTriangle, CheckCircle2, MoreVertical, Plus, X, Loader2 } from 'lucide-react';
import { DisciplinaryService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface DisciplinaryRow {
  id: string;
  actionNumber?: string;
  employeeId?: string;
  misconductType?: string;
  actionType?: string;
  severity?: string;
  status?: string;
  warningCount?: number;
  suspensionDays?: number;
  hearingHeld?: boolean;
  createdAt?: string;
}

const ACTION_TYPES = [
  'verbal_warning',
  'written_warning',
  'suspension',
  'demotion',
  'termination',
  'fine',
];
const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function severityBadge(sev?: string) {
  switch ((sev || '').toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
      return 'bg-rose-100 text-rose-600';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}

function statusBadge(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'ISSUED':
      return 'bg-indigo-50 border-indigo-200 text-indigo-600';
    case 'CLOSED':
      return 'bg-emerald-50 border-emerald-200 text-emerald-600';
    default:
      return 'bg-amber-50 border-amber-200 text-amber-600';
  }
}

export default function DisciplinaryPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [records, setRecords] = useState<DisciplinaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const notify = (type: Toast['type'], message: string) =>
    setToasts((t) => [...t, { id: crypto.randomUUID(), type, message }]);
  const closeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const [form, setForm] = useState({
    employeeId: '',
    misconductType: '',
    actionType: 'verbal_warning',
    severity: 'MEDIUM',
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DisciplinaryService.getRecords();
      setRecords(data as unknown as DisciplinaryRow[]);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCount = records.filter((r) => (r.status || '').toUpperCase() !== 'CLOSED').length;
  const pendingHearings = records.filter(
    (r) => !r.hearingHeld && (r.status || '').toUpperCase() !== 'CLOSED'
  ).length;
  const resolvedCount = records.filter((r) => (r.status || '').toUpperCase() === 'CLOSED').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId.trim() || !form.misconductType.trim()) {
      notify('warning', 'Employee ID and misconduct type are required');
      return;
    }
    setSubmitting(true);
    try {
      await DisciplinaryService.createRecord({
        employeeId: form.employeeId,
        misconductType: form.misconductType,
        actionType: form.actionType,
        severity: form.severity,
      });
      setShowCreate(false);
      setForm({
        employeeId: '',
        misconductType: '',
        actionType: 'verbal_warning',
        severity: 'MEDIUM',
      });
      notify('success', 'Disciplinary case created');
      await fetchRecords();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    setMenuOpen(null);
    setSubmitting(true);
    try {
      await DisciplinaryService.updateRecord(id, { status });
      notify('success', `Case ${status.toLowerCase()}`);
      await fetchRecords();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Failed to update case');
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
            <Gavel className="w-6 h-6 text-indigo-500" />
            Disciplinary Actions
          </h1>
          <p className="text-slate-500 text-sm">Manage employee misconduct cases and hearings.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={authLoading || !user}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold">{openCount}</div>
            <div className="text-xs text-slate-500">Open Cases</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold">{pendingHearings}</div>
            <div className="text-xs text-slate-500">Pending Hearings</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold">{resolvedCount}</div>
            <div className="text-xs text-slate-500">Cases Resolved</div>
          </div>
        </div>
      </div>

      {/* Case List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
              <tr>
                <th className="p-4">Case #</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Misconduct</th>
                <th className="p-4">Action</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading&hellip;
                    </span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 text-sm">
                    No disciplinary cases found.
                  </td>
                </tr>
              ) : (
                records.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {c.actionNumber || c.id.slice(0, 8)}
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {c.employeeId || '—'}
                    </td>
                    <td className="p-4 text-slate-500">{c.misconductType || '—'}</td>
                    <td className="p-4 text-slate-500">{c.actionType || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${severityBadge(c.severity)}`}
                      >
                        {c.severity || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusBadge(c.status)}`}
                      >
                        {c.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === c.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-12 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 w-32 text-left"
                        >
                          <button
                            onClick={() => handleStatus(c.id, 'ISSUED')}
                            disabled={submitting}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            Issue
                          </button>
                          <button
                            onClick={() => handleStatus(c.id, 'CLOSED')}
                            disabled={submitting}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Disciplinary Case</h3>
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
                  Employee ID
                </label>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Misconduct Type
                </label>
                <input
                  value={form.misconductType}
                  onChange={(e) => setForm({ ...form, misconductType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Action Type
                </label>
                <select
                  value={form.actionType}
                  onChange={(e) => setForm({ ...form, actionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
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
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create
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
