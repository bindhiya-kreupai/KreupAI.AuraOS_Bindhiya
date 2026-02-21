"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Target } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  currentSalary: number;
  proposedIncrease: number;
  rating: string;
  compaRatio: number;
}

interface CompensationData {
  summary: {
    totalPayroll: number;
    averageSalary: number;
    medianSalary: number;
  };
  budgetUtilization: {
    annualBudget: number;
    utilized: number;
  };
  byDepartment: {
    department: string;
    headcount: number;
    avgSalary: number;
    median: number;
    min: number;
    max: number;
  }[];
}

export function CompensationPlanner() {
  const [data, setData] = useState<CompensationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/analytics/compensation/')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to load compensation data');
        }
      })
      .catch((err) => {
        console.error('CompensationPlanner fetch error:', err);
        setError('Failed to load compensation data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-20" />
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  const budget = data?.budgetUtilization?.annualBudget ?? 0;
  const utilized = data?.budgetUtilization?.utilized ?? 0;
  const budgetUsed = budget > 0 ? (utilized / budget) * 100 : 0;
  const avgSalary = data?.summary?.averageSalary ?? 0;
  const medianSalary = data?.summary?.medianSalary ?? 0;
  const totalEmployees = data?.byDepartment?.reduce((s, d) => s + d.headcount, 0) ?? 0;
  const avgIncrease = medianSalary > 0 ? Math.round(((avgSalary - medianSalary) / medianSalary) * 1000) / 10 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Budget</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{formatCurrency(budget)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Utilized</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{formatCurrency(utilized)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Avg Salary</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{formatCurrency(avgSalary)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Employees</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{totalEmployees}</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink-black dark:text-pearl">Budget Utilization</span>
          <span className={`text-xs font-semibold ${budgetUsed > 100 ? 'text-coral-alert' : 'text-emerald-500'}`}>{budgetUsed.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${budgetUsed > 100 ? 'bg-coral-alert' : 'bg-emerald-500'}`} style={{ width: `${Math.min(budgetUsed, 100)}%` }} />
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-right px-4 py-3 font-medium">Headcount</th>
              <th className="text-right px-4 py-3 font-medium">Avg Salary</th>
              <th className="text-right px-4 py-3 font-medium">Median</th>
              <th className="text-right px-4 py-3 font-medium">Range Min</th>
              <th className="text-right px-4 py-3 font-medium">Range Max</th>
            </tr>
          </thead>
          <tbody>
            {data?.byDepartment?.map((dept) => (
              <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</p>
                </td>
                <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">{dept.headcount}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${dept.avgSalary.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${dept.median.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-silver-mist">${dept.min.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-silver-mist">${dept.max.toLocaleString()}</td>
              </tr>
            ))}
            {(!data?.byDepartment || data.byDepartment.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-silver-mist">
                  No department data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
