"use client";

import React, { useState } from "react";
import { Shield, Heart, Eye, Check } from "lucide-react";

interface BenefitPlan {
  id: string;
  name: string;
  type: "medical" | "dental" | "vision";
  monthlyCost: number;
  coverageSummary: string[];
  deductible: number;
}

const mockPlans: BenefitPlan[] = [
  {
    id: "med-basic",
    name: "Basic Medical",
    type: "medical",
    monthlyCost: 185,
    coverageSummary: ["$2,000 deductible", "80/20 coinsurance", "$6,000 max out-of-pocket"],
    deductible: 2000,
  },
  {
    id: "med-plus",
    name: "Medical Plus",
    type: "medical",
    monthlyCost: 320,
    coverageSummary: ["$1,000 deductible", "90/10 coinsurance", "$4,000 max out-of-pocket"],
    deductible: 1000,
  },
  {
    id: "med-premium",
    name: "Premium Medical",
    type: "medical",
    monthlyCost: 475,
    coverageSummary: ["$500 deductible", "95/5 coinsurance", "$2,500 max out-of-pocket"],
    deductible: 500,
  },
  {
    id: "dental-basic",
    name: "Basic Dental",
    type: "dental",
    monthlyCost: 35,
    coverageSummary: ["Preventive 100%", "Basic 80%", "$1,500 annual max"],
    deductible: 50,
  },
  {
    id: "dental-plus",
    name: "Dental Plus",
    type: "dental",
    monthlyCost: 55,
    coverageSummary: ["Preventive 100%", "Basic 90%", "Major 60%", "$2,500 annual max"],
    deductible: 25,
  },
  {
    id: "vision-basic",
    name: "Basic Vision",
    type: "vision",
    monthlyCost: 15,
    coverageSummary: ["Annual eye exam", "$150 frame allowance", "$130 contact lens allowance"],
    deductible: 0,
  },
  {
    id: "vision-plus",
    name: "Vision Plus",
    type: "vision",
    monthlyCost: 28,
    coverageSummary: ["Annual eye exam", "$250 frame allowance", "$200 contact lens allowance", "LASIK discount"],
    deductible: 0,
  },
];

const typeIcons = {
  medical: Shield,
  dental: Heart,
  vision: Eye,
};

const typeLabels = {
  medical: "Medical Plans",
  dental: "Dental Plans",
  vision: "Vision Plans",
};

export function PlanSelection() {
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});

  const handleSelect = (plan: BenefitPlan) => {
    setSelectedPlans((prev) => ({
      ...prev,
      [plan.type]: plan.id,
    }));
  };

  const plansByType = (type: "medical" | "dental" | "vision") =>
    mockPlans.filter((p) => p.type === type);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Select Your Plans</h2>
        <p className="text-sm text-silver-mist mt-1">Choose one plan from each category below.</p>
      </div>

      {(["medical", "dental", "vision"] as const).map((type) => {
        const Icon = typeIcons[type];
        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-celestial-indigo" />
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl uppercase tracking-wide">
                {typeLabels[type]}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plansByType(type).map((plan) => {
                const isSelected = selectedPlans[type] === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-stellar-blue rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-celestial-indigo ring-2 ring-celestial-indigo/20"
                        : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
                    }`}
                    onClick={() => handleSelect(plan)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl">{plan.name}</h4>
                        <p className="text-xs text-silver-mist mt-0.5">
                          Deductible: ${plan.deductible.toLocaleString()}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-celestial-indigo flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-xl font-bold text-ink-black dark:text-pearl">
                        ${plan.monthlyCost}
                      </span>
                      <span className="text-xs text-silver-mist">/month</span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {plan.coverageSummary.map((item, idx) => (
                        <li key={idx} className="text-xs text-silver-mist flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-celestial-indigo flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(plan);
                      }}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-celestial-indigo text-white"
                          : "bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo hover:bg-celestial-indigo/10"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
