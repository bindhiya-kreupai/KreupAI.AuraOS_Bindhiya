'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Globe,
  Award,
  Database,
  X,
  RefreshCw,
  Building2,
  ExternalLink,
  TrendingUp,
  FolderLock,
} from 'lucide-react';
import Link from 'next/link';

interface ByCategory {
  categoryCode: string;
  total: number;
  completed: number;
  overdue: number;
}

interface DashboardStats {
  period: string;
  total: number;
  completed: number;
  deferred: number;
  overdue: number;
  criticalOverdue: number;
  onTimePct: number;
  byCategory: ByCategory[];
}

interface Task {
  id: string;
  ruleCode: string | null;
  categoryCode: string;
  countryCode: string | null;
  legalEntityId: string | null;
  subject: string;
  ownerRole: string;
  dueDate: string;
  status: string;
  escalatedToRole: string | null;
}

interface Company {
  id: string;
  code: string;
  name: string;
}

const CATEGORY_MAP: Record<string, string> = {
  PAYROLL: 'Payroll Cut-off',
  WPS: 'Wage Protection System',
  SOCIAL_INSURANCE: 'Social Insurance',
  IMMIGRATION: 'Visa & Work Permits',
  NATIONALIZATION: 'Nationalization Target',
  HOLIDAY: 'Holidays & Ramadan',
  BENEFITS: 'Benefits & Insurance',
  HSE: 'HSE & Training',
  EMPLOYEE_RELATIONS: 'Employee Relations',
  DOCUMENT_AUDIT: 'Personnel-File Audit',
};

