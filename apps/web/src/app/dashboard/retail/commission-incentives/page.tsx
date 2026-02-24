'use client';

import React from 'react';
import { DollarSign, Target, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { useRetail } from '@/app/dashboard/retail/hooks/useRetail';

export default function CommissionsPage() {
  const { salesCommissions, settings, loading, error } = useRetail();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  const totalEarned = salesCommissions.reduce((acc, c) => acc + c.commissionEarned, 0);
  const totalBonus = salesCommissions.reduce((acc, c) => acc + c.bonusEarned, 0);
  const totalSales = salesCommissions.reduce((acc, c) => acc + c.totalSales, 0);
  const targetSales = settings?.commissionSettings.disputeWindow ? 50000 : 0; // Placeholder target calculation
  const achievement = targetSales > 0 ? (totalSales / targetSales) * 100 : 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Commissions & Incentives
          </h1>
          <p className="text-slate-500 text-sm">
            Sales tracking, Spiff calcs, and payout estimations.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
          Next Payout:{' '}
          {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Team Target</span>
          </div>
          <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${Math.min(achievement, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-right mt-1 text-indigo-600 font-bold">
            {achievement.toFixed(1)}% Achieved
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Est. Commission</span>
          </div>
          <div className="text-2xl font-bold">${totalEarned.toLocaleString()}</div>
          <div className="text-xs text-emerald-500 font-bold flex items-center mt-2">
            <TrendingUp className="w-3 h-3 mr-1" /> On track for tier bonus
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Spiff Rewards</span>
          </div>
          <div className="text-2xl font-bold">${totalBonus.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-2">Active seasonal contest</div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 min-h-0 overflow-y-auto">
        <h3 className="font-bold text-lg mb-6">Commission Breakdown</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 pl-2">Employee / Period</th>
              <th className="pb-3 text-right">Sales Amount</th>
              <th className="pb-3 text-right">Rate</th>
              <th className="pb-3 text-right pr-2">Commission</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {salesCommissions.map((row, i) => (
              <tr
                key={row.commissionId || i}
                className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">
                  {row.employeeName}
                  <div className="text-xs font-normal text-slate-400">
                    {new Date(row.period.startDate).toLocaleDateString()} -{' '}
                    {new Date(row.period.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                  ${row.totalSales.toLocaleString()}
                </td>
                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                    {(row.commissionRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 text-right pr-2 font-bold text-emerald-600 font-mono">
                  ${row.commissionEarned.toLocaleString()}
                </td>
              </tr>
            ))}
            {salesCommissions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400">
                  No commission data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

