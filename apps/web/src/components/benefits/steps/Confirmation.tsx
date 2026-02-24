/**
 * @module Confirmation
 * @description Step 5 — Review selections and submit enrollment, or show success
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import {
  CheckCircle2,
  FileCheck,
  Shield,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type {
  BenefitPlan,
  BenefitDependent,
  EnrollmentSelection,
  CostBreakdown,
  EnrollmentWindow,
} from '@/services/benefitsService';
import { CATEGORY_META, COVERAGE_LABELS } from '@/services/benefitsService';

interface ConfirmationProps {
  plans: BenefitPlan[];
  dependents: BenefitDependent[];
  selections: Record<string, EnrollmentSelection | null>;
  costs: { items: CostBreakdown[]; totalEmployee: number; totalEmployer: number };
  enrollmentWindow: EnrollmentWindow | null;
  enrollmentId: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onGoBack: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  plans,
  dependents,
  selections,
  costs,
  enrollmentWindow,
  enrollmentId,
  submitting,
  onSubmit,
  onGoBack,
}) => {
  // If already submitted, show success
  if (enrollmentId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-neural-mint/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-neural-mint" />
        </div>
        <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
          Enrollment Submitted!
        </h3>
        <p className="text-sm text-silver-mist mb-2">
          Your benefits enrollment has been submitted successfully.
        </p>
        <p className="text-xs text-silver-mist/70 mb-6">
          Confirmation ID:{' '}
          <span className="font-mono font-semibold text-celestial-indigo">{enrollmentId}</span>
        </p>

        <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-4 max-w-md">
          <div className="flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-ink-black dark:text-pearl">
                What happens next?
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-silver-mist">
                <li>You will receive a confirmation email shortly.</li>
                <li>
                  Your benefits will be effective from{' '}
                  {enrollmentWindow
                    ? new Date(enrollmentWindow.effectiveDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'the next coverage period'}
                  .
                </li>
                <li>You can modify your elections until the enrollment window closes.</li>
                <li>New insurance cards will be mailed to your address on file.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review & submit view
  const selectedEntries = Object.entries(selections).filter(([, sel]) => sel !== null);

  return (
    <div className="space-y-5">
      {/* Review header */}
      <div className="bg-sunset-amber/5 dark:bg-sunset-amber/10 rounded-xl p-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-sunset-amber mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">
            Review Your Selections
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            Please review your benefits selections below before submitting. Once submitted, you can
            still make changes before the enrollment window closes.
          </p>
        </div>
      </div>

      {/* Selected plans review */}
      <div className="space-y-3">
        {selectedEntries.map(([cat, sel]) => {
          if (!sel) return null;
          const plan = plans.find((p) => p.id === sel.planId);
          if (!plan) return null;
          const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
          const costItem = costs.items.find((i) => i.category === cat);
          const assignedDeps = dependents.filter((d) => sel.dependentIds.includes(d.id));

          return (
            <div
              key={cat}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${meta.color}`}>
                    <div className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-black dark:text-pearl">{meta.label}</p>
                    <p className="text-[10px] text-silver-mist">
                      {plan.name} — {plan.carrier}
                    </p>
                  </div>
                </div>
                {costItem && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-celestial-indigo">
                      ${costItem.employeeCost}/mo
                    </p>
                    <p className="text-[10px] text-silver-mist">Total: ${costItem.totalCost}/mo</p>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pearl dark:bg-deep-cosmos text-[10px] text-twilight dark:text-silver-mist">
                  <Shield className="w-2.5 h-2.5" />
                  {COVERAGE_LABELS[sel.coverageLevel]}
                </span>
                {assignedDeps.map((dep) => (
                  <span
                    key={dep.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-[10px] text-celestial-indigo"
                  >
                    <Users className="w-2.5 h-2.5" />
                    {dep.firstName} {dep.lastName}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost totals */}
      <div className="bg-pearl/50 dark:bg-deep-cosmos/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-celestial-indigo" />
          <div>
            <p className="text-xs font-bold text-ink-black dark:text-pearl">Total Monthly Cost</p>
            <p className="text-[10px] text-silver-mist">Deducted from your paycheck</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-celestial-indigo">${costs.totalEmployee}/mo</p>
          <p className="text-[10px] text-silver-mist">
            ${(costs.totalEmployee * 12).toLocaleString()}/year
          </p>
        </div>
      </div>

      {/* Effective date */}
      {enrollmentWindow && (
        <div className="flex items-center gap-2 px-1">
          <Calendar className="w-3.5 h-3.5 text-silver-mist" />
          <p className="text-[10px] text-silver-mist">
            Coverage effective{' '}
            {new Date(enrollmentWindow.effectiveDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onGoBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || selectedEntries.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit Enrollment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
