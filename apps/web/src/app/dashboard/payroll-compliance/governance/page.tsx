'use client';

import { useEffect, useState } from 'react';

interface Ctl {
  id: string;
  controlCode: string;
  label: string;
  category: string;
  country: string | null;
  owner: string | null;
  frequency: string;
  lastReviewedAt: string | null;
  status: string;
}

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

export default function PayrollGovernancePage() {
  const [rows, setRows] = useState<Ctl[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    controlCode: '',
    label: '',
    category: 'APPROVAL',
    country: '',
    owner: '',
    frequency: 'MONTHLY',
    requiredEvidence: '',
  });

  async function load() {
    const r = await fetch('/api/v1/payroll-compliance/governance');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/payroll-compliance/governance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function review(id: string) {
    const r = await fetch('/api/v1/payroll-compliance/governance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', id }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Reviewed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-10 · S01</p>
          <h1 className="text-2xl font-semibold">Payroll Governance Controls</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.controlCode}
              onChange={(e) => setForm({ ...form, controlCode: e.target.value })}
              placeholder="Code"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Label"
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
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country (opt)"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save
            </button>
          </div>
          <input
            value={form.requiredEvidence}
            onChange={(e) => setForm({ ...form, requiredEvidence: e.target.value })}
            placeholder="Required evidence"
            className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Last Reviewed</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.controlCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 text-xs">{r.category}</td>
                  <td className="px-3 py-2">{r.country ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.owner ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.frequency}</td>
                  <td className="px-3 py-2 text-xs">{r.lastReviewedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => review(r.id)}
                      className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                    >
                      Mark Reviewed
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No controls.
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
