"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Target,
  Info,
} from "lucide-react";

interface MeritInput {
  currentSalary: number;
  performanceRating: number;
  compaRatio: number;
  tenure: number;
  marketAdjustment: number;
}

const MERIT_MATRIX: Record<string, Record<string, { min: number; max: number; recommended: number }>> = {
  "Exceptional (5)": {
    "Below Range (<0.85)": { min: 10, max: 15, recommended: 12 },
    "Low in Range (0.85-0.95)": { min: 8, max: 12, recommended: 10 },
    "Mid Range (0.95-1.05)": { min: 6, max: 10, recommended: 8 },
    "High in Range (1.05-1.15)": { min: 4, max: 7, recommended: 5 },
    "Above Range (>1.15)": { min: 2, max: 4, recommended: 3 },
  },
  "Exceeds (4)": {
    "Below Range (<0.85)": { min: 8, max: 12, recommended: 10 },
    "Low in Range (0.85-0.95)": { min: 6, max: 10, recommended: 8 },
    "Mid Range (0.95-1.05)": { min: 5, max: 8, recommended: 6 },
    "High in Range (1.05-1.15)": { min: 3, max: 5, recommended: 4 },
    "Above Range (>1.15)": { min: 1, max: 3, recommended: 2 },
  },
  "Meets (3)": {
    "Below Range (<0.85)": { min: 5, max: 8, recommended: 6 },
    "Low in Range (0.85-0.95)": { min: 4, max: 6, recommended: 5 },
    "Mid Range (0.95-1.05)": { min: 3, max: 5, recommended: 4 },
    "High in Range (1.05-1.15)": { min: 2, max: 3, recommended: 2 },
    "Above Range (>1.15)": { min: 0, max: 2, recommended: 1 },
  },
  "Below (2)": {
    "Below Range (<0.85)": { min: 2, max: 4, recommended: 3 },
    "Low in Range (0.85-0.95)": { min: 1, max: 3, recommended: 2 },
    "Mid Range (0.95-1.05)": { min: 0, max: 2, recommended: 1 },
    "High in Range (1.05-1.15)": { min: 0, max: 1, recommended: 0 },
    "Above Range (>1.15)": { min: 0, max: 0, recommended: 0 },
  },
  "Unsatisfactory (1)": {
    "Below Range (<0.85)": { min: 0, max: 0, recommended: 0 },
    "Low in Range (0.85-0.95)": { min: 0, max: 0, recommended: 0 },
    "Mid Range (0.95-1.05)": { min: 0, max: 0, recommended: 0 },
    "High in Range (1.05-1.15)": { min: 0, max: 0, recommended: 0 },
    "Above Range (>1.15)": { min: 0, max: 0, recommended: 0 },
  },
};

function getPerformanceLabel(rating: number): string {
  if (rating >= 5) return "Exceptional (5)";
  if (rating >= 4) return "Exceeds (4)";
  if (rating >= 3) return "Meets (3)";
  if (rating >= 2) return "Below (2)";
  return "Unsatisfactory (1)";
}

function getCompaRatioLabel(ratio: number): string {
  if (ratio < 0.85) return "Below Range (<0.85)";
  if (ratio < 0.95) return "Low in Range (0.85-0.95)";
  if (ratio < 1.05) return "Mid Range (0.95-1.05)";
  if (ratio < 1.15) return "High in Range (1.05-1.15)";
  return "Above Range (>1.15)";
}

