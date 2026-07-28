'use client';

import { useEffect, useState } from 'react';

interface Threshold {
  id: string;
  sector: string;
  sizeBracket: string;
  redMaxPct: string;
  yellowMaxPct: string;
  greenMaxPct: string;
  platinumMinPct: string;
  effectiveFrom: string;
}

export default function NitaqatThresholdsPage() {
  const [rows, setRows] = useState<Threshold[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/nitaqat-compliance/thresholds');
    const p = await r.json();
    if (p.success) setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setMessage('');
    const r = await fetch('/api/v1/nitaqat-compliance/thresholds', {
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
            <p className="text-sm uppercase text-slate-500">EPIC-17 · S03 / S04</p>
            <h1 className="text-2xl font-semibold">Band Thresholds (Sector × Size)</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Default Thresholds
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Sector</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">RED ≤</th>
                <th className="px-3 py-2">YELLOW ≤</th>
                <th className="px-3 py-2">GREEN ≤</th>
                <th className="px-3 py-2">PLATINUM ≥</th>
                <th className="px-3 py-2">Effective From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{r.sector}</td>
                  <td className="px-3 py-2">{r.sizeBracket}</td>
                  <td className="px-3 py-2 text-rose-700">{r.redMaxPct}</td>
                  <td className="px-3 py-2 text-amber-700">{r.yellowMaxPct}</td>
                  <td className="px-3 py-2 text-emerald-700">{r.greenMaxPct}</td>
                  <td className="px-3 py-2 text-indigo-700">{r.platinumMinPct}</td>
                  <td className="px-3 py-2 text-xs">{r.effectiveFrom?.slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No thresholds configured. Click &quot;Seed Default Thresholds&quot; to
                    bootstrap.
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
