'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  counts: {
    checklist: number;
    checklistByResult: Record<string, number>;
    checklistOverdue: number;
    overhireTotal: number;
    departmentsCovered: number;
    vacanciesOpen: number;
    vacanciesAged: number;
    vacanciesUnapproved: number;
    certificates: number;
    certificatesSigned: number;
  };
  categories: string[];
}

export default function OrgComplianceHome() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/org-compliance/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-09 · Organization & Position</p>
          <h1 className="text-2xl font-semibold">Organization & Position Compliance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Audit checklist, position control / headcount budgeting, vacancy register and monthly
            certificate gated on overhire, ageing vacancies, unapproved vacancies and HIGH/CRITICAL
            checklist failures.
          </p>
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Period" value={data.period} />
            <Tile label="Checklist" value={data.counts.checklist} />
            <Tile label="Pass" value={data.counts.checklistByResult.PASS ?? 0} colour="emerald" />
            <Tile label="Fail" value={data.counts.checklistByResult.FAIL ?? 0} colour="rose" />
            <Tile label="Overdue" value={data.counts.checklistOverdue} colour="rose" />
            <Tile label="Overhire" value={data.counts.overhireTotal} colour="rose" />
            <Tile label="Departments" value={data.counts.departmentsCovered} />
            <Tile label="Vacancies Open" value={data.counts.vacanciesOpen} colour="amber" />
            <Tile label="Aged >90d" value={data.counts.vacanciesAged} colour="rose" />
            <Tile label="Unapproved Vac." value={data.counts.vacanciesUnapproved} colour="rose" />
            <Tile label="Certificates" value={data.counts.certificates} />
            <Tile label="Signed" value={data.counts.certificatesSigned} colour="emerald" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/org-compliance/audit-checklist"
                className="text-blue-700 hover:underline"
              >
                Org Audit Checklist (S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/org-compliance/position-control"
                className="text-blue-700 hover:underline"
              >
                Position Control & Headcount (S08/S16)
              </a>
            </li>
            <li>
              <a href="/dashboard/org-compliance/vacancy" className="text-blue-700 hover:underline">
                Vacancy Register (S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/org-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Org Compliance Certificate
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
