'use client';

import React from 'react';
import { Leaf, Users, BookOpen, Award } from 'lucide-react';

export default function EsgComplianceHomePage() {
  const tools = [
    {
      href: '/dashboard/esg-compliance/carbon-per-employee',
      label: 'Carbon per Employee',
      desc: 'Compute carbon emissions per FTE across Scope 1, 2, and 3 intensity bands.',
      icon: <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      href: '/dashboard/esg-compliance/diversity',
      label: 'Diversity Metrics',
      desc: 'Evaluate key workforce diversity targets, female-in-leadership, and nationality ratios.',
      icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      href: '/dashboard/esg-compliance/disclosure-checklist',
      label: 'Governance Disclosure Checklist',
      desc: 'Ensure mandatory ESG disclosures are submitted on time within compliance windows.',
      icon: <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    },
    {
      href: '/dashboard/esg-compliance/certificate',
      label: 'Monthly Compliance Certificate',
      desc: 'Generate and sign monthly corporate ESG status attestations and check gating metrics.',
      icon: <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">EPIC-30 · ESG Compliance</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">ESG Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-455">
            Track and evaluate sustainability metrics, workforce diversity distributions, and governance disclosures.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">ESG Workspaces</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="block rounded-xl border border-slate-250 dark:border-slate-800 p-5 transition-all hover:border-slate-900 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850 bg-white dark:bg-slate-900/50 shadow-sm"
              >
                <div className="mb-3">{t.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.label}</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
