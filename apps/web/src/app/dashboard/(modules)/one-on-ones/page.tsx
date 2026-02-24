/**
 * @module OneOnOnesPage
 * @description One-on-One Meeting Tracker page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Users, Shield } from 'lucide-react';
import { OneOnOneTracker } from '@/components/one-on-ones/OneOnOneTracker';

export default function OneOnOnesPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Users className="w-5 h-5 text-celestial-indigo" />
          One-on-One Meetings
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Schedule, track, and manage your one-on-one meetings with team members.
        </p>
      </div>

      {/* Tracker */}
      <OneOnOneTracker />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Meeting notes and action items are confidential between participants. Data is retained per
          your organization&apos;s policy.
        </p>
      </div>
    </div>
  );
}
