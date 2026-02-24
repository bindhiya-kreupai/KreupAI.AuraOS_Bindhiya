"use client";

import React, { useState, useEffect } from 'react';
import {
  Shield, ChevronRight, ChevronLeft, CheckCircle, Circle,
  Heart, DollarSign, Users, AlertCircle, Loader2
} from 'lucide-react';
import { BenefitsEnrollmentService } from '../services';

type Step = 'plan' | 'coverage' | 'dependents' | 'cost' | 'confirm';

const steps: { id: Step; label: string }[] = [
  { id: 'plan', label: 'Select Plan' },
  { id: 'coverage', label: 'Coverage Level' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'cost', label: 'Cost Summary' },
  { id: 'confirm', label: 'Confirmation' },
];

const defaultPlans = [
  { id: 'basic', name: 'Basic Health', premium: 150, deductible: 5000, coverage: '80%', network: 'Standard' },
  { id: 'standard', name: 'Standard Health', premium: 300, deductible: 2500, coverage: '90%', network: 'Preferred' },
  { id: 'premium', name: 'Premium Health', premium: 500, deductible: 1000, coverage: '95%', network: 'Premier' },
];

const coverageLevels = [
  { id: 'employee', label: 'Employee Only', multiplier: 1.0 },
  { id: 'spouse', label: 'Employee + Spouse', multiplier: 1.8 },
  { id: 'family', label: 'Employee + Family', multiplier: 2.5 },
];

export default function BenefitsEnrollmentPage() {
  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [selectedCoverage, setSelectedCoverage] = useState('employee');
  const [fetching, setFetching] = useState(true);
  const [plans, setPlans] = useState(defaultPlans);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, enrollRes] = await Promise.allSettled([
          BenefitsEnrollmentService.getPlans(),
          BenefitsEnrollmentService.getEnrollments(),
        ]);

        if (plansRes.status === 'fulfilled' && plansRes.value?.success && Array.isArray(plansRes.value.data) && plansRes.value.data.length > 0) {
          const mapped = plansRes.value.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.planName,
            premium: p.basePremium || p.premium || 0,
            deductible: p.deductible || 0,
            coverage: p.coveragePercentage ? `${p.coveragePercentage}%` : '90%',
            network: p.networkType || p.network || 'Standard',
          }));
          setPlans(mapped);
          setSelectedPlan(mapped[1]?.id || mapped[0]?.id);
        }

        if (enrollRes.status === 'fulfilled' && enrollRes.value?.success && Array.isArray(enrollRes.value.data)) {
          setEnrollments(enrollRes.value.data);
        }
      } catch (err) {
        console.error('Failed to fetch benefits data:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const selectedCoverageData = coverageLevels.find((c) => c.id === selectedCoverage);
  const monthlyPremium = Math.round((selectedPlanData?.premium || 0) * (selectedCoverageData?.multiplier || 1));

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await BenefitsEnrollmentService.enroll({
        planId: selectedPlan,
        coverageLevel: selectedCoverage === 'employee' ? 'EMPLOYEE_ONLY' : selectedCoverage === 'spouse' ? 'EMPLOYEE_SPOUSE' : 'FAMILY',
        enrollmentType: 'OPEN_ENROLLMENT',
        employeePremium: monthlyPremium,
        employerPremium: 0,
        totalPremium: monthlyPremium,
        effectiveFrom: new Date().toISOString(),
      });
      alert('Enrollment confirmed successfully!');
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Failed to confirm enrollment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full font-medium">Open Enrollment</span>
          <span className="text-[10px] text-silver-mist">Ends Feb 28, 2026</span>
        </div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Benefits Enrollment</h1>
        <p className="text-sm text-silver-mist mt-1">Choose your healthcare plan for the upcoming year</p>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < currentStepIndex ? 'bg-emerald-500 text-white' :
                i === currentStepIndex ? 'bg-celestial-indigo text-white' :
                'bg-slate-100 dark:bg-deep-cosmos text-silver-mist'
              }`}>
                {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === currentStepIndex ? 'text-celestial-indigo' : 'text-silver-mist'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
        {currentStep === 'plan' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Select Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === plan.id ? 'border-celestial-indigo bg-celestial-indigo/5' : 'border-cloud dark:border-nebula-purple/50 hover:border-slate-300'
                  }`}
                >
                  <h3 className="font-bold text-sm text-ink-black dark:text-pearl">{plan.name}</h3>
                  <p className="text-2xl font-bold text-celestial-indigo mt-2">${plan.premium}<span className="text-xs text-silver-mist font-normal">/mo</span></p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-silver-mist">Deductible: ${plan.deductible.toLocaleString()}</p>
                    <p className="text-xs text-silver-mist">Coverage: {plan.coverage}</p>
                    <p className="text-xs text-silver-mist">Network: {plan.network}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'coverage' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Coverage Level</h2>
            <div className="space-y-3">
              {coverageLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedCoverage(level.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedCoverage === level.id ? 'border-celestial-indigo bg-celestial-indigo/5' : 'border-cloud dark:border-nebula-purple/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-celestial-indigo" />
                    <span className="font-medium text-sm text-ink-black dark:text-pearl">{level.label}</span>
                  </div>
                  <span className="font-bold text-sm text-celestial-indigo">
                    ${Math.round((selectedPlanData?.premium || 0) * level.multiplier)}/mo
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'dependents' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Add Dependents</h2>
            <p className="text-sm text-silver-mist">Add family members who will be covered under your plan.</p>
            <div className="p-6 border-2 border-dashed border-cloud dark:border-nebula-purple/50 rounded-xl text-center">
              <Users className="w-8 h-8 text-silver-mist mx-auto mb-2" />
              <p className="text-sm text-silver-mist mb-3">No dependents added yet</p>
              <button className="text-xs font-medium text-celestial-indigo hover:underline">+ Add Dependent</button>
            </div>
          </div>
        )}

        {currentStep === 'cost' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Cost Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-cloud dark:border-nebula-purple/50">
                <span className="text-sm text-silver-mist">Plan</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">{selectedPlanData?.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-cloud dark:border-nebula-purple/50">
                <span className="text-sm text-silver-mist">Coverage</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">{selectedCoverageData?.label}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-cloud dark:border-nebula-purple/50">
                <span className="text-sm text-silver-mist">Monthly Premium</span>
                <span className="text-lg font-bold text-celestial-indigo">${monthlyPremium}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-silver-mist">Annual Cost</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">${(monthlyPremium * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'confirm' && (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">Review & Confirm</h2>
            <p className="text-sm text-silver-mist mb-6">
              You are enrolling in <span className="font-medium">{selectedPlanData?.name}</span> with <span className="font-medium">{selectedCoverageData?.label}</span> coverage at <span className="font-bold text-celestial-indigo">${monthlyPremium}/mo</span>.
            </p>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 mx-auto"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Enrollment
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-silver-mist disabled:opacity-30 hover:text-ink-black dark:hover:text-pearl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {currentStep !== 'confirm' && (
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:bg-celestial-indigo/90 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

