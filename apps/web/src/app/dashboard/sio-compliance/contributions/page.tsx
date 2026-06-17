'use client';

import { useEffect, useState } from 'react';

interface Contribution {
  id: string;
  employeeId: string;
  period: string;
  nationalityClass: string;
  contributionWage: string;
  insuranceEmployer: string;
  insuranceEmployee: string;
  unemploymentEmployer: string;
  unemploymentEmployee: string;
  totalEmployer: string;
  totalEmployee: string;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function SioContributionsPage() {
  const [list, setList] = useState<Contribution[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [form, setForm] = useState({
    employeeId: '',
    basicWage: '800',
    housingAllowance: '200',
    otherAllowances: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/sio-compliance/contributions?period=${period}`);
    const p = await r.json();
    if (p.success) setList(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function recordWage() {
    setMessage('');
    const r = await fetch('/api/v1/sio-compliance/wages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: form.employeeId,
        period,
        basicWage: Number(form.basicWage),
        housingAllowance: Number(form.housingAllowance),
        otherAllowances: Number(form.otherAllowances),
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Wage recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
  }
  async function computeOne() {
    setMessage('');
    const r = await fetch('/api/v1/sio-compliance/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: form.employeeId, period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Computed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-15 · S05–S08</p>
            <h1 className="text-2xl font-semibold">Wages & Contributions</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Basic
            <input
              value={form.basicWage}
              onChange={(e) => setForm((f) => ({ ...f, basicWage: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Housing
            <input
              value={form.housingAllowance}
              onChange={(e) => setForm((f) => ({ ...f, housingAllowance: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Other
            <input
              value={form.otherAllowances}
              onChange={(e) => setForm((f) => ({ ...f, otherAllowances: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={recordWage}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              Wage
            </button>
            <button
              type="button"
              onClick={computeOne}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Compute
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Wage</th>
                <th className="px-3 py-2">Ins ER</th>
                <th className="px-3 py-2">Ins EE</th>
                <th className="px-3 py-2">Unemp ER</th>
                <th className="px-3 py-2">Unemp EE</th>
                <th className="px-3 py-2">Total ER</th>
                <th className="px-3 py-2">Total EE</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                  <td className="px-3 py-2">{c.nationalityClass}</td>
                  <td className="px-3 py-2">{c.contributionWage}</td>
                  <td className="px-3 py-2">{c.insuranceEmployer}</td>
                  <td className="px-3 py-2">{c.insuranceEmployee}</td>
                  <td className="px-3 py-2">{c.unemploymentEmployer}</td>
                  <td className="px-3 py-2">{c.unemploymentEmployee}</td>
                  <td className="px-3 py-2 font-semibold">{c.totalEmployer}</td>
                  <td className="px-3 py-2 font-semibold">{c.totalEmployee}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No contributions for {period}.
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
