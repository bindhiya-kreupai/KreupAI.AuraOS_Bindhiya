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
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
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
    if (p.success) setRows(p.data ?? []);
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
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-31 · S11</p>
            <h1 className="text-2xl font-semibold">Corrective Action Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Action #
            <input
              value={form.actionNumber}
              onChange={(e) => setForm((f) => ({ ...f, actionNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Source Domain
            <input
              value={form.sourceDomain}
              onChange={(e) => setForm((f) => ({ ...f, sourceDomain: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Severity
            <select
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Due
            <input
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
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
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{a.actionNumber}</td>
                    <td className="px-3 py-2 font-mono text-xs">{a.sourceDomain}</td>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[a.severity] ?? ''}`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{a.raisedAt?.slice(0, 10)}</td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {a.dueAt?.slice(0, 10) ?? '—'}
                      {overdue ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2 text-xs">{a.status}</td>
                    <td className="px-3 py-2">
                      {a.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => complete(a.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
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
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
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
