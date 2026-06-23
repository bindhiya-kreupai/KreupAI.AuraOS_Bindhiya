'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  submissions: number;
  acknowledged: number;
  reconciled: number;
  delayFlags: number;
  criticalDelays: number;
  openExceptions: number;
  openPenalties: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function WpsComplianceHomePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/wps-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seedSchemes() {
    setMessage('');
    await fetch('/api/v1/wps-compliance/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed' }),
    });
    await fetch('/api/v1/wps-compliance/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed' }),
    });
    setMessage('Schemes + documents seeded');
    load();
  }

  const tools = [
    { href: '/dashboard/wps-compliance/submissions', label: 'WPS Submissions (S02–S07)' },
    { href: '/dashboard/wps-compliance/exceptions', label: 'Exceptions + Delay Flags (S08–S09)' },
    { href: '/dashboard/wps-compliance/penalties', label: 'Penalties Register (S10)' },
    { href: '/dashboard/wps-compliance/certificate', label: 'Monthly Certificate + Library (S14)' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-11 · Wage Protection System</p>
            <h1 className="text-2xl font-semibold">WPS Compliance Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={seedSchemes}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed
            </button>
          </div>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ['Submissions', data.submissions, ''],
              ['Acknowledged', data.acknowledged, 'emerald'],
              ['Reconciled', data.reconciled, 'emerald'],
              ['Delay Flags', data.delayFlags, 'amber'],
              ['Critical Delays', data.criticalDelays, 'rose'],
              ['Open Exceptions', data.openExceptions, 'amber'],
              ['Open Penalties', data.openPenalties, 'rose'],
            ].map(([label, value, c]) => (
              <Tile
                key={String(label)}
                label={String(label)}
                value={Number(value)}
                colour={String(c)}
              />
            ))}
          </section>
        ) : null}
        {data?.criticalDelays ? (
          <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
            ⚠️ {data.criticalDelays} critical salary delay(s). Monthly certificate will be blocked.
          </p>
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
