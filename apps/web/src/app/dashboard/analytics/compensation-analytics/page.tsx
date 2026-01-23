"use client";

import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface PayBand {
  level: string;
  min: number;
  mid: number;
  max: number;
  avgActual: number;
  headcount: number;
}

const payBands: PayBand[] = [
  { level: 'Engineer I', min: 70000, mid: 85000, max: 100000, avgActual: 82000, headcount: 25 },
  { level: 'Engineer II', min: 90000, mid: 110000, max: 130000, avgActual: 105000, headcount: 45 },
  { level: 'Senior Engineer', min: 120000, mid: 140000, max: 160000, avgActual: 135000, headcount: 35 },
  { level: 'Staff Engineer', min: 150000, mid: 175000, max: 200000, avgActual: 168000, headcount: 15 },
  { level: 'Principal', min: 180000, mid: 210000, max: 240000, avgActual: 205000, headcount: 5 },
];

interface CompMetric {
  label: string;
  value: string;
  subtext: string;
  color: string;
}

const compMetrics: CompMetric[] = [
  { label: 'Total Comp Spend', value: '$42.5M', subtext: '+8% YoY', color: 'text-ink-black dark:text-pearl' },
  { label: 'Avg Salary', value: '$118K', subtext: 'Median: $112K', color: 'text-celestial-indigo' },
  { label: 'Avg Compa-Ratio', value: '0.95', subtext: 'Target: 1.0', color: 'text-sunset-amber' },
  { label: 'Pay Equity Gap', value: '2.8%', subtext: '-1.2% YoY', color: 'text-emerald-600' },
];

const deptSpend = [
  { dept: 'Engineering', spend: 18500000, headcount: 120, avgComp: 154167 },
  { dept: 'Sales', spend: 8200000, headcount: 65, avgComp: 126154 },
  { dept: 'Marketing', spend: 4800000, headcount: 40, avgComp: 120000 },
  { dept: 'Operations', spend: 7650000, headcount: 85, avgComp: 90000 },
  { dept: 'Product', spend: 4200000, headcount: 30, avgComp: 140000 },
];

export default function CompensationAnalyticsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Compensation Analytics</h1>
        <p className="text-sm text-silver-mist mt-1">Analyze compensation trends, pay equity, and benchmarking data</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {compMetrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            <p className="text-[10px] text-silver-mist">{metric.subtext}</p>
          </div>
        ))}
      </div>

      {/* Pay Bands */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Salary Bands & Positioning</h3>
        </div>
        <div className="p-5 space-y-4">
          {payBands.map((band) => {
            const range = band.max - band.min;
            const actualPos = ((band.avgActual - band.min) / range) * 100;
            const midPos = ((band.mid - band.min) / range) * 100;
            return (
              <div key={band.level} className="flex items-center gap-4">
                <span className="text-xs font-medium text-ink-black dark:text-pearl w-28">{band.level}</span>
                <div className="flex-1 relative">
                  <div className="w-full h-4 bg-slate-100 dark:bg-deep-cosmos rounded-full relative overflow-visible">
                    {/* Mid marker */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600" style={{ left: `${midPos}%` }} />
                    {/* Actual position */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-celestial-indigo border-2 border-white dark:border-stellar-blue shadow"
                      style={{ left: `${actualPos}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-silver-mist mt-0.5">
                    <span>${(band.min / 1000).toFixed(0)}K</span>
                    <span>${(band.max / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <p className="text-xs font-medium text-ink-black dark:text-pearl">${(band.avgActual / 1000).toFixed(0)}K</p>
                  <p className="text-[9px] text-silver-mist">{band.headcount} emp</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Spend */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Compensation by Department</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-right px-5 py-3 font-medium">Total Spend</th>
                <th className="text-right px-5 py-3 font-medium">Headcount</th>
                <th className="text-right px-5 py-3 font-medium">Avg Comp</th>
                <th className="text-right px-5 py-3 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {deptSpend.map((dept) => {
                const totalSpend = deptSpend.reduce((s, d) => s + d.spend, 0);
                const pct = ((dept.spend / totalSpend) * 100).toFixed(1);
                return (
                  <tr key={dept.dept} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.dept}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${(dept.spend / 1000000).toFixed(1)}M</td>
                    <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.headcount}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${(dept.avgComp / 1000).toFixed(0)}K</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                          <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-silver-mist">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Equity Alert */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Pay Equity Insight</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
            The average compa-ratio of 0.95 indicates employees are slightly below market midpoint. Consider targeted adjustments for roles with compa-ratios below 0.85.
          </p>
        </div>
      </div>
    </div>
  );
}
