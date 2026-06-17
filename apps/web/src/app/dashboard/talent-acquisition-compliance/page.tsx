'use client';

import { useEffect, useState } from 'react';

interface StageRow {
  stage: string;
  total: number;
  pass: number;
  fail: number;
  obs: number;
  unchecked: number;
}

interface Dashboard {
  counts: {
    checklist: number;
    checklistOverdue: number;
    checklistFailingHighOrCritical: number;
    risksOpen: number;
    risksByBand: Record<string, number>;
    certificates: number;
    certificatesSigned: number;
  };
  stageBreakdown: StageRow[];
}

export default function TaCompliancePage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/talent-acquisition-compliance/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-03 / 04 / 05 · Talent Acquisition</p>
          <h1 className="text-2xl font-semibold">Talent Acquisition Compliance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Workforce-planning + recruitment + offer & pre-employment overlay. Stage-aware audit
            checklist (24 categories), risk register, monthly certificate gated on HIGH/CRITICAL
            failures, overdue items and critical risks.
          </p>
        </header>

        {data ? (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Tile label="Checklist" value={data.counts.checklist} />
              <Tile
                label="HIGH/CRIT Failing"
                value={data.counts.checklistFailingHighOrCritical}
                colour="rose"
              />
              <Tile label="Overdue" value={data.counts.checklistOverdue} colour="rose" />
              <Tile label="Risks Open" value={data.counts.risksOpen} colour="amber" />
              <Tile
                label="Risks HIGH/CRIT"
                value={
                  (data.counts.risksByBand.HIGH ?? 0) + (data.counts.risksByBand.CRITICAL ?? 0)
                }
                colour="rose"
              />
              <Tile label="Certificates" value={data.counts.certificates} />
              <Tile label="Signed" value={data.counts.certificatesSigned} colour="emerald" />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold">Stage Breakdown</h2>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Stage</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2 text-emerald-700">Pass</th>
                    <th className="px-3 py-2 text-rose-700">Fail</th>
                    <th className="px-3 py-2 text-amber-700">Observation</th>
                    <th className="px-3 py-2">Unchecked</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stageBreakdown.map((s) => (
                    <tr key={s.stage} className="border-b border-slate-100">
                      <td className="px-3 py-2">{s.stage}</td>
                      <td className="px-3 py-2">{s.total}</td>
                      <td className="px-3 py-2 text-emerald-700">{s.pass}</td>
                      <td className="px-3 py-2 text-rose-700">{s.fail}</td>
                      <td className="px-3 py-2 text-amber-700">{s.obs}</td>
                      <td className="px-3 py-2 text-slate-500">{s.unchecked}</td>
                    </tr>
                  ))}
                  {data.stageBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                        No checklist items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/talent-acquisition-compliance/audit-checklist"
                className="text-blue-700 hover:underline"
              >
                Lifecycle Audit Checklist (24 categories)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/talent-acquisition-compliance/risk-register"
                className="text-blue-700 hover:underline"
              >
                TA Risk Register
              </a>
            </li>
            <li>
              <a
                href="/dashboard/talent-acquisition-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly TA Compliance Certificate
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
      : colour === 'amber'
        ? 'text-amber-700'
        : colour === 'rose'
          ? 'text-rose-700'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
