'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
} from 'recharts';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  FolderLock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Users,
  Award,
  Truck,
  Building,
} from 'lucide-react';
import Link from 'next/link';

interface Dashboard {
  period: string;
  activeEnrollments: number;
  mandatoryCoverGapCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  openExceptionsCount: number;
  vendorsWithoutDpa: number;
  totalAccruedLiability: number;
  monthlyCost: number;
  countryBreakdown: Array<{ name: string; count: number }>;
  departmentBreakdown: Array<{ name: string; count: number }>;
  benefitTypeBreakdown: Array<{ name: string; count: number }>;
  vendorBreakdown: Array<{ name: string; count: number }>;
  trend: Array<{ period: string; cost: number }>;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const COLORS = [
  '#0f172a', // Slate 900
  '#0284c7', // Sky 600
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#6366f1', // Indigo 500
  '#a855f7', // Purple 500
  '#ec4899', // Pink 500
];

function formatCompact(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num === 0) return '0.00';
  const abs = Math.abs(num);
  if (abs >= 1.0e12) {
    return (num / 1.0e12).toFixed(2) + 'T';
  }
  if (abs >= 1.0e9) {
    return (num / 1.0e9).toFixed(2) + 'B';
  }
  if (abs >= 1.0e6) {
    return (num / 1.0e6).toFixed(2) + 'M';
  }
  if (abs >= 1.0e3) {
    return (num / 1.0e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

function formatCurrencyCompact(value: number | string, currency = 'AED'): string {
  return `${currency} ${formatCompact(value)}`;
}

export default function BenefitsHome() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/benefits-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    load();
  }, [period]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-22 · Employee Benefits &amp; Compliance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Benefits Administration &amp; Compliance
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
            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              <KPICard
                label="Active Enrollments"
                value={formatCompact(data.activeEnrollments)}
                icon={Users}
                type="info"
                tooltip={`Full value: ${data.activeEnrollments.toLocaleString()}`}
              />
              <KPICard
                label="Mandatory Gaps"
                value={formatCompact(data.mandatoryCoverGapCount)}
                icon={ShieldAlert}
                type={data.mandatoryCoverGapCount > 0 ? 'danger' : 'success'}
                tooltip={`Full value: ${data.mandatoryCoverGapCount.toLocaleString()}`}
              />
              <KPICard
                label="Expiring Soon"
                value={formatCompact(data.expiringSoonCount)}
                icon={AlertTriangle}
                type={data.expiringSoonCount > 0 ? 'warning' : 'success'}
                tooltip={`Full value: ${data.expiringSoonCount.toLocaleString()}`}
              />
              <KPICard
                label="Expired Policies"
                value={formatCompact(data.expiredCount)}
                icon={AlertTriangle}
                type={data.expiredCount > 0 ? 'danger' : 'success'}
                tooltip={`Full value: ${data.expiredCount.toLocaleString()}`}
              />
              <KPICard
                label="Open Exceptions"
                value={formatCompact(data.openExceptionsCount)}
                icon={FolderLock}
                type={data.openExceptionsCount > 0 ? 'warning' : 'success'}
                tooltip={`Full value: ${data.openExceptionsCount.toLocaleString()}`}
              />
              <KPICard
                label="Vendors w/o DPA"
                value={formatCompact(data.vendorsWithoutDpa)}
                icon={Shield}
                type={data.vendorsWithoutDpa > 0 ? 'danger' : 'success'}
                tooltip={`Full value: ${data.vendorsWithoutDpa.toLocaleString()}`}
              />
              <KPICard
                label="Accrued Liability"
                value={formatCurrencyCompact(data.totalAccruedLiability, 'AED')}
                icon={DollarSign}
                type="info"
                tooltip={`Full value: ${Number(data.totalAccruedLiability).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`}
              />
              <KPICard
                label="Est. Monthly Cost"
                value={formatCurrencyCompact(data.monthlyCost, 'AED')}
                icon={DollarSign}
                type="info"
                tooltip={`Full value: ${Number(data.monthlyCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`}
              />
            </section>

            {/* Recharts Graphs */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Trend Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-855 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Monthly Costs Trend (Last 6 Months)
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {data.trend.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No cost data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.trend}
                        margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(val) => formatCompact(val)}
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrencyCompact(Number(value), 'AED'),
                            'Monthly Cost',
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="cost"
                          stroke="#0284c7"
                          fill="#0284c7"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Pie Chart: Vendor Distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-855 mb-4 flex items-center gap-1.5">
                  <Building className="h-5 w-5 text-slate-500" />
                  Active Enrollments by Vendor
                </h3>
                <div className="flex-1 w-full min-h-[250px] flex flex-col md:flex-row items-center justify-center gap-6">
                  {data.vendorBreakdown.length === 0 ? (
                    <div className="text-slate-400 text-sm">No vendor data available</div>
                  ) : (
                    <>
                      <div className="w-full md:w-1/2 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.vendorBreakdown}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                            >
                              {data.vendorBreakdown.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full md:w-1/2">
                        {data.vendorBreakdown.map((v, index) => (
                          <div key={v.name} className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate text-slate-600 font-medium">
                              {v.name}: {v.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bar Chart: Benefit Type Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-855 mb-4 flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-slate-500" />
                  Enrollment Distribution by Benefit Type
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {data.benefitTypeBreakdown.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.benefitTypeBreakdown}
                        margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          name="Enrollments"
                          fill="#0f172a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bar Chart: Country Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-855 mb-4 flex items-center gap-1.5">
                  <Truck className="h-5 w-5 text-slate-500" />
                  Enrollments by GCC Country
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {data.countryBreakdown.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.countryBreakdown}
                        margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          name="Enrollments"
                          fill="#0284c7"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {/* Workspaces Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Module Workspaces</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <WorkspaceLink
              href="/dashboard/benefits-compliance/catalogue"
              title="Benefit Catalogue"
              desc="Manage eligibility rules, mandatory flags, and valuation parameters."
            />
            <WorkspaceLink
              href="/dashboard/benefits-compliance/enrollments"
              title="Coverage Register"
              desc="Enroll employees, track active policy expiries, exceptions, and process accruals."
            />
            <WorkspaceLink
              href="/dashboard/benefits-compliance/vendors"
              title="Vendor Management"
              desc="Oversee benefits vendors, contract terms, DPA logs, and SLA compliances."
            />
            <WorkspaceLink
              href="/dashboard/benefits-compliance/certificate"
              title="Monthly Certificate"
              desc="Generate compliance audits, review exceptions, and digitally sign reports."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function KPICard({
  label,
  value,
  icon: Icon,
  type,
  tooltip,
}: {
  label: string;
  value: string | number;
  icon: any;
  type: 'success' | 'danger' | 'warning' | 'info';
  tooltip?: string;
}) {
  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-700',
      icon: 'text-emerald-500',
    },
    danger: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700', icon: 'text-rose-500' },
    warning: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: 'text-amber-500' },
    info: { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-900', icon: 'text-slate-500' },
  }[type];

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm flex flex-col justify-between min-h-[100px] ${styles.bg}`}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${styles.icon}`} />
      </div>
      <p className={`text-xl font-extrabold mt-3 tracking-tight ${styles.text}`}>{value}</p>
    </div>
  );
}

function WorkspaceLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-400 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950">{title}</h3>
        <ExternalLink className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600" />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-normal">{desc}</p>
    </Link>
  );
}
