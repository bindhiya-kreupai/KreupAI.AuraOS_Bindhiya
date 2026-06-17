'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  counts: {
    matrixItems: number;
    matrixByCountry: Record<string, number>;
    employeesEvaluated: number;
    averageScore: number;
    greenEmployees: number;
    amberEmployees: number;
    redEmployees: number;
    mandatoryMissingTotal: number;
    expiredDocsTotal: number;
    checklist: number;
    checklistOverdue: number;
    risksOpen: number;
    certificates: number;
    certificatesSigned: number;
  };
}

export default function RecordsCompliancePage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/records-compliance/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-08 · Employee Records</p>
          <h1 className="text-2xl font-semibold">Employee Records Compliance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Mandatory document matrix, per-employee completeness score, audit checklist, risk
            register and monthly compliance certificate gated on RED employees, expired mandatory
            docs and HIGH/CRITICAL audit findings.
          </p>
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Tile label="Period" value={data.period} />
            <Tile label="Matrix Items" value={data.counts.matrixItems} />
            <Tile label="Employees Eval" value={data.counts.employeesEvaluated} />
            <Tile label="Avg Score" value={data.counts.averageScore} />
            <Tile label="GREEN" value={data.counts.greenEmployees} colour="emerald" />
            <Tile label="AMBER" value={data.counts.amberEmployees} colour="amber" />
            <Tile label="RED" value={data.counts.redEmployees} colour="rose" />
            <Tile label="Missing Docs" value={data.counts.mandatoryMissingTotal} colour="rose" />
            <Tile label="Expired Docs" value={data.counts.expiredDocsTotal} colour="rose" />
            <Tile label="Checklist Overdue" value={data.counts.checklistOverdue} colour="rose" />
            <Tile label="Risks Open" value={data.counts.risksOpen} colour="amber" />
            <Tile label="Signed Certs" value={data.counts.certificatesSigned} colour="emerald" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/records-compliance/document-matrix"
                className="text-blue-700 hover:underline"
              >
                Mandatory Document Matrix (S04)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/records-compliance/completeness"
                className="text-blue-700 hover:underline"
              >
                Employee Completeness Score (S12)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/records-compliance/audit-checklist"
                className="text-blue-700 hover:underline"
              >
                Records Audit Checklist (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/records-compliance/risk-register"
                className="text-blue-700 hover:underline"
              >
                Records Risk Register (S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/records-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Records Compliance Certificate
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({
  label,
  value,
  colour,
}: {
  label: string;
  value: string | number;
  colour?: string;
}) {
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
