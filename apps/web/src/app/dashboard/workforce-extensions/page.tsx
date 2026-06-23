'use client';

import { useEffect, useState } from 'react';

interface Summary {
  activeContractors: number;
  activeLoans: number;
  activeLoanBalance: number;
  ppeIssuancesLast30: number;
  maintenanceOpenCritical: number;
}

export default function WorkforceExtensionsPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/v1/workforce-extensions/dashboard');
      const p = await r.json();
      if (p.success) setData(p.data);
    })();
  }, []);

  const workspaces = [
    {
      label: 'Contractor Assignments (TA/Holidays/Accommodation/HSE)',
      href: '/api/v1/workforce-extensions/contractors',
      stories: 'EPIC-19-S15 · EPIC-21-S11 · EPIC-23-S13 · EPIC-24-S13',
    },
    {
      label: 'Employee Loans & Salary Advances (with amortization)',
      href: '/api/v1/workforce-extensions/loans',
      stories: 'EPIC-22-S09',
    },
    {
      label: 'Uniform / PPE / Tools Issuance Register',
      href: '/api/v1/workforce-extensions/issuance',
      stories: 'EPIC-22-S11',
    },
    {
      label: 'Accommodation Transport Routes',
      href: '/api/v1/workforce-extensions/transport-routes',
      stories: 'EPIC-23-S08',
    },
    {
      label: 'Accommodation On-Site Clinics',
      href: '/api/v1/workforce-extensions/clinics',
      stories: 'EPIC-23-S09',
    },
    {
      label: 'Accommodation Maintenance Tickets (SLA-tracked)',
      href: '/api/v1/workforce-extensions/maintenance',
      stories: 'EPIC-23-S11',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            Themes E + F + I · Workforce Extensions
          </p>
          <h1 className="text-2xl font-semibold">Workforce Extensions</h1>
          <p className="mt-1 text-sm text-slate-600">
            Contractor flow tagging, accommodation ops (transport / clinic / maintenance), and the
            missing benefits sub-categories (loans + PPE register). Plus education / relocation /
            wellness covered by extending the existing BenefitCatalogue default seeds.
          </p>
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Active contractors" value={data.activeContractors} />
            <Tile label="Active loans" value={data.activeLoans} />
            <Tile label="Active loan balance" value={Math.round(data.activeLoanBalance)} />
            <Tile label="PPE / uniform issuances (30d)" value={data.ppeIssuancesLast30} />
            <Tile
              label="Open HIGH/CRITICAL maint."
              value={data.maintenanceOpenCritical}
              colour={data.maintenanceOpenCritical > 0 ? 'rose' : undefined}
            />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {workspaces.map((w) => (
              <li
                key={w.href}
                className="block rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <p className="font-semibold">{w.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{w.stories}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{w.href}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: 'rose' }) {
  const cls = colour === 'rose' ? 'text-rose-700' : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
