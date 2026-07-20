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
  'LEGAL_ENTITY',
  'DEPARTMENT',
  'COST_CENTER',
  'POSITION',
  'JOB_ARCHITECTURE',
  'GRADE',
  'POSITION_CONTROL',
  'REPORTING',
  'DELEGATION',
  'VACANCY',
  'CHANGE_MGMT',
  'NATIONALIZATION',
  'WORKFORCE_ANALYTICS',
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

interface ListResponse<T> {
  items?: T[];
}

export default function OrgChecklistPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordFor, setRecordFor] = useState<{ id: string; result: string } | null>(null);
  const [recordNotes, setRecordNotes] = useState('');
  const [form, setForm] = useState({
    itemCode: '',
    label: '',
    category: 'POSITION',
    severity: 'MEDIUM',
    expectation: '',
  });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/org-compliance/audit-checklist');
      const p = await r.json();
      if (p.success) {
        const data = p.data as ListResponse<Item> | Item[] | undefined;
        setRows(Array.isArray(data) ? data : (data?.items ?? []));
      } else {
        setMessage(p.error?.message ?? 'Failed to load');
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/org-compliance/audit-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) {
      setForm({
        itemCode: '',
        label: '',
        category: 'POSITION',
        severity: 'MEDIUM',
        expectation: '',
      });
      await load();
    }
  }
  async function submitRecord() {
    if (!recordFor) return;
    setMessage('');
    const r = await fetch('/api/v1/org-compliance/audit-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        id: recordFor.id,
        result: recordFor.result,
        notes: recordNotes || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) {
      setRecordFor(null);
      setRecordNotes('');
      await load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-09 · S17</p>
          <h1 className="text-2xl font-semibold">Org Audit Checklist</h1>
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
          <input
            value={form.expectation}
            onChange={(e) => setForm({ ...form, expectation: e.target.value })}
            placeholder="Expectation"
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
                  <td className="px-3 py-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRecordFor({ id: r.id, result: 'PASS' });
                        setRecordNotes('');
                      }}
                      className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                    >
                      PASS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecordFor({ id: r.id, result: 'FAIL' });
                        setRecordNotes('');
                      }}
                      className="rounded-md bg-rose-700 px-2 py-1 text-xs text-white"
                    >
                      FAIL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecordFor({ id: r.id, result: 'OBSERVATION' });
                        setRecordNotes('');
                      }}
                      className="rounded-md bg-amber-700 px-2 py-1 text-xs text-white"
                    >
                      OBS
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    {loading ? 'Loading…' : 'No items.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {recordFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <h3 className="text-base font-semibold">Record {recordFor.result}</h3>
            <p className="mt-1 text-sm text-slate-600">Add optional notes for this review.</p>
            <textarea
              value={recordNotes}
              onChange={(e) => setRecordNotes(e.target.value)}
              rows={3}
              placeholder="Notes (optional)"
              className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRecordFor(null);
                  setRecordNotes('');
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRecord}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
