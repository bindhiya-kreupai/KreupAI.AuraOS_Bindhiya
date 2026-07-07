'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  LayoutGrid,
  Loader2,
  Users,
  Activity,
  CheckCircle2,
  ClipboardList,
  RefreshCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { OnboardingAnalyticsService } from './services';
import type { OnboardingMetrics } from './types';

const FEATURES = [
  'Cases',
  'Guidance',
  'Pre-boarding',
  'First Day Experience',
  'Induction Program',
  'Buddy Assignment',
  '30-60-90 Day Plan',
  'Employee Master',
  'Social Insurance',
  'Benefits',
  'Payroll',
  'Country Rules',
];

const BASE_PATH = '/dashboard/onboarding';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

type Kpi = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
};

export default function OnboardingPage() {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await OnboardingAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis: Kpi[] = metrics
    ? [
        {
          label: 'Total Onboardings',
          value: String(metrics.totalOnboardings),
          icon: Users,
          accent: 'text-indigo-500',
        },
        {
          label: 'Active',
          value: String(metrics.activeOnboardings),
          icon: Activity,
          accent: 'text-amber-500',
        },
        {
          label: 'Completed',
          value: String(metrics.completedOnboardings),
          icon: CheckCircle2,
          accent: 'text-emerald-500',
        },
        {
          label: 'Task Completion',
          value: `${metrics.averageTaskCompletionRate}%`,
          icon: ClipboardList,
          accent: 'text-purple-500',
        },
      ]
    : [];

  return (
    <div className="space-y-8 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-indigo-500" />
            Onboarding
          </h1>
          <p className="text-slate-500 text-lg mt-1">
            Manage your onboarding operations, compliance, and new-hire journeys.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-4 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {kpi.label}
                  </span>
                  <Icon className={`w-5 h-5 ${kpi.accent}`} />
                </div>
                <div className="mt-3 text-3xl font-bold">{kpi.value}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FEATURES.map((feature) => {
          const link = `${BASE_PATH}/${toKebabCase(feature)}`;
          return (
            <Link
              key={feature}
              href={link}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                <LayoutGrid className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>

              <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {feature}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Access and manage {feature.toLowerCase()} records and workflows.
              </p>

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
