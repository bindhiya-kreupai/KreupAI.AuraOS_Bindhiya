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
} from 'recharts';
import {
  Activity,
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  Fingerprint,
  Users,
  TrendingUp,
  FolderLock,
  ArrowRight,
  ExternalLink,
  Layers,
  MapPin,
  Building,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  period: string;
  punchesTotal: number;
  missingPunchCount: number;
  lateCount: number;
  earlyOutCount: number;
  regularizationTotal: number;
  regularizationsPending: number;
  fraudFlagsOpen: number;
  fraudFlagsResolved: number;
  absconding3DayCount: number;
  consentMissingCount: number;
  totalEmployees: number;
  biometricConsentCount: number;
  geolocationConsentCount: number;
  attendancePct: number;
  compliancePct: number;
  fraudSeverityData: Array<{ name: string; value: number }>;
  weeklyTrendsData: Array<{ name: string; compliance: number; attendance: number }>;
  companyComparison: Array<{ name: string; rate: number }>;
  countryComparison: Array<{ name: string; rate: number }>;
  departmentComparison: Array<{ name: string; rate: number }>;
}

const COLORS = [
  '#0f172a', // Slate 900
  '#f59e0b', // Amber 500
  '#ef4444', // Red 500
  '#10b981', // Emerald 500
];

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function AttendanceDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [period, setPeriod] = React.useState(periodNow());
  const [loading, setLoading] = React.useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/attendance-compliance/dashboard?period=${period}`);
      const payload = await res.json();
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
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-19 · Attendance &amp; Labor compliance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Attendance Compliance Dashboard
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
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <KPICard
                label="Total Punches"
                value={stats.punchesTotal.toLocaleString()}
                icon={Activity}
                type="info"
              />
              <KPICard
                label="Attendance Rate"
                value={`${stats.attendancePct}%`}
                icon={ShieldCheck}
                type="success"
              />
              <KPICard
                label="Compliance Rate"
                value={`${stats.compliancePct}%`}
                icon={FileCheck}
                type="success"
              />
              <KPICard
                label="Active Fraud"
                value={stats.fraudFlagsOpen}
                icon={AlertOctagon}
                type={stats.fraudFlagsOpen > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Missing Consents"
                value={stats.consentMissingCount}
                icon={Fingerprint}
                type={stats.consentMissingCount > 0 ? 'warning' : 'success'}
              />
              <KPICard
                label="Absconding (3d+)"
                value={stats.absconding3DayCount}
                icon={Users}
                type={stats.absconding3DayCount > 0 ? 'danger' : 'success'}
              />
              <KPICard
                label="Pending Regs"
                value={stats.regularizationsPending}
                icon={TrendingUp}
                type={stats.regularizationsPending > 0 ? 'warning' : 'success'}
              />
            </section>

            {/* Analytics Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Weekly Trends */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Weekly Trends (Attendance vs. Compliance Rate)
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.weeklyTrendsData}
                      margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        type="monotone"
                        dataKey="compliance"
                        name="Compliance Rate %"
                        stroke="#0f172a"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#compGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        name="Attendance Rate %"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#attGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Fraud Severity distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <AlertOctagon className="h-5 w-5 text-slate-500" />
                  Active Fraud Severity Profile
                </h3>
                <div className="flex-1 w-full min-h-[250px] flex flex-col md:flex-row items-center justify-center gap-6">
                  {stats.fraudFlagsOpen === 0 ? (
                    <div className="text-slate-455 text-sm font-semibold">
                      No active fraud flags logged
                    </div>
                  ) : (
                    <>
                      <div className="w-full md:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.fraudSeverityData.filter((d) => d.value > 0)}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                            >
                              {stats.fraudSeverityData
                                .filter((d) => d.value > 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full md:w-1/2">
                        {stats.fraudSeverityData.map((d, index) => (
                          <div key={d.name} className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate text-slate-650 font-medium">
                              {d.name}: {d.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Chart 3: Department-wise Compliance rates */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                  Departmental Compliance Comparison
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.departmentComparison}
                      layout="vertical"
                      margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[70, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        width={80}
                      />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="rate"
                        name="Compliance Rate %"
                        fill="#0f172a"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Legal Entities & GCC Comparison */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  GCC Regional Compliance rates
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.countryComparison}
                      margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="rate"
                        name="Compliance Rate %"
                        fill="#0284c7"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WorkspaceCard
              href="/dashboard/attendance-compliance/policies"
              title="Attendance Policies"
              subtitle="S01 · Rules &amp; SLAs"
              desc="Configure country grace periods, SLA hours, and biometric settings."
            />

            <WorkspaceCard
              href="/dashboard/attendance-compliance/fraud-flags"
              title="Fraud Register"
              subtitle="S02 · Investigation Desk"
              desc="Review and resolve buddy punch warnings, time drifts, and anomalies."
            />

            <WorkspaceCard
              href="/dashboard/attendance-compliance/consents"
              title="Consent Register"
              subtitle="S03 · Attestations"
              desc="Manage worker biometric and geolocation consent document agreements."
            />

            <WorkspaceCard
              href="/dashboard/attendance-compliance/certificate"
              title="Monthly Certificates"
              subtitle="S04 · Attestations"
              desc="Generate monthly reports and sign off on attendance certifications."
            />
          </div>
        </section>

        {/* Compliance Details Footer Info Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">GCC Labor Law Enforcement</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Gating mechanisms block the monthly attendance certificate if there are open fraud
              flags, missing biometric/geo consents, unresolved regularizations, or absconding
              alerts. Full audit trails, soft deletes, and bulk operations are active across all
              registers.
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
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 border-slate-200 ${styles.bg}`}
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
