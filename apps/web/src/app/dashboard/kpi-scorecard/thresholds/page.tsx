'use client';

import { useEffect, useState } from 'react';

interface Threshold {
  id: string;
  kpiCode: string;
  countryCode: string | null;
  greenMin: string | null;
  greenMax: string | null;
  amberMin: string | null;
  amberMax: string | null;
  redMin: string | null;
  redMax: string | null;
  statutoryRef: string | null;
}

export default function ThresholdsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);

  async function load() {
    const r = await fetch('/api/v1/kpi-scorecard/thresholds');
    const p = await r.json();
    if (p.success) setThresholds(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-38 · S06</p>
          <h1 className="text-2xl font-semibold">Threshold Library</h1>
        </header>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">KPI</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Green</th>
                <th className="px-3 py-2">Amber</th>
                <th className="px-3 py-2">Red</th>
                <th className="px-3 py-2">Statutory</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{t.kpiCode}</td>
                  <td className="px-3 py-2">{t.countryCode ?? 'global'}</td>
                  <td className="px-3 py-2 text-xs">
                    {[t.greenMin, t.greenMax].filter((x) => x != null).join(' – ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {[t.amberMin, t.amberMax].filter((x) => x != null).join(' – ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {[t.redMin, t.redMax].filter((x) => x != null).join(' – ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">{t.statutoryRef ?? '—'}</td>
                </tr>
              ))}
              {thresholds.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No thresholds yet. Seed the catalogue first.
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
