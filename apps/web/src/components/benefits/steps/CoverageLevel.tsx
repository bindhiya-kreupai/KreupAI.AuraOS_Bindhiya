"use client";

import React, { useState } from "react";
import { User, Users, Baby, Home, Check } from "lucide-react";

interface CoverageTier {
  id: string;
  label: string;
  description: string;
  monthlyCost: number;
  icon: React.ElementType;
}

const coverageTiers: CoverageTier[] = [
  {
    id: "employee-only",
    label: "Employee Only",
    description: "Coverage for you alone",
    monthlyCost: 185,
    icon: User,
  },
  {
    id: "employee-spouse",
    label: "Employee + Spouse",
    description: "Coverage for you and your spouse or domestic partner",
    monthlyCost: 420,
    icon: Users,
  },
  {
    id: "employee-children",
    label: "Employee + Children",
    description: "Coverage for you and your dependent children",
    monthlyCost: 385,
    icon: Baby,
  },
  {
    id: "family",
    label: "Family",
    description: "Coverage for you, your spouse, and dependent children",
    monthlyCost: 625,
    icon: Home,
  },
];

export function CoverageLevel() {
  const [selectedTier, setSelectedTier] = useState<string>("employee-only");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Coverage Level</h2>
        <p className="text-sm text-silver-mist mt-1">
          Select who you would like to cover under your plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coverageTiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`bg-white dark:bg-stellar-blue rounded-xl border p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-celestial-indigo ring-2 ring-celestial-indigo/20"
                  : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-celestial-indigo/10"
                        : "bg-slate-50 dark:bg-deep-cosmos"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-celestial-indigo" : "text-silver-mist"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">{tier.label}</h3>
                    <p className="text-xs text-silver-mist mt-0.5">{tier.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-celestial-indigo flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/50">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-silver-mist">Monthly Premium</span>
                  <div>
                    <span className="text-lg font-bold text-ink-black dark:text-pearl">
                      ${tier.monthlyCost}
                    </span>
                    <span className="text-xs text-silver-mist">/month</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs text-silver-mist">Per Paycheck (bi-weekly)</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    ${(tier.monthlyCost / 2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-deep-cosmos rounded-xl p-4 border border-cloud dark:border-nebula-purple/50">
        <p className="text-xs text-silver-mist">
          <span className="font-medium text-ink-black dark:text-pearl">Note:</span> Monthly costs shown
          are based on your selected medical plan. Actual costs may vary based on additional dental and
          vision selections. Employer contributes up to 70% for Employee Only and 50% for dependent coverage.
        </p>
      </div>
    </div>
  );
}
