"use client";

import React, { useState } from 'react';
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

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', role: 'Sr. Engineer', currentSalary: 145000, proposedIncrease: 5.0, rating: 'Exceeds', compaRatio: 1.05 },
  { id: '2', name: 'James Wilson', role: 'Engineer II', currentSalary: 120000, proposedIncrease: 8.0, rating: 'Exceeds', compaRatio: 0.92 },
  { id: '3', name: 'Maria Garcia', role: 'Sr. Engineer', currentSalary: 140000, proposedIncrease: 4.0, rating: 'Meets', compaRatio: 1.01 },
  { id: '4', name: 'David Kim', role: 'Engineer III', currentSalary: 135000, proposedIncrease: 6.0, rating: 'Exceeds', compaRatio: 0.97 },
  { id: '5', name: 'Alex Thompson', role: 'Engineer I', currentSalary: 95000, proposedIncrease: 10.0, rating: 'Meets', compaRatio: 0.88 },
];

export function CompensationPlanner() {
  const [budget] = useState(85000);
  const totalProposed = teamMembers.reduce((s, m) => s + (m.currentSalary * m.proposedIncrease / 100), 0);
  const budgetUsed = (totalProposed / budget) * 100;

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Budget</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${(budget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Proposed</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${(totalProposed / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Avg Increase</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{(teamMembers.reduce((s, m) => s + m.proposedIncrease, 0) / teamMembers.length).toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Eligible</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{teamMembers.length}</p>
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

      {/* Team Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
              <th className="text-left px-4 py-3 font-medium">Employee</th>
              <th className="text-right px-4 py-3 font-medium">Current</th>
              <th className="text-right px-4 py-3 font-medium">Increase %</th>
              <th className="text-right px-4 py-3 font-medium">New Salary</th>
              <th className="text-center px-4 py-3 font-medium">Rating</th>
              <th className="text-right px-4 py-3 font-medium">Compa Ratio</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0 hover:bg-slate-50 dark:hover:bg-deep-cosmos">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{member.name}</p>
                  <p className="text-xs text-silver-mist">{member.role}</p>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${member.currentSalary.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-celestial-indigo">{member.proposedIncrease}%</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">${Math.round(member.currentSalary * (1 + member.proposedIncrease / 100)).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    member.rating === 'Exceeds' ? 'bg-emerald-50 text-emerald-600' : 'bg-celestial-indigo/10 text-celestial-indigo'
                  }`}>{member.rating}</span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-medium ${member.compaRatio < 0.95 ? 'text-coral-alert' : 'text-emerald-500'}`}>{member.compaRatio.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
