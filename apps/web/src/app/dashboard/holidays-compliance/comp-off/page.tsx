'use client';

import { useEffect, useState } from 'react';

interface Co {
  id: string;
  employeeId: string;
  workApprovalId: string | null;
  earnedDate: string;
  daysAccrued: string;
  daysConsumed: string;
  expiresAt: string | null;
  status: string;
}

const statusColor: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800',
  CONSUMED: 'bg-slate-100 text-slate-700',
};

export default function CompOffPage() {
  const [rows, setRows] = useState<Co[]>([]);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/holidays-compliance/comp-off', window.location.origin);
    if (expiringOnly) url.searchParams.set('expiringSoonDays', '30');
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [expiringOnly]);

  async function consume(id: string) {
    const d = window.prompt('Days to consume?') ?? '';
    if (!d) return;
    const r = await fetch('/api/v1/holidays-compliance/comp-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'consume', id, days: Number(d) }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Consumed' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-21 · S07</p>
            <h1 className="text-2xl font-semibold">Comp-Off Ledger</h1>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={expiringOnly}
              onChange={(e) => setExpiringOnly(e.target.checked)}
            />
            Expiring ≤ 30d
          </label>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Earned</th>
                <th className="px-3 py-2">Accrued</th>
                <th className="px-3 py-2">Consumed</th>
                <th className="px-3 py-2">Avail</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const available = Number(c.daysAccrued) - Number(c.daysConsumed);
                const expSoon =
                  c.expiresAt &&
                  new Date(c.expiresAt).getTime() < Date.now() + 30 * 24 * 3600 * 1000;
                return (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{c.employeeId}</td>
                    <td className="px-3 py-2 text-xs">{c.earnedDate?.slice(0, 10)}</td>
                    <td className="px-3 py-2">{c.daysAccrued}</td>
                    <td className="px-3 py-2">{c.daysConsumed}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{available}</td>
                    <td
                      className={`px-3 py-2 text-xs ${expSoon ? 'font-semibold text-rose-700' : ''}`}
                    >
                      {c.expiresAt?.slice(0, 10) ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[c.status] ?? ''}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {c.status === 'AVAILABLE' && available > 0 && (
                        <button
                          type="button"
                          onClick={() => consume(c.id)}
                          className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                        >
                          Consume
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No comp-off records.
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
