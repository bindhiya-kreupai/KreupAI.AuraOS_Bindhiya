/**
 * @module PlanComparisonTable
 * @description Side-by-side plan comparison view for benefits enrollment
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { X, Check, Star } from 'lucide-react';
import type { BenefitPlan, CoverageLevel } from '@/services/benefitsService';
import { COVERAGE_LABELS } from '@/services/benefitsService';

interface PlanComparisonTableProps {
  plans: BenefitPlan[];
  coverageLevel: CoverageLevel;
  onRemove: (planId: string) => void;
  onSelect: (planId: string) => void;
  onClose: () => void;
  selectedPlanId?: string;
}

export const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({
  plans,
  coverageLevel,
  onRemove,
  onSelect,
  onClose,
  selectedPlanId,
}) => {
  if (plans.length === 0) return null;

  const rows: { label: string; getValue: (p: BenefitPlan) => string | React.ReactNode }[] = [
    { label: 'Tier', getValue: (p) => <span className="capitalize font-medium">{p.tier}</span> },
    { label: 'Carrier', getValue: (p) => p.carrier },
    {
      label: `Monthly Premium (${COVERAGE_LABELS[coverageLevel]})`,
      getValue: (p) => {
        const prem = p.premiums[coverageLevel];
        return prem ? `$${prem.employee}/mo` : '—';
      },
    },
    {
      label: 'Employer Contribution',
      getValue: (p) => {
        const prem = p.premiums[coverageLevel];
        return prem ? `$${prem.employer}/mo` : '—';
      },
    },
    {
      label: 'Deductible (Individual)',
      getValue: (p) => `$${p.deductible.individual.toLocaleString()}`,
    },
    { label: 'Deductible (Family)', getValue: (p) => `$${p.deductible.family.toLocaleString()}` },
    {
      label: 'Out-of-Pocket Max (Individual)',
      getValue: (p) => `$${p.outOfPocketMax.individual.toLocaleString()}`,
    },
    {
      label: 'Out-of-Pocket Max (Family)',
      getValue: (p) => `$${p.outOfPocketMax.family.toLocaleString()}`,
    },
    {
      label: 'Primary Care Copay',
      getValue: (p) => (p.copay.primaryCare > 0 ? `$${p.copay.primaryCare}` : 'No copay'),
    },
    {
      label: 'Specialist Copay',
      getValue: (p) => (p.copay.specialist > 0 ? `$${p.copay.specialist}` : 'No copay'),
    },
    {
      label: 'Urgent Care Copay',
      getValue: (p) => (p.copay.urgentCare > 0 ? `$${p.copay.urgentCare}` : 'No copay'),
    },
    {
      label: 'Emergency Copay',
      getValue: (p) => (p.copay.emergency > 0 ? `$${p.copay.emergency}` : 'No copay'),
    },
    { label: 'Coinsurance', getValue: (p) => `${p.coinsurance}%` },
  ];

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Plan Comparison</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          <X className="w-4 h-4 text-silver-mist" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/30">
              <th className="text-left px-4 py-3 text-silver-mist font-semibold w-48">Feature</th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-4 py-3 text-center min-w-[180px]">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink-black dark:text-pearl">{plan.name}</span>
                      {plan.isRecommended && (
                        <Star className="w-3 h-3 text-sunset-amber fill-sunset-amber" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onRemove(plan.id)}
                        className="text-[10px] text-silver-mist hover:text-coral-alert transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-cloud/50 dark:border-nebula-purple/20 ${
                  i % 2 === 0 ? 'bg-pearl/20 dark:bg-deep-cosmos/10' : ''
                }`}
              >
                <td className="px-4 py-2.5 text-silver-mist font-medium">{row.label}</td>
                {plans.map((plan) => (
                  <td
                    key={plan.id}
                    className="px-4 py-2.5 text-center text-ink-black dark:text-pearl"
                  >
                    {row.getValue(plan)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Features row */}
            <tr className="border-b border-cloud/50 dark:border-nebula-purple/20">
              <td className="px-4 py-2.5 text-silver-mist font-medium align-top">Key Features</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-2.5">
                  <ul className="space-y-1">
                    {plan.features.map((f, fi) => (
                      <li
                        key={fi}
                        className="flex items-center gap-1.5 text-[10px] text-ink-black dark:text-pearl"
                      >
                        <Check className="w-3 h-3 text-neural-mint shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Select buttons */}
      <div className="flex border-t border-cloud dark:border-nebula-purple/30">
        <div className="w-48 shrink-0" />
        {plans.map((plan) => (
          <div key={plan.id} className="flex-1 px-4 py-3 flex justify-center min-w-[180px]">
            <button
              onClick={() => onSelect(plan.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedPlanId === plan.id
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-pearl dark:bg-deep-cosmos text-twilight dark:text-silver-mist hover:bg-celestial-indigo/10'
              }`}
            >
              {selectedPlanId === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanComparisonTable;
