'use client';

import { useEffect, useState } from 'react';

interface Risk {
  id: string;
  riskCode: string;
  category: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  score: number;
  rating: string;
  ownerRole: string;
  countryScope: string[];
  status: string;
  mitigation: string | null;
}

const ratingColor: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-rose-100 text-rose-800',
};

export default function GccRiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filter, setFilter] = useState<{ rating?: string; status?: string }>({});
  const [message, setMessage] = useState('');

  async function load() {
    const url = new URL('/api/v1/gcc-landscape/risk-register', window.location.origin);
    if (filter.rating) url.searchParams.set('rating', filter.rating);
    if (filter.status) url.searchParams.set('status', filter.status);
    const r = await fetch(url.toString());
    const p = await r.json();
    if (p.success) setRisks(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, [filter.rating, filter.status]);

  async function seed() {
    const r = await fetch('/api/v1/gcc-landscape/risk-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-regional' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded: ${(p.data?.created ?? []).join(', ')}` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S06</p>
            <h1 className="text-2xl font-semibold">Compliance Risk Register</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Regional Risks
          </button>
        </header>

        <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="text-sm">
            Rating
            <select
              value={filter.rating ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, rating: e.target.value || undefined }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              value={filter.status ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value || undefined }))}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {['OPEN', 'MITIGATING', 'RESOLVED', 'ACCEPTED'].map((r) => (
                <option key={r}>{r}</option>
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
                  {r.title}{' '}
                  <span className="ml-2 font-mono text-xs text-slate-500">{r.riskCode}</span>
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${ratingColor[r.rating] ?? ''}`}
                >
                  {r.rating} ({r.score})
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 md:grid-cols-4">
                <dt>Category</dt>
                <dd>{r.category}</dd>
                <dt>Owner</dt>
                <dd>{r.ownerRole}</dd>
                <dt>Likelihood × Impact</dt>
                <dd>
                  {r.likelihood} × {r.impact}
                </dd>
                <dt>Countries</dt>
                <dd>{r.countryScope.join(', ') || 'All'}</dd>
              </dl>
              {r.mitigation ? (
                <p className="mt-3 rounded border border-slate-100 bg-slate-50 p-2 text-xs">
                  <strong>Mitigation:</strong> {r.mitigation}
                </p>
              ) : null}
            </article>
          ))}
          {risks.length === 0 && <p className="text-sm text-slate-500">No risks yet.</p>}
        </section>
      </div>
    </main>
  );
}
