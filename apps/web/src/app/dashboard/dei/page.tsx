'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  MessageSquare,
  Scale,
  GraduationCap,
  Users,
  UserPlus,
  Accessibility,
  Target,
  ArrowRight,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { getDiversityMetrics, listGoals, listErgs, type DiversityMetrics } from './dei-api';
import { useDeiToast } from './dei-ui';

const MODULES = [
  {
    href: '/dashboard/dei/diversity-metrics',
    title: 'Diversity Metrics',
    desc: 'Workforce demographics',
    icon: PieChart,
    tint: 'text-indigo-500',
  },
  {
    href: '/dashboard/dei/inclusion-survey',
    title: 'Inclusion Survey',
    desc: 'Belonging & culture pulse',
    icon: MessageSquare,
    tint: 'text-emerald-500',
  },
  {
    href: '/dashboard/dei/pay-equity-analysis',
    title: 'Pay Equity',
    desc: 'Compensation fairness',
    icon: Scale,
    tint: 'text-pink-500',
  },
  {
    href: '/dashboard/dei/bias-training',
    title: 'Bias Training',
    desc: 'Inclusive learning modules',
    icon: GraduationCap,
    tint: 'text-amber-500',
  },
  {
    href: '/dashboard/dei/erg-management',
    title: 'ERG Management',
    desc: 'Employee resource groups',
    icon: Users,
    tint: 'text-purple-500',
  },
  {
    href: '/dashboard/dei/mentorship-program',
    title: 'Mentorship',
    desc: 'Mentors & mentees',
    icon: UserPlus,
    tint: 'text-indigo-500',
  },
  {
    href: '/dashboard/dei/accessibility',
    title: 'Accessibility',
    desc: 'Accommodations & audits',
    icon: Accessibility,
    tint: 'text-sky-500',
  },
  {
    href: '/dashboard/dei/dei-goals',
    title: 'DEI Goals',
    desc: 'Objectives & key results',
    icon: Target,
    tint: 'text-rose-500',
  },
];

export default function DeiHubPage() {
  const [metrics, setMetrics] = useState<DiversityMetrics | null>(null);
  const [goalCount, setGoalCount] = useState(0);
  const [ergCount, setErgCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [m, goals, ergs] = await Promise.all([getDiversityMetrics(), listGoals(), listErgs()]);
      setMetrics(m);
      setGoalCount(goals.length);
      setErgCount(ergs.length);
    } catch {
      notify('error', 'Failed to load DEI overview.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Diversity, Equity &amp; Inclusion
          </h1>
          <p className="text-slate-500 text-sm">
            Live overview of your organization&apos;s DEI programs.
          </p>
        </div>
        <Link
          href="/dashboard/analytics/dei-dashboard"
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
        >
          <BarChart3 className="w-4 h-4" /> Analytics Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Employees"
            value={(metrics?.totalEmployees ?? 0).toLocaleString()}
          />
          <StatCard label="Diversity Score" value={`${metrics?.diversityScore ?? 0}`} />
          <StatCard label="Active ERGs" value={`${ergCount}`} />
          <StatCard label="DEI Goals" value={`${goalCount}`} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group flex flex-col"
            >
              <Icon className={`w-8 h-8 mb-3 ${m.tint}`} />
              <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">
                {m.title}
              </h3>
              <p className="text-sm text-slate-500 flex-1">{m.desc}</p>
              <div className="mt-4 text-indigo-600 text-sm font-bold flex items-center gap-1">
                Open{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
