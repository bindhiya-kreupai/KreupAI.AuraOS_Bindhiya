/**
 * @module BenefitsEnrollmentWizard
 * @description Multi-step benefits enrollment wizard container
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBenefitsEnrollment, type WizardStep } from '@/hooks/useBenefits';
import { OpenEnrollmentBanner } from './OpenEnrollmentBanner';
import { PlanComparisonTable } from './PlanComparisonTable';
import { PlanSelection } from './steps/PlanSelection';
import { CoverageLevel } from './steps/CoverageLevel';
import { DependentSelection } from './steps/DependentSelection';
import { CostSummary } from './steps/CostSummary';
import { Confirmation } from './steps/Confirmation';

// ── Step metadata ─────────────────────────────────────────────────────────────

interface StepMeta {
  key: WizardStep;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const STEPS: StepMeta[] = [
  { key: 'plans', label: 'Select Plans', shortLabel: 'Plans', icon: Heart },
  { key: 'coverage', label: 'Coverage Level', shortLabel: 'Coverage', icon: Shield },
  { key: 'dependents', label: 'Dependents', shortLabel: 'Dependents', icon: Users },
  { key: 'summary', label: 'Cost Summary', shortLabel: 'Costs', icon: DollarSign },
  { key: 'confirmation', label: 'Review & Submit', shortLabel: 'Submit', icon: CheckCircle2 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const BenefitsEnrollmentWizard: React.FC = () => {
  const {
    plans,
    plansByCategory,
    availableCategories,
    dependents,
    enrollmentWindow,
    loading,
    wizard,
    goNext,
    goBack,
    goToStep,
    selections,
    activeCategory,
    setActiveCategory,
    selectPlan,
    deselectPlan,
    setCoverageLevel,
    setDependentIds,
    selectedCount,
    addDependent,
    removeDependent,
    costs,
    comparePlans,
    toggleCompare,
    clearCompare,
    comparedPlanObjects,
    submitting,
    submitEnrollment,
    enrollmentId,
  } = useBenefitsEnrollment();

  const [showCompare, setShowCompare] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
        <span className="ml-2 text-sm text-silver-mist">Loading benefits data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Enrollment Banner */}
      {enrollmentWindow && <OpenEnrollmentBanner window={enrollmentWindow} />}

      {/* Stepper */}
      <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = wizard.currentStep === step.key;
            const isPast = wizard.stepIndex > i;
            const isClickable = isPast || i <= wizard.stepIndex;

            return (
              <React.Fragment key={step.key}>
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      isPast ? 'bg-celestial-indigo' : 'bg-cloud dark:bg-nebula-purple/30'
                    }`}
                  />
                )}
                <button
                  onClick={() => isClickable && goToStep(step.key)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                    isActive
                      ? 'bg-celestial-indigo text-white shadow-sm'
                      : isPast
                        ? 'bg-celestial-indigo/10 text-celestial-indigo'
                        : 'text-silver-mist'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="text-xs font-semibold hidden sm:inline">{step.shortLabel}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step title */}
        <div className="mt-3 pt-3 border-t border-cloud/50 dark:border-nebula-purple/20">
          <h2 className="text-sm font-bold text-ink-black dark:text-pearl">
            Step {wizard.stepIndex + 1}: {STEPS[wizard.stepIndex].label}
          </h2>
          {selectedCount > 0 && wizard.currentStep === 'plans' && (
            <p className="text-[10px] text-silver-mist mt-0.5">
              {selectedCount} plan{selectedCount !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </div>

      {/* Compare bar */}
      {comparePlans.length > 0 && wizard.currentStep === 'plans' && (
        <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-ink-black dark:text-pearl font-medium">
              {comparePlans.length} plan{comparePlans.length !== 1 ? 's' : ''} selected for
              comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-[10px] text-silver-mist hover:text-twilight dark:hover:text-pearl transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={comparePlans.length < 2}
              className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-celestial-indigo text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Compare Plans
            </button>
          </div>
        </div>
      )}

      {/* Comparison table */}
      {showCompare && comparedPlanObjects.length >= 2 && (
        <PlanComparisonTable
          plans={comparedPlanObjects}
          coverageLevel={selections[activeCategory]?.coverageLevel || 'employee_only'}
          onRemove={(id) => toggleCompare(id)}
          onSelect={(id) => {
            selectPlan(activeCategory, id);
            setShowCompare(false);
          }}
          onClose={() => setShowCompare(false)}
          selectedPlanId={selections[activeCategory]?.planId}
        />
      )}

      {/* Step content */}
      <div className="min-h-[400px]">
        {wizard.currentStep === 'plans' && (
          <PlanSelection
            plansByCategory={plansByCategory}
            availableCategories={availableCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            selections={selections}
            onSelectPlan={selectPlan}
            onDeselectPlan={deselectPlan}
            comparePlans={comparePlans}
            onToggleCompare={toggleCompare}
          />
        )}
        {wizard.currentStep === 'coverage' && (
          <CoverageLevel plans={plans} selections={selections} onSetCoverage={setCoverageLevel} />
        )}
        {wizard.currentStep === 'dependents' && (
          <DependentSelection
            dependents={dependents}
            selections={selections}
            onSetDependentIds={setDependentIds}
            onAddDependent={addDependent}
            onRemoveDependent={removeDependent}
          />
        )}
        {wizard.currentStep === 'summary' && (
          <CostSummary
            items={costs.items}
            totalEmployee={costs.totalEmployee}
            totalEmployer={costs.totalEmployer}
          />
        )}
        {wizard.currentStep === 'confirmation' && (
          <Confirmation
            plans={plans}
            dependents={dependents}
            selections={selections}
            costs={costs}
            enrollmentWindow={enrollmentWindow}
            enrollmentId={enrollmentId}
            submitting={submitting}
            onSubmit={submitEnrollment}
            onGoBack={goBack}
          />
        )}
      </div>

      {/* Navigation */}
      {wizard.currentStep !== 'confirmation' && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={goBack}
            disabled={wizard.isFirstStep}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={goNext}
            disabled={wizard.isLastStep}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BenefitsEnrollmentWizard;
