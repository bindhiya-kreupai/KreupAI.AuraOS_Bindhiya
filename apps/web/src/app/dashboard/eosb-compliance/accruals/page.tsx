'use client';

import { useEffect, useState } from 'react';

interface Accrual {
  id: string;
  employeeId: string;
  period: string;
  countryCode: string;
  basicSalary: string;
  serviceMonths: number;
  accruedGratuity: string;
  monthDelta: string;
  currency: string;
  glPosted: boolean;
  glJournalRef: string | null;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EosbAccrualsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    employeeId: '',
    period: periodNow(),
    countryCode: 'AE',
    joiningDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .slice(0, 10),
    basicSalary: '10000',
  });
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch('/api/v1/eosb-compliance/accruals');
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function snapshot() {
    setMessage('');
    const r = await fetch('/api/v1/eosb-compliance/accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'snapshot',
        ...form,
        basicSalary: Number(form.basicSalary),
      }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Snapshot taken' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  async function markPosted(id: string) {
    const ref = window.prompt('GL journal reference?') ?? '';
    if (!ref) return;
    const r = await fetch('/api/v1/eosb-compliance/accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-gl-posted', id, glJournalRef: ref }),
    });
    const p = await r.json();
    setMessage(p.success ? 'GL posted' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-28 · S11 / S17</p>
          <h1 className="text-2xl font-semibold">Monthly EOSB Accruals (GL Liability)</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
          <label className="text-sm">
            Employee
            <input
              value={form.employeeId}
              onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Period
            <input
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Country
            <select
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Joining
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Basic Salary
            <input
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={snapshot}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Take Snapshot
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Service Mo</th>
                <th className="px-3 py-2">Basic</th>
                <th className="px-3 py-2">Accrued</th>
                <th className="px-3 py-2">Δ Month</th>
                <th className="px-3 py-2">GL</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={9} className="px-3 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : rows.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">{a.period}</td>
                      <td className="px-3 py-2 font-semibold">
                        <div>{a.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{a.employeeId}</div>
                      </td>
                      <td className="px-3 py-2">{a.countryCode}</td>
                      <td className="px-3 py-2">{a.serviceMonths}</td>
                      <td className="px-3 py-2">{a.basicSalary} AED</td>
                      <td className="px-3 py-2 font-semibold">{a.accruedGratuity} AED</td>
                      <td
                        className={`px-3 py-2 ${Number(a.monthDelta) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                      >
                        {a.monthDelta} AED
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {a.glPosted ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                            ✓ {a.glJournalRef}
                          </span>
                        ) : (
                          'pending'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {!a.glPosted && (
                          <button
                            type="button"
                            onClick={() => markPosted(a.id)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            Post to GL
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No accruals.
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
