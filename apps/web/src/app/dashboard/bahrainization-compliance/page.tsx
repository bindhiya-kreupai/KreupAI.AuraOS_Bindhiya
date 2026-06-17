'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  entitiesLmraGated: number;
  entitiesTenderEligible: number;
  totalMissedHires: number;
  artificialRiskCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function BahrainizationHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/bahrainization-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-18 · Bahrain Bahrainization</p>
            <h1 className="text-2xl font-semibold">Bahrainization Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="In Scope" value={data.entitiesInScope} />
            <Tile label="At Target" value={data.entitiesAtTarget} colour="emerald" />
            <Tile label="LMRA-Gated" value={data.entitiesLmraGated} colour="rose" />
            <Tile label="Tender Eligible" value={data.entitiesTenderEligible} colour="indigo" />
            <Tile label="Missed Hires" value={data.totalMissedHires} colour="rose" />
            <Tile label="Artificial-Risk" value={data.artificialRiskCount} colour="amber" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Bahrainization links the Bahraini-employee ratio to{' '}
            <strong>LMRA work-permit issuance</strong> (RED-band entities are blocked from hiring
            expats) and <strong>government tender eligibility</strong> (default ≥ 50%). SIO
            registration and payroll wage evidence are reconciled per counted Bahraini to detect
            artificial Bahrainization.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/bahrainization-compliance/config"
                className="text-blue-700 hover:underline"
              >
                Establishment Scope (S01–S02)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/bahrainization-compliance/targets"
                className="text-blue-700 hover:underline"
              >
                Sector × Size Targets (S04 / S15)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/bahrainization-compliance/hires"
                className="text-blue-700 hover:underline"
              >
                Bahraini Hires &amp; Artificial-Risk (S05–S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/bahrainization-compliance/snapshots"
                className="text-blue-700 hover:underline"
              >
                Ratio Snapshots &amp; LMRA Gating (S03 / S04 / S10)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/bahrainization-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate &amp; Evidence Pack (S12 / S20)
              </a>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">API</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            <li>POST /api/v1/bahrainization-compliance/config — set establishment scope</li>
            <li>POST /api/v1/bahrainization-compliance/targets — seed sector/size targets</li>
            <li>
              POST /api/v1/bahrainization-compliance/hires{' '}
              {`{action:'record'|'link-evidence'|'detect-artificial-risk'}`}
            </li>
            <li>POST /api/v1/bahrainization-compliance/snapshots — take ratio snapshot</li>
            <li>
              POST /api/v1/bahrainization-compliance/certificate {`{action:'generate'|'sign'}`}
            </li>
            <li>
              POST /api/v1/bahrainization-compliance/lmra-gate{' '}
              {`{action:'hire-expat'|'bid-tender'}`} — gating check for domain modules
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
