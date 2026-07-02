'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Gauge, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { HelpdeskAnalyticsApi, type AnalyticsDTO } from '../services';

interface KpiCard {
  title: string;
  value: string;
}

function BarRows({
  rows,
  emptyLabel,
}: {
  rows: { label: string; count: number }[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }

  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
        return (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="capitalize">{row.label}</span>
              <span className="tabular-nums">{row.count}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PerformanceMetricsPage() {
  const [data, setData] = useState<AnalyticsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await HelpdeskAnalyticsApi.get();
      setData(result);
    } catch {
      setError('Failed to load performance metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const total = data?.total ?? 0;
  const open = data?.open ?? 0;
  const resolved = data?.resolved ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const windowDays = data?.windowDays ?? 0;

  const kpis: KpiCard[] = [
    { title: 'Total Tickets', value: String(total) },
    { title: 'Open', value: String(open) },
    { title: 'Resolved', value: String(resolved) },
    { title: 'Resolution Rate', value: `${resolutionRate}%` },
  ];

  const categoryRows = (data?.byCategory ?? []).map((item) => ({
    label: item.category,
    count: item.count,
  }));
  const priorityRows = (data?.byPriority ?? []).map((item) => ({
    label: item.priority,
    count: item.count,
  }));

  const updatedAt = data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : null;

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-col space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex shrink-0 flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Gauge className="h-6 w-6 text-indigo-500" />
            Performance Metrics
          </h1>
          <p className="text-sm text-slate-500">Key Performance Indicators for the HRSD team.</p>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt ? <span className="text-xs text-slate-400">Updated {updatedAt}</span> : null}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">{kpi.title}</h3>
              <div className="text-3xl font-bold">{kpi.value}</div>
              <p className="mt-2 text-xs text-slate-400">Last {windowDays} days</p>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">
              Tickets by Category
            </h3>
            <BarRows rows={categoryRows} emptyLabel="No category data available." />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">
              Tickets by Priority
            </h3>
            <BarRows rows={priorityRows} emptyLabel="No priority data available." />
          </div>
        </div>
      )}
    </div>
  );
}
