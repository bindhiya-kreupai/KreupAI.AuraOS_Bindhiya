/**
 * @module SalaryReview
 * @description Individual salary review card with merit increase calculator
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Calculator,
  AlertTriangle,
} from 'lucide-react';

export interface EmployeeReviewData {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  grade: string;
  currentSalary: number;
  currency: string;
  compaRatio: number;
  performanceRating: number; // 1-5
  performanceLabel: string;
  tenure: number; // months
  lastIncrementDate: string;
  lastIncrementPercent: number;
  marketMedian: number;
  marketPosition: 'leading' | 'competitive' | 'lagging';
  isEligible: boolean;
  proposedIncrement?: number;
  proposedSalary?: number;
  status: 'pending' | 'proposed' | 'approved' | 'rejected';
}

interface SalaryReviewProps {
  employee: EmployeeReviewData;
  budgetRemaining: number;
  onPropose: (
    employeeId: string,
    incrementPercent: number,
    amount: number,
    justification: string
  ) => void;
  readonly?: boolean;
}

const RATING_CONFIG: Record<
  number,
  { label: string; color: string; meritRange: [number, number] }
> = {
  1: { label: 'Needs Improvement', color: 'text-coral-alert', meritRange: [0, 0] },
  2: { label: 'Developing', color: 'text-sunset-amber', meritRange: [0, 3] },
  3: { label: 'Meets Expectations', color: 'text-silver-mist', meritRange: [3, 6] },
  4: { label: 'Exceeds Expectations', color: 'text-celestial-indigo', meritRange: [6, 10] },
  5: { label: 'Exceptional', color: 'text-neural-mint', meritRange: [10, 15] },
};

const MARKET_CONFIG: Record<string, { label: string; color: string }> = {
  leading: { label: 'Above Market', color: 'text-neural-mint bg-neural-mint/10' },
  competitive: { label: 'At Market', color: 'text-celestial-indigo bg-celestial-indigo/10' },
  lagging: { label: 'Below Market', color: 'text-coral-alert bg-coral-alert/10' },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const SalaryReview: React.FC<SalaryReviewProps> = ({
  employee,
  budgetRemaining,
  onPropose,
  readonly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [incrementPercent, setIncrementPercent] = useState(employee.proposedIncrement || 0);
  const [justification, setJustification] = useState('');

  const ratingConfig = RATING_CONFIG[Math.round(employee.performanceRating)] || RATING_CONFIG[3];
  const marketConfig = MARKET_CONFIG[employee.marketPosition];

  const proposedSalary = useMemo(() => {
    return Math.round(employee.currentSalary * (1 + incrementPercent / 100));
  }, [employee.currentSalary, incrementPercent]);

  const incrementAmount = proposedSalary - employee.currentSalary;
  const annualCost = incrementAmount * 12;
  const exceedsBudget = annualCost > budgetRemaining;

  const newCompaRatio = useMemo(() => {
    if (employee.marketMedian === 0) return 0;
    return Math.round((proposedSalary / employee.marketMedian) * 100) / 100;
  }, [proposedSalary, employee.marketMedian]);

  const handlePropose = useCallback(() => {
    if (incrementPercent <= 0 || exceedsBudget) return;
    onPropose(employee.id, incrementPercent, incrementAmount, justification);
  }, [employee.id, incrementPercent, incrementAmount, justification, exceedsBudget, onPropose]);

  const tenureYears = Math.floor(employee.tenure / 12);
  const tenureMonths = employee.tenure % 12;

  return (
    <div
      className={`rounded-xl border transition-colors ${
        employee.status === 'approved'
          ? 'border-neural-mint/30 bg-neural-mint/5 dark:bg-neural-mint/5'
          : employee.status === 'rejected'
            ? 'border-coral-alert/20 bg-coral-alert/5 dark:bg-coral-alert/5'
            : !employee.isEligible
              ? 'border-cloud/50 dark:border-nebula-purple/10 bg-pearl/20 dark:bg-deep-cosmos/10 opacity-60'
              : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
      }`}
    >
      {/* Summary row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-bold text-celestial-indigo shrink-0">
          {employee.employeeName
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
              {employee.employeeName}
            </h4>
            <span className="text-[9px] text-silver-mist">{employee.employeeCode}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-silver-mist">
            <span>{employee.designation}</span>
            <span>·</span>
            <span>{employee.grade}</span>
          </div>
        </div>

        {/* Current salary */}
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-ink-black dark:text-pearl">
            {formatCurrency(employee.currentSalary, employee.currency)}
          </p>
          <div className="flex items-center gap-1 justify-end">
            {/* Rating stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${i < Math.round(employee.performanceRating) ? ratingConfig.color : 'text-cloud dark:text-nebula-purple/30'}`}
                  fill={i < Math.round(employee.performanceRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {employee.status === 'approved' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-neural-mint bg-neural-mint/10">
              Approved
            </span>
          )}
          {employee.status === 'rejected' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-coral-alert bg-coral-alert/10">
              Rejected
            </span>
          )}
          {employee.status === 'proposed' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-sunset-amber bg-sunset-amber/10">
              Proposed
            </span>
          )}
          {!employee.isEligible && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-silver-mist bg-silver-mist/10">
              Ineligible
            </span>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-silver-mist shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-silver-mist shrink-0" />
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-3">
          {/* Detail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="px-2.5 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
              <p className="text-[9px] text-silver-mist mb-0.5">Compa-Ratio</p>
              <p
                className={`text-sm font-bold ${
                  employee.compaRatio >= 1.1
                    ? 'text-neural-mint'
                    : employee.compaRatio >= 0.9
                      ? 'text-celestial-indigo'
                      : 'text-coral-alert'
                }`}
              >
                {employee.compaRatio.toFixed(2)}
              </p>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
              <p className="text-[9px] text-silver-mist mb-0.5">Market Position</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${marketConfig.color}`}
              >
                {marketConfig.label}
              </span>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
              <p className="text-[9px] text-silver-mist mb-0.5">Tenure</p>
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {tenureYears > 0 ? `${tenureYears}y ` : ''}
                {tenureMonths}m
              </p>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10">
              <p className="text-[9px] text-silver-mist mb-0.5">Last Increment</p>
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {employee.lastIncrementPercent}%
              </p>
              <p className="text-[8px] text-silver-mist">
                {new Date(employee.lastIncrementDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Market comparison bar */}
          <div>
            <p className="text-[10px] text-silver-mist mb-1">Salary vs Market Median</p>
            <div className="relative h-5 rounded-full bg-pearl/50 dark:bg-deep-cosmos/20 overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-silver-mist/40 z-10" />
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  employee.marketPosition === 'leading'
                    ? 'bg-neural-mint/30'
                    : employee.marketPosition === 'competitive'
                      ? 'bg-celestial-indigo/30'
                      : 'bg-coral-alert/30'
                }`}
                style={{
                  width: `${Math.min((employee.currentSalary / (employee.marketMedian * 1.5)) * 100, 100)}%`,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-ink-black dark:text-pearl z-20">
                {formatCurrency(employee.currentSalary, employee.currency)} /{' '}
                {formatCurrency(employee.marketMedian, employee.currency)} median
              </span>
            </div>
          </div>

          {/* Merit increase calculator */}
          {employee.isEligible && !readonly && employee.status === 'pending' && (
            <div className="rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5 dark:bg-celestial-indigo/5 p-3 space-y-3">
              <h5 className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-1">
                <Calculator className="w-3 h-3 text-celestial-indigo" /> Merit Increase Calculator
              </h5>

              {/* Recommended range */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-silver-mist">Recommended range:</span>
                <span className={`font-semibold ${ratingConfig.color}`}>
                  {ratingConfig.meritRange[0]}% – {ratingConfig.meritRange[1]}%
                </span>
                <span className="text-silver-mist">based on {ratingConfig.label} rating</span>
              </div>

              {/* Increment slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-silver-mist">Increment Percentage</label>
                  <span className="text-xs font-bold text-celestial-indigo">
                    {incrementPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={incrementPercent}
                  onChange={(e) => setIncrementPercent(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-cloud dark:bg-nebula-purple/20 accent-celestial-indigo"
                />
                <div className="flex items-center justify-between text-[8px] text-silver-mist mt-0.5">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Result preview */}
              {incrementPercent > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-stellar-blue border border-cloud/50 dark:border-nebula-purple/10">
                    <p className="text-[8px] text-silver-mist">Proposed Salary</p>
                    <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                      {formatCurrency(proposedSalary, employee.currency)}
                    </p>
                  </div>
                  <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-stellar-blue border border-cloud/50 dark:border-nebula-purple/10">
                    <p className="text-[8px] text-silver-mist">Monthly Increase</p>
                    <p className="text-[11px] font-bold text-neural-mint">
                      +{formatCurrency(incrementAmount, employee.currency)}
                    </p>
                  </div>
                  <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-stellar-blue border border-cloud/50 dark:border-nebula-purple/10">
                    <p className="text-[8px] text-silver-mist">New Compa-Ratio</p>
                    <p
                      className={`text-[11px] font-bold ${newCompaRatio >= 0.9 && newCompaRatio <= 1.1 ? 'text-celestial-indigo' : 'text-sunset-amber'}`}
                    >
                      {newCompaRatio.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Budget warning */}
              {exceedsBudget && incrementPercent > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-coral-alert/10 border border-coral-alert/20">
                  <AlertTriangle className="w-3 h-3 text-coral-alert shrink-0" />
                  <p className="text-[9px] text-coral-alert">
                    Annual cost ({formatCurrency(annualCost, employee.currency)}) exceeds remaining
                    budget ({formatCurrency(budgetRemaining, employee.currency)})
                  </p>
                </div>
              )}

              {/* Justification */}
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Justification for the proposed increment..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg border border-cloud/50 dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[11px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo resize-none transition-colors"
              />

              <button
                onClick={handlePropose}
                disabled={incrementPercent <= 0 || exceedsBudget}
                className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Propose {incrementPercent}% Increment
              </button>
            </div>
          )}

          {/* Already proposed/approved info */}
          {employee.proposedIncrement && employee.proposedIncrement > 0 && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                employee.status === 'approved'
                  ? 'bg-neural-mint/10 border border-neural-mint/20'
                  : employee.status === 'rejected'
                    ? 'bg-coral-alert/10 border border-coral-alert/20'
                    : 'bg-sunset-amber/10 border border-sunset-amber/20'
              }`}
            >
              {employee.status === 'approved' && <Check className="w-3.5 h-3.5 text-neural-mint" />}
              {employee.status === 'rejected' && <X className="w-3.5 h-3.5 text-coral-alert" />}
              <div>
                <p className="text-[11px] font-semibold text-ink-black dark:text-pearl">
                  {employee.proposedIncrement}% increment →{' '}
                  {formatCurrency(employee.proposedSalary || proposedSalary, employee.currency)}
                </p>
                <p className="text-[9px] text-silver-mist">
                  {employee.status === 'approved'
                    ? 'Approved'
                    : employee.status === 'rejected'
                      ? 'Rejected'
                      : 'Pending approval'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryReview;
