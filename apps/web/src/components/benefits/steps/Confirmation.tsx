"use client";

import React, { useState } from "react";
import { CheckCircle2, Shield, Users, Calendar, AlertCircle } from "lucide-react";

interface EnrollmentSummary {
  category: string;
  plan: string;
  coverageLevel: string;
  monthlyCost: number;
}

interface SelectedDependent {
  name: string;
  relationship: string;
}

const mockSummary: EnrollmentSummary[] = [
  { category: "Medical", plan: "Medical Plus", coverageLevel: "Family", monthlyCost: 320 },
  { category: "Dental", plan: "Dental Plus", coverageLevel: "Family", monthlyCost: 55 },
  { category: "Vision", plan: "Vision Plus", coverageLevel: "Family", monthlyCost: 28 },
];

const mockDependents: SelectedDependent[] = [
  { name: "Jessica Martinez", relationship: "Spouse" },
  { name: "Lucas Martinez", relationship: "Child" },
  { name: "Emma Martinez", relationship: "Child" },
];

export function Confirmation() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const effectiveDate = "February 1, 2026";
  const totalMonthlyCost = mockSummary.reduce((s, item) => s + item.monthlyCost, 0);
  const employeeMonthly = Math.round(totalMonthlyCost * 0.32);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">Enrollment Submitted!</h2>
        <p className="text-sm text-silver-mist text-center max-w-md">
          Your benefits enrollment has been submitted successfully. Your new coverage will be effective
          starting {effectiveDate}. You will receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Review & Confirm</h2>
        <p className="text-sm text-silver-mist mt-1">
          Please review your selections before submitting your enrollment.
        </p>
      </div>

      {/* Effective Date */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-deep-cosmos flex items-center justify-center">
            <Calendar className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-xs text-silver-mist">Effective Date</p>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{effectiveDate}</p>
          </div>
        </div>
      </div>

      {/* Plan Selections */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
          <Shield className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Selected Plans</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {mockSummary.map((item) => (
            <div key={item.category} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{item.plan}</p>
                <p className="text-xs text-silver-mist">{item.category} - {item.coverageLevel}</p>
              </div>
              <span className="text-sm font-medium text-ink-black dark:text-pearl">${item.monthlyCost}/mo</span>
            </div>
          ))}
          <div className="px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-deep-cosmos">
            <span className="text-sm font-semibold text-ink-black dark:text-pearl">Your Monthly Cost</span>
            <span className="text-sm font-bold text-celestial-indigo">${employeeMonthly}/mo</span>
          </div>
        </div>
      </div>

      {/* Dependents */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center gap-2">
          <Users className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Covered Dependents</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {mockDependents.map((dep) => (
            <div key={dep.name} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-ink-black dark:text-pearl">{dep.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo font-medium">
                {dep.relationship}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-celestial-indigo mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-silver-mist leading-relaxed">
              By submitting this enrollment, I confirm that the information provided is accurate and complete.
              I understand that my elections are binding for the plan year unless I experience a qualifying life
              event. I authorize payroll deductions for my share of the premiums.
            </p>
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-cloud dark:border-nebula-purple/50 text-celestial-indigo focus:ring-celestial-indigo"
              />
              <span className="text-sm text-ink-black dark:text-pearl font-medium">
                I agree to the terms and conditions
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setSubmitted(true)}
          disabled={!termsAccepted}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            termsAccepted
              ? "bg-celestial-indigo text-white hover:bg-celestial-indigo/90 shadow-lg shadow-celestial-indigo/20"
              : "bg-slate-50 dark:bg-deep-cosmos text-silver-mist cursor-not-allowed"
          }`}
        >
          Submit Enrollment
        </button>
      </div>
    </div>
  );
}
