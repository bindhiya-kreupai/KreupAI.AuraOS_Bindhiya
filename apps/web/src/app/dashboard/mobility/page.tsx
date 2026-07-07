'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe2,
  FileCheck,
  Package,
  Calculator,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface MobilitySummary {
  activeVisas: number;
  expiringVisas: number;
  activeRelocations: number;
  completedRelocations: number;
  pendingFilings: number;
  totalTaxProfiles: number;
}

const MODULES = [
  {
    href: '/dashboard/mobility/visa-immigration',
    title: 'Visa & Immigration',
    description: 'Track visa status, work permits, and residency documents.',
    icon: FileCheck,
  },
  {
    href: '/dashboard/mobility/relocation-packages',
    title: 'Relocation Packages',
    description: 'Manage international moves, tiers, and relocation budgets.',
    icon: Package,
  },
  {
    href: '/dashboard/mobility/expat-tax-manager',
    title: 'Expat Tax Manager',
    description: 'Tax equalization estimates and filing compliance.',
    icon: Calculator,
  },
];

export default function GlobalMobilityPage() {
  const [summary, setSummary] = useState<MobilitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/mobility/summary');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message ?? 'Failed to load summary');
        }
        if (active) setSummary(json.data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load summary');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const kpis = summary
    ? [
        { label: 'Active Visas', value: summary.activeVisas, tone: 'text-indigo-600' },
        { label: 'Expiring (30d)', value: summary.expiringVisas, tone: 'text-rose-600' },
        { label: 'Active Relocations', value: summary.activeRelocations, tone: 'text-emerald-600' },
        { label: 'Pending Tax Filings', value: summary.pendingFilings, tone: 'text-amber-600' },
      ]
    : [];

  return (
    <div className="space-y-8 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-indigo-500" />
          Global Mobility
        </h1>
        <p className="text-slate-500 text-lg mt-1">
          Manage international assignments, visas, and relocation logistics.
        </p>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 text-sm p-3 rounded-xl border border-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Live KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center h-24"
              >
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ))
          : kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className={`text-3xl font-bold ${kpi.tone}`}>{kpi.value}</div>
                <div className="text-sm text-slate-500 mt-1">{kpi.label}</div>
              </div>
            ))}
      </div>

      {/* Module navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{mod.description}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600">
                Open Module <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
