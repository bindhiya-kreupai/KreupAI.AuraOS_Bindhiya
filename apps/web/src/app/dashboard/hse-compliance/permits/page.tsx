'use client';

import { useEffect, useState } from 'react';

interface P {
  id: string;
  permitNumber: string;
  workType: string;
  location: string;
  startAt: string;
  endAt: string;
  ramsAttached: boolean;
  status: string;
  closedAt: string | null;
}

export default function PermitsPage() {
  const [rows, setRows] = useState<P[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [form, setForm] = useState({
    permitNumber: '',
    workType: 'HOT_WORK',
    location: '',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16),
    ramsAttached: false,
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/hse-compliance/permits', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function issue() {
    setMessage('');
    const r = await fetch('/api/v1/hse-compliance/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'issue', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Issued' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function close(id: string) {
    const r = await fetch('/api/v1/hse-compliance/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-24 · S08</p>
            <h1 className="text-2xl font-semibold">Permit-to-Work</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Permit #
            <input
              value={form.permitNumber}
              onChange={(e) => setForm((f) => ({ ...f, permitNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Work Type
            <select
              value={form.workType}
              onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'HOT_WORK',
                'CONFINED_SPACE',
                'WORK_AT_HEIGHT',
                'ELECTRICAL',
                'EXCAVATION',
                'LOCKOUT_TAGOUT',
                'CHEMICAL_HANDLING',
                'CRANE_LIFT',
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Start
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            End
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ramsAttached}
              onChange={(e) => setForm((f) => ({ ...f, ramsAttached: e.target.checked }))}
            />
            RAMS attached
          </label>
          <button
            type="button"
            onClick={issue}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Issue
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Permit #</th>
                <th className="px-3 py-2">Work Type</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">RAMS</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const overdue = r.status === 'OPEN' && new Date(r.endAt) < new Date();
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{r.permitNumber}</td>
                    <td className="px-3 py-2 text-xs">{r.workType}</td>
                    <td className="px-3 py-2 text-xs">{r.location}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.startAt?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td
                      className={`px-3 py-2 text-xs ${overdue ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {r.endAt?.slice(0, 16).replace('T', ' ')}
                      {overdue ? ' ⚠' : ''}
                    </td>
                    <td className="px-3 py-2">{r.ramsAttached ? '✓' : '—'}</td>
                    <td className="px-3 py-2 text-xs">{r.status}</td>
                    <td className="px-3 py-2">
                      {r.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => close(r.id)}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No permits.
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
