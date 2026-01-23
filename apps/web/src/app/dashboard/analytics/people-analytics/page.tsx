"use client";

import React, { useState } from 'react';
import {
  Users, TrendingUp, TrendingDown, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Globe, Building2
} from 'lucide-react';

const metrics = [
  { label: 'Total Headcount', value: '1,234', change: '+12', trend: 'up', period: 'vs last quarter' },
  { label: 'Attrition Rate', value: '2.4%', change: '-0.5%', trend: 'down', period: 'vs last quarter' },
  { label: 'Avg Tenure', value: '3.2 years', change: '+0.1', trend: 'up', period: 'vs last year' },
  { label: 'Gender Ratio', value: '58/42', change: '+2%', trend: 'up', period: 'women improved' },
];

const departmentData = [
  { name: 'Engineering', headcount: 412, attrition: '1.8%', avgTenure: '2.8y', openRoles: 15 },
  { name: 'Sales', headcount: 234, attrition: '3.2%', avgTenure: '2.1y', openRoles: 8 },
  { name: 'Marketing', headcount: 156, attrition: '2.5%', avgTenure: '3.5y', openRoles: 3 },
  { name: 'Operations', headcount: 198, attrition: '1.2%', avgTenure: '4.1y', openRoles: 5 },
  { name: 'HR', headcount: 67, attrition: '0.8%', avgTenure: '3.8y', openRoles: 2 },
  { name: 'Finance', headcount: 89, attrition: '1.5%', avgTenure: '4.5y', openRoles: 1 },
  { name: 'Product', headcount: 78, attrition: '2.1%', avgTenure: '2.5y', openRoles: 11 },
];

const turnoverReasons = [
  { reason: 'Better Opportunity', percentage: 35 },
  { reason: 'Compensation', percentage: 25 },
  { reason: 'Work-Life Balance', percentage: 18 },
  { reason: 'Management', percentage: 12 },
  { reason: 'Career Growth', percentage: 10 },
];

export default function PeopleAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('quarter');

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{metric.value}</p>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${
                metric.trend === 'up' ? 'text-emerald-500' : 'text-coral-alert'
              }`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
            <p className="text-[10px] text-silver-mist mt-1">{metric.period}</p>
          </div>
        ))}
      </div>

      {/* Department Breakdown */}
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
                <tr key={dept.name} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                  <td className="px-4 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">{dept.headcount}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`font-medium ${parseFloat(dept.attrition) > 2.5 ? 'text-coral-alert' : 'text-emerald-500'}`}>{dept.attrition}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-silver-mist">{dept.avgTenure}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className="px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full text-xs font-medium">{dept.openRoles}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turnover Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Top Turnover Reasons</h3>
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
        </div>

        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Predictive Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-coral-alert/5 border border-coral-alert/20 rounded-lg">
              <p className="text-xs font-medium text-coral-alert">High Risk - 3 employees</p>
              <p className="text-[11px] text-silver-mist mt-1">Engineering team members showing disengagement signals</p>
            </div>
            <div className="p-3 bg-sunset-amber/5 border border-sunset-amber/20 rounded-lg">
              <p className="text-xs font-medium text-sunset-amber">Medium Risk - 7 employees</p>
              <p className="text-[11px] text-silver-mist mt-1">Below market compensation in Sales department</p>
            </div>
            <div className="p-3 bg-neural-mint/5 border border-neural-mint/20 rounded-lg">
              <p className="text-xs font-medium text-neural-mint">Positive Trend</p>
              <p className="text-[11px] text-silver-mist mt-1">Overall engagement score up 5 points this quarter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
