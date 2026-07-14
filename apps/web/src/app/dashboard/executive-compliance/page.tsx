'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Target,
  Calendar,
  ArrowRight,
  ExternalLink,
  FolderLock,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface Domain {
  domain: string;
  label: string;
  score: number;
  ragStatus: string;
  blockingIssues: number;
  certificateStatus: string | null;
  certificateGatingReason: string | null;
}

interface Dashboard {
  period: string;
  domainCount: number;
  greenDomains: number;
  amberDomains: number;
  redDomains: number;
  blockingIssuesTotal: number;
  averageScore: number;
  criticalRisksOpen: number;
  correctiveActionsOpen: number;
  correctiveActionsOverdue: number;
  reviewItemsOverdue: number;
  domainBreakdown: Domain[];
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const ragColor: Record<string, string> = {
  GREEN: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
  AMBER: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  RED: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
};

const progressColor = (rag: string) => {
  if (rag === 'GREEN') return 'bg-emerald-500';
  if (rag === 'AMBER') return 'bg-amber-500';
  return 'bg-rose-500';
};

export default function ExecHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPersisting, setIsPersisting] = useState(false);
  const { isDark } = useTheme();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/executive-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

  async function persistSnapshot() {
    if (isPersisting) return;
    setIsPersisting(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/executive-compliance/rollup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'persist', period }),
      });
      const p = await r.json();
      setMessage(
        p.success
          ? 'Snapshot persisted successfully'
          : (p.error?.details?.error ?? p.error?.message ?? 'Failed to persist snapshot')
      );
      load();
    } catch (e) {
      setMessage('Failed to persist snapshot due to network error');
    } finally {
      setIsPersisting(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md relative overflow-hidden border border-indigo-500/20">
          <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> EPIC-31 · Executive HR Compliance
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Executive Compliance Rollup</h1>
            <p className="text-indigo-100/90 mt-2 max-w-2xl text-sm leading-relaxed">
              Track global RAG statuses, review average scores across all modules, and persist
              historical compliance snapshots.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start lg:self-auto border border-white/10 shrink-0">
            <span className="text-sm font-medium text-slate-300">Reporting Period</span>
            <input
              value={inputPeriod}
              onChange={(e) => setInputPeriod(e.target.value)}
              placeholder="YYYY-MM"
              disabled={loading || isPersisting}
              className="w-28 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setPeriod(inputPeriod)}
              disabled={loading || isPersisting || period === inputPeriod}
              className="rounded-lg bg-white text-slate-950 hover:bg-slate-100 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={persistSnapshot}
              disabled={loading || isPersisting}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center gap-1.5"
            >
              {isPersisting && <RefreshCw className="w-4 h-4 animate-spin" />}
              Persist Snapshot
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold animate-fade-in">
            {message}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
              >
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Overall KPI Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <KPICard
                  label="Domains Tracked"
                  value={data.domainCount}
                  icon={Layers}
                  type="info"
                />
                <KPICard
                  label="GREEN Domains"
                  value={data.greenDomains}
                  icon={ShieldCheck}
                  type="success"
                />
                <KPICard
                  label="AMBER Domains"
                  value={data.amberDomains}
                  icon={AlertTriangle}
                  type="warning"
                />
                <KPICard
                  label="RED Domains"
                  value={data.redDomains}
                  icon={AlertOctagon}
                  type="danger"
                />
                <KPICard
                  label="Blocking Issues"
                  value={data.blockingIssuesTotal}
                  icon={AlertOctagon}
                  type="danger"
                />
                <KPICard
                  label="Open Risks"
                  value={data.criticalRisksOpen}
                  icon={AlertTriangle}
                  type="danger"
                />
                <KPICard
                  label="Actions Open"
                  value={data.correctiveActionsOpen}
                  icon={Target}
                  type="warning"
                />
                <KPICard
                  label="Actions Overdue"
                  value={data.correctiveActionsOverdue}
                  icon={Calendar}
                  type="danger"
                />
              </div>
              {/* Right: Circular Score Gauge Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Average Compliance Score
                </span>
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 224 224"
                  >
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 100}
                      strokeDashoffset={2 * Math.PI * 100 * (1 - data.averageScore / 100)}
                      className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-[33px] font-black text-slate-900 dark:text-white tracking-tight">
                      {data.averageScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold mt-2">
                      Platform Score
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 max-w-xs">
                  This represents the aggregate performance across all active legal regulatory
                  checks.
                </p>
              </div>
            </div>

            {/* Domain Table Section */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Domain Status breakdown
                </h2>
                <span className="text-xs text-slate-400 font-semibold">Updated as of {period}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                      <th className="px-4 py-3">Domain</th>
                      <th className="px-4 py-3">Score & Rating</th>
                      <th className="px-4 py-3">RAG</th>
                      <th className="px-4 py-3">Blocking Issues</th>
                      <th className="px-4 py-3">Certificate Status</th>
                      <th className="px-4 py-3">Gating Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {data.domainBreakdown.map((d) => (
                      <tr
                        key={d.domain}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200">
                          {d.label}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 dark:text-white w-8">
                              {d.score}%
                            </span>
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${progressColor(d.ragStatus)}`}
                                style={{ width: `${d.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${ragColor[d.ragStatus] ?? ''}`}
                          >
                            {d.ragStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                          {d.blockingIssues}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-450">
                          {d.certificateStatus ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-rose-500 dark:text-rose-450 max-w-xs truncate">
                          {d.certificateGatingReason ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {/* Workspaces Section */}
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-5">
            <FolderLock className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Compliance Workspaces
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <WorkspaceCard
              href="/dashboard/executive-compliance/compliance-risk-heatmap-l-i"
              title="Compliance Risk Heatmap"
              subtitle="S10 · Risk Matrix"
              desc="Identify and map HR compliance risks across all domains using a 5x5 heatmap."
            />
            <WorkspaceCard
              href="/dashboard/executive-compliance/corrective-action-register"
              title="Corrective Action Register"
              subtitle="S11 · CAPA"
              desc="Track and resolve open corrective actions and internal audit findings."
            />
            <WorkspaceCard
              href="/dashboard/executive-compliance/compliance-review-calendar"
              title="Compliance Review Calendar"
              subtitle="S13 · Cadence"
              desc="Manage upcoming periodic compliance reviews and policy check-ins."
            />
            <WorkspaceCard
              href="/dashboard/executive-compliance/executive-monthly-certificate"
              title="Executive Monthly Certificate"
              subtitle="S12 · Attestation"
              desc="Generate and sign off on the monthly executive HR compliance certificate."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'danger' | 'warning' | 'success' | 'info';
}

function KPICard({ label, value, icon: Icon, type }: KPICardProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40',
      icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/40',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500',
      text: 'text-amber-600 dark:text-amber-500',
    },
    success: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    info: {
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
      icon: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-350',
      text: 'text-slate-800 dark:text-white',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <span className={`text-2xl font-black tracking-tight ${styles.text}`}>{value}</span>
    </div>
  );
}

interface WorkspaceCardProps {
  href: string;
  title: string;
  subtitle: string;
  desc: string;
}

function WorkspaceCard({ href, title, subtitle, desc }: WorkspaceCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:border-slate-450 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="space-y-1.5">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {subtitle}
        </span>
        <h3 className="text-base font-extrabold tracking-tight text-slate-850 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors flex items-center gap-1">
          {title}
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-slate-800 dark:text-slate-200 transition-all ml-0.5" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{desc}</p>
      </div>
      <div className="flex justify-end pt-4 mt-auto">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-950 dark:group-hover:bg-white text-slate-400 dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-950 transition-all">
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
