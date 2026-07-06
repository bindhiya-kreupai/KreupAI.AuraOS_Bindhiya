'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, TrendingUp, Globe, PieChart, Download, Filter, Loader2 } from 'lucide-react';
import {
  Pie,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getDiversityMetrics, type DiversityMetrics } from '../dei-api';
import { useDeiToast } from '../dei-ui';

const PALETTE = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#94a3b8',
  '#0ea5e9',
];

export default function DiversityMetricsPage() {
  const [metrics, setMetrics] = useState<DiversityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLowTenureOnly, setShowLowTenureOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDiversityMetrics();
      setMetrics(data);
    } catch {
      notify('error', 'Failed to load diversity metrics.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = useCallback(() => {
    if (!metrics) return;
    setExporting(true);
    try {
      const rows: string[] = ['Section,Category,Value,Percentage'];
      metrics.departmentDistribution.forEach((d) =>
        rows.push(`Department,${d.name},${d.value},${d.percentage}%`)
      );
      metrics.gradeDistribution.forEach((d) =>
        rows.push(`Grade,${d.name},${d.value},${d.percentage}%`)
      );
      metrics.tenureDistribution.forEach((d) => rows.push(`Tenure,${d.name},${d.value},`));
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diversity-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      notify('success', 'Diversity report exported.');
    } catch {
      notify('error', 'Export failed.');
    } finally {
      setExporting(false);
    }
  }, [metrics, notify]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const deptData = (metrics?.departmentDistribution ?? []).map((d, i) => ({
    name: d.name,
    value: d.value,
    color: PALETTE[i % PALETTE.length],
  }));
  const gradeData = (metrics?.gradeDistribution ?? []).map((d, i) => ({
    name: d.name,
    value: d.value,
    color: PALETTE[i % PALETTE.length],
  }));
  const tenureData = (metrics?.tenureDistribution ?? []).filter(
    (d) => !showLowTenureOnly || d.name === '< 1 yr' || d.name === '1-3 yrs'
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="w-6 h-6 text-indigo-500" />
            Diversity Metrics
          </h1>
          <p className="text-slate-500 text-sm">Real-time statistics on workforce demographics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLowTenureOnly((v) => !v)}
            className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-2 transition-colors ${
              showLowTenureOnly
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" /> {showLowTenureOnly ? 'Early Tenure' : 'Filter'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !metrics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<Users className="w-6 h-6" />}
          tint="indigo"
          label="Total Employees"
          value={(metrics?.totalEmployees ?? 0).toLocaleString()}
        />
        <KpiCard
          icon={<TrendingUp className="w-6 h-6" />}
          tint="emerald"
          label="Diversity Score"
          value={`${metrics?.diversityScore ?? 0}`}
        />
        <KpiCard
          icon={<Users className="w-6 h-6" />}
          tint="pink"
          label="Avg Tenure (yrs)"
          value={`${metrics?.avgTenure ?? 0}`}
        />
        <KpiCard
          icon={<Globe className="w-6 h-6" />}
          tint="amber"
          label="Groups Tracked"
          value={`${metrics?.nationalities ?? 0}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[400px]">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4">Department Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={deptData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4">Grade / Level Breakdown</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tenure Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
        <h3 className="font-bold text-lg mb-4">Workforce by Tenure</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tenureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12 }} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" name="Employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: 'indigo' | 'emerald' | 'pink' | 'amber';
  label: string;
  value: string;
}) {
  const tints: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${tints[tint]}`}>{icon}</div>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
