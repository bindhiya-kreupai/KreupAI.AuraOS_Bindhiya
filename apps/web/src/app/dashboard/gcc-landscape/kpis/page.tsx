'use client';

import { useEffect, useState } from 'react';

interface Snapshot {
  id: string;
  countryCode: string | null;
  snapshotDate: string;
  totalHeadcount: number;
  nationalCount: number;
  gccOtherCount: number;
  expatCount: number;
  nationalPct: string;
  targetPct: string | null;
  ragStatus: string | null;
}

const GCC_COUNTRIES = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];
const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  AMBER: 'bg-amber-100 text-amber-800',
  RED: 'bg-rose-100 text-rose-800',
};

export default function GccKpisPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [country, setCountry] = useState('AE');
  const [targetPct, setTargetPct] = useState('10');
  const [amber, setAmber] = useState('5');
  const [red, setRed] = useState('10');
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gcc-landscape/kpis');
    const p = await r.json();
    if (p.success) setSnapshots(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function takeSnapshot() {
    const r = await fetch('/api/v1/gcc-landscape/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'snapshot' }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Snapshot taken' : p.error?.message);
    load();
  }
  async function setTarget() {
    const r = await fetch('/api/v1/gcc-landscape/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set-target',
        countryCode: country,
        targetPct: Number(targetPct),
        amberThreshold: Number(amber),
        redThreshold: Number(red),
      }),
    });
    const p = await r.json();
    setMessage(p.success ? `Target set for ${country}` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">GCC Landscape · S07</p>
          <h1 className="text-2xl font-semibold">Workforce KPI Baseline</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Take Snapshot</h2>
            <p className="mt-2 text-sm text-slate-600">
              Computes per-country national% / target% / RAG and persists a timestamped row.
            </p>
            <button
              type="button"
              onClick={takeSnapshot}
              className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Snapshot now
            </button>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Set Localization Target</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <label>
                Country
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                >
                  {GCC_COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Target %
                <input
                  value={targetPct}
                  onChange={(e) => setTargetPct(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label>
                Amber threshold (gap)
                <input
                  value={amber}
                  onChange={(e) => setAmber(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label>
                Red threshold (gap)
                <input
                  value={red}
                  onChange={(e) => setRed(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={setTarget}
              className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Save Target
            </button>
          </div>
        </section>

        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Latest Snapshots</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">National</th>
                <th className="px-3 py-2">GCC Other</th>
                <th className="px-3 py-2">Expat</th>
                <th className="px-3 py-2">National %</th>
                <th className="px-3 py-2">Target %</th>
                <th className="px-3 py-2">RAG</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{s.countryCode ?? '—'}</td>
                  <td className="px-3 py-2">{s.snapshotDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2">{s.totalHeadcount}</td>
                  <td className="px-3 py-2">{s.nationalCount}</td>
                  <td className="px-3 py-2">{s.gccOtherCount}</td>
                  <td className="px-3 py-2">{s.expatCount}</td>
                  <td className="px-3 py-2">{s.nationalPct}</td>
                  <td className="px-3 py-2">{s.targetPct ?? '—'}</td>
                  <td className="px-3 py-2">
                    {s.ragStatus ? (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${ragColor[s.ragStatus] ?? ''}`}
                      >
                        {s.ragStatus}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                    No snapshots yet.
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
