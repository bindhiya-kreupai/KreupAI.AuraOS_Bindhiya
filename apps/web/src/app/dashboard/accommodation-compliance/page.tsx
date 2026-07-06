'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import {
  Building2,
  AlertOctagon,
  ClipboardList,
  MessageSquareWarning,
  Award,
  ArrowRight,
  TrendingUp,
  FolderLock,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  period: string;
  sitesTotal: number;
  sitesOvercapacity: number;
  inspectionsDue: number;
  openCriticalFindings: number;
  openComplaints: number;
  complaintsSlaBreached: number;
  averageInspectionScore: number;
  complaintsByCategory: Array<{ category: string; count: number }>;
  inspectionsByCategory: Array<{ category: string; count: number }>;
  complaintsTrend: Array<{ period: string; count: number }>;
  inspectionsTrend: Array<{ period: string; score: number }>;
  sitesOccupancy: Array<{ name: string; capacity: number; occupancy: number }>;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const COLORS = [
  '#0f172a',
  '#0284c7',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

export default function AccHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/accommodation-compliance/dashboard?period=${period}`);
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

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-23 · Accommodation &amp; Labour Camps
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Accommodation Compliance Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Period:
            </span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <KPICard label="Total Sites" value={data.sitesTotal} icon={Building2} type="info" />
              <KPICard
                label="Over Capacity"
                value={data.sitesOvercapacity}
                icon={AlertOctagon}
                type={data.sitesOvercapacity > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Inspections Due"
                value={data.inspectionsDue}
                icon={ClipboardList}
                type={data.inspectionsDue > 0 ? 'warning' : 'success'}
              />
              <KPICard
                label="Critical Open"
                value={data.openCriticalFindings}
                icon={AlertOctagon}
                type={data.openCriticalFindings > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Open Complaints"
                value={data.openComplaints}
                icon={MessageSquareWarning}
                type={data.openComplaints > 0 ? 'warning' : 'success'}
              />
              <KPICard
                label="SLA Breached"
                value={data.complaintsSlaBreached}
                icon={AlertOctagon}
                type={data.complaintsSlaBreached > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Avg Inspection"
                value={`${Number(data.averageInspectionScore ?? 0).toFixed(2)}%`}
                icon={Award}
                type={(data.averageInspectionScore ?? 0) >= 80 ? 'success' : 'warning'}
              />
            </section>

            {/* Analytics Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Site Capacity vs Occupancy */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Building2 className="h-5 w-5 text-slate-500" />
                  Site Capacity vs. Occupancy
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {data.sitesOccupancy.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-450 text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.sitesOccupancy}
                        margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar
                          dataKey="capacity"
                          name="Total Capacity"
                          fill="#94a3b8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="occupancy"
                          name="Current Occupancy"
                          fill="#0f172a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Complaints by Category */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <MessageSquareWarning className="h-5 w-5 text-slate-500" />
                  Complaints distribution
                </h3>
                <div className="flex-1 w-full min-h-[250px] flex flex-col md:flex-row items-center justify-center gap-6">
                  {data.complaintsByCategory.length === 0 ? (
                    <div className="text-slate-450 text-sm">No complaints recorded</div>
                  ) : (
                    <>
                      <div className="w-full md:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.complaintsByCategory}
                              dataKey="count"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                            >
                              {data.complaintsByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full md:w-1/2">
                        {data.complaintsByCategory.map((c, index) => (
                          <div key={c.category} className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate text-slate-650 font-medium">
                              {c.category}: {c.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Chart 3: Inspection Performance trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-slate-500" />
                  Avg Inspection Scores Trend (Last 6 Months)
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.inspectionsTrend}
                      margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="score"
                        name="Avg Score %"
                        stroke="#0f172a"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#scoreGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Complaint Frequency trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Monthly Complaints Trend (Last 6 Months)
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.complaintsTrend}
                      margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Complaints"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {/* Workspaces Section */}
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <FolderLock className="h-5 w-5 text-slate-650" />
            <h2 className="text-xl font-bold text-slate-900">Compliance Workspaces</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <WorkspaceCard
              href="/dashboard/accommodation-compliance/sites"
              title="Site Master"
              subtitle="S02 / S14 · Registry"
              desc="Manage labor camps, apartments, villas, capacities, managers, and contractors."
            />

            <WorkspaceCard
              href="/dashboard/accommodation-compliance/assignments"
              title="Employee Register"
              subtitle="S03 / S04 / S10 · Allocations"
              desc="Assign rooms/beds, control segregation rules, and allocate housing costs."
            />

            <WorkspaceCard
              href="/dashboard/accommodation-compliance/inspections"
              title="Inspections"
              subtitle="S05–S09 / S12 · Audits"
              desc="Track hygiene, fire, electrical, kitchen and water safety findings."
            />

            <WorkspaceCard
              href="/dashboard/accommodation-compliance/complaints"
              title="Complaints"
              subtitle="S15 · Resolution Desk"
              desc="Manage tenant-raised issues, SLAs, and assignee details."
            />

            <WorkspaceCard
              href="/dashboard/accommodation-compliance/certificate"
              title="Monthly Certificates"
              subtitle="S17 / S18 · Attestations"
              desc="Generate monthly reports and sign gated compliance certificates."
            />
          </div>
        </section>

        {/* Compliance Details Footer Info Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Enterprise Standard Enforcement</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Gating mechanisms block the monthly compliance certificate if a site is over capacity,
              has open critical findings, exceeds SLA limits on open complaints, or has overdue
              scheduled inspections. Full history logs, soft deletes, and bulk editing capabilities
              are active across all workspaces.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// Subcomponent: KPICard
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'danger' | 'warning' | 'success' | 'info';
}

function KPICard({ label, value, icon: Icon, type }: KPICardProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50 border-rose-100',
      icon: 'bg-rose-100 text-rose-700',
      text: 'text-rose-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100',
      icon: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
    },
    info: {
      bg: 'bg-slate-50 border-slate-100',
      icon: 'bg-slate-100 text-slate-800',
      text: 'text-slate-900',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <span className={`text-2xl font-black tracking-tight ${styles.text}`}>{value}</span>
    </div>
  );
}

// Subcomponent: WorkspaceCard
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
