/**
 * @module DependentsPage
 * @description ESS Dependent Management — add, edit, and manage family members for benefits
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Users, Shield } from 'lucide-react';
import { DependentManager } from '@/components/dependents/DependentManager';

export default function DependentsPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Users className="w-5 h-5 text-celestial-indigo" />
          Dependent Management
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Add and manage family members covered under your benefit plans.
        </p>
      </div>

      {/* Manager */}
      <DependentManager />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Dependent information including SSNs is encrypted at rest and in transit. Only authorized
          HR personnel can view full SSN details.
        </p>
      </div>
    </div>
  );
}
