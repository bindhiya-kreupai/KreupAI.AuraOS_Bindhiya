'use client';

import { useEffect, useState } from 'react';

interface Contribution {
  id: string;
  employeeId: string;
  period: string;
  nationalityClass: string;
  contributionWage: string;
  annuitiesEmployer: string;
  annuitiesEmployee: string;
  ohEmployer: string;
  totalEmployer: string;
  totalEmployee: string;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ContributionsPage() {
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [period, setPeriod] = useState(periodNow());
  const [wageForm, setWageForm] = useState({
    employeeId: '',
    basicWage: '5000',
    housingAllowance: '1500',
    otherAllowances: '0',
  });
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/gosi-compliance/contributions?period=${period}`);
    const p = await r.json();
    if (p.success) {
      setContribs(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }
  useEffect(() => {
    load();
  }, [period]);

  async function recordWage() {
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/wages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: wageForm.employeeId,
        period,
        basicWage: Number(wageForm.basicWage),
        housingAllowance: Number(wageForm.housingAllowance),
        otherAllowances: Number(wageForm.otherAllowances),
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Wage recorded' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
  }
  async function computeOne() {
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: wageForm.employeeId, period }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Computed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }
  async function deleteContrib(c: Contribution) {
    setMessage('');
    const r = await fetch(`/api/v1/gosi-compliance/contributions?employeeId=${c.employeeId}&period=${period}`, {
      method: 'DELETE',
    });
    const p = await r.json();
    setMessage(p.success ? 'Deleted' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-13 · S07–S12</p>
            <h1 className="text-2xl font-semibold dark:text-white">Contribution Wage + Calculation</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="YYYY-MM"
            className="w-24 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-center dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </header>
        {message ? <p className="text-sm text-slate-650 dark:text-slate-400">{message}</p> : null}

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-5">
          <label className="text-sm dark:text-slate-300">
            Employee ID
            <input
              value={wageForm.employeeId}
              onChange={(e) => setWageForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Basic
            <input
              value={wageForm.basicWage}
              onChange={(e) => setWageForm((f) => ({ ...f, basicWage: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Housing
            <input
              value={wageForm.housingAllowance}
              onChange={(e) => setWageForm((f) => ({ ...f, housingAllowance: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-300">
            Other
            <input
              value={wageForm.otherAllowances}
              onChange={(e) => setWageForm((f) => ({ ...f, otherAllowances: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 dark:text-white"
            />
          </label>
          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={recordWage}
              className="rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Record Wage
            </button>
            <button
              type="button"
              onClick={computeOne}
              className="rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-3 py-2 text-sm text-white dark:text-slate-900 font-semibold transition-colors"
            >
              Compute
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Wage</th>
                <th className="px-3 py-2">Ann. ER</th>
                <th className="px-3 py-2">Ann. EE</th>
                <th className="px-3 py-2">OH ER</th>
                <th className="px-3 py-2">Total ER</th>
                <th className="px-3 py-2">Total EE</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {contribs.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-3 py-2 font-mono text-xs dark:text-slate-300">{c.employeeId}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.nationalityClass}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.contributionWage}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.annuitiesEmployer}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.annuitiesEmployee}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{c.ohEmployer}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{c.totalEmployer}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{c.totalEmployee}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => deleteContrib(c)}
                      className="rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-2 py-1 text-xs text-rose-600 dark:text-rose-455 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {contribs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
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
