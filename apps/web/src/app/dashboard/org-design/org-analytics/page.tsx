'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BarChart2, PieChart, Layers, Users, Globe, Loader2, AlertCircle } from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { APIClient } from '@/lib/api-client';

type DistributionRow = {
  name: string;
  count: number;
  percentage: number;
};

interface OrgAnalytics {
  totalEmployees: number;
  totalPositions: number;
  totalDepartments: number;
  totalLocations: number;
  vacancyRate: number;
  averageSpanOfControl: number;
  employeesByDepartment: DistributionRow[];
  employeesByLocation: DistributionRow[];
  employeesByGrade: DistributionRow[];
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#64748b', '#0ea5e9', '#8b5cf6'];

export default function OrgAnalyticsPage() {
  const [analytics, setAnalytics] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/analytics');
      const data = APIClient.unwrapItem<OrgAnalytics>(res);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deptData = (analytics?.employeesByDepartment ?? []).slice(0, 7);

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-500" />
            Org Analytics
          </h1>
          <p className="text-slate-500 text-sm">
            Live organization demographics and structure metrics.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading analytics...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Total Headcount"
              value={analytics.totalEmployees}
            />
            <StatCard
              icon={<Layers className="w-4 h-4" />}
              label="Total Positions"
              value={analytics.totalPositions}
              sub={`${analytics.vacancyRate}% vacant`}
            />
            <StatCard
              icon={<Globe className="w-4 h-4" />}
              label="Locations"
              value={analytics.totalLocations}
              sub={`${analytics.totalDepartments} departments`}
            />
            <StatCard
              icon={<PieChart className="w-4 h-4" />}
              label="Avg Span of Control"
              value={analytics.averageSpanOfControl}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-6">Headcount by Department</h3>
              <div className="h-64">
                {deptData.length === 0 ? (
                  <EmptyState label="No department data" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                      />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
              <h3 className="font-bold text-lg mb-6">Grade Distribution</h3>
              <div className="flex-1 flex items-center justify-center">
                {analytics.employeesByGrade.length === 0 ? (
                  <EmptyState label="No grade data" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={analytics.employeesByGrade.slice(0, 7)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                      >
                        {analytics.employeesByGrade.slice(0, 7).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {analytics.employeesByGrade.slice(0, 7).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    ></div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{d.name}</span>
                    <span className="text-slate-400">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
        {icon} {label}
      </div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      {sub ? <div className="text-xs text-slate-400 mt-1">{sub}</div> : null}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-slate-400">{label}</div>
  );
}
