'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  activeEnrollments: number;
  mandatoryCoverGapCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  openExceptionsCount: number;
  vendorsWithoutDpa: number;
  totalAccruedLiability: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function BenefitsHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/benefits-compliance/dashboard?period=${period}`);
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
              EPIC-22 · Employee Benefits Compliance
            </p>
            <h1 className="text-2xl font-semibold">Benefits Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-7">
            <Tile label="Active Enrollments" value={data.activeEnrollments} />
            <Tile label="Mandatory Gaps" value={data.mandatoryCoverGapCount} colour="rose" />
            <Tile label="Expiring ≤60d" value={data.expiringSoonCount} colour="amber" />
            <Tile label="Expired" value={data.expiredCount} colour="rose" />
            <Tile label="Open Exceptions" value={data.openExceptionsCount} colour="amber" />
            <Tile label="Vendors w/o DPA" value={data.vendorsWithoutDpa} colour="rose" />
            <Tile label="Accrued Liability" value={data.totalAccruedLiability} />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Configurable benefit catalogue (MEDICAL, LIFE, AIR_TICKET, HOUSING, TRANSPORT, MOBILE,
            MEAL, EDUCATION, LOAN, RELOCATION, UNIFORM_PPE, WELLNESS, ACCOMMODATION) with
            isMandatory, country eligibility, vendor requirement, and valuation basis (FIXED /
            ACCRUED / ACTUAL). Coverage records the employee's enrolment with expiry tracking,
            monthly accrual for ACCRUED-basis benefits (e.g. air ticket), and exception register.
            Monthly certificate refuses to sign while mandatory gaps, expired coverages, or
            vendors-without-DPA remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/benefits-compliance/catalogue"
                className="text-blue-700 hover:underline"
              >
                Benefit Catalogue (S01 / S02)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/benefits-compliance/enrollments"
                className="text-blue-700 hover:underline"
              >
                Coverage Register, Renewal &amp; Accrual (S03–S13 / S15 / S18)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/benefits-compliance/vendors"
                className="text-blue-700 hover:underline"
              >
                Vendor Management &amp; DPA (S14)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/benefits-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S17 / S18)
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
