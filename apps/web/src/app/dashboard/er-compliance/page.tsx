'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';

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
  const { isDark } = useTheme();
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch(`/api/v1/er-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

  const features = [
    { label: 'Grievance Register', slug: 'grievances' },
    { label: 'Disciplinary Actions', slug: 'disciplinary' },
    { label: 'Investigation Register', slug: 'investigations' },
    { label: 'Appeals', slug: 'appeals' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-blue-200 font-semibold text-sm uppercase tracking-wider mb-2">
              EPIC-25 + EPIC-26
            </p>
            <h1 className="text-3xl font-bold">ER Compliance Dashboard</h1>
            <p className="text-blue-100 mt-2 max-w-2xl leading-relaxed">
              Combined Grievance + Disciplinary register. Manage multi-channel intake, SLAs,
              investigations, appeals, and monthly compliance certificates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start md:self-auto border border-white/20">
            <span className="text-sm font-medium text-blue-100">Period</span>
            <input
              value={inputPeriod}
              onChange={(e) => setInputPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="rounded-lg border-0 bg-white/20 text-white placeholder-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-32 text-center font-mono"
            />
            <button
              type="button"
              onClick={() => setPeriod(inputPeriod)}
              disabled={isLoading || period === inputPeriod}
              className="rounded-lg bg-white text-indigo-700 hover:bg-blue-50 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* KPI Tiles */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse flex flex-col gap-3"
              >
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))
          ) : data ? (
            <>
              <Tile label="Opened" value={data.grievancesOpened} />
              <Tile label="Closed" value={data.grievancesClosed} colour="emerald" />
              <Tile label="SLA Breached" value={data.grievancesSlaBreached} colour="rose" />
              <Tile label="HIGH/CRIT Open" value={data.highSeverityOpen} colour="rose" />
              <Tile label="Actions Issued" value={data.disciplinaryActionsIssued} />
              <Tile label="No Hearing" value={data.actionsWithoutHearing} colour="rose" />
              <Tile label="Appeals Open" value={data.appealsOpen} colour="amber" />
              <Tile label="Authority Ref" value={data.labourAuthorityReferrals} colour="amber" />
              <Tile label="Retaliation Open" value={data.retaliationFlags} colour="rose" />
            </>
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-slate-400">
              No data available for this period.
            </div>
          )}
        </section>

        {/* Workspaces ModuleGrid */}
        <div className="-mt-4">
          <ModuleGrid
            title="ER Workspaces"
            description="Manage grievances, investigations, and disciplinary actions."
            features={features}
            basePath="/dashboard/er-compliance"
          />
        </div>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : colour === 'rose'
        ? 'text-rose-600 dark:text-rose-400'
        : colour === 'amber'
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-slate-900 dark:text-white';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`text-4xl font-black mt-2 ${cls}`}>{value}</p>
    </div>
  );
}
