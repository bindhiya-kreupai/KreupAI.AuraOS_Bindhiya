'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Palmtree,
  BarChart3,
  Loader2,
  Settings,
  PieChart,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { LeaveAnalyticsService } from './services';
import type { LeaveStats } from './types';

interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'amber' | 'emerald' | 'blue' | 'indigo' | 'rose';
  alert?: boolean;
}

const COLOR_MAP: Record<StatCard['color'], string> = {
  amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
};

const QUICK_LINKS = [
  { label: 'Leave Types', href: '/dashboard/leave/leave-types', icon: Settings },
  { label: 'Leave Balance', href: '/dashboard/leave/leave-balance', icon: PieChart },
  { label: 'Holiday Management', href: '/dashboard/leave/holiday-management', icon: Palmtree },
  { label: 'Leave Reports', href: '/dashboard/leave/leave-reports', icon: FileText },
  { label: 'Leave Calendar', href: '/dashboard/leave/leave-calendar', icon: Calendar },
  { label: 'My Leaves', href: '/dashboard/leave/my-leaves', icon: Clock },
];

export default function LeaveDashboardPage() {
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await LeaveAnalyticsService.getStats();
      setStats(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load leave analytics';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const utilization =
    stats && stats.totalAccruedDays > 0
      ? Math.round((stats.totalAvailedDays / stats.totalAccruedDays) * 100)
      : 0;

  const statCards: StatCard[] = [
    {
      title: 'Pending Requests',
      value: String(stats?.pendingRequests ?? 0),
      icon: Clock,
      color: 'amber',
      alert: (stats?.pendingRequests ?? 0) > 0,
    },
    {
      title: 'On Leave Today',
      value: String(stats?.onLeaveToday ?? 0),
      icon: Palmtree,
      color: 'blue',
    },
    {
      title: 'Upcoming Leaves',
      value: String(stats?.upcomingLeaves ?? 0),
      icon: Calendar,
      color: 'emerald',
    },
    {
      title: 'Utilization Rate',
      value: `${utilization}%`,
      icon: BarChart3,
      color: 'indigo',
    },
    {
      title: 'Lapsed Days',
      value: String(stats?.totalLapsedDays ?? 0),
      icon: AlertCircle,
      color: 'rose',
      alert: (stats?.totalLapsedDays ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            Leave Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Live overview of leave operations across your organization.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-lg ${
                stat.alert
                  ? 'border-rose-100 dark:border-rose-900/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex p-3 rounded-2xl ${COLOR_MAP[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.alert && <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                {stat.title}
              </p>
              <div className="text-2xl font-bold">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                ) : (
                  stat.value
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Leave type usage */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold mb-4">Leave Type Usage</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading usage...
            </div>
          ) : !stats || stats.leaveTypeUsage.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No approved leave recorded yet this year.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.leaveTypeUsage.map((item: any, i: number) => {
                const pct = item.percentage ?? 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{item.leaveType}</span>
                      <span className="text-slate-500 font-bold">
                        {item.days} days ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Balance summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold mb-4">Balance Summary</h2>
          <div className="space-y-3">
            <SummaryRow
              label="Total Accrued"
              value={stats?.totalAccruedDays ?? 0}
              loading={loading}
            />
            <SummaryRow
              label="Total Availed"
              value={stats?.totalAvailedDays ?? 0}
              loading={loading}
            />
            <SummaryRow
              label="Total Lapsed"
              value={stats?.totalLapsedDays ?? 0}
              loading={loading}
            />
            <SummaryRow
              label="Avg Balance / Employee"
              value={stats?.averageLeaveBalance ?? 0}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold mb-4">Manage Leave</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-center"
              >
                <Icon className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        ) : (
          `${Math.round(value * 100) / 100}`
        )}
      </span>
    </div>
  );
}
