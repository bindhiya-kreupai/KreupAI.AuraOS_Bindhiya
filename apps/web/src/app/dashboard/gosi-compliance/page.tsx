'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';

interface Dashboard {
  period: string;
  submissions: number;
  submitted: number;
  late: number;
  openVariances: number;
  criticalVariances: number;
  registrationStats?: {
    totalRegistered: number;
    activeRegistrations: number;
    pendingRegistrations: number;
    expiredRegistrations: number;
    deregistered: number;
    saudiNationals: number;
    gccNationals: number;
    expat: number;
    byCompany: Record<string, number>;
    byDepartment: Record<string, number>;
    byEstablishment: Record<string, number>;
    registrationTrend: Record<string, number>;
    deregistrationTrend: Record<string, number>;
  };
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function GosiComplianceHomePage() {
  const { isDark } = useTheme();
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch(`/api/v1/gosi-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

  async function seed() {
    setMessage('');
    await fetch('/api/v1/gosi-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-branches' }),
    });
    await fetch('/api/v1/gosi-compliance/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-rates' }),
    });
    setMessage('Branches + rates seeded');
    load();
  }

  const features = [
    { label: 'Employee Registrations', slug: 'registrations' },
    { label: 'Wages & Contributions', slug: 'contributions' },
    { label: 'Reconciliation', slug: 'reconciliation' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  const regStats = data?.registrationStats;

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-teal-100 font-semibold text-sm uppercase tracking-wider mb-2">
              EPIC-13 · KSA GOSI Compliance
            </p>
            <h1 className="text-3xl font-bold">GOSI Dashboard</h1>
            <p className="text-teal-50 mt-2 max-w-2xl leading-relaxed">
              Track GOSI submissions, variances, and employee registrations. Generate monthly
              compliance certificates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start md:self-auto border border-white/20">
            <span className="text-sm font-medium text-teal-100">Period</span>
            <input
              value={inputPeriod}
              onChange={(e) => setInputPeriod(e.target.value)}
              placeholder="YYYY-MM"
              className="rounded-lg border-0 bg-white/20 text-white placeholder-teal-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-32 text-center font-mono"
            />
            <button
              type="button"
              onClick={() => setPeriod(inputPeriod)}
              disabled={isLoading || period === inputPeriod}
              className="rounded-lg bg-white text-emerald-700 hover:bg-teal-50 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={seed}
              className="rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 px-3 py-2 text-sm font-bold transition-all border border-emerald-500/30 shadow-sm ml-2"
            >
              Seed Rates
            </button>
          </div>
        </div>

        {message ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
            {message}
          </div>
        ) : null}

        {/* KPI Tiles */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
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
              <Tile label="Submissions" value={data.submissions} />
              <Tile label="Submitted" value={data.submitted} colour="emerald" />
              <Tile label="Late" value={data.late} colour="amber" />
              <Tile label="Open Variances" value={data.openVariances} colour="amber" />
              <Tile label="Critical Variances" value={data.criticalVariances} colour="rose" />
            </>
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-slate-400">
              No data available for this period.
            </div>
          )}
        </section>

        {data?.criticalVariances ? (
          <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-800 dark:text-rose-300 shadow-sm flex items-center gap-2">
            <span className="text-xl">⚠️</span> {data.criticalVariances} critical GOSI variance(s)
            open. Monthly certificate will be blocked.
          </div>
        ) : null}

        {/* --- GOSI Registration Analytics Section --- */}
        {regStats && !isLoading && (
          <section className="grid gap-6 md:grid-cols-2">
            {/* Registration Stats Summary */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                GOSI Registrations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  [
                    'Active',
                    regStats.activeRegistrations,
                    'text-emerald-600 dark:text-emerald-400',
                  ],
                  ['Deregistered', regStats.deregistered, 'text-slate-600 dark:text-slate-400'],
                  ['Pending', regStats.pendingRegistrations, 'text-amber-600 dark:text-amber-400'],
                  ['Expired', regStats.expiredRegistrations, 'text-rose-600 dark:text-rose-400'],
                  [
                    'Total History',
                    regStats.totalRegistered,
                    'text-indigo-600 dark:text-indigo-400',
                  ],
                ].map(([lbl, val, col]) => (
                  <div
                    key={String(lbl)}
                    className="border-b border-slate-100 dark:border-slate-800 pb-2"
                  >
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                      {lbl}
                    </p>
                    <p className={`text-2xl font-black mt-1 ${col}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationalities Breakdown */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Nationality Demographics
              </h2>
              <div className="grid grid-cols-3 gap-4 h-[calc(100%-2rem)]">
                {[
                  [
                    'Saudi Nationals',
                    regStats.saudiNationals,
                    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
                  ],
                  [
                    'GCC Nationals',
                    regStats.gccNationals,
                    'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50',
                  ],
                  [
                    'Expats',
                    regStats.expat,
                    'bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300 border-slate-100 dark:border-slate-700/50',
                  ],
                ].map(([lbl, val, cls]) => (
                  <div
                    key={String(lbl)}
                    className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${cls}`}
                  >
                    <p className="text-xs uppercase tracking-wider font-bold mb-2">{lbl}</p>
                    <p className="text-4xl font-black">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchy Breakdown: Company & Department */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Hierarchical Registration Breakdown
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">By Company</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byCompany).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byCompany).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No companies.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">
                    By Establishment
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byEstablishment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byEstablishment).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No establishments.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">By Department</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byDepartment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byDepartment).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No departments.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trends */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Registration Activity Trends
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">
                    Monthly Registrations
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.registrationTrend)
                      .sort()
                      .reverse()
                      .slice(0, 6)
                      .map(([month, count]) => (
                        <div key={month} className="flex justify-between py-2.5 text-sm">
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {month}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {count}{' '}
                            <span className="text-slate-400 font-normal ml-1">registered</span>
                          </span>
                        </div>
                      ))}
                    {Object.keys(regStats.registrationTrend).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No data.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">
                    Monthly Deregistrations
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.deregistrationTrend)
                      .sort()
                      .reverse()
                      .slice(0, 6)
                      .map(([month, count]) => (
                        <div key={month} className="flex justify-between py-2.5 text-sm">
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {month}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {count}{' '}
                            <span className="text-slate-400 font-normal ml-1">deregistered</span>
                          </span>
                        </div>
                      ))}
                    {Object.keys(regStats.deregistrationTrend).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No data.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Workspaces ModuleGrid */}
        <div className="-mt-4">
          <ModuleGrid
            title="GOSI Workspaces"
            description="Manage employee registrations, handle wages and contributions, and finalize certificates."
            features={features}
            basePath="/dashboard/gosi-compliance"
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
