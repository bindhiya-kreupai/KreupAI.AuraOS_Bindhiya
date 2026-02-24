/**
 * @module CompensationPlanningPage
 * @description Compensation Planner page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { DollarSign, Shield } from 'lucide-react';
import { CompensationPlanner } from '@/components/compensation/CompensationPlanner';

export default function CompensationPlanningPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-sunset-amber" />
          Compensation Planner
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Plan merit increases, allocate budgets, and benchmark against market data.
        </p>
      </div>

      {/* Planner */}
      <CompensationPlanner />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Compensation data is confidential. Access is restricted to authorized managers and HR
          personnel. All changes are audit-logged.
        </p>
      </div>
    </div>
  );
}