export default function MeritIncreaseCalculator() {
  const [input, setInput] = useState<MeritInput>({
    currentSalary: 120000,
    performanceRating: 4,
    compaRatio: 0.92,
    tenure: 3,
    marketAdjustment: 0,
  });

  const [overridePercent, setOverridePercent] = useState<number | null>(null);

  const calculation = useMemo(() => {
    const perfLabel = getPerformanceLabel(input.performanceRating);
    const compaLabel = getCompaRatioLabel(input.compaRatio);
    const matrixEntry = MERIT_MATRIX[perfLabel]?.[compaLabel] ?? { min: 0, max: 0, recommended: 0 };

    const tenureBonus = input.tenure >= 5 ? 0.5 : input.tenure >= 3 ? 0.25 : 0;
    const baseIncrease = matrixEntry.recommended + tenureBonus + input.marketAdjustment;
    const effectiveIncrease = overridePercent ?? baseIncrease;

    const increaseAmount = Math.round(input.currentSalary * (effectiveIncrease / 100));
    const newSalary = input.currentSalary + increaseAmount;
    const newCompaRatio = input.compaRatio * (1 + effectiveIncrease / 100);

    return {
      perfLabel,
      compaLabel,
      matrixEntry,
      tenureBonus,
      baseIncrease,
      effectiveIncrease,
      increaseAmount,
      newSalary,
      newCompaRatio,
    };
  }, [input, overridePercent]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
          Merit Increase Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Inputs</h4>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Current Annual Salary</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={input.currentSalary}
                onChange={(e) => setInput({ ...input, currentSalary: Number(e.target.value) })}
                className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Performance Rating</label>
            <select
              value={input.performanceRating}
              onChange={(e) => setInput({ ...input, performanceRating: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
            >
              <option value={5}>5 - Exceptional</option>
              <option value={4}>4 - Exceeds Expectations</option>
              <option value={3}>3 - Meets Expectations</option>
              <option value={2}>2 - Below Expectations</option>
              <option value={1}>1 - Unsatisfactory</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Compa-Ratio (Current vs. Market Midpoint)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="1.5"
              value={input.compaRatio}
              onChange={(e) => setInput({ ...input, compaRatio: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">1.00 = at market midpoint</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tenure (Years)</label>
            <input
              type="number"
              min="0"
              max="40"
              value={input.tenure}
              onChange={(e) => setInput({ ...input, tenure: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Market Adjustment (%)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="10"
              value={input.marketAdjustment}
              onChange={(e) => setInput({ ...input, marketAdjustment: Number(e.target.value) })}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">Additional % for market correction</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Calculation Result</h4>

          {/* Matrix Lookup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Merit Matrix Lookup</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Performance:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{calculation.perfLabel}</p>
              </div>
              <div>
                <span className="text-slate-400">Position in Range:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{calculation.compaLabel}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400">Guideline Range: </span>
              <span className="font-bold text-indigo-600">
                {calculation.matrixEntry.min}% - {calculation.matrixEntry.max}%
              </span>
              <span className="text-slate-400 ml-2">(Recommended: {calculation.matrixEntry.recommended}%)</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Calculation Breakdown</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Matrix Recommended</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{calculation.matrixEntry.recommended}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure Bonus ({input.tenure}yr)</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">+{calculation.tenureBonus}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Market Adjustment</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">+{input.marketAdjustment}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-700 dark:text-slate-200">Total Recommended</span>
                <span className="font-mono text-indigo-600">{calculation.baseIncrease}%</span>
              </div>
            </div>
          </div>

          {/* Override */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Override Increase % (optional)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="25"
              value={overridePercent ?? ""}
              onChange={(e) => setOverridePercent(e.target.value ? Number(e.target.value) : null)}
              placeholder={`Recommended: ${calculation.baseIncrease}%`}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Final Result */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Final Result</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-medium">Increase %</p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {calculation.effectiveIncrease.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-medium">Increase Amount</p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  ${calculation.increaseAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-medium">New Salary</p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  ${calculation.newSalary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-medium">New Compa-Ratio</p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {calculation.newCompaRatio.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning if outside guideline */}
          {overridePercent !== null && (overridePercent < calculation.matrixEntry.min || overridePercent > calculation.matrixEntry.max) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Override value is outside the guideline range ({calculation.matrixEntry.min}%-{calculation.matrixEntry.max}%). This will require additional approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Merit Matrix Reference */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Merit Matrix Reference (Recommended %)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-2 px-3 font-medium">Rating \ Position</th>
                <th className="text-center py-2 px-3 font-medium">&lt;0.85</th>
                <th className="text-center py-2 px-3 font-medium">0.85-0.95</th>
                <th className="text-center py-2 px-3 font-medium">0.95-1.05</th>
                <th className="text-center py-2 px-3 font-medium">1.05-1.15</th>
                <th className="text-center py-2 px-3 font-medium">&gt;1.15</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MERIT_MATRIX).map(([perf, ranges]) => (
                <tr key={perf} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{perf}</td>
                  {Object.values(ranges).map((val, idx) => (
                    <td key={idx} className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                      {val.recommended}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
