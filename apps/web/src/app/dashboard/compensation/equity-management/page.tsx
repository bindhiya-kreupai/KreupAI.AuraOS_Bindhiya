"use client";

import React from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart3, Clock, ArrowUpRight, AlertCircle } from 'lucide-react';

interface Grant {
  id: string;
  type: string;
  grantDate: string;
  vestingStart: string;
  totalShares: number;
  vestedShares: number;
  exercisePrice: number;
  currentPrice: number;
  nextVestDate: string;
  nextVestShares: number;
}

const grants: Grant[] = [
  { id: '1', type: 'ISO', grantDate: 'Jan 15, 2022', vestingStart: 'Jan 15, 2022', totalShares: 10000, vestedShares: 6250, exercisePrice: 12.50, currentPrice: 28.75, nextVestDate: 'Apr 15, 2025', nextVestShares: 625 },
  { id: '2', type: 'RSU', grantDate: 'Jul 1, 2023', vestingStart: 'Jul 1, 2023', totalShares: 5000, vestedShares: 1875, exercisePrice: 0, currentPrice: 28.75, nextVestDate: 'Apr 1, 2025', nextVestShares: 312 },
  { id: '3', type: 'ISO', grantDate: 'Mar 1, 2024', vestingStart: 'Mar 1, 2024', totalShares: 8000, vestedShares: 1500, exercisePrice: 22.00, currentPrice: 28.75, nextVestDate: 'Jun 1, 2025', nextVestShares: 500 },
];

export default function EquityManagementPage() {
  const totalVested = grants.reduce((sum, g) => sum + g.vestedShares, 0);
  const totalUnvested = grants.reduce((sum, g) => sum + (g.totalShares - g.vestedShares), 0);
  const totalValue = grants.reduce((sum, g) => sum + (g.vestedShares * g.currentPrice), 0);
  const totalGain = grants.reduce((sum, g) => sum + (g.vestedShares * (g.currentPrice - g.exercisePrice)), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Equity Management</h1>
        <p className="text-sm text-silver-mist mt-1">Track your stock options, RSUs, and vesting schedule</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Vested Value</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">${(totalValue / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5"><ArrowUpRight className="w-3 h-3" /> +12% this quarter</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Unrealized Gain</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${(totalGain / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-silver-mist">On vested shares</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Vested Shares</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{totalVested.toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">{totalUnvested.toLocaleString()} unvested</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Current Share Price</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">${grants[0].currentPrice}</p>
          <p className="text-[10px] text-emerald-600">+$2.50 (30d)</p>
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Equity Grants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Grant Date</th>
                <th className="text-right px-5 py-3 font-medium">Total</th>
                <th className="text-right px-5 py-3 font-medium">Vested</th>
                <th className="text-right px-5 py-3 font-medium">Exercise Price</th>
                <th className="text-right px-5 py-3 font-medium">Value</th>
                <th className="text-left px-5 py-3 font-medium">Next Vest</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant) => {
                const vestPercent = Math.round((grant.vestedShares / grant.totalShares) * 100);
                return (
                  <tr key={grant.id} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${grant.type === 'RSU' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                        {grant.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-silver-mist">{grant.grantDate}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">{grant.totalShares.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-mono text-ink-black dark:text-pearl">{grant.vestedShares.toLocaleString()}</span>
                        <span className="text-[10px] text-silver-mist">({vestPercent}%)</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                      {grant.exercisePrice > 0 ? `$${grant.exercisePrice.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono font-medium text-emerald-600">
                      ${(grant.vestedShares * (grant.currentPrice - grant.exercisePrice)).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs">
                        <p className="text-ink-black dark:text-pearl">{grant.nextVestDate}</p>
                        <p className="text-silver-mist">{grant.nextVestShares} shares</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vesting Timeline */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Upcoming Vesting Events</h3>
        <div className="space-y-3">
          {grants.map((grant) => (
            <div key={grant.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <Clock className="w-4 h-4 text-celestial-indigo flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{grant.nextVestShares} {grant.type} shares vest</p>
                <p className="text-xs text-silver-mist">{grant.nextVestDate}</p>
              </div>
              <span className="text-sm font-bold text-celestial-indigo">
                ~${(grant.nextVestShares * (grant.currentPrice - grant.exercisePrice)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
