"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Shield,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  monthlyPremium: number;
  description: string;
}

interface CoverageLevel {
  id: string;
  label: string;
  multiplier: number;
}

interface Dependent {
  name: string;
  relationship: string;
}

const steps = [
  { label: "Plan Selection", icon: ClipboardList },
  { label: "Coverage Level", icon: Shield },
  { label: "Dependents", icon: Users },
  { label: "Cost Summary", icon: DollarSign },
  { label: "Confirmation", icon: CheckCircle2 },
];

const mockPlans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPremium: 150,
    description: "Essential coverage for individuals with low premiums and higher deductibles.",
  },
  {
    id: "standard",
    name: "Standard Plan",
    monthlyPremium: 300,
    description: "Balanced coverage with moderate premiums and deductibles for families.",
  },
  {
    id: "premium",
    name: "Premium Plan",
    monthlyPremium: 500,
    description: "Comprehensive coverage with low deductibles and maximum benefits.",
  },
];

const coverageLevels: CoverageLevel[] = [
  { id: "employee", label: "Employee Only", multiplier: 1 },
  { id: "employee_spouse", label: "Employee + Spouse", multiplier: 1.8 },
  { id: "employee_children", label: "Employee + Children", multiplier: 1.6 },
  { id: "family", label: "Family", multiplier: 2.5 },
];

const mockDependents: Dependent[] = [
  { name: "Jane Doe", relationship: "Spouse" },
  { name: "Alex Doe", relationship: "Child" },
];

export default function BenefitsEnrollmentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("");
  const [selectedDependents, setSelectedDependents] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const toggleDependent = (name: string) => {
    setSelectedDependents((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const getSelectedPlan = () => mockPlans.find((p) => p.id === selectedPlan);
  const getSelectedCoverage = () => coverageLevels.find((c) => c.id === selectedCoverage);

  const calculateCost = () => {
    const plan = getSelectedPlan();
    const coverage = getSelectedCoverage();
    if (!plan || !coverage) return 0;
    return plan.monthlyPremium * coverage.multiplier;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Select Your Plan
            </h3>
            <div className="grid gap-4">
              {mockPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedPlan === plan.id
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
                  } bg-white dark:bg-stellar-blue`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-ink-black dark:text-pearl">{plan.name}</p>
                      <p className="text-sm text-silver-mist mt-1">{plan.description}</p>
                    </div>
                    <p className="text-celestial-indigo font-semibold">
                      ${ plan.monthlyPremium}/mo
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Choose Coverage Level
            </h3>
            <div className="grid gap-3">
              {coverageLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedCoverage(level.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedCoverage === level.id
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
                  } bg-white dark:bg-stellar-blue`}
                >
                  <p className="font-medium text-ink-black dark:text-pearl">{level.label}</p>
                  <p className="text-sm text-silver-mist mt-1">
                    Cost multiplier: {level.multiplier}x
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Select Dependents
            </h3>
            <div className="grid gap-3">
              {mockDependents.map((dep) => (
                <button
                  key={dep.name}
                  onClick={() => toggleDependent(dep.name)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedDependents.includes(dep.name)
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
                  } bg-white dark:bg-stellar-blue`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-celestial-indigo" />
                    <div>
                      <p className="font-medium text-ink-black dark:text-pearl">{dep.name}</p>
                      <p className="text-sm text-silver-mist">{dep.relationship}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">Cost Summary</h3>
            <div className="p-6 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue space-y-3">
              <div className="flex justify-between">
                <span className="text-silver-mist">Plan</span>
                <span className="text-ink-black dark:text-pearl font-medium">
                  {getSelectedPlan()?.name || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-mist">Coverage</span>
                <span className="text-ink-black dark:text-pearl font-medium">
                  {getSelectedCoverage()?.label || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-mist">Dependents</span>
                <span className="text-ink-black dark:text-pearl font-medium">
                  {selectedDependents.length}
                </span>
              </div>
              <hr className="border-cloud dark:border-nebula-purple/50" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-ink-black dark:text-pearl">Monthly Total</span>
                <span className="font-bold text-celestial-indigo">
                  ${ calculateCost().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-ink-black dark:text-pearl">
              Enrollment Confirmed
            </h3>
            <p className="text-silver-mist">
              Your benefits enrollment has been submitted successfully. You will receive a
              confirmation email shortly.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    index <= currentStep
                      ? "bg-celestial-indigo text-white"
                      : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index <= currentStep
                      ? "text-celestial-indigo font-medium"
                      : "text-silver-mist"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-1 mt-[-12px] ${
                    index < currentStep
                      ? "bg-celestial-indigo"
                      : "bg-gray-200 dark:bg-nebula-purple/30"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

      {/* Navigation */}
      {currentStep < steps.length - 1 && (
        <div className="flex justify-between mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/50">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-celestial-indigo text-white hover:bg-celestial-indigo/90 transition-colors"
          >
            {currentStep === steps.length - 2 ? "Confirm" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
