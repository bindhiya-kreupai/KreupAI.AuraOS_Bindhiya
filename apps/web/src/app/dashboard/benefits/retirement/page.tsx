"use client";

import React from 'react';
import { Landmark, TrendingUp, PiggyBank, Target, DollarSign, BarChart3, ArrowUpRight } from 'lucide-react';

interface Fund {
  name: string;
  allocation: number;
  returns: number;
  value: number;
}

const funds: Fund[] = [
  { name: 'S&P 500 Index Fund', allocation: 40, returns: 12.5, value: 45200 },
  { name: 'Total Bond Market', allocation: 25, returns: 4.2, value: 28250 },
  { name: 'International Equity', allocation: 20, returns: 8.7, value: 22600 },
  { name: 'Target Date 2055', allocation: 10, returns: 9.1, value: 11300 },
  { name: 'REIT Fund', allocation: 5, returns: 6.3, value: 5650 },
];

export default function RetirementPage() {
  const totalBalance = funds.reduce((sum, f) => sum + f.value, 0);
  const yearlyContribution = 19500;
  const employerMatch = 6;
  const vestingPercentage = 75;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Retirement</h1>
        <p className="text-sm text-silver-mist mt-1">Track your 401(k) balance, contributions, and investment performance</p>
      </div>

      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-celestial-indigo to-purple-600 rounded-xl p-6 text-white">
        <p className="text-sm opacity-80">Total Retirement Balance</p>
        <p className="text-4xl font-bold mt-1">${totalBalance.toLocaleString()}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+$12,450 this year</span>
          </div>
          <span className="text-sm opacity-70">|</span>
          <span className="text-sm opacity-80">Vested: {vestingPercentage}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Your Contribution</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">12%</p>
          <p className="text-[10px] text-silver-mist">${yearlyContribution.toLocaleString()}/year</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Employer Match</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{employerMatch}%</p>
          <p className="text-[10px] text-silver-mist">Up to 6% of salary</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">YTD Returns</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">+9.8%</p>
          <p className="text-[10px] text-silver-mist">Benchmark: +8.2%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Projected at 65</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">$1.8M</p>
          <p className="text-[10px] text-silver-mist">At current rate</p>
        </div>
      </div>

      {/* Investment Allocation */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Investment Allocation</h3>
          <button className="text-xs text-celestial-indigo font-medium hover:underline">Rebalance</button>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {funds.map((fund) => (
            <div key={fund.name} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{fund.name}</p>
                <p className="text-xs text-silver-mist mt-0.5">{fund.allocation}% allocation</p>
              </div>
              <div className="w-32">
                <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="h-full bg-celestial-indigo rounded-full" style={{ width: `${fund.allocation}%` }} />
                </div>
              </div>
              <div className="w-20 text-right">
                <p className="text-sm font-bold text-ink-black dark:text-pearl">${(fund.value / 1000).toFixed(1)}K</p>
                <p className={`text-[10px] font-medium ${fund.returns > 0 ? 'text-emerald-600' : 'text-coral-alert'}`}>
                  {fund.returns > 0 ? '+' : ''}{fund.returns}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vesting Schedule */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Vesting Schedule</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${vestingPercentage}%` }} />
          </div>
          <span className="text-sm font-bold text-emerald-600">{vestingPercentage}%</span>
        </div>
        <div className="flex justify-between text-[10px] text-silver-mist mt-1">
          <span>Year 1: 25%</span>
          <span>Year 2: 50%</span>
          <span>Year 3: 75%</span>
          <span>Year 4: 100%</span>
        </div>
        <p className="text-xs text-silver-mist mt-3">You are in year 3. Full vesting in 12 months.</p>
      </div>
    </div>
  );
}
