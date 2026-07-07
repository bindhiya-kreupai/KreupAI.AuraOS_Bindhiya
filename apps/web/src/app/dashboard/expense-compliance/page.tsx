'use client';

import React from 'react';

export default function ExpenseComplianceHomePage() {
  const tools = [
    {
      href: '/dashboard/expense-compliance/checks',
      label: 'Per-diem Cap Evaluator',
      desc: 'Validate a per-diem claim against country and city-tier policy limits.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">EPIC-27 · Expense Compliance</p>
          <h1 className="text-2xl font-semibold">Expense Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enforce expense policies and check compliance for per-diem caps and travel-related payouts.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Expense Workspaces</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="block rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-900 hover:bg-slate-50"
              >
                <h3 className="font-semibold text-slate-900">{t.label}</h3>
                <p className="mt-2 text-xs text-slate-500">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
