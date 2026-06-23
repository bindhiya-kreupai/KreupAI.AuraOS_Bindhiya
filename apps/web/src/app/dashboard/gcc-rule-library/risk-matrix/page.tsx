'use client';

import { useEffect, useState } from 'react';

interface Risk {
  id: string;
  countryCode: string;
  riskCode: string;
  title: string;
  description: string;
  domain: string;
  rating: string;
  score: number;
  likelihood: number;
  impact: number;
  status: string;
  ownerRole: string;
  controlRef: string | null;
}

const ratingColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};
const GCC = ['', 'AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

export default function RiskMatrixPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/gcc-rule-library/risk-matrix', window.location.origin);
    if (country) url.searchParams.set('countryCode', country);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRisks(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [country]);

  async function seed() {
    const r = await fetch('/api/v1/gcc-rule-library/risk-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-regional' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded ${(p.data?.created ?? []).length} risks` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-36 · S06</p>
            <h1 className="text-2xl font-semibold">Country Risk Matrix</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Regional
          </button>
        </header>
        <section className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm font-medium">
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
            >
              {GCC.map((c) => (
                <option key={c} value={c}>
                  {c || 'All'}
                </option>
              ))}
            </select>
          </label>
          {message ? <span className="text-sm">{message}</span> : null}
        </section>

        <section className="grid gap-3">
          {risks.map((r) => (
            <article key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {r.countryCode} · {r.title}{' '}
                  <span className="ml-2 font-mono text-xs text-slate-500">{r.riskCode}</span>
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${ratingColor[r.rating] ?? ''}`}
                >
                  {r.rating} ({r.score})
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                Domain: {r.domain} · Owner: {r.ownerRole} · Control: {r.controlRef ?? '—'} · Status:{' '}
                {r.status} · L×I: {r.likelihood}×{r.impact}
              </p>
            </article>
          ))}
          {risks.length === 0 && (
            <p className="text-sm text-slate-500">No risks. Seed regional from the top button.</p>
          )}
        </section>
      </div>
    </main>
  );
}
