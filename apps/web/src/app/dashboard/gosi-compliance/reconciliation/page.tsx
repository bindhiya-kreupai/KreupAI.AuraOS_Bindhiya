'use client';

import { useEffect, useState } from 'react';

interface Variance {
  id: string;
  employeeId: string | null;
  period: string;
  type: string;
  expected: string | null;
  actual: string | null;
  difference: string | null;
  severity: string;
  status: string;
}

const sevColor: Record<string, string> = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350',
  MEDIUM: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-450',
  HIGH: 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-450',
  CRITICAL: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-450',
};

export default function ReconciliationPage() {
  const [variances, setVariances] = useState<Variance[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gosi-compliance/reconciliation');
    const p = await r.json();
    if (p.success) {
      setVariances(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    const r = await fetch('/api/v1/gosi-compliance/reconciliation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', varianceId: id, notes: 'Manually resolved' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-13 · S13 / S21</p>
          <h1 className="text-2xl font-semibold dark:text-white">GOSI ↔ Payroll Reconciliation</h1>
        </header>
        {message ? <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
        
        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Expected</th>
                <th className="px-3 py-2">Actual</th>
                <th className="px-3 py-2">Δ</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {variances.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-3 py-2 font-mono text-xs dark:text-slate-300">{v.employeeId ?? '—'}</td>
                  <td className="px-3 py-2 dark:text-slate-350">{v.period}</td>
                  <td className="px-3 py-2 text-xs dark:text-slate-300">{v.type}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{v.expected ?? '—'}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{v.actual ?? '—'}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{v.difference ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[v.severity] ?? ''}`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${v.status === 'RESOLVED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {v.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => resolve(v.id)}
                        className="rounded bg-emerald-700 hover:bg-emerald-600 px-2 py-1 text-xs text-white font-semibold transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {variances.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No variances.
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
