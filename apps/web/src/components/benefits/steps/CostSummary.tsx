/**
 * @module CostSummary
 * @description Step 4 — Premium breakdown showing per-category and total costs
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { DollarSign, TrendingUp, Building2, User, PieChart } from 'lucide-react';
import type { CostBreakdown } from '@/services/benefitsService';
import { CATEGORY_META, COVERAGE_LABELS } from '@/services/benefitsService';

interface CostSummaryProps {
  items: CostBreakdown[];
  totalEmployee: number;
  totalEmployer: number;
}

export const CostSummary: React.FC<CostSummaryProps> = ({
  items,
  totalEmployee,
  totalEmployer,
}) => {
  const totalMonthly = totalEmployee + totalEmployer;
  const annualEmployee = totalEmployee * 12;
  const annualTotal = totalMonthly * 12;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-silver-mist/10 flex items-center justify-center mx-auto mb-3">
          <DollarSign className="w-8 h-8 text-silver-mist/40" />
        </div>
        <p className="text-sm text-silver-mist">No plans selected yet.</p>
        <p className="text-xs text-silver-mist/70 mt-1">
          Go back and select plans to see your cost breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-2xl p-4 border border-celestial-indigo/20">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-celestial-indigo" />
            <span className="text-[10px] text-celestial-indigo font-semibold uppercase tracking-wide">
              You Pay
            </span>
          </div>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">${totalEmployee}</p>
          <p className="text-[10px] text-silver-mist">
            /month · ${annualEmployee.toLocaleString()}/year
          </p>
        </div>

        <div className="bg-neural-mint/5 dark:bg-neural-mint/10 rounded-2xl p-4 border border-neural-mint/20">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-neural-mint" />
            <span className="text-[10px] text-neural-mint font-semibold uppercase tracking-wide">
              Employer Pays
            </span>
          </div>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">${totalEmployer}</p>
          <p className="text-[10px] text-silver-mist">
            /month · ${(totalEmployer * 12).toLocaleString()}/year
          </p>
        </div>

        <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-2xl p-4 border border-sunset-amber/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sunset-amber" />
            <span className="text-[10px] text-sunset-amber font-semibold uppercase tracking-wide">
              Total Value
            </span>
          </div>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl">${totalMonthly}</p>
          <p className="text-[10px] text-silver-mist">
            /month · ${annualTotal.toLocaleString()}/year
          </p>
        </div>
      </div>

      {/* Per-plan breakdown */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <PieChart className="w-4 h-4 text-celestial-indigo" />
            Monthly Cost Breakdown
          </h4>
        </div>

        <div className="divide-y divide-cloud/50 dark:divide-nebula-purple/20">
          {items.map((item) => {
            const meta = CATEGORY_META[item.category];
            const employeePercent =
              item.totalCost > 0 ? Math.round((item.employeeCost / item.totalCost) * 100) : 0;

            return (
              <div key={item.category} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${meta.color.split(' ')[0]?.replace('text-', 'bg-') || 'bg-celestial-indigo'}`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-silver-mist">
                        {item.planName} · {COVERAGE_LABELS[item.coverageLevel]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink-black dark:text-pearl">
                      ${item.totalCost}/mo
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      You: ${item.employeeCost} · Employer: ${item.employerCost}
                    </p>
                  </div>
                </div>

                {/* Cost split bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-pearl dark:bg-deep-cosmos">
                  <div
                    className="bg-celestial-indigo rounded-l-full transition-all"
                    style={{ width: `${employeePercent}%` }}
                  />
                  <div
                    className="bg-neural-mint rounded-r-full transition-all"
                    style={{ width: `${100 - employeePercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-celestial-indigo font-medium">
                    You: {employeePercent}%
                  </span>
                  <span className="text-[9px] text-neural-mint font-medium">
                    Employer: {100 - employeePercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total footer */}
        <div className="px-4 py-3 bg-pearl/30 dark:bg-deep-cosmos/20 border-t border-cloud dark:border-nebula-purple/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-black dark:text-pearl">Monthly Total</span>
            <div className="text-right">
              <span className="text-sm font-bold text-celestial-indigo">${totalEmployee}/mo</span>
              <span className="text-[10px] text-silver-mist ml-2">(${totalMonthly}/mo total)</span>
            </div>
          </div>
          <p className="text-[10px] text-silver-mist mt-1">
            Bi-weekly payroll deduction: ${(totalEmployee / 2).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;
