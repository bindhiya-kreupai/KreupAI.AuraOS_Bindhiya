/**
 * @module InterviewSchedulerPage
 * @description Interview Scheduler page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { CalendarDays, Shield } from 'lucide-react';
import { InterviewScheduler } from '@/components/recruitment/InterviewScheduler';

export default function InterviewSchedulerPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-celestial-indigo" />
          Interview Scheduler
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Schedule interviews with smart slot matching, interviewer availability checking, and
          calendar integration.
        </p>
      </div>

      {/* Scheduler */}
      <InterviewScheduler />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Calendar data is fetched via secure OAuth connections. Interview details are confidential
          and audit-logged.
        </p>
      </div>
    </div>
  );
}