const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  AE: { name: 'United Arab Emirates', flag: '🇦🇪' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
  BH: { name: 'Bahrain', flag: '🇧🇭' },
  QA: { name: 'Qatar', flag: '🇶🇦' },
  OM: { name: 'Oman', flag: '🇴🇲' },
  KW: { name: 'Kuwait', flag: '🇰🇼' },
};

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ComplianceCalendarHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState(periodNow());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch Dashboard Stats
      const statsRes = await fetch(`/api/v1/compliance-calendar/dashboard?period=${period}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Fetch Tasks for the whole month
      const [year, month] = period.split('-').map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      const taskRes = await fetch(
        `/api/v1/compliance-calendar/tasks?from=${start.toISOString()}&to=${end.toISOString()}&pageSize=1000`
      );
      const taskData = await taskRes.json();
      if (taskData.success) {
        setTasks(taskData.data?.items ?? []);
      }

      // 3. Fetch Companies (Legal Entities) for lookup
      const compRes = await fetch('/api/v1/companies');
      const compData = await compRes.json();
      if (compData.success) {
        const lookup: Record<string, string> = {};
        (compData.data?.data || []).forEach((c: Company) => {
          lookup[c.id] = c.name;
        });
        setCompanies(lookup);
      }

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setMessage({ type: 'error', text: 'Error connecting to service API' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [period]);

  async function handleEscalate() {
    setMessage({ type: '', text: '' });
    try {
      setLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'escalate-overdue' }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: Evaluated deadlines and escalated ${p.data.escalated.length} overdue task(s).`,
        });
        loadData();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Escalation failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to process task escalations' });
    } finally {
      setLoading(false);
    }
  }

  // Aggregate country statistics from fetched tasks
  const countryStats = Object.keys(COUNTRY_MAP).map((code) => {
    const countryTasks = tasks.filter((t) => t.countryCode === code);
    const completed = countryTasks.filter((t) => t.status === 'COMPLETED').length;
    const total = countryTasks.length;
    const rate = total === 0 ? 100 : Math.round((completed / total) * 100);
    const overdue = countryTasks.filter((t) => t.status === 'OVERDUE').length;
    return { code, total, completed, overdue, rate };
  });

  // Calendar Day Map
  const [year, month] = period.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // Sunday=0, etc.

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayTasks = tasks.filter((t) => {
      const d = new Date(t.dueDate);
      return d.getUTCDate() === dayNum;
    });
    return { dayNum, tasks: dayTasks };
  });

  // Currently viewed day tasks
  const selectedDayTasks = selectedDay ? calendarDays[selectedDay - 1]?.tasks || [] : [];

  // Mock Trend data using stats parameters
  const chartTrendData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Feb', rate: 85 },
      { name: 'Mar', rate: 88 },
      { name: 'Apr', rate: 90 },
      { name: 'May', rate: 92 },
      { name: 'Jun', rate: 94 },
      { name: period.slice(5), rate: Math.round(stats.onTimePct) },
    ];
  }, [stats, period]);

  // Chart data for category breakdown
  const chartCategoryData = useMemo(() => {
    if (!stats) return [];
    return stats.byCategory.map((cat) => ({
      name: CATEGORY_MAP[cat.categoryCode] || cat.categoryCode,
      Completed: cat.completed,
      Total: cat.total,
    }));
  }, [stats]);

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 text-slate-900 select-none">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header matching other dashboards */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-35 · Compliance Calendar &amp; Scheduling
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Compliance Calendar &amp; Scheduling
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
              onClick={handleEscalate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              <span>{loading ? 'Processing...' : 'Escalate'}</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Action message */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-2xl border p-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Critical Blocker Alert */}
        {stats && stats.criticalOverdue > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm text-rose-900">
            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-rose-800">Critical Blocker Hold</h4>
              <p className="text-sm mt-0.5 text-rose-700">
                You have {stats.criticalOverdue} critical task(s) overdue in core categories (WPS,
                Pension, or Immigration). The Monthly Compliance Certificate for{' '}
                <strong>{period}</strong> is currently locked from sign-off.
              </p>
              <Link
                href="/dashboard/compliance-calendar/tasks?status=OVERDUE"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-rose-800 hover:underline"
              >
                <span>Resolve overdue blockers</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards section matching other dashboard structures */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard label="Total Tasks" value={stats.total} icon={Calendar} type="info" />
              <KPICard
                label="On-Time Rate"
                value={`${stats.onTimePct}%`}
                icon={Award}
                type={stats.onTimePct >= 90 ? 'success' : 'warning'}
              />
              <KPICard
                label="Completed"
                value={stats.completed}
                icon={CheckCircle}
                type="success"
              />
              <KPICard label="Deferred" value={stats.deferred} icon={Clock} type="warning" />
              <KPICard
                label="Overdue Tasks"
                value={stats.overdue}
                icon={AlertCircle}
                type={stats.overdue > 0 ? 'danger' : 'success'}
              />
            </section>

            {/* Analytics Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Recharts Historical Area Trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                  Statutory Completion Trend (6 Months)
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {chartTrendData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-450 text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartTrendData}
                        margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="rate"
                          name="On-Time Completion %"
                          stroke="#0f172a"
                          strokeWidth={2}
                          fill="url(#rateGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Recharts Category Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Shield className="h-5 w-5 text-slate-500" />
                  Compliance Pillar Breakdown
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {chartCategoryData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-450 text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartCategoryData}
                        layout="vertical"
                        margin={{ left: 30, right: 10, top: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tick={{ fontSize: 10, fill: '#64748b' }}
                        />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Completed" fill="#10b981" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Total" fill="#0f172a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            {/* Bottom Grid: Calendar Preview & Workspace Navigation */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Calendar Preview Grid */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-5 w-5 text-slate-500" />
                      Calendar Deadlines Preview
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect deadlines by clicking on active calendar days.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 select-none">
                    Period: {period}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Days Board */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                        <div key={idx} className="py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Empty placeholders */}
                      {Array.from({ length: firstDayIndex }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="aspect-square bg-slate-50/50 rounded-lg border border-slate-100/50"
                        />
                      ))}

                      {/* Calendar days mapping */}
                      {calendarDays.map((day) => {
                        const isSelected = selectedDay === day.dayNum;
                        const hasTasks = day.tasks.length > 0;
                        const hasOverdue = day.tasks.some((t) => t.status === 'OVERDUE');
                        const allCompleted =
                          hasTasks && day.tasks.every((t) => t.status === 'COMPLETED');

                        let dayBg = 'hover:bg-slate-50 border-slate-200';
                        if (isSelected)
                          dayBg = 'bg-slate-900 text-white border-slate-900 shadow-sm';
                        else if (hasOverdue)
                          dayBg = 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100';
                        else if (allCompleted)
                          dayBg =
                            'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100';
                        else if (hasTasks)
                          dayBg = 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100';

                        return (
                          <button
                            key={`day-${day.dayNum}`}
                            type="button"
                            onClick={() => setSelectedDay(isSelected ? null : day.dayNum)}
                            className={`aspect-square rounded-lg border text-xs font-semibold flex flex-col items-center justify-between p-1.5 transition ${dayBg}`}
                          >
                            <span
                              className={`h-5 w-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-slate-900 font-bold' : ''}`}
                            >
                              {day.dayNum}
                            </span>
                            {hasTasks && !isSelected && (
                              <div className="flex gap-0.5 justify-center mt-1">
                                {day.tasks.slice(0, 3).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      t.status === 'COMPLETED'
                                        ? 'bg-emerald-500'
                                        : t.status === 'OVERDUE'
                                          ? 'bg-rose-500'
                                          : 'bg-blue-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Tasks Side Details */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[250px]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <span>Filing Details</span>
                        {selectedDay && (
                          <span className="rounded bg-slate-200 text-slate-700 px-1.5 py-0.5 text-[10px] font-bold">
                            Day {selectedDay}
                          </span>
                        )}
                      </h4>

                      <div className="mt-3.5 space-y-3 max-h-56 overflow-y-auto pr-1">
                        {!selectedDay ? (
                          <div className="text-center py-12 text-slate-400 text-xs">
                            Select a highlighted day to inspect statutory deadlines.
                          </div>
                        ) : selectedDayTasks.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs">
                            No compliance deadlines scheduled on this date.
                          </div>
                        ) : (
                          selectedDayTasks.map((t) => (
                            <div
                              key={t.id}
                              className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm hover:border-slate-300 transition"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span
                                  className="font-semibold text-slate-800 truncate"
                                  title={t.subject}
                                >
                                  {t.subject}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Entity:{' '}
                                {companies[t.legalEntityId ?? ''] ||
                                  t.legalEntityId ||
                                  'All Entities'}
                              </p>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
                                <span className="capitalize">
                                  {t.ownerRole.toLowerCase().replace('_', ' ')}
                                </span>
                                <Link
                                  href={`/dashboard/compliance-calendar/tasks?search=${encodeURIComponent(t.subject)}`}
                                  className="text-indigo-600 font-semibold hover:underline"
                                >
                                  Open
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {selectedDay && selectedDayTasks.length > 0 && (
                      <Link
                        href={`/dashboard/compliance-calendar/tasks?dueDate=${period}-${String(selectedDay).padStart(2, '0')}`}
                        className="w-full mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl py-2 hover:bg-indigo-100 transition text-center"
                      >
                        <span>Open Task Register</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* GCC National Contexts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Globe className="h-5 w-5 text-slate-500" />
                  GCC National Contexts
                </h3>
                <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                  {countryStats.map((c) => {
                    const countryInfo = COUNTRY_MAP[c.code] || { name: c.code, flag: '🌐' };
                    return (
                      <div
                        key={c.code}
                        className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 max-w-[160px]">
                          <span className="text-lg leading-none">{countryInfo.flag}</span>
                          <span className="font-semibold text-slate-700 truncate">
                            {countryInfo.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono font-bold">
                          <span className="text-slate-400 text-[10px] font-normal">
                            {c.completed}/{c.total} Tasks
                          </span>
                          {c.overdue > 0 ? (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                              {c.overdue} Overdue
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.rate === 100
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}
                            >
                              {c.rate}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Workspaces Section */}
            <section className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <FolderLock className="h-6 w-6 text-slate-700" />
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {' '}
                  Compliance Workspaces{' '}
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <WorkspaceCard
                  href="/dashboard/compliance-calendar/tasks"
                  title="Task Register"
                  subtitle="S02 Workspace"
                  desc="Audit-ready registry for completing, reassigning, or deferring compliance filing tasks."
                />
                <WorkspaceCard
                  href="/dashboard/compliance-calendar/rules"
                  title="Recurrence Rules"
                  subtitle="S01 Recurrence Scheduling"
                  desc="Define compliance templates, owner roles, lead times, and alert reminder periods."
                />
                <WorkspaceCard
                  href="/dashboard/compliance-calendar/audit"
                  title="Annual Audit Plan"
                  subtitle="S07-S08 inspections"
                  desc="Draw randomized or risk-weighted employee samples, record tests, and log corrective action logs."
                />
                <WorkspaceCard
                  href="/dashboard/compliance-calendar/certificate"
                  title="Monthly Certificate"
                  subtitle="S10 Executive sign-offs"
                  desc="Attest statutory filings and digitally sign Monthly Certificates if free of overdue blockers."
                />
              </div>
            </section>

            {/* Last Updated Footer */}
            <footer className="text-center text-xs text-slate-400 mt-12 flex justify-between border-t border-slate-200 pt-4">
              <span>Enterprise HR Compliance Platform • AuraOS v1.2</span>
              {lastRefreshed && <span>Last refresh: {lastRefreshed}</span>}
            </footer>
          </>
        ) : (
          <div className="flex h-96 items-center justify-center text-slate-500">
            No data. Please configure rules and generate tasks.
          </div>
        )}
      </div>
    </main>
  );
}

// Subcomponent: KPICard
interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type?: 'success' | 'warning' | 'danger' | 'info';
  sub?: string;
}

function KPICard({ label, value, icon: Icon, type = 'info', sub }: KPICardProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50/50 border-rose-100',
      icon: 'bg-rose-100 text-rose-700',
      text: 'text-rose-700',
    },
    warning: {
      bg: 'bg-amber-50/50 border-amber-100',
      icon: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
    },
    success: {
      bg: 'bg-emerald-50/50 border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
    },
    info: {
      bg: 'bg-slate-50/50 border-slate-100',
      icon: 'bg-slate-100 text-slate-800',
      text: 'text-slate-900',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <span className={`text-3xl font-black tracking-tight ${styles.text}`}>{value}</span>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
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

// Subcomponent: WorkspaceCard
interface WorkspaceCardProps {
  href: string;
  title: string;
  subtitle: string;
  desc: string;
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
      className="
        group
        flex
        min-h-[250px]
        flex-col
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-7
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-xl
      "
    >
      {/* Header */}
      <div className="space-y-5">
        <div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            {subtitle}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-slate-950">
            {title}
          </h3>

          <ExternalLink className="mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-all duration-300 group-hover:text-slate-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>

        <p className="max-w-[32ch] text-[15px] leading-7 text-slate-600">{desc}</p>
      </div>

      {/* Push footer to bottom */}
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <p className="text-sm font-semibold text-slate-700">Open Workspace</p>
            <p className="mt-1 text-xs text-slate-400">View dashboard & manage records</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 transition-all duration-300 group-hover:bg-slate-900">
            <ArrowRight className="h-5 w-5 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
