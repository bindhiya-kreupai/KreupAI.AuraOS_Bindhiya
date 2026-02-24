/**
 * @module PlanSelection
 * @description Step 1 — Browse and select benefit plans by category
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Check, Star, Heart, Smile, Eye, Shield, Umbrella, Wallet, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BenefitPlan, BenefitCategory, EnrollmentSelection } from '@/services/benefitsService';
import { CATEGORY_META } from '@/services/benefitsService';

interface PlanSelectionProps {
  plansByCategory: Record<string, BenefitPlan[]>;
  availableCategories: BenefitCategory[];
  activeCategory: BenefitCategory;
  onCategoryChange: (cat: BenefitCategory) => void;
  selections: Record<string, EnrollmentSelection | null>;
  onSelectPlan: (category: BenefitCategory, planId: string) => void;
  onDeselectPlan: (category: BenefitCategory) => void;
  comparePlans: string[];
  onToggleCompare: (planId: string) => void;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  health: Heart,
  dental: Smile,
  vision: Eye,
  life: Shield,
  disability: Umbrella,
  fsa_hsa: Wallet,
};

export const PlanSelection: React.FC<PlanSelectionProps> = ({
  plansByCategory,
  availableCategories,
  activeCategory,
  onCategoryChange,
  selections,
  onSelectPlan,
  onDeselectPlan,
  comparePlans,
  onToggleCompare,
}) => {
  const currentPlans = plansByCategory[activeCategory] || [];
  const currentSelection = selections[activeCategory];

  return (
    <div className="space-y-5">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {availableCategories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = CATEGORY_ICONS[cat] || Heart;
          const isSelected = !!selections[cat];
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-celestial-indigo text-white shadow-sm'
                  : 'bg-pearl dark:bg-deep-cosmos text-twilight dark:text-silver-mist hover:bg-celestial-indigo/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
              {isSelected && activeCategory !== cat && (
                <Check className="w-3 h-3 text-neural-mint" />
              )}
            </button>
          );
        })}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentPlans.map((plan) => {
          const isActive = currentSelection?.planId === plan.id;
          const isComparing = comparePlans.includes(plan.id);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                isActive
                  ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10 shadow-md'
                  : 'border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/50 hover:shadow-sm'
              }`}
              onClick={() =>
                isActive ? onDeselectPlan(activeCategory) : onSelectPlan(activeCategory, plan.id)
              }
            >
              {/* Recommended badge */}
              {plan.isRecommended && (
                <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sunset-amber text-white text-[10px] font-bold">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  Recommended
                </div>
              )}

              {/* Selected indicator */}
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-celestial-indigo flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div className="mt-1">
                {/* Tier badge */}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    plan.tier === 'platinum'
                      ? 'bg-nebula-purple/10 text-nebula-purple'
                      : plan.tier === 'gold'
                        ? 'bg-sunset-amber/10 text-sunset-amber'
                        : 'bg-silver-mist/10 text-silver-mist'
                  }`}
                >
                  {plan.tier}
                </span>

                <h4 className="text-sm font-bold text-ink-black dark:text-pearl mt-2">
                  {plan.name}
                </h4>
                <p className="text-[10px] text-silver-mist mt-0.5">{plan.carrier}</p>
                <p className="text-xs text-silver-mist mt-1.5 leading-relaxed">
                  {plan.description}
                </p>

                {/* Premium */}
                <div className="mt-3 p-2.5 rounded-xl bg-pearl/50 dark:bg-deep-cosmos/30">
                  <p className="text-[10px] text-silver-mist">Employee monthly cost</p>
                  <p className="text-lg font-bold text-ink-black dark:text-pearl">
                    ${plan.premiums.employee_only.employee}
                    <span className="text-xs font-normal text-silver-mist">/mo</span>
                  </p>
                </div>

                {/* Features */}
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-ink-black dark:text-pearl"
                    >
                      <Check className="w-3 h-3 text-neural-mint shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Compare checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(plan.id);
                  }}
                  className={`mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    isComparing
                      ? 'bg-celestial-indigo/10 text-celestial-indigo'
                      : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos'
                  }`}
                >
                  <BarChart3 className="w-3 h-3" />
                  {isComparing ? 'Comparing' : 'Compare'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelection;
