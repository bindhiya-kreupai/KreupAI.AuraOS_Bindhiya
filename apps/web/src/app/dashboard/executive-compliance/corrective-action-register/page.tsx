'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { Plus, CheckCircle2, AlertTriangle, ListFilter } from 'lucide-react';

interface A {
  id: string;
  actionNumber: string;
  sourceDomain: string;
  sourceRef: string | null;
  title: string;
  rootCause: string | null;
  severity: string;
  ownerId: string | null;
  raisedAt: string;
  dueAt: string | null;
  completedAt: string | null;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
  HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400',
  CRITICAL: 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-300',
};

export default function CorrectiveActionRegisterPage() {
  const { isDark } = useTheme();
  const [rows, setRows] = useState<A[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    actionNumber: '',
    sourceDomain: 'WPS',
    sourceRef: '',
    title: '',
    description: '',
    rootCause: '',
    severity: 'MEDIUM',
    ownerId: '',
    dueAt: '',
  });
  const [rowNotes, setRowNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(
        '/api/v1/executive-compliance/corrective-actions',
        window.location.origin
      );
      if (filter) url.searchParams.set('status', filter);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/executive-compliance/corrective-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      setMessage(p.success ? okMsg : (p.error?.details?.error ?? p.error?.message ?? 'Failed'));
      if (p.success) await load();
    } finally {
      setBusy(false);
    }
  }

  function raise() {
    if (!form.actionNumber || !form.title) {
      setMessage('Action # and Title are required.');
      return;
    }

    // Optimistic update
    const newRow: A = {
      id: `temp-${Date.now()}`,
      actionNumber: form.actionNumber,
      sourceDomain: form.sourceDomain,
      sourceRef: form.sourceRef || null,
      title: form.title,
      rootCause: form.rootCause || null,
      severity: form.severity,
      ownerId: form.ownerId || null,
      raisedAt: new Date().toISOString(),
      dueAt: form.dueAt || null,
      completedAt: null,
      status: 'OPEN',
    };
    if (filter === 'OPEN' || filter === '') {
      setRows((prev) => [newRow, ...prev]);
    }

    void post(
      {
        action: 'raise',
        ...form,
        sourceRef: form.sourceRef || undefined,
        description: form.description || undefined,
        rootCause: form.rootCause || undefined,
        ownerId: form.ownerId || undefined,
        dueAt: form.dueAt || undefined,
      },
      'Raised'
    );
  }

  function complete(id: string) {
    // Optimistic UI update
    setRows((rows) =>
      rows.map((r) =>
        r.id === id ? { ...r, status: 'COMPLETED', completedAt: new Date().toISOString() } : r
      )
    );

    void post(
      { action: 'complete', id, verificationNotes: rowNotes[id] || undefined },
      'Completed'
    );
  }

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              EPIC-31 · S11
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Corrective Action Register
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="" className="dark:bg-slate-900">
                All
              </option>
              <option value="OPEN" className="dark:bg-slate-900">
                OPEN
              </option>
              <option value="COMPLETED" className="dark:bg-slate-900">
                COMPLETED
              </option>
            </select>
          </div>
        </header>

        {/* Raise Form */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Plus className="h-3.5 w-3.5" />
            </div>
            Raise New Corrective Action
          </h2>
          <div className="grid gap-3 md:grid-cols-7">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Action #
              <input
                value={form.actionNumber}
                onChange={(e) => setForm((f) => ({ ...f, actionNumber: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Source Domain
              <input
                value={form.sourceDomain}
                onChange={(e) => setForm((f) => ({ ...f, sourceDomain: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold md:col-span-2 text-slate-600 dark:text-slate-400">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Severity
              <select
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                  <option key={s} className="dark:bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Due
              <input
                type="date"
                value={form.dueAt}
                onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={raise}
              disabled={busy}
              className="self-end flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-2.5 text-sm text-white dark:text-slate-900 font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              Raise
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
          </div>
        ) : null}

        {/* Table */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Action Register</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              {rows.length} records
            </span>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="px-5 py-3">Action #</th>
                    <th className="px-5 py-3">Domain</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Raised</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Verification & complete</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const overdue =
                      a.status === 'OPEN' && a.dueAt && new Date(a.dueAt) < new Date();
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {a.actionNumber}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {a.sourceDomain}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {a.title}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevColor[a.severity] ?? ''}`}
                          >
                            {a.severity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {a.raisedAt?.slice(0, 10)}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs ${overdue ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                          {a.dueAt?.slice(0, 10) ?? '—'}
                          {overdue ? ' ⚠' : ''}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {a.status === 'OPEN' ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                value={rowNotes[a.id] ?? ''}
                                onChange={(e) =>
                                  setRowNotes((m) => ({ ...m, [a.id]: e.target.value }))
                                }
                                placeholder="Verification notes"
                                className="w-36 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => complete(a.id)}
                                disabled={busy}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-xs text-white font-bold disabled:opacity-50 transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {a.completedAt?.slice(0, 10) ?? '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-slate-400 dark:text-slate-500"
                      >
                        No corrective actions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
