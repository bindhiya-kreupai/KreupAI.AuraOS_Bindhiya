'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Scale, AlertTriangle, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPayEquity, type PayEquityData } from '../dei-api';
import { useDeiToast } from '../dei-ui';

export default function PayEquityPage() {
  const [data, setData] = useState<PayEquityData | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await getPayEquity());
    } catch {
      notify('error', 'Failed to load pay equity analysis.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const chartData = data?.chartData ?? [];
  const summary = data?.summary;
  const genderDataUnavailable = summary?.note === 'gender_pay_data_unavailable';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-pink-500" />
            Pay Equity Analysis
          </h1>
          <p className="text-slate-500 text-sm">
            Average compensation across grades, derived from live payroll data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Overall Pay Gap</div>
          <div className="text-3xl font-bold text-rose-500">{summary?.overallGap ?? 0}%</div>
          <div className="text-sm text-slate-500 mt-1">Across gender groups</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Adjusted Pay Gap</div>
          <div className="text-3xl font-bold text-emerald-600">{summary?.adjustedGap ?? 0}%</div>
          <div className="text-sm text-slate-500 mt-1">After role / tenure controls</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Employees Analysed</div>
          <div className="text-3xl font-bold text-indigo-600">
            {(data?.analysedEmployees ?? 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 mt-1">With active salary structures</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
        <h3 className="font-bold text-lg mb-6">Average Compensation by Grade</h3>
        <div className="flex-1 w-full min-h-0">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No salary structures available to analyse.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="role" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  formatter={(val: any) => val.toLocaleString()}
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Legend />
                <Bar
                  dataKey="avg"
                  name="Avg Compensation"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-600" /> Analysis Notes
        </h3>
        <div className="space-y-3 text-sm text-indigo-800 dark:text-indigo-300">
          <p>
            Compensation is aggregated by grade from active employee salary structures within your
            tenant.
          </p>
          {genderDataUnavailable && (
            <p>
              Gender-linked pay data is not recorded on the employee profile, so the gender pay gap
              is reported as 0%. Capture gender demographics to unlock gap-level insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
