'use client';

import { useEffect, useState } from 'react';

interface Insp {
  id: string;
  siteId: string;
  inspectionDate: string;
  category: string;
  score: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  status: string;
  closedAt: string | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
};

export default function InspectionsPage() {
  const [rows, setRows] = useState<Insp[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    siteId: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    category: 'HYGIENE',
    score: '80',
    criticalFindings: '0',
    majorFindings: '0',
    minorFindings: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/accommodation-compliance/inspections', window.location.origin);
    if (filter) url.searchParams.set('status', filter);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/accommodation-compliance/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        ...form,
        score: Number(form.score),
        criticalFindings: Number(form.criticalFindings),
        majorFindings: Number(form.majorFindings),
        minorFindings: Number(form.minorFindings),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function close(id: string) {
    const r = await fetch('/api/v1/accommodation-compliance/inspections', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-23 · S05–S09 / S12</p>
            <h1 className="text-2xl font-semibold">Inspection Register</h1>
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

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-8">
          <label className="text-sm">
            Site ID
            <input
              value={form.siteId}
              onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm((f) => ({ ...f, inspectionDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Category
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {[
                'HYGIENE',
                'FIRE_SAFETY',
                'ELECTRICAL',
                'KITCHEN',
                'MEDICAL',
                'WELFARE',
                'SECURITY',
                'GENERAL',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Score /100
            <input
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            CRITICAL
            <input
              value={form.criticalFindings}
              onChange={(e) => setForm((f) => ({ ...f, criticalFindings: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            MAJOR
            <input
              value={form.majorFindings}
              onChange={(e) => setForm((f) => ({ ...f, majorFindings: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            MINOR
            <input
              value={form.minorFindings}
              onChange={(e) => setForm((f) => ({ ...f, minorFindings: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={record}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2 text-rose-700">CRIT</th>
                <th className="px-3 py-2 text-amber-700">MAJ</th>
                <th className="px-3 py-2">MIN</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{i.siteId.slice(0, 8)}</td>
                  <td className="px-3 py-2 text-xs">{i.inspectionDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs">{i.category}</td>
                  <td className="px-3 py-2 font-semibold">{i.score}</td>
                  <td className="px-3 py-2 text-rose-700">{i.criticalFindings}</td>
                  <td className="px-3 py-2 text-amber-700">{i.majorFindings}</td>
                  <td className="px-3 py-2">{i.minorFindings}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[i.status] ?? ''}`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {i.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => close(i.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No inspections.
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
