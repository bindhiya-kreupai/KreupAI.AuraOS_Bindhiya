'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  casesOpened: number;
  casesClosed: number;
  casesAbsconding: number;
  graceExpiringCount: number;
  overduePoActions: number;
  missingEvidenceCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function VisaExitHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/visa-exit-compliance/dashboard?period=${period}`);
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
              EPIC-29 · Visa / Work Permit / Immigration Exit
            </p>
            <h1 className="text-2xl font-semibold">Immigration Exit Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <Tile label="Opened" value={data.casesOpened} />
            <Tile label="Closed" value={data.casesClosed} colour="emerald" />
            <Tile label="Absconding" value={data.casesAbsconding} colour="rose" />
            <Tile label="Grace ≤7d" value={data.graceExpiringCount} colour="amber" />
            <Tile label="Overdue PRO" value={data.overduePoActions} colour="rose" />
            <Tile label="Missing Evidence" value={data.missingEvidenceCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Orchestrates exit cases (RESIGNATION / TERMINATION / END_OF_CONTRACT / RETIREMENT /
            TRANSFER / ABSCONDING / DEATH) through cancel-work-permit, cancel-residence-visa,
            dependent cascade, repatriation ticket, SI closure, and exit stamping, with PRO action
            register, grace-period management (default UAE 30d / KSA 60d / BH 30d / QA 30d / OM 30d
            / KW 60d), authority-portal evidence capture, and a monthly certificate that refuses to
            sign while overdue PRO actions, missing evidence, or ≤7-day grace expiries exist.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/visa-exit-compliance/cases"
                className="text-blue-700 hover:underline"
              >
                Exit Case Orchestration (S03 / S04 / S08 / S09)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/visa-exit-compliance/pro-actions"
                className="text-blue-700 hover:underline"
              >
                PRO Action Register (S13)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/visa-exit-compliance/grace"
                className="text-blue-700 hover:underline"
              >
                Grace Period Register (S05 / S06)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/visa-exit-compliance/evidence"
                className="text-blue-700 hover:underline"
              >
                Authority Portal Evidence (S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/visa-exit-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S18)
              </a>
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
