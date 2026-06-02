"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart3, Users, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';

export default function CompensationAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalPayroll: 0, averageSalary: 0, medianSalary: 0 });
  const [deptSpend, setDeptSpend] = useState<{ dept: string; avgSalary: number; headcount: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/analytics/compensation');
      const json = await res.json();
      const data = json?.data;

      if (data) {
        setSummary({
          totalPayroll: data.summary?.totalPayroll ?? 0,
          averageSalary: data.summary?.averageSalary ?? 0,
          medianSalary: data.summary?.medianSalary ?? 0,
        });

        setDeptSpend(
          (data.byDepartment || []).map((d: any) => ({
            dept: d.department,
            avgSalary: d.avgSalary,
            headcount: d.headcount,
          }))
        );
      }
    } catch (error: any) {
      console.error('Error loading compensation data:', error);
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

  const compMetrics = [
    { label: 'Total Comp Spend', value: summary.totalPayroll > 0 ? `$${(summary.totalPayroll / 1000000).toFixed(1)}M` : '$0', subtext: 'Annual', color: 'text-ink-black dark:text-pearl' },
    { label: 'Avg Salary', value: summary.averageSalary > 0 ? `$${(summary.averageSalary / 1000).toFixed(0)}K` : '$0', subtext: `Median: $${(summary.medianSalary / 1000).toFixed(0)}K`, color: 'text-celestial-indigo' },
    { label: 'Departments', value: String(deptSpend.length), subtext: 'with compensation data', color: 'text-sunset-amber' },
    { label: 'Total Employees', value: String(deptSpend.reduce((s, d) => s + d.headcount, 0)), subtext: 'with salary structures', color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Compensation Analytics</h1>
        <p className="text-sm text-silver-mist mt-1">Analyze compensation trends, pay equity, and benchmarking data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {compMetrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <p className="text-xs text-silver-mist uppercase font-medium">{metric.label}</p>
            <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            <p className="text-[10px] text-silver-mist">{metric.subtext}</p>
          </div>
        ))}
      </div>

      {deptSpend.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Compensation by Department</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-5 py-3 font-medium">Department</th>
                  <th className="text-right px-5 py-3 font-medium">Headcount</th>
                  <th className="text-right px-5 py-3 font-medium">Avg Salary</th>
                  <th className="text-right px-5 py-3 font-medium">Est. Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {deptSpend.map((dept) => {
                  const totalSpend = dept.avgSalary * dept.headcount;
                  return (
                    <tr key={dept.dept} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                      <td className="px-5 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.dept}</td>
                      <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.headcount}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${(dept.avgSalary / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${(totalSpend / 1000000).toFixed(1)}M</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deptSpend.length === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <DollarSign className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No compensation data available. Ensure salary structures are configured.</p>
        </div>
      )}
    </div>
  );
}

