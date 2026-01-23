"use client";

import React from 'react';
import { TrendingDown, Users, AlertTriangle, BarChart3, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface DeptTurnover {
  department: string;
  rate: number;
  headcount: number;
  voluntary: number;
  involuntary: number;
  trend: 'up' | 'down' | 'stable';
}

const deptData: DeptTurnover[] = [
  { department: 'Engineering', rate: 8.2, headcount: 120, voluntary: 7, involuntary: 3, trend: 'down' },
  { department: 'Sales', rate: 18.5, headcount: 65, voluntary: 10, involuntary: 2, trend: 'up' },
  { department: 'Marketing', rate: 12.0, headcount: 40, voluntary: 4, involuntary: 1, trend: 'stable' },
  { department: 'Operations', rate: 6.5, headcount: 85, voluntary: 4, involuntary: 2, trend: 'down' },
  { department: 'HR', rate: 5.0, headcount: 20, voluntary: 1, involuntary: 0, trend: 'stable' },
  { department: 'Finance', rate: 9.8, headcount: 30, voluntary: 2, involuntary: 1, trend: 'up' },
];

const exitReasons = [
  { reason: 'Better compensation elsewhere', count: 12, percent: 30 },
  { reason: 'Limited growth opportunities', count: 9, percent: 22 },
  { reason: 'Work-life balance', count: 7, percent: 17 },
  { reason: 'Management issues', count: 5, percent: 12 },
  { reason: 'Relocation', count: 4, percent: 10 },
  { reason: 'Career change', count: 3, percent: 9 },
];

const monthlyTrend = [
  { month: 'Jul', exits: 3 },
  { month: 'Aug', exits: 5 },
  { month: 'Sep', exits: 4 },
  { month: 'Oct', exits: 6 },
  { month: 'Nov', exits: 3 },
  { month: 'Dec', exits: 4 },
  { month: 'Jan', exits: 2 },
];

export default function TurnoverAnalysisPage() {
  const overallRate = 10.2;
  const industryAvg = 13.5;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Turnover Analysis</h1>
        <p className="text-sm text-silver-mist mt-1">Understand attrition patterns and retention insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Overall Turnover</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{overallRate}%</p>
          <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" /> -2.1% vs last year</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Industry Average</p>
          <p className="text-2xl font-bold text-silver-mist mt-1">{industryAvg}%</p>
          <p className="text-[10px] text-emerald-600">Below industry avg</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Voluntary Exits (YTD)</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">28</p>
          <p className="text-[10px] text-silver-mist">Regrettable: 18</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Tenure at Exit</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">2.4 yrs</p>
          <p className="text-[10px] text-silver-mist">First-year: 35%</p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Monthly Exits (Last 7 Months)</h3>
        <div className="flex items-end gap-3 h-32">
          {monthlyTrend.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-ink-black dark:text-pearl">{m.exits}</span>
              <div className="w-full flex flex-col items-center justify-end h-20">
                <div
                  className="w-full rounded-t bg-coral-alert/70"
                  style={{ height: `${(m.exits / 7) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-silver-mist">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Department Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-right px-5 py-3 font-medium">Headcount</th>
                <th className="text-right px-5 py-3 font-medium">Rate</th>
                <th className="text-right px-5 py-3 font-medium">Voluntary</th>
                <th className="text-right px-5 py-3 font-medium">Involuntary</th>
                <th className="text-center px-5 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map((dept) => (
                <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                  <td className="px-5 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</td>
                  <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.headcount}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    <span className={`font-bold ${dept.rate > 15 ? 'text-coral-alert' : dept.rate > 10 ? 'text-sunset-amber' : 'text-emerald-600'}`}>
                      {dept.rate}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.voluntary}</td>
                  <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.involuntary}</td>
                  <td className="px-5 py-3 text-center">
                    {dept.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-coral-alert mx-auto" />}
                    {dept.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-emerald-600 mx-auto" />}
                    {dept.trend === 'stable' && <span className="text-xs text-silver-mist">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exit Reasons */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Top Exit Reasons</h3>
        <div className="space-y-3">
          {exitReasons.map((item) => (
            <div key={item.reason} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink-black dark:text-pearl">{item.reason}</span>
                  <span className="text-xs text-silver-mist">{item.count} exits ({item.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="h-full bg-coral-alert/60 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">High Risk Department</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
            Sales department turnover (18.5%) is significantly above the company average. Consider retention interventions including compensation review and career development programs.
          </p>
        </div>
      </div>
    </div>
  );
}
