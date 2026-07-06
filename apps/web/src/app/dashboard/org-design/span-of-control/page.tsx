'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { GitCommit, ArrowRight, Users, AlertCircle, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { APIClient } from '@/lib/api-client';

interface SpanDistribution {
  reports: number;
  managers: number;
  status: 'too_narrow' | 'optimal' | 'too_wide';
}

interface DepartmentSpan {
  departmentId: string;
  departmentName: string;
  managerCount: number;
  averageSpan: number;
  totalPositions: number;
  status: string;
}

interface SpanAnalysis {
  overall: {
    totalManagers: number;
    averageSpan: number;
    medianSpan: number;
    minSpan: number;
    maxSpan: number;
    idealRange: { min: number; max: number };
    withinIdealRange: number;
    tooNarrow: number;
    tooWide: number;
  };
  distribution: SpanDistribution[];
  departmentAnalysis: DepartmentSpan[];
}

const STATUS_STYLE: Record<string, string> = {
  optimal: 'bg-emerald-100 text-emerald-600',
  too_wide: 'bg-amber-100 text-amber-600',
  too_narrow: 'bg-slate-100 text-slate-500',
  inefficient: 'bg-rose-100 text-rose-600',
};

export default function SpanOfControlPage() {
  const [data, setData] = useState<SpanAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/span');
      setData(APIClient.unwrapItem<SpanAnalysis>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load span analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const overall = data?.overall;

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-indigo-500 rotate-90" />
            Span of Control Analysis
          </h1>
          <p className="text-slate-500 text-sm">
            Evaluate management layers and direct report distribution.
          </p>
        </div>
        {overall ? (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
              Avg Span: {overall.averageSpan}
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
              Target: {overall.idealRange.min}-{overall.idealRange.max}
            </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Analyzing structure...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : data && overall ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-6">Manager Distribution by Direct Reports</h3>
              <div className="h-80 w-full">
                {data.distribution.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    No manager data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.distribution}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="reports"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                      />
                      <Bar dataKey="managers" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                      <ReferenceLine
                        x={overall.idealRange.min}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                      />
                      <ReferenceLine
                        x={overall.idealRange.max}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Under-managed</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {overall.tooNarrow} managers below the ideal minimum span. Consider merging
                      teams.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">Overloaded Managers</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {overall.tooWide} managers above the ideal maximum span. Risk of bottleneck.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm mb-4">
                  Overall Metrics
                </h4>
                <dl className="space-y-2 text-xs">
                  <Metric label="Total Managers" value={overall.totalManagers} />
                  <Metric label="Median Span" value={overall.medianSpan} />
                  <Metric label="Within Ideal Range" value={overall.withinIdealRange} />
                  <Metric label="Min / Max" value={`${overall.minSpan} / ${overall.maxSpan}`} />
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-sm">Department Breakdown</h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {data.departmentAnalysis.length} departments <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Managers</th>
                    <th className="px-6 py-3">Avg Span</th>
                    <th className="px-6 py-3">Positions</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.departmentAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No department data available
                      </td>
                    </tr>
                  ) : (
                    data.departmentAnalysis.map((row) => (
                      <tr
                        key={row.departmentId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 font-bold">{row.departmentName || 'Unnamed'}</td>
                        <td className="px-6 py-4">{row.managerCount}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{row.averageSpan}</td>
                        <td className="px-6 py-4">{row.totalPositions}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                              STATUS_STYLE[row.status] ?? 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {row.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/40 p-2 rounded-lg">
      <dt className="font-bold text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className="font-mono font-bold text-indigo-600">{value}</dd>
    </div>
  );
}
