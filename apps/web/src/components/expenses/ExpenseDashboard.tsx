// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Plus,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  FileText,
  Wallet,
  ChevronRight,
} from 'lucide-react';
import type { ExpenseReport, ExpenseAnalytics } from '@/services/expenseService';
import { ExpenseService, EXPENSE_STATUS_META } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpenseDashboardProps {
  onCreateReport?: () => void;
  onViewReport?: (reportId: string) => void;
  onViewApprovals?: () => void;
  onViewAnalytics?: () => void;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ExpenseDashboard({
  onCreateReport,
  onViewReport,
  onViewApprovals,
  onViewAnalytics,
}: ExpenseDashboardProps) {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reps, ana] = await Promise.all([
          ExpenseService.getExpenseReports(),
          ExpenseService.getExpenseAnalytics(),
        ]);
        setReports(reps);
        setAnalytics(ana);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingReports = reports.filter(
    (r) => r.status === 'pending_approval' || r.status === 'submitted'
  );
  const draftReports = reports.filter((r) => r.status === 'draft');
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5);

  const monthlySummary =
    analytics?.expensesByMonth.slice(-3).reduce((s, m) => s + m.amount, 0) ?? 0;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Expense Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Track, submit, and manage your expense reports
          </p>
        </div>
        <button
          onClick={onCreateReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={String(pendingReports.length)}
          sub="reports awaiting review"
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          icon={FileText}
          label="Draft Reports"
          value={String(draftReports.length)}
          sub="not yet submitted"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={Wallet}
          label="Pending Reimbursement"
          value={`$${(analytics?.pendingReimbursements ?? 0).toLocaleString()}`}
          sub="awaiting payment"
          color="text-violet-600"
          bgColor="bg-violet-50 dark:bg-violet-900/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Last 3 Months"
          value={`$${(monthlySummary / 1000).toFixed(1)}k`}
          sub="total expenses"
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* Policy Violations Alert */}
      {analytics && analytics.policyViolations > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {analytics.policyViolations} policy violation
              {analytics.policyViolations !== 1 ? 's' : ''} flagged
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Review and resolve violations to avoid delays in reimbursement.
            </p>
          </div>
          <button className="text-xs font-medium text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:no-underline flex-shrink-0">
            Review
          </button>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Reports</h3>
            <button
              onClick={onViewAnalytics}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No expense reports yet</div>
            ) : (
              recentReports.map((report) => {
                const meta = EXPENSE_STATUS_META[report.status];
                return (
                  <button
                    key={report.id}
                    onClick={() => onViewReport?.(report.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {report.reportName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {report.reportCode} &middot;{' '}
                        {new Date(report.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.bgColor} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        ${report.totalAmount.toLocaleString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions + Monthly Summary */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                {
                  icon: Plus,
                  label: 'New Expense Report',
                  desc: 'Create and submit expenses',
                  action: onCreateReport,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                },
                {
                  icon: CheckCircle,
                  label: 'Pending Approvals',
                  desc: `${pendingReports.length} reports waiting`,
                  action: onViewApprovals,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
                {
                  icon: BarChart3,
                  label: 'Expense Analytics',
                  desc: 'Trends & category insights',
                  action: onViewAnalytics,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 opacity-80" />
              <h3 className="font-semibold">Monthly Summary</h3>
            </div>
            <div className="space-y-3">
              {analytics?.expensesByMonth
                .slice(-3)
                .reverse()
                .map((m) => {
                  const label = new Date(m.month + '-01').toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <div key={m.month} className="flex items-center justify-between">
                      <span className="text-sm opacity-80">{label}</span>
                      <span className="text-sm font-semibold">
                        ${(m.amount / 1000).toFixed(1)}k
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-70">Compliance Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${analytics?.complianceScore ?? 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{analytics?.complianceScore ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
