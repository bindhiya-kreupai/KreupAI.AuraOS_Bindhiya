'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Building2,
  ShieldCheck,
  Target,
  AlertOctagon,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Landmark,
  ShieldAlert,
  BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import type { BahrainizationDashboardFull } from '@/lib/services/bahrainization-compliance';
import { KPICard } from './components/KPICard';

const RAG_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function BahrainizationDashboard() {
  const [stats, setStats] = React.useState<BahrainizationDashboardFull | null>(null);
  const [period, setPeriod] = React.useState(periodNow());
  const [loading, setLoading] = React.useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/bahrainization-compliance/dashboard?period=${period}`);
      const payload = (await res.json()) as {
        success: boolean;
        data: BahrainizationDashboardFull;
        error?: { message?: string };
      };
      if (payload.success) {
        setStats(payload.data);
      } else {
        toast.error('Failed to load dashboard metrics');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-18 · Bahrain Nationalization Compliance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Bahrainization Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Period:
            </span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <KPICard
                label="Establishments In Scope"
                value={stats.entitiesInScope}
                icon={Building2}
                type="info"
              />
              <KPICard
                label="At Target (GREEN)"
                value={stats.entitiesAtTarget}
                icon={ShieldCheck}
                type="success"
                sub={`of ${stats.entitiesInScope} total`}
              />
              <KPICard
                label="LMRA-Gated (RED)"
                value={stats.entitiesLmraGated}
                icon={ShieldAlert}
                type={stats.entitiesLmraGated > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Tender Eligible"
                value={stats.entitiesTenderEligible}
                icon={Award}
                type="indigo"
              />
              <KPICard
                label="Missed Bahraini Hires"
                value={stats.totalMissedHires}
                icon={Users}
                type={stats.totalMissedHires > 0 ? 'warning' : 'success'}
              />
              <KPICard
                label="Artificial-Risk Cases"
                value={stats.artificialRiskCount}
                icon={AlertOctagon}
                type={stats.artificialRiskCount > 0 ? 'danger' : 'success'}
              />
            </section>

            {/* Ratio Summary Tiles */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Avg. Bahrainization Ratio
                </p>
                <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                  {stats.avgRatioPct}%
                </p>
                <p className="mt-1 text-xs text-slate-500">Across all in-scope establishments</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Avg. Target Ratio
                </p>
                <p className="mt-2 text-4xl font-black tracking-tight text-slate-700">
                  {stats.avgTargetPct}%
                </p>
                <p className="mt-1 text-xs text-slate-500">Weighted by sector/size targets</p>
              </div>
              <div
                className={`rounded-2xl border p-5 shadow-sm ${stats.avgGapPct >= 0 ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Avg. Gap to Target
                </p>
                <p
                  className={`mt-2 text-4xl font-black tracking-tight ${stats.avgGapPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {stats.avgGapPct > 0 ? '+' : ''}
                  {stats.avgGapPct}pp
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {stats.avgGapPct >= 0
                    ? 'Above target — compliant'
                    : 'Below target — action required'}
                </p>
              </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Monthly Bahrainization Trend (12 months)
                </h3>
                {stats.monthlyTrend.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400 font-medium">
                    No snapshot data yet — take a snapshot to see trends
                  </div>
                ) : (
                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats.monthlyTrend}
                        margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="ratioGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                        <Tooltip formatter={(v: any) => `${v}%`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area
                          type="monotone"
                          dataKey="avgRatio"
                          name="Avg Ratio %"
                          stroke="#0f172a"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#ratioGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="avgTarget"
                          name="Target %"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 3"
                          fillOpacity={1}
                          fill="url(#targetGrad)"
                        />
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* RAG Distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Target className="h-5 w-5 text-slate-500" />
                  RAG Status Distribution
                </h3>
                {stats.ragDistribution.every((d) => d.value === 0) ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400 font-medium">
                    No snapshot data yet
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="w-full md:w-1/2 h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.ragDistribution.filter((d) => d.value > 0)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                          >
                            {stats.ragDistribution.map((_, index) => (
                              <Cell key={index} fill={RAG_COLORS[index % RAG_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      {stats.ragDistribution.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ background: RAG_COLORS[i] }}
                          />
                          <span className="text-slate-700 font-medium">{d.name}</span>
                          <span className="font-bold text-slate-900 ml-1">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Sector Comparison */}
            {stats.sectorComparison.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Landmark className="h-5 w-5 text-slate-500" />
                  Sector Comparison — Average Bahrainization Ratio
                </h3>
                <div className="w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.sectorComparison}
                      margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                      <Tooltip formatter={(v: any) => `${v}%`} />
                      <Bar
                        dataKey="avgRatio"
                        name="Avg Ratio %"
                        fill="#0f172a"
                        radius={[4, 4, 0, 0]}
                        barSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Entity Breakdown */}
            {stats.entityBreakdown.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Building2 className="h-5 w-5 text-slate-500" />
                  Establishment Breakdown
                </h3>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Establishment</th>
                      <th className="px-4 py-3 font-semibold">Ratio</th>
                      <th className="px-4 py-3 font-semibold">Target</th>
                      <th className="px-4 py-3 font-semibold">Gap</th>
                      <th className="px-4 py-3 font-semibold">RAG</th>
                      <th className="px-4 py-3 font-semibold">LMRA</th>
                      <th className="px-4 py-3 font-semibold">Tender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.entityBreakdown.map((e, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {e.establishmentName}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{e.ratioPct}%</td>
                        <td className="px-4 py-3 text-slate-700">{e.targetRatioPct}%</td>
                        <td
                          className={`px-4 py-3 font-semibold ${e.gapPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                        >
                          {e.gapPct > 0 ? '+' : ''}
                          {e.gapPct}pp
                        </td>
                        <td className="px-4 py-3">
                          <RAGDot status={e.ragStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold ${e.lmraGated ? 'text-rose-700' : 'text-emerald-700'}`}
                          >
                            {e.lmraGated ? 'GATED' : 'Clear'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold ${e.tenderEligible ? 'text-emerald-700' : 'text-slate-500'}`}
                          >
                            {e.tenderEligible ? '✓ Eligible' : '✗ Ineligible'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Workspaces */}
            <section className="mt-2">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-900">Compliance Workspaces</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <WorkspaceCard
                  href="/dashboard/bahrainization-compliance/config"
                  title="Establishment Scope"
                  subtitle="S01–S02 · Config"
                  desc="Configure establishments, sectors, size brackets, and LMRA IDs."
                />
                <WorkspaceCard
                  href="/dashboard/bahrainization-compliance/targets"
                  title="Sector Targets"
                  subtitle="S04 / S15 · Targets"
                  desc="Manage sector × size ratio targets with effective dating."
                />
                <WorkspaceCard
                  href="/dashboard/bahrainization-compliance/hires"
                  title="Bahraini Hires"
                  subtitle="S05–S11 · Hires"
                  desc="Record Bahraini hires, link SIO/payroll evidence, detect artificial risk."
                />
                <WorkspaceCard
                  href="/dashboard/bahrainization-compliance/snapshots"
                  title="Ratio Snapshots"
                  subtitle="S03 / S10 · LMRA"
                  desc="Take ratio snapshots, review LMRA gating and tender eligibility."
                />
                <WorkspaceCard
                  href="/dashboard/bahrainization-compliance/certificate"
                  title="Monthly Certificate"
                  subtitle="S12 / S20 · Certificate"
                  desc="Generate and sign monthly Bahrainization compliance certificates."
                />
              </div>
            </section>

            {/* Regulatory Context */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  LMRA & Government Tender Gating
                </h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  LMRA work-permit issuance is blocked for RED-band establishments (below target by
                  &gt;2pp). Government tender eligibility requires a minimum 50% Bahrainization
                  ratio by default. SIO registration and payroll wage evidence are cross-checked per
                  counted Bahraini employee to detect artificial Bahrainization. Certificates cannot
                  be signed while LMRA-gated, artificial-risk unresolved, or missing SIO/payroll
                  evidence.
                </p>
              </div>
            </section>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-400 text-sm font-medium">
            No data available. Configure establishments and seed targets first.
          </div>
        )}
      </div>
    </main>
  );
}

function RAGDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    GREEN: 'bg-emerald-500',
    AMBER: 'bg-amber-500',
    RED: 'bg-rose-500',
  };
  const labels: Record<string, string> = {
    GREEN: 'text-emerald-700',
    AMBER: 'text-amber-700',
    RED: 'text-rose-700',
  };
  const cls = colors[status?.toUpperCase()] ?? 'bg-slate-400';
  const txt = labels[status?.toUpperCase()] ?? 'text-slate-600';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${txt}`}>
      <span className={`h-2 w-2 rounded-full ${cls}`} />
      {status ?? '—'}
    </span>
  );
}

function WorkspaceCard({
  href,
  title,
  subtitle,
  desc,
}: {
  href: string;
  title: string;
  subtitle: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-800 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
          {subtitle}
        </span>
        <h3 className="text-base font-extrabold tracking-tight text-slate-800 group-hover:text-slate-900 transition-colors flex items-center gap-1">
          {title}
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-slate-800 transition-all ml-0.5" />
        </h3>
        <p className="text-xs text-slate-500 leading-normal pt-1.5">{desc}</p>
      </div>
      <div className="flex justify-end pt-4 mt-auto">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 group-hover:bg-slate-900 text-slate-400 group-hover:text-white transition-all">
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
