"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, TrendingDown, BarChart3, Clock, Calendar, Award, Loader2
} from 'lucide-react';

interface TeamMetrics {
  totalHeadcount: number;
  activeEmployees: number;
  attritionRate: number;
  avgPerformanceRating: number;
  attendanceRate: number;
  totalLeavesTaken: number;
  pendingLeaveRequests: number;
  lateComings: number;
  overtimeHours: number;
}

interface PerformanceItem {
  rating: number;
  label: string;
  count: number;
  percentage: number;
}

interface OvertimeItem {
  name: string;
  hours: number;
}

interface AnalyticsData {
  period: string;
  teamMetrics: TeamMetrics;
  performanceDistribution: PerformanceItem[];
  overtimeData: OvertimeItem[];
  leaveUtilization: {
    totalLeavesTaken: number;
    onLeaveToday: number;
  };
}

export default function TeamAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  async function fetchAnalytics(selectedPeriod: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/analytics?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-silver-mist">Loading analytics...</span>
      </div>
    );
  }

  const metrics = analytics?.teamMetrics;

  const kpis = [
    { label: 'Team Headcount', value: String(metrics?.totalHeadcount || 0), change: `${metrics?.activeEmployees || 0} active`, trend: 'up' },
    { label: 'Attrition Rate', value: `${metrics?.attritionRate || 0}%`, change: '', trend: (metrics?.attritionRate || 0) > 10 ? 'up' : 'down' },
    { label: 'Avg Performance', value: `${metrics?.avgPerformanceRating || 0}/5`, change: '', trend: 'up' },
    { label: 'Attendance Rate', value: `${metrics?.attendanceRate || 0}%`, change: `${metrics?.lateComings || 0} late`, trend: 'up' },
  ];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Team Analytics</h1>
          <p className="text-sm text-silver-mist mt-1">Key metrics and trends for your team</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-silver-mist">Updating analytics...</span>
        </div>
      ) : !analytics ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">No analytics data available</p>
          <p className="text-xs text-slate-400 mt-1">Data will appear once team members are assigned</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((metric) => (
              <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-2xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
                  {metric.change && (
                    <span className="text-xs font-medium text-silver-mist">
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {analytics.performanceDistribution && analytics.performanceDistribution.length > 0 && (
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
                <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-celestial-indigo" /> Performance Distribution
                </h3>
                <div className="space-y-3">
                  {analytics.performanceDistribution.map((item) => (
                    <div key={item.rating} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-black dark:text-pearl">{item.label}</span>
                        <span className="text-silver-mist">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                        <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sunset-amber" /> Overtime This Period
              </h3>
              {analytics.overtimeData && analytics.overtimeData.length > 0 ? (
                <div className="space-y-3">
                  {analytics.overtimeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">{item.name}</span>
                      <span className="text-sm font-bold text-sunset-amber">{item.hours}h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-silver-mist text-center py-6">No overtime logged this period</p>
              )}

              <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-silver-mist">Total Team Overtime</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{metrics?.overtimeHours || 0}h</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neural-mint" /> Leave Overview
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <p className="text-xs text-silver-mist">Total Leaves Taken</p>
                  <p className="text-lg font-bold text-celestial-indigo mt-1">{analytics.leaveUtilization?.totalLeavesTaken || 0}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <p className="text-xs text-silver-mist">Attendance Rate</p>
                  <p className="text-lg font-bold text-neural-mint mt-1">{metrics?.attendanceRate || 0}%</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <p className="text-xs text-silver-mist">Pending Requests</p>
                  <p className="text-lg font-bold text-sunset-amber mt-1">{metrics?.pendingLeaveRequests || 0}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <p className="text-xs text-silver-mist">Late Comings</p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">{metrics?.lateComings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-celestial-indigo" /> Team Composition
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <span className="text-sm text-silver-mist">Total Headcount</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{metrics?.totalHeadcount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <span className="text-sm text-silver-mist">Active Employees</span>
                  <span className="text-sm font-bold text-emerald-500">{metrics?.activeEmployees || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <span className="text-sm text-silver-mist">Attrition Rate</span>
                  <span className={`text-sm font-bold ${(metrics?.attritionRate || 0) > 10 ? 'text-coral-alert' : 'text-neural-mint'}`}>{metrics?.attritionRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

