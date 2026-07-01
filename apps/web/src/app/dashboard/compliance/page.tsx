'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { ComplianceAnalyticsService } from './services';
import type { ComplianceMetrics } from './types';

const FEATURES = [
  'Union Database',
  'Grievance Management',
  'Collective Bargaining',
  'Disciplinary Actions',
  'Labor Law Compliance',
  'Strike Management',
  'Arbitration',
  'Communication Log',
];

export default function LaborRelationsPage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await ComplianceAnalyticsService.getMetrics();
        if (active) setMetrics(data);
      } catch {
        // Overview banner is non-critical; the module grid still renders.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards: { label: string; value: number | string }[] = metrics
    ? [
        { label: 'Compliance Rate', value: `${metrics.complianceRate ?? 0}%` },
        { label: 'Active Grievances', value: metrics.activeGrievances ?? 0 },
        { label: 'Active Disciplinary', value: metrics.activeDisciplinaryRecords ?? 0 },
        { label: 'Upcoming Audits', value: metrics.upcomingAudits ?? 0 },
        { label: 'Active Unions', value: metrics.activeUnions ?? 0 },
        { label: 'Whistleblower Reports', value: metrics.whistleblowerReports ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {!loading && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p>
              <p className="text-xs text-slate-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <ModuleGrid
        title="Labor Relations"
        description="Manage your labor relations operations and settings."
        features={FEATURES}
        basePath="/dashboard/compliance"
      />
    </div>
  );
}
