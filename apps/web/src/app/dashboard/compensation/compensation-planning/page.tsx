"use client";

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, Target, BarChart3,
  ChevronDown, ArrowUpRight, ArrowDownRight, Minus, Loader2
} from 'lucide-react';
import { EmployeeCompensationService, CompensationAnalyticsService } from '../services';

export default function CompensationPlanningPage() {
  const [compensations, setCompensations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compData, metricsData] = await Promise.all([
        EmployeeCompensationService.getCompensations(),
        CompensationAnalyticsService.getMetrics(),
      ]);
      setCompensations(compData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = metrics?.totalCompensationCost || 0;
  const avgIncrease = metrics?.incrementMetrics?.averageIncrementPercentage || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Compensation Planning</h1>
        <p className="text-sm text-silver-mist mt-1">Plan and allocate merit increases for your team</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Compensation</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            ${totalBudget > 0 ? (totalBudget / 1000).toFixed(0) + 'K' : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">Active employees: {metrics?.totalEmployees || 0}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Compensation</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">
            ${metrics?.averageCompensation ? (metrics.averageCompensation / 1000).toFixed(0) + 'K' : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">Per employee</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Median Compensation</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">
            ${metrics?.medianCompensation ? (metrics.medianCompensation / 1000).toFixed(0) + 'K' : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">50th percentile</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Increase</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{avgIncrease > 0 ? avgIncrease.toFixed(1) + '%' : '--'}</p>
          <p className="text-[10px] text-silver-mist">Last cycle</p>
        </div>
      </div>

      {/* Team Compensation Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Employee Compensation Details</h3>
        </div>
        {compensations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No compensation data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-4 py-3 font-medium">Employee</th>
                  <th className="text-right px-4 py-3 font-medium">Annual CTC</th>
                  <th className="text-right px-4 py-3 font-medium">Monthly CTC</th>
                  <th className="text-right px-4 py-3 font-medium">Basic Salary</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {compensations.map((comp: any) => (
                  <tr key={comp.id} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-celestial-indigo">
                            {(comp.employeeName || comp.employeeId || '?').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">
                          {comp.employeeName || comp.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.annualCTC ? Number(comp.annualCTC).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.monthlyCTC ? Number(comp.monthlyCTC).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      ${comp.annualBasic ? Number(comp.annualBasic).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${comp.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {comp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market Benchmarking */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3">Compensation Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">Total Employees</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">{metrics?.totalEmployees || 0}</p>
          </div>
          <div className="text-center p-3 bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-lg border border-celestial-indigo/20">
            <p className="text-xs text-celestial-indigo font-medium">Average CTC</p>
            <p className="text-lg font-bold text-celestial-indigo mt-1">
              ${metrics?.averageCompensation ? Math.round(metrics.averageCompensation).toLocaleString() : '--'}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">Median CTC</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">
              ${metrics?.medianCompensation ? Math.round(metrics.medianCompensation).toLocaleString() : '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
