'use client';

import { useEffect, useState } from 'react';
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
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch(`/api/v1/gosi-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
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

  const tools = [
    { href: '/dashboard/gosi-compliance/registrations', label: 'Employee Registrations (S05–S06)' },
    { href: '/dashboard/gosi-compliance/contributions', label: 'Wages + Contributions (S07–S12)' },
    {
      href: '/dashboard/gosi-compliance/reconciliation',
      label: 'Reconciliation + Variance (S13/S21)',
    },
    { href: '/dashboard/gosi-compliance/certificate', label: 'Monthly Certificate (S19–S20)' },
  ];

  const regStats = data?.registrationStats;

  return (
    <main 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-13 · KSA GOSI Compliance</p>
            <h1 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">GOSI Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1.5 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={seed}
              className="rounded-md bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-650 px-3 py-2 text-sm text-white transition-colors"
            >
              Seed Branches + Rates
            </button>
          </div>
        </header>
        {message ? <p className="text-sm text-amber-600 dark:text-amber-400">{message}</p> : null}

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              ['Submissions', data.submissions, ''],
              ['Submitted', data.submitted, 'emerald'],
              ['Late', data.late, 'amber'],
              ['Open Variances', data.openVariances, 'amber'],
              ['Critical Variances', data.criticalVariances, 'rose'],
            ].map(([label, value, c]) => (
              <Tile
                key={String(label)}
                label={String(label)}
                value={Number(value)}
                colour={String(c)}
              />
            ))}
          </section>
        ) : null}

        {data?.criticalVariances ? (
          <p className="rounded-md border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-3 text-sm text-rose-800 dark:text-rose-400">
            ⚠️ {data.criticalVariances} critical GOSI variance(s) open. Monthly certificate will be
            blocked.
          </p>
        ) : null}

        {/* --- GOSI Registration Analytics Section --- */}
        {regStats && (
          <section className="grid gap-6 md:grid-cols-2">
            {/* Registration Stats Summary */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">GOSI Registrations</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ['Active', regStats.activeRegistrations, 'text-emerald-600 dark:text-emerald-400'],
                  ['Deregistered', regStats.deregistered, 'text-slate-600 dark:text-slate-400'],
                  ['Pending', regStats.pendingRegistrations, 'text-amber-600 dark:text-amber-400'],
                  ['Expired', regStats.expiredRegistrations, 'text-rose-600 dark:text-rose-400'],
                  ['Total History', regStats.totalRegistered, 'text-indigo-600 dark:text-indigo-400'],
                ].map(([lbl, val, col]) => (
                  <div key={String(lbl)} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lbl}</p>
                    <p className={`text-2xl font-bold ${col}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nationalities Breakdown */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Nationality Demographics</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['Saudi Nationals', regStats.saudiNationals, 'bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400'],
                  ['GCC Nationals', regStats.gccNationals, 'bg-cyan-100/50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-400'],
                  ['Expats', regStats.expat, 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300'],
                ].map(([lbl, val, cls]) => (
                  <div key={String(lbl)} className={`p-3 rounded-lg text-center ${cls}`}>
                    <p className="text-xs font-semibold">{lbl}</p>
                    <p className="text-3xl font-bold mt-1">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchy Breakdown: Company & Department */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Hierarchical Registration Breakdown</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">By Company</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byCompany).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-350">{name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byCompany).length === 0 && <p className="text-xs text-slate-400 py-2">No companies.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">By Establishment</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byEstablishment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-350">{name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byEstablishment).length === 0 && <p className="text-xs text-slate-400 py-2">No establishments.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">By Department</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.byDepartment).map(([name, count]) => (
                      <div key={name} className="flex justify-between py-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-350">{name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                    {Object.keys(regStats.byDepartment).length === 0 && <p className="text-xs text-slate-400 py-2">No departments.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trends */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Registration Activity Trends</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Monthly Registrations</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.registrationTrend).sort().reverse().slice(0, 6).map(([month, count]) => (
                      <div key={month} className="flex justify-between py-2 text-sm">
                        <span className="font-mono text-slate-600 dark:text-slate-350">{month}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count} registered</span>
                      </div>
                    ))}
                    {Object.keys(regStats.registrationTrend).length === 0 && <p className="text-xs text-slate-400 py-2">No data.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Monthly Deregistrations</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(regStats.deregistrationTrend).sort().reverse().slice(0, 6).map(([month, count]) => (
                      <div key={month} className="flex justify-between py-2 text-sm">
                        <span className="font-mono text-slate-600 dark:text-slate-350">{month}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count} deregistered</span>
                      </div>
                    ))}
                    {Object.keys(regStats.deregistrationTrend).length === 0 && <p className="text-xs text-slate-400 py-2">No data.</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Workspaces</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <li key={t.href}>
                <a
                  href={t.href}
                  className="block rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all font-medium"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700 dark:text-emerald-400'
      : colour === 'rose'
        ? 'text-rose-700 dark:text-rose-400'
        : colour === 'amber'
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-slate-900 dark:text-white';
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <p className="text-xs uppercase text-slate-500 dark:text-slate-450">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${cls}`}>{value}</p>
    </div>
  );
}
