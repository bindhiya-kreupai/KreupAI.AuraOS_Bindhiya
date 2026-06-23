'use client';

import { useEffect, useState } from 'react';

interface Flag {
  id: string;
  employeeId: string;
  punchDate: string;
  flagType: string;
  severity: string;
  score: number;
  status: string;
  evidenceJson: Record<string, unknown>;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-rose-100 text-rose-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
};

export default function FraudFlagsPage() {
  const [rows, setRows] = useState<Flag[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    employeeId: '',
    punchDate: new Date().toISOString().slice(0, 10),
    flagType: 'BUDDY_PUNCH',
    score: '50',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/attendance-compliance/fraud-flags', window.location.origin);
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
    const r = await fetch('/api/v1/attendance-compliance/fraud-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'raise', ...form, score: Number(form.score) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Raised' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function resolve(id: string) {
    const notes = window.prompt('Resolution notes?') ?? '';
    const r = await fetch('/api/v1/attendance-compliance/fraud-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id, notes }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-19 · S16</p>
            <h1 className="text-2xl font-semibold">Attendance Fraud Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Punch Date
            <input
              type="date"
              value={form.punchDate}
              onChange={(e) => setForm((f) => ({ ...f, punchDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Flag Type
            <select
              value={form.flagType}
              onChange={(e) => setForm((f) => ({ ...f, flagType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'BUDDY_PUNCH',
                'GEO_MISMATCH',
                'SUSPICIOUS_TIME',
                'SHARED_IP',
                'TIME_DRIFT',
                'GHOST_PRESENCE',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Score
            <input
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={raise}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Raise
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Resolution</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-xs">{f.punchDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{f.employeeId}</td>
                  <td className="px-3 py-2 text-xs">{f.flagType}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[f.severity] ?? ''}`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">{f.score}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[f.status] ?? ''}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{f.resolutionNotes ?? '—'}</td>
                  <td className="px-3 py-2">
                    {f.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => resolve(f.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No fraud flags.
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
