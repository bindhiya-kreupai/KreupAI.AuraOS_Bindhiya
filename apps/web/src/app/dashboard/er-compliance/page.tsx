'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  grievancesOpened: number;
  grievancesClosed: number;
  grievancesSlaBreached: number;
  highSeverityOpen: number;
  disciplinaryActionsIssued: number;
  actionsWithoutHearing: number;
  appealsOpen: number;
  labourAuthorityReferrals: number;
  retaliationFlags: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ErHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/er-compliance/dashboard?period=${period}`);
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
              EPIC-25 + EPIC-26 · Employee Relations
            </p>
            <h1 className="text-2xl font-semibold">ER Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Opened" value={data.grievancesOpened} />
            <Tile label="Closed" value={data.grievancesClosed} colour="emerald" />
            <Tile label="SLA Breached" value={data.grievancesSlaBreached} colour="rose" />
            <Tile label="HIGH/CRIT Open" value={data.highSeverityOpen} colour="rose" />
            <Tile label="Actions Issued" value={data.disciplinaryActionsIssued} />
            <Tile label="No Hearing" value={data.actionsWithoutHearing} colour="rose" />
            <Tile label="Appeals Open" value={data.appealsOpen} colour="amber" />
            <Tile label="Authority Ref" value={data.labourAuthorityReferrals} colour="amber" />
            <Tile label="Retaliation Open" value={data.retaliationFlags} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Combined Grievance + Disciplinary register. Grievance handles multi-channel intake
            (EMAIL / PORTAL / HOTLINE / IN_PERSON / ANONYMOUS / WHISTLEBLOWER) with 30-day default
            SLA and labour-authority referral tracking. Disciplinary chain runs VERBAL_WARNING →
            WRITTEN_WARNING → FINAL_WARNING → SUSPENSION / DEMOTION / SALARY_DEDUCTION /
            TERMINATION, gated by hearingHeld + responseRecorded before issuance. Salary deduction
            enforces country caps (UAE/BH/OM 25%, KSA/QA/KW 50%). Investigation register formalises
            interviews + evidence + findings. Appeals register supports OPEN → DECIDED with outcomes
            UPHELD / OVERTURNED / PARTIAL. Monthly certificate refuses to sign while SLA-breached
            grievances, HIGH/CRITICAL open grievances, disciplinary actions issued without hearings,
            or open retaliation cases remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/er-compliance/grievances"
                className="text-blue-700 hover:underline"
              >
                Grievance Register (EPIC-25 S02 / S10 / S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/er-compliance/disciplinary"
                className="text-blue-700 hover:underline"
              >
                Disciplinary Action Register (EPIC-26 S02 / S05 / S06)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/er-compliance/investigations"
                className="text-blue-700 hover:underline"
              >
                Investigation Register (EPIC-25 S05 / EPIC-26 S03)
              </a>
            </li>
            <li>
              <a href="/dashboard/er-compliance/appeals" className="text-blue-700 hover:underline">
                Appeals (EPIC-25 S10 / EPIC-26 S08)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/er-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (EPIC-25 S14 / EPIC-26 S13)
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
