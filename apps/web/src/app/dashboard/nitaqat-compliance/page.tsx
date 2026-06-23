'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  entitiesInScope: number;
  platinum: number;
  green: number;
  yellow: number;
  red: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function NitaqatHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/nitaqat-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  async function seedDefaults() {
    await fetch('/api/v1/nitaqat-compliance/thresholds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-17 · KSA Nitaqat / Saudization</p>
            <h1 className="text-2xl font-semibold">Nitaqat Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={seedDefaults}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Seed Default Thresholds
            </button>
          </div>
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Entities In Scope" value={data.entitiesInScope} />
            <Tile label="PLATINUM" value={data.platinum} colour="indigo" />
            <Tile label="GREEN" value={data.green} colour="emerald" />
            <Tile label="YELLOW" value={data.yellow} colour="amber" />
            <Tile label="RED" value={data.red} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/nitaqat-compliance/config"
                className="text-blue-700 hover:underline"
              >
                Establishment Scope &amp; Headcount (S01 / S02)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/nitaqat-compliance/thresholds"
                className="text-blue-700 hover:underline"
              >
                Band Thresholds (S03 / S04)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/nitaqat-compliance/hires"
                className="text-blue-700 hover:underline"
              >
                Saudi Hires &amp; Evidence (S07 / S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/nitaqat-compliance/snapshots"
                className="text-blue-700 hover:underline"
              >
                Band Snapshots (S05 / S09 / S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/nitaqat-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S20 / S21)
              </a>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Band Privileges</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Hire Expats</th>
                <th className="px-3 py-2">Renew Visas</th>
                <th className="px-3 py-2">Transfer Workers</th>
                <th className="px-3 py-2">Expedited Qiwa</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PLATINUM', true, true, true, true],
                ['GREEN', true, true, true, false],
                ['YELLOW', false, true, false, false],
                ['RED', false, false, false, false],
              ].map(([band, ...flags]) => (
                <tr key={String(band)} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{String(band)}</td>
                  {flags.map((f, i) => (
                    <td key={i} className="px-3 py-2 text-sm">
                      {f ? '✓' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-600">
            POST /api/v1/nitaqat-compliance/privilege-check with{' '}
            <code>{`{ legalEntityId, privilege: 'hireExpat' | 'renewVisa' | 'transferWorker' }`}</code>{' '}
            to gate domain transactions.
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
          : colour === 'indigo'
            ? 'text-indigo-700'
            : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
