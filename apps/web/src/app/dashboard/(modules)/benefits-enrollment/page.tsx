/**
 * @module BenefitsEnrollmentPage
 * @description ESS Benefits Enrollment page — multi-step wizard for annual open enrollment
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Heart, Shield } from 'lucide-react';
import { BenefitsEnrollmentWizard } from '@/components/benefits/BenefitsEnrollmentWizard';

export default function BenefitsEnrollmentPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Heart className="w-5 h-5 text-quantum-rose" />
            Benefits Enrollment
          </h1>
          <p className="text-sm text-silver-mist mt-0.5">
            Review and select your medical, dental, vision, and other benefit plans.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <BenefitsEnrollmentWizard />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Your benefit elections are encrypted and securely stored. Changes are subject to plan
          rules and enrollment window deadlines.
        </p>
      </div>
    </div>
  );
}
