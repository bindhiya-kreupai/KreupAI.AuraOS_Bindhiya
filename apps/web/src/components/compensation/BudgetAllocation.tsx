/**
 * @module BudgetAllocation
 * @description Budget pool allocation splitter for compensation planning
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Wallet, AlertTriangle, Minus, Plus, Lock, Star } from 'lucide-react';

export interface DepartmentAllocation {
  id: string;
  name: string;
  headcount: number;
  totalSalary: number;
  allocatedBudget: number;
  usedBudget: number;
  avgPerformance: number;
  eligibleCount: number;
  isLocked: boolean;
}

interface BudgetAllocationProps {
  totalBudget: number;
  currency: string;
  departments: DepartmentAllocation[];
  onAllocate: (departmentId: string, amount: number) => void;
  onLock: (departmentId: string) => void;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const BudgetAllocation: React.FC<BudgetAllocationProps> = ({
  totalBudget,
  currency,
  departments,
  onAllocate,
  onLock,
}) => {
  const [distributionMode, setDistributionMode] = useState<
    'manual' | 'headcount' | 'performance' | 'equal'
  >('manual');

  const totalAllocated = useMemo(
    () => departments.reduce((s, d) => s + d.allocatedBudget, 0),
    [departments]
  );
  const totalUsed = useMemo(() => departments.reduce((s, d) => s + d.usedBudget, 0), [departments]);
  const remaining = totalBudget - totalAllocated;
  const utilizationPercent = totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0;
  const totalHeadcount = useMemo(
    () => departments.reduce((s, d) => s + d.headcount, 0),
    [departments]
  );
  const totalEligible = useMemo(
    () => departments.reduce((s, d) => s + d.eligibleCount, 0),
    [departments]
  );

  const handleAutoDistribute = useCallback(() => {
    const unlockedDepts = departments.filter((d) => !d.isLocked);
    const lockedBudget = departments
      .filter((d) => d.isLocked)
      .reduce((s, d) => s + d.allocatedBudget, 0);
    const distributableBudget = totalBudget - lockedBudget;

    if (distributionMode === 'equal') {
      const perDept = Math.floor(distributableBudget / unlockedDepts.length);
      unlockedDepts.forEach((d) => onAllocate(d.id, perDept));
    } else if (distributionMode === 'headcount') {
      const totalUnlockedHC = unlockedDepts.reduce((s, d) => s + d.headcount, 0);
      unlockedDepts.forEach((d) => {
        const share =
          totalUnlockedHC > 0
            ? Math.floor(distributableBudget * (d.headcount / totalUnlockedHC))
            : 0;
        onAllocate(d.id, share);
      });
    } else if (distributionMode === 'performance') {
      const totalPerf = unlockedDepts.reduce((s, d) => s + d.avgPerformance, 0);
      unlockedDepts.forEach((d) => {
        const share =
          totalPerf > 0 ? Math.floor(distributableBudget * (d.avgPerformance / totalPerf)) : 0;
        onAllocate(d.id, share);
      });
    }
  }, [distributionMode, departments, totalBudget, onAllocate]);

  const adjustBudget = useCallback(
    (deptId: string, delta: number) => {
      const dept = departments.find((d) => d.id === deptId);
      if (!dept || dept.isLocked) return;
      const newAmount = Math.max(0, dept.allocatedBudget + delta);
      onAllocate(deptId, newAmount);
    },
    [departments, onAllocate]
  );

  return (
    <div className="space-y-4">
      {/* Budget overview */}
      <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sunset-amber" />
            Budget Pool Allocation
          </h3>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              remaining > 0
                ? 'text-celestial-indigo bg-celestial-indigo/10'
                : remaining === 0
                  ? 'text-neural-mint bg-neural-mint/10'
                  : 'text-coral-alert bg-coral-alert/10'
            }`}
          >
            {remaining >= 0 ? formatCurrency(remaining, currency) + ' remaining' : 'Over-allocated'}
          </span>
        </div>

        {/* Budget bar */}
        <div className="h-4 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden mb-2 relative">
          <div
            className="h-full bg-sunset-amber/30 rounded-full transition-all"
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-neural-mint/60 rounded-full transition-all"
            style={{
              width: `${totalBudget > 0 ? Math.min((totalUsed / totalBudget) * 100, 100) : 0}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] text-silver-mist">
          <span>Used: {formatCurrency(totalUsed, currency)}</span>
          <span>Allocated: {formatCurrency(totalAllocated, currency)}</span>
          <span>Total: {formatCurrency(totalBudget, currency)}</span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
            <p className="text-[8px] text-silver-mist">Total Budget</p>
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
              {formatCurrency(totalBudget, currency)}
            </p>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
            <p className="text-[8px] text-silver-mist">Departments</p>
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
              {departments.length}
            </p>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
            <p className="text-[8px] text-silver-mist">Headcount</p>
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl">{totalHeadcount}</p>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
            <p className="text-[8px] text-silver-mist">Eligible</p>
            <p className="text-[11px] font-bold text-ink-black dark:text-pearl">{totalEligible}</p>
          </div>
        </div>
      </div>

      {/* Auto-distribution controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-silver-mist font-semibold">Distribute by:</span>
        {[
          { key: 'manual' as const, label: 'Manual' },
          { key: 'headcount' as const, label: 'Headcount' },
          { key: 'performance' as const, label: 'Performance' },
          { key: 'equal' as const, label: 'Equal Split' },
        ].map((mode) => (
          <button
            key={mode.key}
            onClick={() => setDistributionMode(mode.key)}
            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
              distributionMode === mode.key
                ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
            }`}
          >
            {mode.label}
          </button>
        ))}
        {distributionMode !== 'manual' && (
          <button
            onClick={handleAutoDistribute}
            className="text-[10px] px-3 py-1 rounded-lg bg-celestial-indigo text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        )}
      </div>

      {/* Department allocations */}
      <div className="space-y-2">
        {departments.map((dept) => {
          const deptPercent =
            totalBudget > 0 ? Math.round((dept.allocatedBudget / totalBudget) * 100) : 0;
          const deptUsedPercent =
            dept.allocatedBudget > 0
              ? Math.round((dept.usedBudget / dept.allocatedBudget) * 100)
              : 0;
          const perEmployee =
            dept.eligibleCount > 0 ? Math.round(dept.allocatedBudget / dept.eligibleCount) : 0;
          const avgIncrementPercent =
            dept.totalSalary > 0
              ? (((dept.allocatedBudget * 12) / dept.totalSalary) * 100).toFixed(1)
              : '0.0';

          return (
            <div
              key={dept.id}
              className={`rounded-xl border p-3 transition-colors ${
                dept.isLocked
                  ? 'border-silver-mist/20 bg-pearl/20 dark:bg-deep-cosmos/10'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-ink-black dark:text-pearl">
                      {dept.name}
                    </h4>
                    {dept.isLocked && <Lock className="w-3 h-3 text-silver-mist" />}
                    <span className="text-[9px] text-silver-mist">
                      {dept.headcount} employees · {dept.eligibleCount} eligible
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => adjustBudget(dept.id, -5000)}
                    disabled={dept.isLocked}
                    className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-silver-mist" />
                  </button>
                  <span className="text-xs font-bold text-ink-black dark:text-pearl min-w-[80px] text-center">
                    {formatCurrency(dept.allocatedBudget, currency)}
                  </span>
                  <button
                    onClick={() => adjustBudget(dept.id, 5000)}
                    disabled={dept.isLocked}
                    className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-silver-mist" />
                  </button>
                  <button
                    onClick={() => onLock(dept.id)}
                    className={`ml-1 p-1 rounded transition-colors ${dept.isLocked ? 'bg-silver-mist/10 text-silver-mist' : 'hover:bg-pearl dark:hover:bg-deep-cosmos text-silver-mist/40'}`}
                    title={dept.isLocked ? 'Unlock' : 'Lock allocation'}
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Allocation bar */}
              <div className="h-2 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden mb-1.5 relative">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-sunset-amber/40 transition-all"
                  style={{ width: `${Math.min(deptPercent * 2, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-neural-mint/60 transition-all"
                  style={{
                    width: `${Math.min((deptUsedPercent * (deptPercent * 2)) / 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-silver-mist">
                <span>{deptPercent}% of pool</span>
                <span>~{avgIncrementPercent}% avg increment</span>
                <span>{formatCurrency(perEmployee, currency)}/eligible</span>
                <span>
                  <span className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" fill="currentColor" />{' '}
                    {dept.avgPerformance.toFixed(1)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Over-allocation warning */}
      {remaining < 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-coral-alert/10 border border-coral-alert/20">
          <AlertTriangle className="w-3.5 h-3.5 text-coral-alert shrink-0" />
          <p className="text-[10px] text-coral-alert font-medium">
            Budget over-allocated by {formatCurrency(Math.abs(remaining), currency)}. Reduce
            department allocations to stay within budget.
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetAllocation;
