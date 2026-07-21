'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';
import {
  ShieldAlert,
  Users,
  Database,
  FileCheck,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

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

const minPeriod = () => {
  return '2010-01';
};

const maxPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function GosiComplianceHomePage() {
  const { isDark } = useTheme();
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
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
    setIsSeeding(true);
    setMessage('');
    try {
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
      await load();
    } finally {
      setIsSeeding(false);
    }
  }

  const features = [
    { label: 'Employee Registrations', slug: 'registrations' },
    { label: 'Wages & Contributions', slug: 'contributions' },
    { label: 'Reconciliation', slug: 'reconciliation' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  const regStats = data?.registrationStats;
  const inputYear = parseInt(inputPeriod.slice(0, 4), 10);
  const isInvalidYear =
    isNaN(inputYear) || inputYear < 2010 || inputYear > new Date().getFullYear();

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Premium Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-2xl p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md relative overflow-hidden border border-indigo-500/20">
          <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> EPIC-13 · KSA GOSI Compliance
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">GOSI Dashboard</h1>
            <p className="text-indigo-100/90 mt-2 max-w-2xl text-sm leading-relaxed">
              Track GOSI submissions, variances, and employee registrations. Generate monthly
              compliance certificates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start lg:self-auto border border-white/10 shrink-0">
            <span className="text-sm font-semibold text-slate-350">Year</span>
            <input
              type="number"
              value={isNaN(inputYear) ? '' : inputYear}
              onChange={(e) => {
                const val = e.target.value;
                setInputPeriod(val + (inputPeriod.slice(4) || '-07'));
              }}
              disabled={isLoading || isSeeding}
              min="2010"
              max={new Date().getFullYear()}
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPeriod(inputPeriod)}
                disabled={isLoading || isSeeding || period === inputPeriod || isInvalidYear}
                className="flex-1 sm:flex-initial rounded-lg bg-white text-slate-950 hover:bg-slate-100 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center justify-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                {isLoading ? 'Applying...' : 'Apply'}
              </button>
              <button
                type="button"
                onClick={seed}
                disabled={isLoading || isSeeding}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm font-bold transition-all border border-slate-700 shadow-sm whitespace-nowrap text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5"
              >
                {isSeeding && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                {isSeeding ? 'Seeding...' : 'Seed Rates'}
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-indigo-200/50 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-950/20 p-4 text-sm text-indigo-700 dark:text-indigo-300 shadow-sm">
            {message}
          </div>
        ) : null}

        {/* KPI Tiles */}
        <section className="grid grid-cols-2 gap-5 md:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse flex flex-col gap-3"
              >
                <div className="h-3 w-20 bg-slate-250 dark:bg-slate-800 rounded"></div>
                <div className="h-8 w-16 bg-slate-250 dark:bg-slate-800 rounded"></div>
              </div>
            ))
          ) : data ? (
            <>
              <Tile label="Submissions" value={data.submissions} icon={Layers} type="info" />
              <Tile label="Submitted" value={data.submitted} icon={ShieldCheck} type="success" />
              <Tile label="Late" value={data.late} icon={AlertCircle} type="warning" />
              <Tile
                label="Open Variances"
                value={data.openVariances}
                icon={AlertCircle}
                type="warning"
              />
              <Tile
                label="Critical Variances"
                value={data.criticalVariances}
                icon={ShieldAlert}
                type="danger"
              />
            </>
          ) : (
            <div className="col-span-full py-10 text-center text-slate-450 dark:text-slate-500">
              No data available for this period.
            </div>
          )}
        </section>

        {data?.criticalVariances ? (
          <div className="rounded-xl border border-rose-200/60 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 p-4 text-sm text-rose-800 dark:text-rose-350 shadow-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>
              {data.criticalVariances} critical GOSI variance(s) open. Monthly certificate will be
              blocked.
            </span>
          </div>
        ) : null}

        {/* --- GOSI Registration Analytics Section --- */}
        {regStats && !isLoading && (
          <section className="grid gap-6 md:grid-cols-2">
            {/* Registration Stats Summary */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-400" />
                GOSI Registrations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  [
                    'Active',
                    regStats.activeRegistrations,
                    'text-emerald-600 dark:text-emerald-400',
                  ],
                  ['Deregistered', regStats.deregistered, 'text-slate-650 dark:text-slate-400'],
                  ['Pending', regStats.pendingRegistrations, 'text-amber-600 dark:text-amber-400'],
                  ['Expired', regStats.expiredRegistrations, 'text-rose-600 dark:text-rose-400'],
                  ['Total History', regStats.totalRegistered, 'text-slate-900 dark:text-white'],
                ].map(([lbl, val, col]) => (
                  <div
                    key={String(lbl)}
                    className="border-b border-slate-100 dark:border-slate-800 pb-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                      {lbl}
                    </p>
                    <p className={`text-2xl font-black mt-1 ${col}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationalities Breakdown */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Nationality Demographics
              </h2>
              <div className="grid grid-cols-3 gap-4 h-[calc(100%-2rem)]">
                {[
                  [
                    'Saudi',
                    regStats.saudiNationals,
                    'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
                  ],
                  [
                    'GCC',
                    regStats.gccNationals,
                    'bg-cyan-50/50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/40',
                  ],
                  [
                    'Expat',
                    regStats.expat,
                    'bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300 border-slate-100 dark:border-slate-700/50',
                  ],
                ].map(([lbl, val, cls]) => (
                  <div
                    key={String(lbl)}
                    className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${cls}`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-2">{lbl}</p>
                    <p className="text-4xl font-black">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchy Breakdown: Company & Department */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                Hierarchical Registration Breakdown
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">
                    By Company
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byCompany).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-655 dark:text-slate-350 font-medium">
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
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">
                    By Establishment
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byEstablishment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-655 dark:text-slate-350 font-medium">
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
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">
                    By Department
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byDepartment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-655 dark:text-slate-350 font-medium">
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
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-slate-400" />
                Registration Activity Trends
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">
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
                  <h3 className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">
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

interface TileProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'danger' | 'warning' | 'success' | 'info';
}

function Tile({ label, value, icon: Icon, type }: TileProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50/40 dark:bg-rose-905/10 border-rose-100 dark:border-rose-900/40',
      icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400',
      text: 'text-rose-700 dark:text-rose-400',
    },
    warning: {
      bg: 'bg-amber-50/40 dark:bg-amber-905/10 border-amber-100 dark:border-amber-900/40',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500',
      text: 'text-amber-700 dark:text-amber-500',
    },
    success: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-905/10 border-emerald-100 dark:border-emerald-900/40',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-750 dark:text-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    info: {
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
      icon: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300',
      text: 'text-slate-900 dark:text-white',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon} shrink-0`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <span className={`text-2xl font-black tracking-tight truncate ${styles.text}`}>{value}</span>
    </div>
  );
}
