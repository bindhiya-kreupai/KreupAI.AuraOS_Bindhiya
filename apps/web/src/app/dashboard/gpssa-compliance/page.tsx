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

export default function GpssaHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [evidence, setEvidence] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/gpssa-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
    const e = await fetch('/api/v1/gpssa-compliance/registrations?view=emiratisation-evidence');
    const ep = await e.json();
    if (ep.success) setEvidence(ep.data.activeUaeNationals);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seed() {
    setMessage('');
    await fetch('/api/v1/gpssa-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-rates' }),
    });
    setMessage('Rates seeded');
    load();
  }

  const tools = [
    {
      href: '/dashboard/gpssa-compliance/registrations',
      label: 'Registrations + Transfers (S04, S09)',
    },
    { href: '/dashboard/gpssa-compliance/contributions', label: 'Wages + Contributions (S05–S08)' },
    { href: '/dashboard/gpssa-compliance/reconciliation', label: 'Reconciliation (S12)' },
    { href: '/dashboard/gpssa-compliance/certificate', label: 'Monthly Certificate (S19–S20)' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-14 · UAE GPSSA Compliance</p>
            <h1 className="text-2xl font-semibold">GPSSA Dashboard</h1>
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
              Seed Rates
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
            <Tile label="Emiratisation Evidence" value={evidence ?? 0} />
          </section>
        ) : null}

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
