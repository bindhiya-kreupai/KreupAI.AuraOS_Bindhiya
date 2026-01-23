"use client";

import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Users, Target, BarChart3,
  ChevronDown, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  currentSalary: number;
  proposedIncrease: number;
  performanceRating: number;
  compaRatio: number;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Emily Davis', avatar: 'ED', role: 'Senior Engineer', currentSalary: 125000, proposedIncrease: 8, performanceRating: 4.5, compaRatio: 0.95 },
  { id: '2', name: 'Raj Patel', avatar: 'RP', role: 'Engineer II', currentSalary: 105000, proposedIncrease: 10, performanceRating: 4.2, compaRatio: 0.88 },
  { id: '3', name: 'Anna Lee', avatar: 'AL', role: 'Senior Engineer', currentSalary: 130000, proposedIncrease: 5, performanceRating: 3.8, compaRatio: 1.02 },
  { id: '4', name: 'Mike Chen', avatar: 'MC', role: 'Staff Engineer', currentSalary: 155000, proposedIncrease: 6, performanceRating: 4.0, compaRatio: 0.92 },
  { id: '5', name: 'Sarah Johnson', avatar: 'SJ', role: 'Engineer II', currentSalary: 98000, proposedIncrease: 12, performanceRating: 4.8, compaRatio: 0.82 },
];

export default function CompensationPlanningPage() {
  const [budgetUsed] = useState(72);
  const totalBudget = 85000;
  const usedBudget = Math.round(totalBudget * budgetUsed / 100);

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
          <p className="text-xs text-silver-mist uppercase font-medium">Total Budget</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">${totalBudget.toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">FY 2025</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Allocated</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">${usedBudget.toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">{budgetUsed}% of budget</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Remaining</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">${(totalBudget - usedBudget).toLocaleString()}</p>
          <p className="text-[10px] text-silver-mist">{100 - budgetUsed}% available</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Increase</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">8.2%</p>
          <p className="text-[10px] text-silver-mist">Market avg: 5%</p>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink-black dark:text-pearl">Budget Utilization</span>
          <span className="text-xs text-silver-mist">{budgetUsed}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-celestial-indigo to-purple-500 rounded-full transition-all" style={{ width: `${budgetUsed}%` }} />
        </div>
      </div>

      {/* Team Compensation Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Team Salary Review</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                <th className="text-left px-4 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-right px-4 py-3 font-medium">Current Salary</th>
                <th className="text-right px-4 py-3 font-medium">Proposed %</th>
                <th className="text-right px-4 py-3 font-medium">New Salary</th>
                <th className="text-center px-4 py-3 font-medium">Rating</th>
                <th className="text-center px-4 py-3 font-medium">Compa-Ratio</th>
              </tr>
            </thead>
            <tbody>
              {mockTeam.map((member) => {
                const newSalary = Math.round(member.currentSalary * (1 + member.proposedIncrease / 100));
                return (
                  <tr key={member.id} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-celestial-indigo">{member.avatar}</span>
                        </div>
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-silver-mist">{member.role}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${member.currentSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${member.proposedIncrease >= 10 ? 'text-emerald-600' : member.proposedIncrease >= 7 ? 'text-celestial-indigo' : 'text-silver-mist'}`}>
                        +{member.proposedIncrease}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-medium text-ink-black dark:text-pearl">${newSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                        {member.performanceRating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${
                        member.compaRatio >= 1.0 ? 'text-emerald-600' : member.compaRatio >= 0.9 ? 'text-sunset-amber' : 'text-coral-alert'
                      }`}>
                        {member.compaRatio.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Benchmarking */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3">Market Benchmarking</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">25th Percentile</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">$95,000</p>
          </div>
          <div className="text-center p-3 bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-lg border border-celestial-indigo/20">
            <p className="text-xs text-celestial-indigo font-medium">50th Percentile (Target)</p>
            <p className="text-lg font-bold text-celestial-indigo mt-1">$120,000</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <p className="text-xs text-silver-mist">75th Percentile</p>
            <p className="text-lg font-bold text-ink-black dark:text-pearl mt-1">$145,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
