'use client';

import { useEffect, useState } from 'react';

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
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-450',
  HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-450',
  CRITICAL: 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-300',
};

export default function CorrectiveActionsPage() {
  const [rows, setRows] = useState<A[]>([]);
  const [filter, setFilter] = useState('OPEN');
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
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/executive-compliance/corrective-actions', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) {
      setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function raise() {
    setMessage('');
    const r = await fetch('/api/v1/executive-compliance/corrective-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'raise',
        ...form,
        sourceRef: form.sourceRef || undefined,
        description: form.description || undefined,
        rootCause: form.rootCause || undefined,
        ownerId: form.ownerId || undefined,
        dueAt: form.dueAt || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function complete(id: string) {
    const notes = window.prompt('Verification notes?') ?? '';
    const r = await fetch('/api/v1/executive-compliance/corrective-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', id, verificationNotes: notes }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Completed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-31 · S11</p>
            <h1 className="text-2xl font-semibold dark:text-white">Corrective Action Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="" className="dark:bg-slate-900">All</option>
            <option value="OPEN" className="dark:bg-slate-900">OPEN</option>
            <option value="COMPLETED" className="dark:bg-slate-900">COMPLETED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-7">
          <label className="text-sm dark:text-slate-300">
            Action #
            <input
              value={form.actionNumber}
              onChange={(e) => setForm((f) => ({ ...f, actionNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 font-mono text-xs dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Source Domain
            <input
              value={form.sourceDomain}
              onChange={(e) => setForm((f) => ({ ...f, sourceDomain: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 font-mono text-xs dark:text-white"
            />
          </label>
          <label className="text-sm md:col-span-2 dark:text-slate-300">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Severity
            <select
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} className="dark:bg-slate-900">{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm dark:text-slate-300">
            Due
            <input
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="self-end rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-3 py-2 text-sm text-white dark:text-slate-900 font-semibold transition-colors"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm text-slate-650 dark:text-slate-400">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Action #</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Raised</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const overdue = a.status === 'OPEN' && a.dueAt && new Date(a.dueAt) < new Date();
                return (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                    <td className="px-3 py-2 font-mono text-xs dark:text-slate-350">{a.actionNumber}</td>
                    <td className="px-3 py-2 font-mono text-xs dark:text-slate-300">{a.sourceDomain}</td>
                    <td className="px-3 py-2 dark:text-slate-300">{a.title}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[a.severity] ?? ''}`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs dark:text-slate-350">{a.raisedAt?.slice(0, 10)}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700 dark:text-rose-400' : 'dark:text-slate-350'}`}
                    >
                      {a.dueAt?.slice(0, 10) ?? '—'}
                      {overdue ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${a.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {a.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => complete(a.id)}
                          className="rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1 text-xs text-white font-semibold transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No corrective actions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
