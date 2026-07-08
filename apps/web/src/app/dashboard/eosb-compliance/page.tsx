'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';

interface Dashboard {
  period: string;
  calcsCount: number;
  calcsTotalAmount: number;
  accrualsCount: number;
  accrualsTotalAmount: number;
  openDisputesCount: number;
  unsettledCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EosbHome() {
  const { isDark } = useTheme();
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch(`/api/v1/eosb-compliance/dashboard?period=${period}`);
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
    { label: 'Finalized Calculations', slug: 'calculations' },
    { label: 'Monthly Accruals & GL', slug: 'accruals' },
    { label: 'Dispute Register', slug: 'disputes' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-amber-100 font-semibold text-sm uppercase tracking-wider mb-2">
              EPIC-28
            </p>
            <h1 className="text-3xl font-bold">GCC EOSB Compliance Dashboard</h1>
            <p className="text-amber-50 mt-2 max-w-2xl leading-relaxed">
              Country-specific EOSB math for UAE, KSA, Bahrain, Qatar, Oman, and Kuwait. Manage
              settlements, monthly accruals, disputes, and compliance certificates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start md:self-auto border border-white/20">
            <span className="text-sm font-medium text-amber-100">Period</span>
            <input
              value={inputPeriod}
              onChange={(e) => setInputPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="rounded-lg border-0 bg-white/20 text-white placeholder-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-32 text-center font-mono"
            />
            <button
              type="button"
              onClick={() => setPeriod(inputPeriod)}
              disabled={isLoading || period === inputPeriod}
              className="rounded-lg bg-white text-orange-700 hover:bg-amber-50 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* KPI Tiles */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
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
              <Tile label="Settlements" value={data.calcsCount} />
              <Tile label="Settlement Total" value={data.calcsTotalAmount} />
              <Tile label="Accruals" value={data.accrualsCount} />
              <Tile label="Accrual Liability" value={data.accrualsTotalAmount} />
              <Tile label="Open Disputes" value={data.openDisputesCount} colour="amber" />
              <Tile label="Unsettled" value={data.unsettledCount} colour="rose" />
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
            title="EOSB Workspaces"
            description="Manage End of Service Benefit (EOSB) math, liabilities, and multi-jurisdiction compliance."
            features={features}
            basePath="/dashboard/eosb-compliance"
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
      <p className={`text-3xl font-black mt-2 ${cls}`}>{value}</p>
    </div>
  );
}
