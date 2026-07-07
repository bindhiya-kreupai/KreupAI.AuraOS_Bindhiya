'use client';

import { useEffect, useState } from 'react';

interface Row {
  id: string;
  country: string;
  documentCode: string;
  label: string;
  category: string;
  isMandatory: boolean;
  retentionYears: number;
  renewalCadenceMonths: number | null;
  sensitivity: string;
}

const CATEGORIES = [
  'IDENTITY',
  'CONTRACT',
  'VISA',
  'WORK_PERMIT',
  'EDUCATION',
  'EXPERIENCE',
  'MEDICAL',
  'PERSONAL',
  'BENEFITS',
  'COMPENSATION',
  'POLICY_ACK',
  'OTHER',
];

export default function DocumentMatrixPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    country: 'UAE',
    documentCode: '',
    label: '',
    category: 'IDENTITY',
    isMandatory: true,
    retentionYears: 7,
    renewalCadenceMonths: 0,
    sensitivity: 'CONFIDENTIAL',
  });

  async function load() {
    const r = await fetch('/api/v1/records-compliance/document-matrix');
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data?.items) ? p.data.items : []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/records-compliance/document-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        renewalCadenceMonths: form.renewalCadenceMonths > 0 ? form.renewalCadenceMonths : undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-08 · S04</p>
          <h1 className="text-2xl font-semibold">Mandatory Document Matrix</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['UAE', 'KSA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={form.documentCode}
              onChange={(e) => setForm({ ...form, documentCode: e.target.value })}
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
              type="number"
              value={form.retentionYears}
              onChange={(e) => setForm({ ...form, retentionYears: Number(e.target.value) })}
              placeholder="Retention y"
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
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Mandatory</th>
                <th className="px-3 py-2">Retention</th>
                <th className="px-3 py-2">Renewal</th>
                <th className="px-3 py-2">Sensitivity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.documentCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 text-xs">{r.category}</td>
                  <td className="px-3 py-2">{r.isMandatory ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.retentionYears}y</td>
                  <td className="px-3 py-2 text-xs">
                    {r.renewalCadenceMonths ? `${r.renewalCadenceMonths}m` : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.sensitivity}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No items.
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
