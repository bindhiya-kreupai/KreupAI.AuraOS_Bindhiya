'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';

export default function EsgComplianceHomePage() {
  const { isDark } = useTheme();

  const features = [
    { label: 'Carbon per Employee', slug: 'carbon-per-employee' },
    { label: 'Diversity Metrics', slug: 'diversity' },
    { label: 'Disclosure Checklist', slug: 'disclosure-checklist' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-emerald-100 font-semibold text-sm uppercase tracking-wider mb-2">
              EPIC-30
            </p>
            <h1 className="text-3xl font-bold">ESG Compliance Dashboard</h1>
            <p className="text-emerald-50 mt-2 max-w-2xl leading-relaxed">
              Track and evaluate sustainability metrics, workforce diversity distributions, and
              governance disclosures.
            </p>
          </div>
        </div>

        {/* Workspaces ModuleGrid */}
        <div className="-mt-4">
          <ModuleGrid
            title="ESG Workspaces"
            description="Manage carbon emissions, diversity goals, and corporate governance disclosures."
            features={features}
            basePath="/dashboard/esg-compliance"
          />
        </div>
      </div>
    </main>
  );
}
