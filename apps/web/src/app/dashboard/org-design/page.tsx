'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  Network,
  GitBranch,
  GitCommit,
  Target,
  BarChart2,
  GitPullRequest,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface OrgAnalytics {
  totalEmployees: number;
  totalPositions: number;
  totalDepartments: number;
  vacancyRate: number;
  averageSpanOfControl: number;
}

const FEATURES = [
  { label: 'Org Chart Builder', slug: 'org-chart-builder', icon: Users },
  { label: 'Position Hierarchy', slug: 'position-hierarchy', icon: Layers },
  { label: 'Matrix Structure', slug: 'matrix-structure', icon: Network },
  { label: 'Span of Control', slug: 'span-of-control', icon: GitCommit },
  { label: 'Scenario Planning', slug: 'scenario-planning', icon: GitBranch },
  { label: 'Succession Pool', slug: 'succession-pool', icon: Target },
  { label: 'Org Analytics', slug: 'org-analytics', icon: BarChart2 },
  { label: 'Change Management', slug: 'change-management', icon: GitPullRequest },
];

export default function OrgDesignPage() {
  const [analytics, setAnalytics] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await APIClient.get<unknown>('/org-design/analytics');
      setAnalytics(APIClient.unwrapItem<OrgAnalytics>(res));
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8 pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Network className="w-8 h-8 text-indigo-500" />
          Org Design
        </h1>
        <p className="text-slate-500 text-lg mt-1">
          Design, analyze, and evolve your organizational structure.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {loading ? (
          <div className="col-span-full flex items-center gap-2 text-slate-400 py-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading organization metrics...
          </div>
        ) : (
          <>
            <Kpi label="Employees" value={analytics?.totalEmployees ?? 0} />
            <Kpi label="Positions" value={analytics?.totalPositions ?? 0} />
            <Kpi label="Departments" value={analytics?.totalDepartments ?? 0} />
            <Kpi label="Vacancy Rate" value={`${analytics?.vacancyRate ?? 0}%`} />
            <Kpi label="Avg Span" value={analytics?.averageSpanOfControl ?? 0} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.slug}
              href={`/dashboard/org-design/${feature.slug}`}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {feature.label}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Access and manage {feature.label.toLowerCase()}.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600">
                Open <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
