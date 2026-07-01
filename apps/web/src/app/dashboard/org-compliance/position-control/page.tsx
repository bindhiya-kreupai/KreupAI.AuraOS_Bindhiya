'use client';

import { useEffect, useState } from 'react';

interface Row {
  id: string;
  period: string;
  departmentId: string | null;
  positionId: string | null;
  country: string | null;
  budgetedHeadcount: number;
  approvedHeadcount: number;
  filledHeadcount: number;
  vacantHeadcount: number;
  overhireCount: number;
  frozenCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

interface ListResponse<T> {
  items?: T[];
}

export default function OrgPositionControlPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    period: periodNow(),
    departmentId: '',
    positionId: '',
    country: '',
    budgetedHeadcount: 0,
    approvedHeadcount: 0,
    filledHeadcount: 0,
    frozenCount: 0,
  });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/org-compliance/position-control');
      const p = await r.json();
      if (p.success) {
        const data = p.data as ListResponse<Row> | Row[] | undefined;
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
    const r = await fetch('/api/v1/org-compliance/position-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    if (p.success) await load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-09 · S08/S16</p>
          <h1 className="text-2xl font-semibold">Position Control & Headcount</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">New / Update</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <input
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="Period"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              placeholder="Department ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
              placeholder="Position ID"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.budgetedHeadcount}
              onChange={(e) => setForm({ ...form, budgetedHeadcount: Number(e.target.value) })}
              placeholder="Budgeted"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.approvedHeadcount}
              onChange={(e) => setForm({ ...form, approvedHeadcount: Number(e.target.value) })}
              placeholder="Approved"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
            <input
              type="number"
              value={form.filledHeadcount}
              onChange={(e) => setForm({ ...form, filledHeadcount: Number(e.target.value) })}
              placeholder="Filled"
              className="rounded-md border border-slate-300 px-2 py-1.5"
            />
          </div>
          <button
            type="button"
            onClick={save}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Dept</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Budget</th>
                <th className="px-3 py-2">Approved</th>
                <th className="px-3 py-2">Filled</th>
                <th className="px-3 py-2">Vacant</th>
                <th className="px-3 py-2">Overhire</th>
                <th className="px-3 py-2">Frozen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.period}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.departmentId ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.positionId ?? '—'}</td>
                  <td className="px-3 py-2">{r.budgetedHeadcount}</td>
                  <td className="px-3 py-2">{r.approvedHeadcount}</td>
                  <td className="px-3 py-2 text-emerald-700">{r.filledHeadcount}</td>
                  <td className="px-3 py-2 text-amber-700">{r.vacantHeadcount}</td>
                  <td className="px-3 py-2 text-rose-700">{r.overhireCount}</td>
                  <td className="px-3 py-2">{r.frozenCount}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    {loading ? 'Loading…' : 'No rows.'}
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
