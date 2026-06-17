'use client';

import { useEffect, useState } from 'react';

interface Rule {
  id: string;
  country: string;
  holidayClass: string;
  baseMultiplier: string;
  otMultiplier: string;
  compOffDaysAccrued: string;
  isPaid: boolean;
  ramadanReducedHours: string | null;
  effectiveFrom: string;
}

export default function PayRulesPage() {
  const [rows, setRows] = useState<Rule[]>([]);
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/holidays-compliance/pay-rules', window.location.origin);
    if (country) url.searchParams.set('country', country);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRows(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [country]);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/holidays-compliance/pay-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Seeded' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-21 · S06 / S07</p>
            <h1 className="text-2xl font-semibold">Holiday Pay &amp; Comp-Off Rules</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All countries</option>
              {['UAE', 'KSA', 'BAHRAIN', 'QATAR', 'OMAN', 'KUWAIT'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={seed}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed GCC Defaults
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Base ×</th>
                <th className="px-3 py-2">OT ×</th>
                <th className="px-3 py-2">Comp-Off d</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.holidayClass}</td>
                  <td className="px-3 py-2">×{r.baseMultiplier}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-700">×{r.otMultiplier}</td>
                  <td className="px-3 py-2">{r.compOffDaysAccrued}</td>
                  <td className="px-3 py-2">{r.isPaid ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No rules. Click &quot;Seed GCC Defaults&quot; to bootstrap.
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
