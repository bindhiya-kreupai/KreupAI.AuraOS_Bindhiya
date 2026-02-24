/**
 * @module TeamAnalyticsPage
 * @description Team Analytics Dashboard page route
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Activity, Shield } from 'lucide-react';
import { TeamAnalyticsDashboard } from '@/components/manager/TeamAnalyticsDashboard';

export default function TeamAnalyticsPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Activity className="w-5 h-5 text-celestial-indigo" />
          Team Analytics
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Monitor headcount trends, attrition rates, performance distribution, leave utilization,
          and overtime hours.
        </p>
      </div>

      {/* Dashboard */}
      <TeamAnalyticsDashboard />

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Analytics data is aggregated and anonymized where applicable. Access restricted to
          authorized managers.
        </p>
      </div>
    </div>
  );
}
