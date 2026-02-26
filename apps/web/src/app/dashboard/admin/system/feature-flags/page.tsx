/**
 * @module FeatureFlagsPage
 * @description Feature flag management dashboard — toggle rollouts, targeting, and audit logs.
 * @project AURA HCM Platform
 * @section 16.8 Inter-Service Communication / Feature Flags
 */

'use client';

import React from 'react';
import FeatureFlagDashboard from '@/components/admin/FeatureFlagDashboard';

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          System / Feature Flags
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Feature Flag Management
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Control feature rollouts with percentage-based targeting, user/tenant/role whitelists, and
          real-time toggle switches. All changes are audited.
        </p>
      </div>
      <FeatureFlagDashboard />
    </div>
  );
}
