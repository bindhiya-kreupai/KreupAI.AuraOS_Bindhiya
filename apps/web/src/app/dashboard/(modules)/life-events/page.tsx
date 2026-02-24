/**
 * @module LifeEventsPage
 * @description ESS Life Event Manager — report qualifying events and manage benefit changes
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { HeartHandshake, Shield } from 'lucide-react';
import { LifeEventManager } from '@/components/life-events/LifeEventManager';

export default function LifeEventsPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-quantum-rose" />
          Life Events
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Report life events that may qualify you for special enrollment periods or benefit changes.
        </p>
      </div>

      {/* Manager */}
      <LifeEventManager />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Life event information is kept confidential and shared only with HR and benefits
          administrators as needed for processing.
        </p>
      </div>
    </div>
  );
}
