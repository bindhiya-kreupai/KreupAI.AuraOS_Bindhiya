/**
 * @module useBenefits
 * @description ESS Benefits Enrollment — React hooks for wizard state, selections & cost calculation
 * @project AURA HCM Platform
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  BenefitsEnrollmentService,
  type BenefitPlan,
  type BenefitCategory,
  type BenefitDependent,
  type CoverageLevel,
  type EnrollmentSelection,
  type EnrollmentWindow,
} from '@/services/benefitsService';

// ── Types ──────────────────────────────────────────────────────────────────────

export type WizardStep = 'plans' | 'coverage' | 'dependents' | 'summary' | 'confirmation';

const WIZARD_STEPS: WizardStep[] = ['plans', 'coverage', 'dependents', 'summary', 'confirmation'];

export interface WizardState {
  currentStep: WizardStep;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// ── Hook: useBenefitsEnrollment ────────────────────────────────────────────────

export function useBenefitsEnrollment() {
  // Data
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [dependents, setDependents] = useState<BenefitDependent[]>([]);
  const [enrollmentWindow, setEnrollmentWindow] = useState<EnrollmentWindow | null>(null);
  const [loading, setLoading] = useState(true);

  // Wizard step
  const [currentStep, setCurrentStep] = useState<WizardStep>('plans');

  // Selections: one per category
  const [selections, setSelections] = useState<Record<string, EnrollmentSelection | null>>({});

  // Active category being configured
  const [activeCategory, setActiveCategory] = useState<BenefitCategory>('health');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Compare mode
  const [comparePlans, setComparePlans] = useState<string[]>([]);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [plansData, depsData, windowData] = await Promise.all([
        BenefitsEnrollmentService.getPlans(),
        BenefitsEnrollmentService.getDependents(),
        BenefitsEnrollmentService.getEnrollmentWindow(),
      ]);
      if (!cancelled) {
        setPlans(plansData);
        setDependents(depsData);
        setEnrollmentWindow(windowData);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Wizard navigation ─────────────────────────────────────────────────────

  const stepIndex = WIZARD_STEPS.indexOf(currentStep);

  const wizard: WizardState = useMemo(
    () => ({
      currentStep,
      stepIndex,
      totalSteps: WIZARD_STEPS.length,
      canGoBack: stepIndex > 0,
      canGoNext: stepIndex < WIZARD_STEPS.length - 1,
      isFirstStep: stepIndex === 0,
      isLastStep: stepIndex === WIZARD_STEPS.length - 1,
    }),
    [currentStep, stepIndex]
  );

  const goNext = useCallback(() => {
    const idx = WIZARD_STEPS.indexOf(currentStep);
    if (idx < WIZARD_STEPS.length - 1) setCurrentStep(WIZARD_STEPS[idx + 1]);
  }, [currentStep]);

  const goBack = useCallback(() => {
    const idx = WIZARD_STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(WIZARD_STEPS[idx - 1]);
  }, [currentStep]);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  // ── Plan selection ─────────────────────────────────────────────────────────

  const selectPlan = useCallback((category: BenefitCategory, planId: string) => {
    setSelections((prev) => ({
      ...prev,
      [category]: {
        planId,
        coverageLevel: prev[category]?.coverageLevel || 'employee_only',
        dependentIds: prev[category]?.dependentIds || [],
      },
    }));
  }, []);

  const deselectPlan = useCallback((category: BenefitCategory) => {
    setSelections((prev) => ({ ...prev, [category]: null }));
  }, []);

  const setCoverageLevel = useCallback((category: BenefitCategory, level: CoverageLevel) => {
    setSelections((prev) => {
      const sel = prev[category];
      if (!sel) return prev;
      return { ...prev, [category]: { ...sel, coverageLevel: level } };
    });
  }, []);

  const setDependentIds = useCallback((category: BenefitCategory, ids: string[]) => {
    setSelections((prev) => {
      const sel = prev[category];
      if (!sel) return prev;
      return { ...prev, [category]: { ...sel, dependentIds: ids } };
    });
  }, []);

  // ── Dependents management ──────────────────────────────────────────────────

  const addDependent = useCallback(async (dep: Omit<BenefitDependent, 'id'>) => {
    const newDep = await BenefitsEnrollmentService.addDependent(dep);
    setDependents((prev) => [...prev, newDep]);
    return newDep;
  }, []);

  const removeDependent = useCallback(async (id: string) => {
    await BenefitsEnrollmentService.removeDependent(id);
    setDependents((prev) => prev.filter((d) => d.id !== id));
    // Also remove from any selection that references this dependent
    setSelections((prev) => {
      const updated = { ...prev };
      for (const key of Object.keys(updated)) {
        const sel = updated[key];
        if (sel && sel.dependentIds.includes(id)) {
          updated[key] = { ...sel, dependentIds: sel.dependentIds.filter((did) => did !== id) };
        }
      }
      return updated;
    });
  }, []);

  // ── Cost calculation ───────────────────────────────────────────────────────

  const costs = useMemo(() => {
    return BenefitsEnrollmentService.calculateCosts(selections, plans);
  }, [selections, plans]);

  // ── Plans grouped by category ──────────────────────────────────────────────

  const plansByCategory = useMemo(() => {
    const grouped: Record<string, BenefitPlan[]> = {};
    for (const plan of plans) {
      if (!grouped[plan.category]) grouped[plan.category] = [];
      grouped[plan.category].push(plan);
    }
    return grouped as Record<BenefitCategory, BenefitPlan[]>;
  }, [plans]);

  // ── Available categories ───────────────────────────────────────────────────

  const availableCategories = useMemo(() => {
    const cats = new Set<BenefitCategory>();
    for (const plan of plans) cats.add(plan.category);
    return Array.from(cats);
  }, [plans]);

  // ── Compare mode ───────────────────────────────────────────────────────────

  const toggleCompare = useCallback((planId: string) => {
    setComparePlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : prev.length < 3
          ? [...prev, planId]
          : prev
    );
  }, []);

  const clearCompare = useCallback(() => setComparePlans([]), []);

  const comparedPlanObjects = useMemo(
    () => plans.filter((p) => comparePlans.includes(p.id)),
    [plans, comparePlans]
  );

  // ── Submit enrollment ──────────────────────────────────────────────────────

  const submitEnrollment = useCallback(async () => {
    if (!enrollmentWindow) return;
    setSubmitting(true);
    try {
      const result = await BenefitsEnrollmentService.submitEnrollment({
        selections: selections as Record<BenefitCategory, EnrollmentSelection | null>,
        effectiveDate: enrollmentWindow.effectiveDate,
        enrollmentType: 'annual',
      });
      if (result.success) {
        setEnrollmentId(result.enrollmentId);
        goToStep('confirmation');
      }
    } finally {
      setSubmitting(false);
    }
  }, [selections, enrollmentWindow, goToStep]);

  // ── Selected count ─────────────────────────────────────────────────────────

  const selectedCount = useMemo(
    () => Object.values(selections).filter(Boolean).length,
    [selections]
  );

  return {
    // Data
    plans,
    plansByCategory,
    availableCategories,
    dependents,
    enrollmentWindow,
    loading,

    // Wizard
    wizard,
    goNext,
    goBack,
    goToStep,

    // Selections
    selections,
    activeCategory,
    setActiveCategory,
    selectPlan,
    deselectPlan,
    setCoverageLevel,
    setDependentIds,
    selectedCount,

    // Dependents
    addDependent,
    removeDependent,

    // Costs
    costs,

    // Compare
    comparePlans,
    toggleCompare,
    clearCompare,
    comparedPlanObjects,

    // Submit
    submitting,
    submitEnrollment,
    enrollmentId,
  };
}
