'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  submissions: number;
  submitted: number;
  late: number;
  openVariances: number;
  criticalVariances: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function SioHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [evidence, setEvidence] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/sio-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
    const e = await fetch('/api/v1/sio-compliance/registrations?view=bahrainization-evidence');
    const ep = await e.json();
    if (ep.success) setEvidence(ep.data.activeBahrainis);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seed() {
    setMessage('');
    await fetch('/api/v1/sio-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-branches' }),
    });
    await fetch('/api/v1/sio-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-rates' }),
    });
    setMessage('Branches + rates seeded');
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-15 · Bahrain SIO Compliance</p>
            <h1 className="text-2xl font-semibold">SIO Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={seed}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="Submissions" value={data.submissions} />
            <Tile label="Submitted" value={data.submitted} colour="emerald" />
            <Tile label="Late" value={data.late} colour="amber" />
            <Tile label="Open Variances" value={data.openVariances} colour="amber" />
            <Tile label="Critical Variances" value={data.criticalVariances} colour="rose" />
            <Tile label="Bahrainization Evidence" value={evidence ?? 0} />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            SIO has two branches: <strong>INSURANCE</strong> (Bahraini nationals only, 12% employer
            + 7% employee) and <strong>UNEMPLOYMENT</strong> (all workers, 1% + 1%). Variance
            reconciliation gates the monthly certificate.
          </p>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : colour === 'amber'
          ? 'text-amber-700'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
