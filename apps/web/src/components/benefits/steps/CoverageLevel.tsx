/**
 * @module CoverageLevel
 * @description Step 2 — Choose coverage tier for each selected plan
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { User, Users, Baby, Home, Check, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  BenefitPlan,
  BenefitCategory,
  CoverageLevel as CoverageLevelType,
  EnrollmentSelection,
} from '@/services/benefitsService';
import { CATEGORY_META, COVERAGE_LABELS } from '@/services/benefitsService';

interface CoverageLevelProps {
  plans: BenefitPlan[];
  selections: Record<string, EnrollmentSelection | null>;
  onSetCoverage: (category: BenefitCategory, level: CoverageLevelType) => void;
}

const COVERAGE_ICONS: Record<CoverageLevelType, LucideIcon> = {
  employee_only: User,
  employee_spouse: Users,
  employee_children: Baby,
  family: Home,
};

const COVERAGE_DESCRIPTIONS: Record<CoverageLevelType, string> = {
  employee_only: 'Coverage for yourself only',
  employee_spouse: 'Coverage for you and your spouse or domestic partner',
  employee_children: 'Coverage for you and your dependent children',
  family: 'Coverage for you, spouse, and children',
};

export const CoverageLevel: React.FC<CoverageLevelProps> = ({
  plans,
  selections,
  onSetCoverage,
}) => {
  // Only show categories with a selected plan
  const selectedCategories = Object.entries(selections)
    .filter(([, sel]) => sel !== null)
    .map(([cat]) => cat as BenefitCategory);

  if (selectedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-silver-mist">
          No plans selected. Go back and choose at least one plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedCategories.map((cat) => {
        const selection = selections[cat]!;
        const plan = plans.find((p) => p.id === selection.planId);
        if (!plan) return null;
        const meta = CATEGORY_META[cat];

        return (
          <div
            key={cat}
            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4"
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 rounded-lg ${meta.color}`}>
                <div className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-black dark:text-pearl">{meta.label}</h4>
                <p className="text-[10px] text-silver-mist">
                  {plan.name} — {plan.carrier}
                </p>
              </div>
            </div>

            {/* Coverage options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(COVERAGE_LABELS) as CoverageLevelType[]).map((level) => {
                const Icon = COVERAGE_ICONS[level];
                const premium = plan.premiums[level];
                const isActive = selection.coverageLevel === level;

                return (
                  <button
                    key={level}
                    onClick={() => onSetCoverage(cat, level)}
                    className={`relative flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
                        : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-celestial-indigo flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-celestial-indigo/10' : 'bg-pearl dark:bg-deep-cosmos'}`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                        {COVERAGE_LABELS[level]}
                      </p>
                      <p className="text-[10px] text-silver-mist mt-0.5">
                        {COVERAGE_DESCRIPTIONS[level]}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <DollarSign className="w-3 h-3 text-neural-mint" />
                        <span className="text-xs font-bold text-ink-black dark:text-pearl">
                          ${premium.employee}
                        </span>
                        <span className="text-[10px] text-silver-mist">/mo (you pay)</span>
                      </div>
                      <p className="text-[10px] text-silver-mist/70 mt-0.5">
                        Employer pays ${premium.employer}/mo
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoverageLevel;
