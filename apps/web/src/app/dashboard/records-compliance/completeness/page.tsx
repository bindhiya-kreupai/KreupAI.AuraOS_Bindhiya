'use client';

import { useEffect, useState } from 'react';

interface Snap {
  id: string;
  period: string;
  employeeId: string;
  country: string | null;
  mandatoryTotal: number;
  mandatoryPresent: number;
  mandatoryMissing: number;
  expiringWithin30: number;
  expired: number;
  score: string;
  band: string;
  missingCodes: string[];
}

const bandColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CompletenessPage() {
  const [rows, setRows] = useState<Snap[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [band, setBand] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    country: 'UAE',
    mandatoryTotal: 10,
    mandatoryPresent: 8,
    expired: 0,
    expiringWithin30: 0,
  });

  async function load() {
    const url = `/api/v1/records-compliance/completeness?period=${period}${band ? `&band=${band}` : ''}`;
    const r = await fetch(url);
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period, band]);

  async function save() {
    const r = await fetch('/api/v1/records-compliance/completeness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', period, ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-08 · S12</p>
            <h1 className="text-2xl font-semibold">Employee Records Completeness</h1>
          </div>
          <div className="flex gap-2">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={band}
              onChange={(e) => setBand(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All bands</option>
              {['GREEN', 'AMBER', 'RED'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Capture Employee Snapshot</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="Employee ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.mandatoryTotal}
              onChange={(e) => setForm({ ...form, mandatoryTotal: Number(e.target.value) })}
              placeholder="Mandatory Total"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.mandatoryPresent}
              onChange={(e) => setForm({ ...form, mandatoryPresent: Number(e.target.value) })}
              placeholder="Mandatory Present"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.expired}
              onChange={(e) => setForm({ ...form, expired: Number(e.target.value) })}
              placeholder="Expired"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Present</th>
                <th className="px-3 py-2">Missing</th>
                <th className="px-3 py-2">Exp ≤30d</th>
                <th className="px-3 py-2">Expired</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Band</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-3 py-2">{r.country ?? '—'}</td>
                  <td className="px-3 py-2">{r.mandatoryTotal}</td>
                  <td className="px-3 py-2 text-emerald-700">{r.mandatoryPresent}</td>
                  <td className="px-3 py-2 text-rose-700">{r.mandatoryMissing}</td>
                  <td className="px-3 py-2 text-amber-700">{r.expiringWithin30}</td>
                  <td className="px-3 py-2 text-rose-700">{r.expired}</td>
                  <td className="px-3 py-2 font-semibold">{r.score}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[r.band] ?? ''}`}
                    >
                      {r.band}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No snapshots.
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
