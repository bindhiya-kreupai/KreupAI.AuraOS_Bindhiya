'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { ComplianceAnalyticsService, ComplianceCatalogApi } from './services';
import type { ComplianceMetrics, ComplianceCatalog } from './types';

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
  const [catalog, setCatalog] = useState<ComplianceCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [metricsRes, catalogRes] = await Promise.allSettled([
          ComplianceAnalyticsService.getMetrics(),
          ComplianceCatalogApi.getCatalog(),
        ]);
        if (active && metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
        if (active && catalogRes.status === 'fulfilled') setCatalog(catalogRes.value);
      } catch {
        // Overview banners are non-critical; the module grid still renders.
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

      {!loading && catalog && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Statutory Compliance Catalogue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {catalog.name} · v{catalog.version} · {catalog.services.length} statutory service
              {catalog.services.length === 1 ? '' : 's'}
              {catalog.supportedCountries.length > 0
                ? ` · ${catalog.supportedCountries.length} supported countries`
                : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {catalog.services.map((s) => (
              <div
                key={s.endpoint}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.name}</p>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {s.country}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{s.description}</p>
                <code className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-2 inline-block">
                  {s.endpoint}
                </code>
              </div>
            ))}
          </div>
          {catalog.features.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {catalog.features.map((f) => (
                <span
                  key={f.name}
                  title={f.description}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
