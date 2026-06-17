'use client';

import { useEffect, useState } from 'react';

interface Row {
  id: string;
  country: string;
  documentCode: string;
  label: string;
  appliesTo: string;
  issuer: string | null;
  isMandatory: boolean;
  validityMonths: number | null;
  renewalLeadDays: number;
  regulatorRef: string | null;
}

const COUNTRIES = ['UAE', 'KSA', 'BH', 'QA', 'OM', 'KW'];

export default function AuthMatrixPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    country: 'UAE',
    documentCode: '',
    label: '',
    appliesTo: 'EMPLOYEE',
    issuer: '',
    validityMonths: 24,
    renewalLeadDays: 60,
    regulatorRef: '',
  });

  async function load() {
    const r = await fetch('/api/v1/immigration-compliance/authorization-matrix');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/immigration-compliance/authorization-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        ...form,
        validityMonths: form.validityMonths > 0 ? form.validityMonths : undefined,
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
          <p className="text-sm uppercase text-slate-500">EPIC-07 · S02/S03</p>
          <h1 className="text-2xl font-semibold">Country Authorization Matrix</h1>
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
              {COUNTRIES.map((c) => (
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
              value={form.appliesTo}
              onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['EMPLOYEE', 'DEPENDENT', 'CONTRACTOR'].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <input
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              placeholder="Issuer"
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
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <input
              type="number"
              value={form.validityMonths}
              onChange={(e) => setForm({ ...form, validityMonths: Number(e.target.value) })}
              placeholder="Validity (months)"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.renewalLeadDays}
              onChange={(e) => setForm({ ...form, renewalLeadDays: Number(e.target.value) })}
              placeholder="Renewal lead days"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.regulatorRef}
              onChange={(e) => setForm({ ...form, regulatorRef: e.target.value })}
              placeholder="Regulator ref"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Applies To</th>
                <th className="px-3 py-2">Issuer</th>
                <th className="px-3 py-2">Mandatory</th>
                <th className="px-3 py-2">Validity</th>
                <th className="px-3 py-2">Lead Days</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.documentCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 text-xs">{r.appliesTo}</td>
                  <td className="px-3 py-2 text-xs">{r.issuer ?? '—'}</td>
                  <td className="px-3 py-2">{r.isMandatory ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{r.validityMonths ? `${r.validityMonths}m` : '—'}</td>
                  <td className="px-3 py-2">{r.renewalLeadDays}d</td>
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
