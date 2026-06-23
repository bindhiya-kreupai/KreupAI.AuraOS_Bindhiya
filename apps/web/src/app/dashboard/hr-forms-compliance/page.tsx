'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  templatesPublished: number;
  submissionsTotal: number;
  submissionsApproved: number;
  submissionsRejected: number;
  submissionsPending: number;
  writebackFailures: number;
  slaBreachCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function HrFormsHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/hr-forms-compliance/dashboard?period=${period}`);
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
            <p className="text-sm uppercase text-slate-500">EPIC-33 · HR Forms &amp; Templates</p>
            <h1 className="text-2xl font-semibold">HR Forms Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Published Tpl" value={data.templatesPublished} colour="emerald" />
            <Tile label="Submissions" value={data.submissionsTotal} />
            <Tile label="Approved" value={data.submissionsApproved} colour="emerald" />
            <Tile label="Rejected" value={data.submissionsRejected} colour="slate" />
            <Tile label="Pending" value={data.submissionsPending} colour="amber" />
            <Tile label="Writeback Failures" value={data.writebackFailures} colour="rose" />
            <Tile label="SLA Breaches" value={data.slaBreachCount} colour="rose" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Template catalogue groups forms by lifecycle band (RECRUITMENT, EMPLOYMENT, PAYROLL,
            LEAVE_ATTENDANCE, BENEFITS, EMPLOYEE_RELATIONS, SEPARATION, COMPLIANCE), with versioned
            schema and optional write-back target. Routing config defines an ordered stage list with
            approver role / id and SLA hours. Submissions transition DRAFT → SUBMITTED → IN_REVIEW →
            APPROVED/REJECTED, with every stage transition recorded as an e-signature (action / hash
            / IP / UA). Monthly certificate refuses to sign while writeback failures or SLA breaches
            remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/hr-forms-compliance/templates"
                className="text-blue-700 hover:underline"
              >
                Template Catalogue (S01 / S02 / S04–S11)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-forms-compliance/routings"
                className="text-blue-700 hover:underline"
              >
                Routing &amp; SLA Config (S03)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-forms-compliance/submissions"
                className="text-blue-700 hover:underline"
              >
                Submissions, Approval &amp; E-Signature (S03 / S12)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/hr-forms-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Compliance Certificate (S14 / S15)
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
          : colour === 'slate'
            ? 'text-slate-600'
            : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
