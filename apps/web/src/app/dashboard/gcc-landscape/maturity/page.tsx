'use client';

import { useEffect, useState } from 'react';

interface Line {
  domain: { code: string; name: string };
  latest?: {
    currentLevel: number;
    targetLevel: number;
    gap: number;
    period: string;
    isImprovementPriority: boolean;
  } | null;
  history: Array<{ period: string; currentLevel: number; targetLevel: number; gap: number }>;
}

interface Scorecard {
  period: string | null;
  index: { current: number; target: number; gap: number };
  lines: Line[];
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
};

export default function GccMaturityPage() {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [domains, setDomains] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [period, setPeriod] = useState(periodNow());
  const [domainCode, setDomainCode] = useState('PAYROLL');
  const [current, setCurrent] = useState('3');
  const [target, setTarget] = useState('4');
  const [message, setMessage] = useState('');

  async function load() {
    const [r1, r2] = await Promise.all([
      fetch(`/api/v1/gcc-landscape/maturity?period=${period}`),
      fetch('/api/v1/gcc-landscape/maturity?action=domains'),
    ]);
    const [p1, p2] = await Promise.all([r1.json(), r2.json()]);
    if (p1.success) setScorecard(p1.data);
    if (p2.success) setDomains(p2.data ?? []);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seedDomains() {
    const r = await fetch('/api/v1/gcc-landscape/maturity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-domains' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded: ${(p.data?.created ?? []).join(', ')}` : p.error?.message);
    load();
  }
  async function save() {
    const r = await fetch('/api/v1/gcc-landscape/maturity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domainCode,
        period,
        currentLevel: Number(current),
        targetLevel: Number(target),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Saved' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S09</p>
            <h1 className="text-2xl font-semibold">Digital Maturity Scorecard</h1>
          </div>
          <button
            type="button"
            onClick={seedDomains}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Domains
          </button>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <label className="text-sm">
            Period
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Domain
            <select
              value={domainCode}
              onChange={(e) => setDomainCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            >
              {domains.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Current (1–5)
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            Target (1–5)
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={save}
            className="md:col-span-4 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Save
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        {scorecard ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">
                Maturity Index – {scorecard.period ?? 'latest'}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Current</p>
                  <p className="text-2xl font-semibold">{scorecard.index.current}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Target</p>
                  <p className="text-2xl font-semibold">{scorecard.index.target}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Gap</p>
                  <p className="text-2xl font-semibold">{scorecard.index.gap}</p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Per-domain</h2>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Domain</th>
                    <th className="px-3 py-2">Current</th>
                    <th className="px-3 py-2">Target</th>
                    <th className="px-3 py-2">Gap</th>
                    <th className="px-3 py-2">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.lines.map((l) => (
                    <tr key={l.domain.code} className="border-b border-slate-100">
                      <td className="px-3 py-2">{l.domain.name}</td>
                      <td className="px-3 py-2">{l.latest?.currentLevel ?? '—'}</td>
                      <td className="px-3 py-2">{l.latest?.targetLevel ?? '—'}</td>
                      <td className="px-3 py-2">{l.latest?.gap ?? '—'}</td>
                      <td className="px-3 py-2">
                        {l.latest?.isImprovementPriority ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            Improve
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
