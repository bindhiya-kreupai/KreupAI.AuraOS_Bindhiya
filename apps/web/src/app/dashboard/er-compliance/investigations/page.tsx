'use client';

import { useEffect, useState } from 'react';

interface I {
  id: string;
  investigationNumber: string;
  grievanceCaseId: string | null;
  disciplinaryActionId: string | null;
  scope: string | null;
  interviewCount: number;
  evidenceCount: number;
  findings: string | null;
  recommendation: string | null;
  startedAt: string;
  completedAt: string | null;
  status: string;
}

export default function InvestigationsPage() {
  const [rows, setRows] = useState<I[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    investigationNumber: '',
    grievanceCaseId: '',
    disciplinaryActionId: '',
    scope: '',
    startedAt: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/er-compliance/investigations', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function open() {
    setMessage('');
    const r = await fetch('/api/v1/er-compliance/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open',
        ...form,
        grievanceCaseId: form.grievanceCaseId || undefined,
        disciplinaryActionId: form.disciplinaryActionId || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Opened' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function call(action: string, id: string, extra: Record<string, unknown> = {}) {
    const r = await fetch('/api/v1/er-compliance/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, ...extra }),
    });
    const p = await r.json();
    setMessage(p.success ? action : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-25 · S05 / EPIC-26 · S03</p>
            <h1 className="text-2xl font-semibold">Investigation Register</h1>
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

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Inv #
            <input
              value={form.investigationNumber}
              onChange={(e) => setForm((f) => ({ ...f, investigationNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Grievance ID
            <input
              value={form.grievanceCaseId}
              onChange={(e) => setForm((f) => ({ ...f, grievanceCaseId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Disciplinary ID
            <input
              value={form.disciplinaryActionId}
              onChange={(e) => setForm((f) => ({ ...f, disciplinaryActionId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Scope
            <input
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={open}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Open
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Inv #</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2">Interviews</th>
                <th className="px-3 py-2">Evidence</th>
                <th className="px-3 py-2">Findings</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{i.investigationNumber}</td>
                  <td className="px-3 py-2 text-xs">{i.startedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{i.scope ?? '—'}</td>
                  <td className="px-3 py-2">{i.interviewCount}</td>
                  <td className="px-3 py-2">{i.evidenceCount}</td>
                  <td className="px-3 py-2 text-xs">{i.findings ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{i.status}</td>
                  <td className="px-3 py-2">
                    {i.status === 'OPEN' && (
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => call('add-interview', i.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          + Interview
                        </button>
                        <button
                          type="button"
                          onClick={() => call('add-evidence', i.id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          + Evidence
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            call('complete', i.id, {
                              findings: window.prompt('Findings?') ?? '',
                              recommendation: window.prompt('Recommendation?') ?? undefined,
                            })
                          }
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Complete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No investigations.
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
