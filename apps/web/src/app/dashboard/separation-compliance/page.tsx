'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  casesOpened: number;
  casesClosed: number;
  casesByType: Record<string, number>;
  averageNoticeServed: number;
  abandonmentCases: number;
  clearancesPending: number;
  handoverPending: number;
  exitInterviewMissing: number;
  itAccessOpenAfterClose: number;
  deathInServiceCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function SepHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/separation-compliance/dashboard?period=${period}`);
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
              EPIC-27 · Termination &amp; Separation
            </p>
            <h1 className="text-2xl font-semibold">Separation Compliance Dashboard</h1>
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
            <Tile label="Abandonment" value={data.abandonmentCases} colour="rose" />
            <Tile label="Clearance Pending" value={data.clearancesPending} colour="amber" />
            <Tile label="Handover Pending" value={data.handoverPending} colour="amber" />
            <Tile label="Exit Int Missing" value={data.exitInterviewMissing} colour="rose" />
            <Tile label="IT Open After Close" value={data.itAccessOpenAfterClose} colour="rose" />
            <Tile label="Death in Service" value={data.deathInServiceCount} colour="rose" />
            <Tile label="Avg Notice Days" value={data.averageNoticeServed} />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Case orchestrates the full separation lifecycle across types (RESIGNATION /
            EMPLOYER_TERMINATION / TERMINATION_FOR_CAUSE / MUTUAL_SEPARATION / REDUNDANCY /
            END_OF_CONTRACT / PROBATION_END / ABANDONMENT / DEATH / RETIREMENT) with status DRAFT →
            SUBMITTED → APPROVED → CLOSED. Opening a case auto-seeds clearance checklists for HR /
            IT / FINANCE / SECURITY / LINE_MANAGER / ADMIN with default items. Country notice-period
            defaults: UAE / BH / QA / OM / KW 30 days, KSA 60. Pure isNoticeCompliant function
            checks served vs required (allowing buyout). Close refuses while any clearance is
            uncompleted. Monthly certificate refuses to sign while IT access stays open after close,
            abandonment cases are unresolved, exit interviews are missing, or clearances are
            pending.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/separation-compliance/cases"
                className="text-blue-700 hover:underline"
              >
                Case Orchestration (S01–S08 / S10–S13 / S15)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/separation-compliance/clearance"
                className="text-blue-700 hover:underline"
              >
                Exit Clearance Checklist (S09)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/separation-compliance/handover"
                className="text-blue-700 hover:underline"
              >
                Handover &amp; Exit Interview (S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/separation-compliance/notice-buyout"
                className="text-blue-700 hover:underline"
              >
                Notice / Garden Leave / Buyout Tracking (S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/separation-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Compliance Certificate (S18 / S19)
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
