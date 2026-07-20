'use client';

import { useEffect, useState } from 'react';

interface Item {
  id: string;
  itemCode: string;
  label: string;
  category: string;
  severity: string;
  lastResult: string | null;
  lastReviewedAt: string | null;
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

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};
const resColor: Record<string, string> = {
  PASS: 'text-emerald-700',
  FAIL: 'text-rose-700',
  OBSERVATION: 'text-amber-700',
};

export default function RecordsChecklistPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [message, setMessage] = useState('');
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    itemCode: '',
    label: '',
    category: 'CONTRACT',
    severity: 'MEDIUM',
    expectation: '',
  });

  async function load() {
    const r = await fetch('/api/v1/records-compliance/audit-checklist');
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data?.items) ? p.data.items : []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch('/api/v1/records-compliance/audit-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function record(id: string, result: string) {
    const notes = notesById[id] ?? '';
    const r = await fetch('/api/v1/records-compliance/audit-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record', id, result, notes }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) setNotesById((prev) => ({ ...prev, [id]: '' }));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-08 · S11</p>
          <h1 className="text-2xl font-semibold">Records Audit Checklist</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
            <input
              value={form.itemCode}
              onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
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
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} value={s}>
                  {s}
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
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Last Result</th>
                <th className="px-3 py-2">Last Reviewed</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.itemCode}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 text-xs">{r.category}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[r.severity] ?? ''}`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-2 font-semibold ${resColor[r.lastResult ?? ''] ?? 'text-slate-500'}`}
                  >
                    {r.lastResult ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.lastReviewedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <input
                        value={notesById[r.id] ?? ''}
                        onChange={(e) =>
                          setNotesById((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        placeholder="Notes (optional)"
                        className="w-40 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => record(r.id, 'PASS')}
                          className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                        >
                          PASS
                        </button>
                        <button
                          type="button"
                          onClick={() => record(r.id, 'FAIL')}
                          className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                        >
                          FAIL
                        </button>
                        <button
                          type="button"
                          onClick={() => record(r.id, 'OBSERVATION')}
                          className="rounded-md bg-amber-700 px-2 py-1 text-xs text-white"
                        >
                          OBS
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
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
