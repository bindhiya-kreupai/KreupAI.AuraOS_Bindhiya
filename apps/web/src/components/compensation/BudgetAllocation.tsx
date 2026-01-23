"use client";

import React, { useState } from "react";
import { DollarSign, ArrowUpDown, AlertTriangle } from "lucide-react";

interface DepartmentBudget {
  id: string;
  department: string;
  totalBudget: number;
  allocated: number;
  headcount: number;
}

const mockBudgets: DepartmentBudget[] = [
  { id: "eng", department: "Engineering", totalBudget: 250000, allocated: 218000, headcount: 24 },
  { id: "product", department: "Product", totalBudget: 120000, allocated: 95000, headcount: 12 },
  { id: "design", department: "Design", totalBudget: 80000, allocated: 78500, headcount: 8 },
  { id: "marketing", department: "Marketing", totalBudget: 95000, allocated: 62000, headcount: 10 },
  { id: "sales", department: "Sales", totalBudget: 150000, allocated: 145000, headcount: 18 },
  { id: "ops", department: "Operations", totalBudget: 65000, allocated: 42000, headcount: 7 },
];

export function BudgetAllocation() {
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(mockBudgets);
  const [reallocationFrom, setReallocationFrom] = useState<string>("");
  const [reallocationTo, setReallocationTo] = useState<string>("");
  const [reallocationAmount, setReallocationAmount] = useState<number>(0);

  const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalRemaining = totalBudget - totalAllocated;

  const handleReallocate = () => {
    if (!reallocationFrom || !reallocationTo || reallocationAmount <= 0) return;
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === reallocationFrom) return { ...b, totalBudget: b.totalBudget - reallocationAmount };
        if (b.id === reallocationTo) return { ...b, totalBudget: b.totalBudget + reallocationAmount };
        return b;
      })
    );
    setReallocationAmount(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Budget Allocation</h2>
        <p className="text-sm text-silver-mist mt-1">Manage compensation budget pools by department.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Budget</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${(totalBudget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Allocated</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${(totalAllocated / 1000).toFixed(0)}K</p>
          <p className="text-xs text-silver-mist">{((totalAllocated / totalBudget) * 100).toFixed(1)}% of budget</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Remaining</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">${(totalRemaining / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Department Budgets */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Department Budget Pools</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {budgets.map((budget) => {
            const remaining = budget.totalBudget - budget.allocated;
            const utilization = (budget.allocated / budget.totalBudget) * 100;
            const isOverBudget = utilization > 100;
            const isNearLimit = utilization > 90 && !isOverBudget;

            return (
              <div key={budget.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-ink-black dark:text-pearl">{budget.department}</h4>
                    <span className="text-xs text-silver-mist">({budget.headcount} employees)</span>
                    {(isOverBudget || isNearLimit) && (
                      <AlertTriangle className={`w-3.5 h-3.5 ${isOverBudget ? "text-red-500" : "text-yellow-500"}`} />
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-ink-black dark:text-pearl">
                      ${(budget.allocated / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs text-silver-mist"> / ${(budget.totalBudget / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverBudget
                        ? "bg-red-500"
                        : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-celestial-indigo"
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-silver-mist">{utilization.toFixed(1)}% utilized</span>
                  <span className={`text-xs font-medium ${remaining < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                    ${(remaining / 1000).toFixed(1)}K remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reallocation Controls */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpDown className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Reallocate Budget</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-silver-mist mb-1">From Department</label>
            <select
              value={reallocationFrom}
              onChange={(e) => setReallocationFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
            >
              <option value="">Select...</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-silver-mist mb-1">To Department</label>
            <select
              value={reallocationTo}
              onChange={(e) => setReallocationTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
            >
              <option value="">Select...</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.department}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-silver-mist mb-1">Amount ($)</label>
            <input
              type="number"
              value={reallocationAmount || ""}
              onChange={(e) => setReallocationAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleReallocate}
              className="w-full px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
            >
              Reallocate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
