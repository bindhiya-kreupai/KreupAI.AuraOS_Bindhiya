'use client';

import { useEffect, useState } from 'react';

interface Ap {
  id: string;
  appealNumber: string;
  subjectType: string;
  subjectId: string;
  appellantId: string;
  reason: string | null;
  filedAt: string;
  decisionDueAt: string | null;
  outcome: string | null;
  decidedAt: string | null;
  status: string;
}

export default function AppealsPage() {
  const [rows, setRows] = useState<Ap[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    appealNumber: '',
    subjectType: 'GRIEVANCE',
    subjectId: '',
    appellantId: '',
    reason: '',
    filedAt: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/er-compliance/appeals', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function file() {
    setMessage('');
    const r = await fetch('/api/v1/er-compliance/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'file', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Filed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function decide(id: string) {
    const outcome = window.prompt('Outcome (UPHELD / OVERTURNED / PARTIAL)?') ?? '';
    if (!outcome) return;
    const r = await fetch('/api/v1/er-compliance/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decide', id, outcome }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Decided' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-25 · S10 / EPIC-26 · S08</p>
            <h1 className="text-2xl font-semibold">Appeals Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="DECIDED">DECIDED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Appeal #
            <input
              value={form.appealNumber}
              onChange={(e) => setForm((f) => ({ ...f, appealNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Subject Type
            <select
              value={form.subjectType}
              onChange={(e) => setForm((f) => ({ ...f, subjectType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              <option>GRIEVANCE</option>
              <option>DISCIPLINARY</option>
            </select>
          </label>
          <label className="text-sm">
            Subject ID
            <input
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Appellant
            <input
              value={form.appellantId}
              onChange={(e) => setForm((f) => ({ ...f, appellantId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Reason
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={file}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            File Appeal
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Appeal #</th>
                <th className="px-3 py-2">Filed</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Appellant</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Outcome</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{a.appealNumber}</td>
                  <td className="px-3 py-2 text-xs">{a.filedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">
                    {a.subjectType} / {a.subjectId.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{a.appellantId}</td>
                  <td className="px-3 py-2 text-xs">{a.reason ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{a.outcome ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{a.status}</td>
                  <td className="px-3 py-2">
                    {a.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => decide(a.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Decide
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No appeals.
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
