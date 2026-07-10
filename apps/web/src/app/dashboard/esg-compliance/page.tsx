'use client';

import React from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';
import { Sparkles } from 'lucide-react';

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
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden border border-emerald-500/20">
          <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> EPIC-30 · ESG Compliance
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">ESG Compliance Dashboard</h1>
            <p className="text-emerald-50 mt-2 max-w-2xl text-sm leading-relaxed">
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
