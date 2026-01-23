"use client";

import React from "react";
import { DollarSign, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

interface CostBreakdown {
  category: string;
  plan: string;
  employerContribution: number;
  employeeContribution: number;
}

interface PlanComparison {
  label: string;
  currentCost: number;
  newCost: number;
}

const mockBreakdown: CostBreakdown[] = [
  {
    category: "Medical",
    plan: "Medical Plus",
    employerContribution: 224,
    employeeContribution: 96,
  },
  {
    category: "Dental",
    plan: "Dental Plus",
    employerContribution: 33,
    employeeContribution: 22,
  },
  {
    category: "Vision",
    plan: "Vision Plus",
    employerContribution: 17,
    employeeContribution: 11,
  },
];

const mockComparison: PlanComparison[] = [
  { label: "Medical", currentCost: 110, newCost: 96 },
  { label: "Dental", currentCost: 18, newCost: 22 },
  { label: "Vision", currentCost: 8, newCost: 11 },
];

export function CostSummary() {
  const totalEmployer = mockBreakdown.reduce((s, b) => s + b.employerContribution, 0);
  const totalEmployee = mockBreakdown.reduce((s, b) => s + b.employeeContribution, 0);
  const totalMonthly = totalEmployer + totalEmployee;
  const perPaycheck = totalEmployee / 2;
  const annualTotal = totalEmployee * 12;

  const currentTotal = mockComparison.reduce((s, c) => s + c.currentCost, 0);
  const newTotal = mockComparison.reduce((s, c) => s + c.newCost, 0);
  const difference = newTotal - currentTotal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Cost Summary</h2>
        <p className="text-sm text-silver-mist mt-1">Review your premium breakdown and costs.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Per Paycheck</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${perPaycheck.toFixed(2)}</p>
          <p className="text-xs text-silver-mist">Bi-weekly deduction</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Monthly Total</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${totalMonthly}</p>
          <p className="text-xs text-silver-mist">Employer + Employee</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Employer Pays</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${totalEmployer}</p>
          <p className="text-xs text-silver-mist">{((totalEmployer / totalMonthly) * 100).toFixed(0)}% of total</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Annual Total</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${annualTotal.toLocaleString()}</p>
          <p className="text-xs text-silver-mist">Your yearly cost</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Premium Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-deep-cosmos">
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-2">Category</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-2">Plan</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-2">Employer</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-2">You Pay</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {mockBreakdown.map((item) => (
                <tr key={item.category}>
                  <td className="px-4 py-3 text-sm font-medium text-ink-black dark:text-pearl">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-silver-mist">{item.plan}</td>
                  <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">${item.employerContribution}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-ink-black dark:text-pearl">${item.employeeContribution}</td>
                  <td className="px-4 py-3 text-sm text-right text-silver-mist">${item.employerContribution + item.employeeContribution}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-deep-cosmos font-semibold">
                <td className="px-4 py-3 text-sm text-ink-black dark:text-pearl">Total</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">${totalEmployer}</td>
                <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">${totalEmployee}</td>
                <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">${totalMonthly}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison to Current */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">Comparison to Current Plan</h3>
        <div className="space-y-2">
          {mockComparison.map((item) => {
            const diff = item.newCost - item.currentCost;
            return (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-ink-black dark:text-pearl">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-silver-mist">${item.currentCost}/mo</span>
                  <ArrowRight className="w-3 h-3 text-silver-mist" />
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">${item.newCost}/mo</span>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${diff > 0 ? "text-red-500" : "text-green-500"}`}>
                    {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {diff > 0 ? "+" : ""}${diff}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-black dark:text-pearl">Net Change</span>
            <span className={`text-sm font-bold ${difference > 0 ? "text-red-500" : "text-green-500"}`}>
              {difference > 0 ? "+" : ""}${difference}/month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
