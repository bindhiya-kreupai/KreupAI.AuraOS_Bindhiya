"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, TrendingDown, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Globe, Building2, Loader2
} from 'lucide-react';

interface DeptData {
  department: string;
  headcount: number;
  avgTenure: number;
  avgSalary: number;
  turnoverRate: number;
  openRoles: number;
}

export default function PeopleAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('quarter');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { label: 'Total Headcount', value: '--', change: '--', trend: 'up' as const, period: '' },
    { label: 'Attrition Rate', value: '--', change: '--', trend: 'down' as const, period: '' },
    { label: 'Avg Tenure', value: '--', change: '--', trend: 'up' as const, period: '' },
    { label: 'Open Positions', value: '--', change: '--', trend: 'up' as const, period: '' },
  ]);
  const [departmentData, setDepartmentData] = useState<DeptData[]>([]);
  const [turnoverReasons, setTurnoverReasons] = useState<{ reason: string; percentage: number }[]>([]);
  const [riskData, setRiskData] = useState<{ high: number; medium: number }>({ high: 0, medium: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [peopleRes, turnoverRes, predictiveRes] = await Promise.all([
        fetch('/api/v1/analytics/people').then((r) => r.json()).catch(() => null),
        fetch('/api/v1/analytics/turnover').then((r) => r.json()).catch(() => null),
        fetch('/api/v1/analytics/predictive').then((r) => r.json()).catch(() => null),
      ]);

      const people = peopleRes?.data;
      const turnover = turnoverRes?.data;
      const predictive = predictiveRes?.data;

      if (people) {
        setMetrics([
          { label: 'Total Headcount', value: people.workforce.totalEmployees.toLocaleString(), change: `+${people.workforce.newHiresThisMonth}`, trend: 'up', period: 'this month' },
          { label: 'Attrition Rate', value: `${people.retention.voluntaryTurnoverRate}%`, change: `${people.retention.voluntaryTurnoverRate}%`, trend: 'down', period: 'voluntary' },
          { label: 'Avg Tenure', value: `${people.workforce.averageTenure} years`, change: '', trend: 'up', period: '' },
          { label: 'Open Positions', value: String(people.workforce.openPositions), change: '', trend: 'up', period: '' },
        ]);

        setDepartmentData(
          people.departmentBreakdown.map((d: any) => ({
            department: d.department,
            headcount: d.headcount,
            avgTenure: d.avgTenure,
            avgSalary: d.avgSalary,
            turnoverRate: d.turnoverRate,
            openRoles: d.openRoles,
          }))
        );
      }

      if (turnover?.reasons) {
        setTurnoverReasons(turnover.reasons.slice(0, 5).map((r: any) => ({ reason: r.reason, percentage: r.percentage })));
      }

      if (predictive?.attritionRisk) {
        setRiskData({
          high: predictive.attritionRisk.highRisk.count,
          medium: predictive.attritionRisk.mediumRisk.count,
        });
      }
    } catch (error) {
      console.error('Error loading people analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">People Analytics</h1>
          <p className="text-sm text-silver-mist mt-1">Workforce insights and predictive analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg p-1">
          {['month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                timeRange === range ? 'bg-celestial-indigo text-white' : 'text-silver-mist hover:bg-slate-50 dark:hover:bg-deep-cosmos'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
              {metric.change && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-500' : 'text-coral-alert'
                }`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </div>
              )}
            </div>
            <p className="text-[10px] text-silver-mist mt-1">{metric.period}</p>
          </div>
        ))}
      </div>

      {departmentData.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-celestial-indigo" />
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Department Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-right px-4 py-3 font-medium">Headcount</th>
                  <th className="text-right px-4 py-3 font-medium">Attrition</th>
                  <th className="text-right px-4 py-3 font-medium">Avg Tenure</th>
                  <th className="text-right px-4 py-3 font-medium">Open Roles</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                    <td className="px-4 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">{dept.headcount}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-medium ${dept.turnoverRate > 15 ? 'text-coral-alert' : dept.turnoverRate > 10 ? 'text-sunset-amber' : 'text-emerald-500'}`}>{dept.turnoverRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-silver-mist">{dept.avgTenure}y</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full text-xs font-medium">{dept.openRoles}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {departmentData.length === 0 && !loading && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <Users className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No department data available yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Top Turnover Reasons</h3>
          {turnoverReasons.length > 0 ? (
            <div className="space-y-3">
              {turnoverReasons.map((item) => (
                <div key={item.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-black dark:text-pearl font-medium">{item.reason}</span>
                    <span className="text-silver-mist">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-celestial-indigo to-purple-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-silver-mist text-center py-4">No turnover data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Predictive Insights</h3>
          <div className="space-y-3">
            {riskData.high > 0 && (
              <div className="p-3 bg-coral-alert/5 border border-coral-alert/20 rounded-lg">
                <p className="text-xs font-medium text-coral-alert">High Risk - {riskData.high} employee{riskData.high > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-silver-mist mt-1">Employees identified with high attrition risk based on tenure and performance</p>
              </div>
            )}
            {riskData.medium > 0 && (
              <div className="p-3 bg-sunset-amber/5 border border-sunset-amber/20 rounded-lg">
                <p className="text-xs font-medium text-sunset-amber">Medium Risk - {riskData.medium} employee{riskData.medium > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-silver-mist mt-1">Employees with moderate attrition risk indicators</p>
              </div>
            )}
            {riskData.high === 0 && riskData.medium === 0 && (
              <div className="p-3 bg-neural-mint/5 border border-neural-mint/20 rounded-lg">
                <p className="text-xs font-medium text-neural-mint">Low Risk</p>
                <p className="text-[11px] text-silver-mist mt-1">No significant attrition risks detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
