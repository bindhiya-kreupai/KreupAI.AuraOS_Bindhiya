'use client';

import { useEffect, useState } from 'react';

interface Budget {
  id: string;
  period: string;
  costCenterId: string | null;
  country: string | null;
  budgetHours: string;
  budgetAmount: string;
  actualHours: string;
  actualAmount: string;
  currency: string;
  status: string;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function OtBudgetsPage() {
  const [rows, setRows] = useState<Budget[]>([]);
  const [form, setForm] = useState({
    period: periodNow(),
    costCenterId: '',
    country: '',
    budgetHours: '100',
    budgetAmount: '10000',
    currency: 'AED',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/overtime-compliance/budgets');
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setMessage('');
    const r = await fetch('/api/v1/overtime-compliance/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        period: form.period,
        costCenterId: form.costCenterId || undefined,
        country: form.country || undefined,
        budgetHours: Number(form.budgetHours),
        budgetAmount: Number(form.budgetAmount),
        currency: form.currency,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function refresh(period: string) {
    const r = await fetch('/api/v1/overtime-compliance/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh', period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Refreshed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-12 · S11 / S15</p>
          <h1 className="text-2xl font-semibold">Overtime Budget Control</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-7">
          <label className="text-sm">
            Period
            <input
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Cost Center
            <input
              value={form.costCenterId}
              onChange={(e) => setForm((f) => ({ ...f, costCenterId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Budget Hours
            <input
              value={form.budgetHours}
              onChange={(e) => setForm((f) => ({ ...f, budgetHours: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Budget Amount
            <input
              value={form.budgetAmount}
              onChange={(e) => setForm((f) => ({ ...f, budgetAmount: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Currency
            <input
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="self-end rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save Budget
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Cost Center</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Budget Hrs</th>
                <th className="px-3 py-2">Actual Hrs</th>
                <th className="px-3 py-2">Budget Amt</th>
                <th className="px-3 py-2">Actual Amt</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const breach = Number(b.actualAmount) > Number(b.budgetAmount);
                return (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{b.period}</td>
                    <td className="px-3 py-2 font-mono text-xs">{b.costCenterId ?? '—'}</td>
                    <td className="px-3 py-2">{b.country ?? '—'}</td>
                    <td className="px-3 py-2">{b.budgetHours}</td>
                    <td className="px-3 py-2">{b.actualHours}</td>
                    <td className="px-3 py-2">
                      {b.budgetAmount} {b.currency}
                    </td>
                    <td className={`px-3 py-2 ${breach ? 'text-rose-700 font-semibold' : ''}`}>
                      {b.actualAmount} {b.currency}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${breach ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}
                      >
                        {breach ? 'BREACH' : 'OK'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => refresh(b.period)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        Refresh
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No budgets.
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
