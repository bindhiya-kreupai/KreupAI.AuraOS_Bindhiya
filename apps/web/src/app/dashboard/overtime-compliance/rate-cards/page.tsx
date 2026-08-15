'use client';

import { useEffect, useState } from 'react';

interface Card {
  id: string;
  country: string;
  otType: string;
  multiplier: string;
  basis: string;
  effectiveFrom: string;
}

export default function OtRateCardsPage() {
  const [rows, setRows] = useState<Card[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/overtime-compliance/rate-cards');
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/overtime-compliance/rate-cards', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-12 · S03 / S07 / S09 / S10</p>
            <h1 className="text-2xl font-semibold">Country × OT Type Rate Cards</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Default GCC Rate Cards
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">OT Type</th>
                <th className="px-3 py-2">Multiplier</th>
                <th className="px-3 py-2">Basis</th>
                <th className="px-3 py-2">Effective From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.country}</td>
                  <td className="px-3 py-2">{r.otType}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-700">×{r.multiplier}</td>
                  <td className="px-3 py-2">{r.basis}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No rate cards. Click &quot;Seed Default GCC Rate Cards&quot; to bootstrap.
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
