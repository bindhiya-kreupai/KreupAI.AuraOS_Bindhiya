'use client';

import { useEffect, useState } from 'react';

interface ProgramSummary {
  program: string;
  reservedRequisitionSeats: number;
  reservedJobSeats: number;
  retention: {
    hires: number;
    exits: number;
    earlyAttritionCount: number;
    earlyAttritionPct: number;
    netGrowth: number;
  };
  development: {
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
    total: number;
    completionPct: number;
  };
  openCriticalArtificialRisk: number;
}

interface Dashboard {
  programs: ProgramSummary[];
  saudiReservedProfessionCount: number;
  coverageWindow: { from: string; to: string; monthsBack: number };
}

const bandColour = (n: number) =>
  n > 5 ? 'text-rose-700' : n > 0 ? 'text-amber-700' : 'text-emerald-700';

export default function NationalisationOverlayPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  async function load() {
    const r = await fetch('/api/v1/nationalisation-overlay/dashboard');
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, []);

  const sections = [
    {
      href: '/dashboard/nationalisation-overlay/requisition-tags',
      label: 'Requisition Tags · TA Pipeline Overlay',
      stories: 'EPIC-16-S07 · EPIC-17-S11 · EPIC-18-S07',
    },
    {
      href: '/dashboard/nationalisation-overlay/job-tags',
      label: 'Job / Position Tags · Eligible-Role Tagging',
      stories: 'EPIC-16-S08 · EPIC-18-S08',
    },
    {
      href: '/dashboard/nationalisation-overlay/retention',
      label: 'Retention Ledger · Early-Attrition Tracker',
      stories: 'EPIC-16-S12 · EPIC-17-S12 · EPIC-18-S14',
    },
    {
      href: '/dashboard/nationalisation-overlay/development-plans',
      label: 'L&D / Development Plans',
      stories: 'EPIC-16-S13 · EPIC-18-S15',
    },
    {
      href: '/dashboard/nationalisation-overlay/artificial-risk',
      label: 'Fake / Artificial Nationalisation Detection',
      stories: 'EPIC-16-S06 · EPIC-17-S13',
    },
    {
      href: '/dashboard/nationalisation-overlay/saudi-professions',
      label: 'Saudi Profession-Localisation Codes',
      stories: 'EPIC-17-S09',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">Theme B · Nationalisation Overlays</p>
          <h1 className="text-2xl font-semibold">Nationalisation Overlay Workspaces</h1>
          <p className="mt-1 text-sm text-slate-600">
            Cross-program registry behind Emiratisation, Nitaqat, Bahrainization (and future
            Omanisation / Qatarisation): requisition tags, position tags, retention ledger,
            development plans, artificial-risk detection, and the Saudi profession-localisation code
            table.
          </p>
        </header>

        {data ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Per-program snapshot</h2>
            <p className="mt-1 text-xs text-slate-500">
              Coverage window: {new Date(data.coverageWindow.from).toLocaleDateString()} —{' '}
              {new Date(data.coverageWindow.to).toLocaleDateString()} (
              {data.coverageWindow.monthsBack} months back). Saudi reserved-for-Saudis profession
              codes on file: {data.saudiReservedProfessionCount}.
            </p>
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Program</th>
                  <th>Reserved req seats</th>
                  <th>Reserved job seats</th>
                  <th>Hires</th>
                  <th>Exits</th>
                  <th>Early attrition</th>
                  <th>L&amp;D completion</th>
                  <th>Open HIGH/CRITICAL risk</th>
                </tr>
              </thead>
              <tbody>
                {data.programs.map((p) => (
                  <tr key={p.program} className="border-t border-slate-100">
                    <td className="py-2 font-semibold text-xs">{p.program}</td>
                    <td className="text-xs">{p.reservedRequisitionSeats}</td>
                    <td className="text-xs">{p.reservedJobSeats}</td>
                    <td className="text-xs">{p.retention.hires}</td>
                    <td className="text-xs">{p.retention.exits}</td>
                    <td className={`text-xs ${bandColour(p.retention.earlyAttritionPct)}`}>
                      {p.retention.earlyAttritionCount} ({p.retention.earlyAttritionPct}%)
                    </td>
                    <td className="text-xs">{p.development.completionPct}%</td>
                    <td className={`text-xs ${bandColour(p.openCriticalArtificialRisk)}`}>
                      {p.openCriticalArtificialRisk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {sections.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:border-slate-900 hover:bg-slate-50"
                >
                  <p className="font-semibold">{s.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.stories}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
