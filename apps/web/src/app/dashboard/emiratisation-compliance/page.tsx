'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  totalMissedHires: number;
  totalProjectedFines: number;
  fakeRiskCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EmiratisationHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/emiratisation-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">
              EPIC-16 · UAE Emiratisation Compliance
            </p>
            <h1 className="text-2xl font-semibold">Emiratisation Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Entities In Scope" value={data.entitiesInScope} />
            <Tile label="Entities At Target" value={data.entitiesAtTarget} colour="emerald" />
            <Tile label="Missed Hires" value={data.totalMissedHires} colour="rose" />
            <Tile label="Projected Fines (AED)" value={data.totalProjectedFines} colour="rose" />
            <Tile label="Fake-Risk Hires" value={data.fakeRiskCount} colour="amber" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Emiratisation applies to private-sector entities with{' '}
            <strong>≥ 50 skilled employees</strong>. Default annual target growth is{' '}
            <strong>2% mid-year + 4% year-end</strong>. Missed hires attract a default{' '}
            <strong>AED 7,000 fine per hire</strong>. Hires flagged as fake-risk (no GPSSA / no WPS
            / not skilled) are excluded from compliance counts.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">API</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            <li>POST /api/v1/emiratisation-compliance/config — set establishment scope</li>
            <li>POST /api/v1/emiratisation-compliance/targets — set annual targets</li>
            <li>
              POST /api/v1/emiratisation-compliance/hires{' '}
              {`{action:'record'|'link-evidence'|'detect-fake-risk'}`}
            </li>
            <li>POST /api/v1/emiratisation-compliance/snapshots — take checkpoint snapshot</li>
            <li>
              POST /api/v1/emiratisation-compliance/fines{' '}
              {`{action:'raise-projected'|'mark-incurred'|'resolve'}`}
            </li>
            <li>
              POST /api/v1/emiratisation-compliance/certificate {`{action:'generate'|'sign'}`}
            </li>
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
