/**
 * @module ApprovalsPage
 * @description Unified Approval Center page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { UnifiedApprovalCenter } from '@/components/approvals/UnifiedApprovalCenter';

export default function ApprovalsPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-celestial-indigo" />
          Approval Center
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Review and manage leave, expense, timesheet, requisition, and document approvals.
        </p>
      </div>

      {/* Approval Center */}
      <UnifiedApprovalCenter />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          All approval actions are logged for audit purposes. Delegation rules apply per your
          organization&apos;s policy.
        </p>
      </div>
    </div>
  );
}
