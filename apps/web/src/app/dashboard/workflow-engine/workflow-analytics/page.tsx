'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Users,
  Timer,
  Target,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { WorkflowAnalyticsService } from '../services';
import type { WorkflowMetrics, TrendData } from '../types';
import { toast } from 'sonner';

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
];

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  failed: 'bg-red-400',
  cancelled: 'bg-slate-400',
  inProgress: 'bg-blue-500',
  initiated: 'bg-cyan-500',
  pendingApproval: 'bg-amber-500',
  paused: 'bg-purple-500',
};

const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  failed: 'Failed',
  cancelled: 'Cancelled',
  inProgress: 'In Progress',
  initiated: 'Initiated',
  pendingApproval: 'Pending Approval',
  paused: 'Paused',
};

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${(s / 60).toFixed(1)}m`;
  return `${(s / 3600).toFixed(1)}h`;
}

export default function WorkflowAnalyticsPage() {
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async (range: string, showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await WorkflowAnalyticsService.getMetrics(range);
      setMetrics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(timeRange);
  }, [timeRange, fetchMetrics]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const handleExport = () => {
    if (!metrics) return;
    const csv = [
      'Metric,Value',
      `Total Executions,${metrics.totalExecutions}`,
      `Successful Executions,${metrics.successfulExecutions}`,
      `Failed Executions,${metrics.failedExecutions}`,
      `Cancelled Executions,${metrics.cancelledExecutions}`,
      `Success Rate,${metrics.successRate}%`,
      `Average Execution Time,${formatSeconds(metrics.averageExecutionTime)}`,
      `Median Execution Time,${formatSeconds(metrics.medianExecutionTime)}`,
      `Total Tasks,${metrics.totalTasks}`,
      `Completed Tasks,${metrics.completedTasks}`,
      `Overdue Tasks,${metrics.overdueTasks}`,
      `Task Completion Rate,${metrics.taskCompletionRate}%`,
      `Total Approvals,${metrics.totalApprovals}`,
      `Approval Rate,${metrics.approvalRate}%`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-500" />
            Workflow Analytics
          </h1>
          <p className="text-slate-500 text-sm">
            Insights into process efficiency and bottlenecks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            {TIME_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchMetrics(timeRange, true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!m || m.totalExecutions === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No Analytics Data</h3>
          <p className="text-sm text-slate-400">Start running workflows to generate analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total Executions"
              value={m.totalExecutions}
              icon={<Activity className="w-4 h-4" />}
              color="text-blue-500"
              subtitle={`${m.successRate}% success rate`}
              subColor="text-emerald-500"
            />
            <MetricCard
              label="Avg. Completion"
              value={formatSeconds(m.averageExecutionTime)}
              icon={<Clock className="w-4 h-4" />}
              color="text-violet-500"
              subtitle={`Median: ${formatSeconds(m.medianExecutionTime)}`}
              subColor="text-slate-500"
            />
            <MetricCard
              label="Failed Executions"
              value={m.failedExecutions}
              icon={<XCircle className="w-4 h-4" />}
              color="text-red-500"
              subtitle={
                m.totalExecutions > 0
                  ? `${((m.failedExecutions / m.totalExecutions) * 100).toFixed(1)}% failure rate`
                  : '0% failure rate'
              }
              subColor="text-red-500"
            />
            <MetricCard
              label="Active Now"
              value={m.runningExecutions}
              icon={<Activity className="w-4 h-4" />}
              color="text-cyan-500"
              subtitle={`${m.pendingExecutions} pending approval`}
              subColor="text-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total Tasks"
              value={m.totalTasks}
              icon={<Target className="w-4 h-4" />}
              color="text-emerald-500"
              subtitle={`${m.taskCompletionRate}% completed`}
              subColor="text-emerald-500"
            />
            <MetricCard
              label="Overdue Tasks"
              value={m.overdueTasks}
              icon={<AlertTriangle className="w-4 h-4" />}
              color="text-amber-500"
              subtitle={
                m.totalTasks > 0
                  ? `${((m.overdueTasks / m.totalTasks) * 100).toFixed(1)}% overdue`
                  : '0% overdue'
              }
              subColor="text-amber-500"
            />
            <MetricCard
              label="Approval Rate"
              value={`${m.approvalRate}%`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="text-indigo-500"
              subtitle={`${m.totalApprovals} total approvals`}
              subColor="text-slate-500"
            />
            <MetricCard
              label="Avg. Approval Time"
              value={formatSeconds(m.averageApprovalTime * 3600)}
              icon={<Timer className="w-4 h-4" />}
              color="text-pink-500"
              subtitle={`${m.escalationRate}% escalation rate`}
              subColor="text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-4">Execution Status Breakdown</h3>
              <StatusChart
                data={{
                  Approved: m.successfulExecutions,
                  Rejected: m.cancelledExecutions,
                  Failed: m.failedExecutions,
                  'In Progress': m.runningExecutions,
                  'Pending Approval': m.pendingExecutions,
                  Paused: m.pausedExecutions,
                }}
                total={m.totalExecutions}
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <PerfRow
                  label="Avg. Execution"
                  value={formatSeconds(m.averageExecutionTime)}
                  benchmark="Target: <5m"
                  good={m.averageExecutionTime < 300}
                />
                <PerfRow
                  label="Median Execution"
                  value={formatSeconds(m.medianExecutionTime)}
                  benchmark="Target: <3m"
                  good={m.medianExecutionTime < 180}
                />
                <PerfRow
                  label="Min Execution"
                  value={formatSeconds(m.minExecutionTime)}
                  benchmark=""
                  good
                />
                <PerfRow
                  label="Max Execution"
                  value={formatSeconds(m.maxExecutionTime)}
                  benchmark="Target: <30m"
                  good={m.maxExecutionTime < 1800}
                />
                <PerfRow
                  label="Avg. Task Completion"
                  value={formatSeconds(m.averageTaskCompletionTime)}
                  benchmark="Target: <1h"
                  good={m.averageTaskCompletionTime < 3600}
                />
                <PerfRow
                  label="Avg. Approval Time"
                  value={`${m.averageApprovalTime}h`}
                  benchmark="Target: <4h"
                  good={m.averageApprovalTime < 4}
                />
              </div>
            </div>
          </div>

          {m.executionTrends.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-4">Execution Trends</h3>
              <TrendChart data={m.executionTrends} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {m.topWorkflowsByUsage.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-sm mb-3">Top Workflows by Usage</h3>
                <div className="space-y-2">
                  {m.topWorkflowsByUsage.map((w, i) => {
                    const maxCount = m.topWorkflowsByUsage[0]?.count || 1;
                    return (
                      <div key={w.workflowId} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{w.workflowName}</div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 rounded-full h-1.5 transition-all"
                              style={{ width: `${(w.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{w.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {m.topWorkflowsByFailure.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-sm mb-3">Top Workflows by Failure</h3>
                <div className="space-y-2">
                  {m.topWorkflowsByFailure.map((w, i) => {
                    const maxCount = m.topWorkflowsByFailure[0]?.count || 1;
                    return (
                      <div key={w.workflowId} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{w.workflowName}</div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-red-500 rounded-full h-1.5 transition-all"
                              style={{ width: `${(w.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-red-500">{w.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {m.topWorkflowsByUsage.length === 0 && m.topWorkflowsByFailure.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-sm mb-3">Workflow Breakdown</h3>
              <p className="text-sm text-slate-400">
                Run more workflows to see usage and failure breakdowns.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  subtitle,
  subColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {subtitle && (
        <div className={`text-xs font-bold mt-1 ${subColor || 'text-slate-500'}`}>{subtitle}</div>
      )}
    </div>
  );
}

function StatusChart({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0)
    return <p className="text-sm text-slate-400 text-center py-8">No data</p>;

  const colors: Record<string, string> = {
    Approved: 'bg-emerald-500',
    Rejected: 'bg-red-400',
    Failed: 'bg-red-500',
    'In Progress': 'bg-blue-500',
    'Pending Approval': 'bg-amber-500',
    Paused: 'bg-purple-500',
  };

  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 w-28 shrink-0">{label}</span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 relative overflow-hidden">
              <div
                className={`${colors[label] || 'bg-slate-400'} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              >
                {pct > 8 && <span className="text-[10px] font-bold text-white">{count}</span>}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 w-16 text-right">
              {count} ({pct.toFixed(1)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ data }: { data: TrendData[] }) {
  if (!data || data.length === 0)
    return <p className="text-sm text-slate-400 text-center py-8">No trend data</p>;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const sorted = [...data].sort((a, b) => a.period.localeCompare(b.period));
  const display = sorted.slice(-30);

  return (
    <div className="flex items-end gap-1 h-[150px]">
      {display.map((d, i) => {
        const h = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.period}: {d.value}
            </div>
            <div
              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
              style={{ height: `${Math.max(h, 2)}%` }}
            />
            {display.length <= 15 && (
              <span className="text-[9px] text-slate-400 truncate w-full text-center">
                {d.period.slice(5)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PerfRow({
  label,
  value,
  benchmark,
  good,
}: {
  label: string;
  value: string;
  benchmark: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {benchmark && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${good ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}
          >
            {good ? 'Good' : 'Review'}
          </span>
        )}
      </div>
    </div>
  );
}
