"use client";

import React, { useState } from 'react';
import { Users, TrendingUp, Plus, Minus, Target, Calendar, Building2, ArrowUpRight } from 'lucide-react';

interface DeptPlan {
  department: string;
  currentHC: number;
  plannedHC: number;
  openReqs: number;
  attritionRisk: number;
  budgetImpact: number;
}

const deptPlans: DeptPlan[] = [
  { department: 'Engineering', currentHC: 120, plannedHC: 140, openReqs: 12, attritionRisk: 8, budgetImpact: 2400000 },
  { department: 'Sales', currentHC: 65, plannedHC: 80, openReqs: 8, attritionRisk: 15, budgetImpact: 1500000 },
  { department: 'Marketing', currentHC: 40, plannedHC: 45, openReqs: 3, attritionRisk: 5, budgetImpact: 600000 },
  { department: 'Operations', currentHC: 85, plannedHC: 90, openReqs: 4, attritionRisk: 3, budgetImpact: 500000 },
  { department: 'Product', currentHC: 30, plannedHC: 38, openReqs: 5, attritionRisk: 7, budgetImpact: 960000 },
  { department: 'HR', currentHC: 20, plannedHC: 22, openReqs: 2, attritionRisk: 2, budgetImpact: 200000 },
];

const quarterlyPlan = [
  { quarter: 'Q1 2025', hires: 15, exits: 5, net: 10 },
  { quarter: 'Q2 2025', hires: 12, exits: 6, net: 6 },
  { quarter: 'Q3 2025', hires: 10, exits: 4, net: 6 },
  { quarter: 'Q4 2025', hires: 8, exits: 5, net: 3 },
];

export default function HeadcountPlanningPage() {
  const totalCurrent = deptPlans.reduce((sum, d) => sum + d.currentHC, 0);
  const totalPlanned = deptPlans.reduce((sum, d) => sum + d.plannedHC, 0);
  const totalOpen = deptPlans.reduce((sum, d) => sum + d.openReqs, 0);
  const totalBudget = deptPlans.reduce((sum, d) => sum + d.budgetImpact, 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Headcount Planning</h1>
        <p className="text-sm text-silver-mist mt-1">Plan and forecast workforce needs across departments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Current Headcount</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{totalCurrent}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Planned (EOY)</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{totalPlanned}</p>
          <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +{totalPlanned - totalCurrent} net growth</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Open Requisitions</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{totalOpen}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Budget Impact</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">${(totalBudget / 1000000).toFixed(1)}M</p>
          <p className="text-[10px] text-silver-mist">Annual cost of growth</p>
        </div>
      </div>

      {/* Quarterly Plan */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
        <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Quarterly Hiring Plan</h3>
        <div className="grid grid-cols-4 gap-4">
          {quarterlyPlan.map((q) => (
            <div key={q.quarter} className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
              <p className="text-xs font-medium text-ink-black dark:text-pearl">{q.quarter}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-emerald-600 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> {q.hires} hires</p>
                <p className="text-xs text-coral-alert flex items-center justify-center gap-1"><Minus className="w-3 h-3" /> {q.exits} exits</p>
                <p className="text-sm font-bold text-celestial-indigo mt-1">Net: +{q.net}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Department Plans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                <th className="text-left px-5 py-3 font-medium">Department</th>
                <th className="text-right px-5 py-3 font-medium">Current</th>
                <th className="text-right px-5 py-3 font-medium">Planned</th>
                <th className="text-right px-5 py-3 font-medium">Growth</th>
                <th className="text-right px-5 py-3 font-medium">Open Reqs</th>
                <th className="text-right px-5 py-3 font-medium">Attrition Risk</th>
                <th className="text-right px-5 py-3 font-medium">Budget</th>
              </tr>
            </thead>
            <tbody>
              {deptPlans.map((dept) => (
                <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-celestial-indigo" />
                      <span className="text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-ink-black dark:text-pearl">{dept.currentHC}</td>
                  <td className="px-5 py-3 text-sm text-right font-medium text-celestial-indigo">{dept.plannedHC}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    <span className="text-emerald-600 font-medium">+{dept.plannedHC - dept.currentHC}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-sunset-amber font-medium">{dept.openReqs}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    <span className={`font-medium ${dept.attritionRisk > 10 ? 'text-coral-alert' : dept.attritionRisk > 5 ? 'text-sunset-amber' : 'text-emerald-600'}`}>
                      {dept.attritionRisk}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                    ${(dept.budgetImpact / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Planning */}
      <div className="bg-gradient-to-r from-celestial-indigo/5 to-purple-500/5 dark:from-celestial-indigo/10 dark:to-purple-500/10 border border-celestial-indigo/20 rounded-lg p-4 flex items-start gap-3">
        <Target className="w-4 h-4 text-celestial-indigo mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-celestial-indigo">Scenario Planning</p>
          <p className="text-xs text-celestial-indigo/70 mt-0.5">
            Based on current growth projections, the organization will reach {totalPlanned} employees by EOY. Consider workforce planning scenarios for aggressive (15% growth) and conservative (5% growth) models.
          </p>
        </div>
      </div>
    </div>
  );
}
