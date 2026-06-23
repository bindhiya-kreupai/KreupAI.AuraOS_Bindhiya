'use client';

import { useEffect, useState } from 'react';

interface Line {
  domain: string;
  weight: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  total: number;
  domainScore: number;
  domainRag: string | null;
}
interface Scorecard {
  period: string;
  overallScore: number;
  overallRag: string | null;
  lines: Line[];
}

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};
const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function KpiScorecardHomePage() {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/kpi-scorecard/scorecard?period=${period}`);
    const p = await r.json();
    if (p.success) setScorecard(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seedAll() {
    setMessage('');
    const c = await fetch('/api/v1/kpi-scorecard/definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-catalog' }),
    }).then((r) => r.json());
    const w = await fetch('/api/v1/kpi-scorecard/definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-weights' }),
    }).then((r) => r.json());
    setMessage(`KPIs: ${c.data?.created?.length ?? 0} · Weights: ${w.data?.created?.length ?? 0}`);
    load();
  }

  const tools = [
    { href: '/dashboard/kpi-scorecard/catalog', label: 'KPI Catalogue (S01–S05)' },
    { href: '/dashboard/kpi-scorecard/thresholds', label: 'Threshold Library + DQ (S06)' },
    { href: '/dashboard/kpi-scorecard/scorecard', label: 'Executive Scorecard (S07)' },
    { href: '/dashboard/kpi-scorecard/certificate', label: 'Monthly KPI Certificate (S08)' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-38 · Compliance KPI Scorecard</p>
            <h1 className="text-2xl font-semibold">Executive Compliance Scorecard</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">
              Period
              <input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              onClick={seedAll}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed Catalog + Weights
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {scorecard ? (
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">Overall {scorecard.period}</p>
                <p className="text-4xl font-semibold">{scorecard.overallScore}</p>
              </div>
              {scorecard.overallRag ? (
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${ragColor[scorecard.overallRag] ?? ''}`}
                >
                  {scorecard.overallRag}
                </span>
              ) : (
                <span className="text-sm text-slate-500">No KPI values yet</span>
              )}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Per-Domain</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">Green</th>
                <th className="px-3 py-2">Amber</th>
                <th className="px-3 py-2">Red</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">RAG</th>
              </tr>
            </thead>
            <tbody>
              {(scorecard?.lines ?? []).map((l) => (
                <tr key={l.domain} className="border-b border-slate-100">
                  <td className="px-3 py-2">{l.domain}</td>
                  <td className="px-3 py-2">{l.weight}</td>
                  <td className="px-3 py-2 text-emerald-700">{l.greenCount}</td>
                  <td className="px-3 py-2 text-amber-700">{l.amberCount}</td>
                  <td className="px-3 py-2 text-rose-700">{l.redCount}</td>
                  <td className="px-3 py-2">{l.total}</td>
                  <td className="px-3 py-2">{l.domainScore}</td>
                  <td className="px-3 py-2">
                    {l.domainRag ? (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${ragColor[l.domainRag] ?? ''}`}
                      >
                        {l.domainRag}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {(!scorecard || scorecard.lines.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No KPI values for {period} yet. Seed the catalog and record values.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-slate-900 hover:bg-slate-50"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
