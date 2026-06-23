'use client';

import { useEffect, useState } from 'react';

interface Risk {
  id: string;
  riskCode: string;
  title: string;
  category: string;
  country: string | null;
  likelihood: number;
  impact: number;
  score: number;
  band: string;
  controlCode: string | null;
  ownerId: string | null;
  status: string;
}

const bandColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

const CATEGORIES = [
  'APPROVAL',
  'PERIOD_LOCK',
  'GL_POSTING',
  'BANK_FILE',
  'RECONCILIATION',
  'STATUTORY',
  'AUDIT_TRAIL',
  'SOD',
];

export default function PayrollRiskPage() {
  const [rows, setRows] = useState<Risk[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    riskCode: '',
    title: '',
    category: 'APPROVAL',
    country: '',
    likelihood: 3,
    impact: 3,
    controlCode: '',
    mitigation: '',
  });

  async function load() {
    const r = await fetch('/api/v1/payroll-compliance/risk-register');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/payroll-compliance/risk-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function close(id: string) {
    const r = await fetch('/api/v1/payroll-compliance/risk-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Closed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-10 · S18</p>
          <h1 className="text-2xl font-semibold">Payroll Risk Register</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.riskCode}
              onChange={(e) => setForm({ ...form, riskCode: e.target.value })}
              placeholder="Code"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={5}
              value={form.likelihood}
              onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}
              placeholder="L"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              min={1}
              max={5}
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}
              placeholder="I"
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

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">L</th>
                <th className="px-3 py-2">I</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.riskCode}</td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2 text-xs">{r.category}</td>
                  <td className="px-3 py-2">{r.likelihood}</td>
                  <td className="px-3 py-2">{r.impact}</td>
                  <td className="px-3 py-2 font-semibold">{r.score}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[r.band] ?? ''}`}
                    >
                      {r.band}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    {r.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => close(r.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No risks.
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
