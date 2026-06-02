// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import type {
  ExpenseAnalytics as AnalyticsData,
  ExpenseAnalyticsParams,
} from '@/services/expenseService';
import { ExpenseService } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpenseAnalyticsProps {
  defaultParams?: ExpenseAnalyticsParams;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function AnalyticsStat({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  color: string;
  bgColor: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {changeLabel && <p className="text-xs text-slate-400 mt-0.5">{changeLabel}</p>}
      </div>
    </div>
  );
}

// ── Bar Chart (pure CSS/SVG) ───────────────────────────────────────────────────

function SimpleBarChart({
  data,
  title,
  valueKey,
  labelKey,
  color = 'bg-indigo-500',
}: {
  data: Record<string, number | string>[];
  title: string;
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const maxVal = Math.max(...values);
  if (maxVal === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
      <div className="space-y-2">
        {data.slice(0, 6).map((row, i) => {
          const val = Number(row[valueKey]);
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-28 truncate flex-shrink-0">
                {String(row[labelKey])}
              </span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-16 text-right flex-shrink-0">
                {formatCurrency(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Trend Chart (SVG sparkline) ────────────────────────────────────────────────

function TrendSparkline({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 300;
  const height = 80;
  const padding = 10;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.amount - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${points[points.length - 1].split(',')[0]},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Trend</h4>
      <div className="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#areaGrad)" />
          <path d={pathD} stroke="#6366f1" strokeWidth="2" fill="none" strokeLinejoin="round" />
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.amount - min) / range) * (height - 2 * padding);
            return <circle key={i} cx={x} cy={y} r="3" fill="#6366f1" />;
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {data.map((d) => (
            <span key={d.month} className="text-xs text-slate-400">
              {new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Donut Chart (SVG) ─────────────────────────────────────────────────────────

function DonutChart({
  data,
  title,
}: {
  data: { label: string; amount: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return null;

  const size = 140;
  const strokeWidth = 28;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.amount / total;
    const dash = pct * circumference;
    const seg = { ...d, pct, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
      <div className="flex items-center gap-6">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="flex-shrink-0 -rotate-90"
        >
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="flex-1 space-y-2 min-w-0">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">
                {seg.label}
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex-shrink-0">
                {Math.round(seg.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const DONUT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function ExpenseAnalytics({ defaultParams }: ExpenseAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, _setParams] = useState<ExpenseAnalyticsParams>(defaultParams ?? {});
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');

  const loadData = async () => {
    setLoading(true);
    try {
      const analytics = await ExpenseService.getExpenseAnalytics(params);
      setData(analytics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const categoryDonut = data.expensesByCategory
    .slice(0, 5)
    .map((c, i) => ({ label: c.categoryName, amount: c.amount, color: DONUT_COLORS[i] }));

  const deptBarData = data.expensesByDepartment.map((d) => ({
    amount: d.amount,
    label: d.departmentName,
  }));

  const _employeeBarData = data.expensesByEmployee.map((e) => ({
    amount: e.amount,
    label: e.employeeName,
  }));

  const lastMonthAmount = data.expensesByMonth[data.expensesByMonth.length - 1]?.amount ?? 0;
  const prevMonthAmount = data.expensesByMonth[data.expensesByMonth.length - 2]?.amount ?? 0;
  const monthChange =
    prevMonthAmount > 0 ? ((lastMonthAmount - prevMonthAmount) / prevMonthAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Expense Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Spend trends, category insights, and compliance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            className="p-2.5 text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStat
          icon={DollarSign}
          label="Total Expenses"
          value={formatCurrency(data.totalExpenses)}
          change={monthChange}
          changeLabel="vs. last month"
          color="text-indigo-600"
          bgColor="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <AnalyticsStat
          icon={TrendingUp}
          label="Avg Expense"
          value={`$${data.averageExpenseAmount.toLocaleString()}`}
          color="text-violet-600"
          bgColor="bg-violet-50 dark:bg-violet-900/20"
        />
        <AnalyticsStat
          icon={Users}
          label="Pending Approvals"
          value={String(data.pendingApprovals)}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <AnalyticsStat
          icon={BarChart3}
          label="Compliance Score"
          value={`${data.complianceScore}%`}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Policy Violations',
            value: data.policyViolations,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            label: 'Rejection Rate',
            value: `${data.rejectionRate}%`,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
          },
          {
            label: 'Avg Approval Time',
            value: `${data.approvalTime}d`,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Avg Reimbursement',
            value: `${data.reimbursementTime}d`,
            color: 'text-teal-500',
            bg: 'bg-teal-50 dark:bg-teal-900/20',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${stat.bg}`}
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <TrendSparkline data={data.expensesByMonth} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.expensesByMonth.slice(-2).map((m) => (
              <div
                key={m.month}
                className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <p className="text-xs text-slate-400">
                  {new Date(m.month + '-01').toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(m.amount)}
                </p>
                <p className="text-xs text-slate-400">{m.count} reports</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <DonutChart data={categoryDonut} title="Spend by Category" />
          <div className="mt-4 space-y-1">
            {data.expensesByCategory.slice(0, 5).map((c) => (
              <div key={c.categoryId} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{c.categoryName}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {c.count} reports &middot; {formatCurrency(c.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department bar chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <SimpleBarChart
            data={deptBarData}
            title="Spend by Department"
            valueKey="amount"
            labelKey="label"
            color="bg-violet-500"
          />
        </div>

        {/* Top merchants + compliance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {/* Top merchants */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Top Merchants
            </h4>
            <div className="space-y-2">
              {data.topMerchants.slice(0, 5).map((m, i) => (
                <div key={m.merchant} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">
                    {m.merchant}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(m.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget utilization */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Budget Utilization
            </h4>
            <div className="space-y-3">
              {data.budgetUtilization.map((b) => (
                <div key={b.departmentId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 truncate">
                      {data.expensesByDepartment.find((d) => d.departmentId === b.departmentId)
                        ?.departmentName ?? b.departmentId}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        b.utilization > 90
                          ? 'text-red-500'
                          : b.utilization > 75
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                      }`}
                    >
                      {b.utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.utilization > 90
                          ? 'bg-red-500'
                          : b.utilization > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.utilization, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-slate-400">{formatCurrency(b.spent)}</span>
                    <span className="text-xs text-slate-400">{formatCurrency(b.budgeted)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
