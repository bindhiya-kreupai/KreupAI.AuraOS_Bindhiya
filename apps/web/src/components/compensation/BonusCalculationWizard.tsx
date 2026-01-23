"use client";

import React, { useState } from "react";
import {
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  Info,
  CheckCircle2,
} from "lucide-react";

interface BonusConfig {
  baseSalary: number;
  targetBonusPercent: number;
  performanceMultiplier: number;
  startDate: string;
  endDate: string;
  prorationMonths: number;
  companyPerformanceFactor: number;
}

const initialConfig: BonusConfig = {
  baseSalary: 165000,
  targetBonusPercent: 20,
  performanceMultiplier: 1.15,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  prorationMonths: 12,
  companyPerformanceFactor: 1.05,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function BonusCalculationWizard() {
  const [config, setConfig] = useState<BonusConfig>(initialConfig);
  const [step, setStep] = useState(1);

  const targetBonus = config.baseSalary * (config.targetBonusPercent / 100);
  const prorationFactor = config.prorationMonths / 12;
  const adjustedBonus =
    targetBonus *
    config.performanceMultiplier *
    prorationFactor *
    config.companyPerformanceFactor;

  const steps = [
    { num: 1, label: "Base & Target" },
    { num: 2, label: "Performance" },
    { num: 3, label: "Proration" },
    { num: 4, label: "Summary" },
  ];

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-6 h-6 text-celestial-indigo" />
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Bonus Calculation Wizard
          </h1>
        </div>
        <p className="text-silver-mist mb-6">
          Calculate your estimated bonus payout
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  step === s.num
                    ? "bg-celestial-indigo text-white"
                    : step > s.num
                    ? "bg-aurora-green/10 text-aurora-green"
                    : "bg-cloud dark:bg-nebula-purple/20 text-silver-mist"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${step > s.num ? "bg-aurora-green" : "bg-cloud dark:bg-nebula-purple/30"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-celestial-indigo" />
                Base Salary & Target
              </h2>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                  Annual Base Salary
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                  <input
                    type="number"
                    value={config.baseSalary}
                    onChange={(e) => setConfig({ ...config, baseSalary: Number(e.target.value) })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                  Target Bonus Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.targetBonusPercent}
                    onChange={(e) => setConfig({ ...config, targetBonusPercent: Number(e.target.value) })}
                    className="w-full pr-9 pl-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                </div>
                <p className="text-xs text-silver-mist mt-1">
                  Target bonus: {formatCurrency(targetBonus)}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-celestial-indigo" />
                Performance Multipliers
              </h2>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
                  Individual Performance Multiplier: {config.performanceMultiplier.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={config.performanceMultiplier}
                  onChange={(e) => setConfig({ ...config, performanceMultiplier: Number(e.target.value) })}
                  className="w-full h-2 accent-celestial-indigo"
                />
                <div className="flex justify-between text-xs text-silver-mist mt-1">
                  <span>0x (Below)</span>
                  <span>1x (Target)</span>
                  <span>2x (Exceptional)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-2">
                  Company Performance Factor: {config.companyPerformanceFactor.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={config.companyPerformanceFactor}
                  onChange={(e) => setConfig({ ...config, companyPerformanceFactor: Number(e.target.value) })}
                  className="w-full h-2 accent-celestial-indigo"
                />
                <div className="flex justify-between text-xs text-silver-mist mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>1.5x</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/20">
                <div className="flex items-center gap-2 text-sm text-celestial-indigo">
                  <Info className="w-4 h-4" />
                  <span>Combined multiplier: {(config.performanceMultiplier * config.companyPerformanceFactor).toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-celestial-indigo" />
                Proration (Mid-Year Adjustments)
              </h2>
              <div>
                <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">
                  Eligible Months in Period
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={config.prorationMonths}
                  onChange={(e) => setConfig({ ...config, prorationMonths: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:ring-2 focus:ring-celestial-indigo focus:outline-none"
                />
                <p className="text-xs text-silver-mist mt-1">
                  For employees who joined mid-year or changed roles
                </p>
              </div>
              <div className="p-4 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
                <p className="text-sm text-ink-black dark:text-pearl">
                  Proration factor: <span className="font-bold">{(prorationFactor * 100).toFixed(1)}%</span>
                </p>
                <p className="text-xs text-silver-mist mt-1">
                  {config.prorationMonths} of 12 months eligible
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
                Bonus Calculation Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                  <span className="text-sm text-silver-mist">Base Salary</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {formatCurrency(config.baseSalary)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                  <span className="text-sm text-silver-mist">Target Bonus ({config.targetBonusPercent}%)</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {formatCurrency(targetBonus)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                  <span className="text-sm text-silver-mist">Individual Performance</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {config.performanceMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                  <span className="text-sm text-silver-mist">Company Performance</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {config.companyPerformanceFactor.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/50">
                  <span className="text-sm text-silver-mist">Proration ({config.prorationMonths}/12 months)</span>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {(prorationFactor * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-celestial-indigo/10 to-aurora-green/10 border border-celestial-indigo/20">
                <p className="text-sm text-silver-mist mb-1">Estimated Bonus Payout</p>
                <p className="text-3xl font-bold text-ink-black dark:text-pearl">
                  {formatCurrency(adjustedBonus)}
                </p>
                <p className="text-xs text-silver-mist mt-1">
                  {formatCurrency(targetBonus)} x {config.performanceMultiplier.toFixed(2)} x {config.companyPerformanceFactor.toFixed(2)} x {(prorationFactor).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl disabled:opacity-40 hover:bg-cloud dark:hover:bg-nebula-purple/20"
          >
            Previous
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90"
            >
              Next
            </button>
          ) : (
            <button className="px-6 py-2 rounded-lg bg-aurora-green text-white font-medium hover:bg-aurora-green/90">
              Confirm Calculation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
