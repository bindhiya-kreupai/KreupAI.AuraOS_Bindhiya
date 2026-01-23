"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface CostSummary {
  label: string;
  amount: number;
  change: number;
  period: string;
}

interface OvertimeProjection {
  department: string;
  regularHours: number;
  overtimeHours: number;
  projectedCost: number;
  budgetLimit: number;
}

interface DepartmentCost {
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
}

const mockSummary: CostSummary[] = [
  { label: "This Week", amount: 124500, change: 3.2, period: "vs last week" },
  { label: "This Month (Projected)", amount: 498000, change: -1.5, period: "vs budget" },
  { label: "Overtime This Week", amount: 18750, change: 12.4, period: "vs last week" },
  { label: "Cost Per Employee", amount: 2850, change: -0.8, period: "vs avg" },
];

const mockOvertimeProjections: OvertimeProjection[] = [
  { department: "Engineering", regularHours: 1600, overtimeHours: 120, projectedCost: 45600, budgetLimit: 40000 },
  { department: "Customer Support", regularHours: 800, overtimeHours: 85, projectedCost: 22100, budgetLimit: 25000 },
  { department: "Sales", regularHours: 640, overtimeHours: 40, projectedCost: 12800, budgetLimit: 15000 },
  { department: "Operations", regularHours: 960, overtimeHours: 65, projectedCost: 19500, budgetLimit: 20000 },
];

const mockDepartmentCosts: DepartmentCost[] = [
  { name: "Engineering", budgeted: 180000, actual: 192000, variance: -12000 },
  { name: "Customer Support", budgeted: 95000, actual: 88000, variance: 7000 },
  { name: "Sales", budgeted: 120000, actual: 118500, variance: 1500 },
  { name: "Operations", budgeted: 85000, actual: 87200, variance: -2200 },
  { name: "HR & Admin", budgeted: 65000, actual: 62000, variance: 3000 },
];

export default function LaborCostForecasting() {
  const [summary] = useState<CostSummary[]>(mockSummary);
  const [overtimeProjections] = useState<OvertimeProjection[]>(mockOvertimeProjections);
  const [departmentCosts] = useState<DepartmentCost[]>(mockDepartmentCosts);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxBudget = Math.max(...departmentCosts.map((d) => Math.max(d.budgeted, d.actual)));

  const getOverBudgetClass = (isOver: boolean) => {
    return isOver ? "text-coral-alert" : "text-ink-black dark:text-pearl";
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Labor Cost Forecasting
            </h2>
            <p className="text-sm text-silver-mist">
              Projected costs and budget comparison
            </p>
          </div>
        </div>
        <select className="px-3 py-1.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
          <option>January 2026</option>
          <option>February 2026</option>
          <option>Q1 2026</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summary.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
          >
            <p className="text-xs text-silver-mist mb-1">{item.label}</p>
            <p className="text-xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(item.amount)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {item.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-coral-alert" />
              ) : (
                <TrendingDown className="w-3 h-3 text-aurora-green" />
              )}
              <span
                className={`text-xs ${
                  item.change > 0 ? "text-coral-alert" : "text-aurora-green"
                }`}
              >
                {Math.abs(item.change)}%
              </span>
              <span className="text-xs text-silver-mist">{item.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget vs Actual Comparison Bars */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            Budget vs Actual by Department
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-celestial-indigo/30" />
              <span className="text-silver-mist">Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-celestial-indigo" />
              <span className="text-silver-mist">Actual</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {departmentCosts.map((dept) => (
            <div key={dept.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-black dark:text-pearl font-medium">
                  {dept.name}
                </span>
                <span
                  className={`font-medium ${
                    dept.variance >= 0 ? "text-aurora-green" : "text-coral-alert"
                  }`}
                >
                  {dept.variance >= 0 ? "+" : ""}
                  {formatCurrency(dept.variance)}
                </span>
              </div>
              <div className="relative h-6 flex gap-0.5">
                <div className="flex-1 relative">
                  <div
                    className="absolute inset-y-0 left-0 h-full bg-celestial-indigo/20 rounded-l"
                    style={{ width: `${(dept.budgeted / maxBudget) * 100}%` }}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 h-full rounded-l ${
                      dept.actual > dept.budgeted
                        ? "bg-coral-alert/70"
                        : "bg-celestial-indigo/70"
                    }`}
                    style={{ width: `${(dept.actual / maxBudget) * 100}%` }}
                  />
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <span className="text-[10px] font-medium text-white drop-shadow">
                      {formatCurrency(dept.actual)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overtime Projections */}
      <div>
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-sunset-amber" />
          Overtime Projections
        </h3>
        <div className="space-y-2">
          {overtimeProjections.map((proj) => {
            const isOverBudget = proj.projectedCost > proj.budgetLimit;
            return (
              <div
                key={proj.department}
                className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-silver-mist" />
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {proj.department}
                    </p>
                    <p className="text-xs text-silver-mist">
                      {proj.regularHours}h regular + {proj.overtimeHours}h OT
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getOverBudgetClass(isOverBudget)}`}>
                      {formatCurrency(proj.projectedCost)}
                    </p>
                    <p className="text-xs text-silver-mist">
                      Limit: {formatCurrency(proj.budgetLimit)}
                    </p>
                  </div>
                  {isOverBudget && (
                    <AlertTriangle className="w-4 h-4 text-coral-alert" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
