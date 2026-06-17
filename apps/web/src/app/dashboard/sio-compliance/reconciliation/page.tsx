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
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function SioReconciliationPage() {
  const [variances, setVariances] = useState<Variance[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/sio-compliance/reconciliation');
    const p = await r.json();
    if (p.success) setVariances(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    const r = await fetch('/api/v1/sio-compliance/reconciliation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', varianceId: id, notes: 'Manually resolved' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Resolved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-15 · S11 / S18</p>
          <h1 className="text-2xl font-semibold">SIO ↔ Payroll Reconciliation</h1>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
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
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{v.employeeId ?? '—'}</td>
                  <td className="px-3 py-2">{v.period}</td>
                  <td className="px-3 py-2 text-xs">{v.type}</td>
                  <td className="px-3 py-2">{v.expected ?? '—'}</td>
                  <td className="px-3 py-2">{v.actual ?? '—'}</td>
                  <td className="px-3 py-2">{v.difference ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor[v.severity] ?? ''}`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">{v.status}</td>
                  <td className="px-3 py-2">
                    {v.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={() => resolve(v.id)}
                        className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
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
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
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
