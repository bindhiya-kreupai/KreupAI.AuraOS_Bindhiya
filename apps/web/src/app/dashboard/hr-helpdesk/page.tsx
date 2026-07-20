'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Headset,
  Ticket,
  BookOpen,
  Boxes,
  Inbox,
  Briefcase,
  Workflow,
  MessageSquare,
  Radio,
  Gauge,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { HelpdeskAnalyticsApi, type AnalyticsDTO } from './services';

interface FeatureLink {
  label: string;
  slug: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: FeatureLink[] = [
  {
    label: 'Tickets',
    slug: 'tickets',
    description: 'Track and resolve support tickets.',
    icon: Ticket,
  },
  {
    label: 'Knowledge Base',
    slug: 'knowledge-base',
    description: 'Self-service articles and guides.',
    icon: BookOpen,
  },
  {
    label: 'Service Catalog',
    slug: 'service-catalog',
    description: 'Browse available HR services.',
    icon: Boxes,
  },
  {
    label: 'Request Portal',
    slug: 'request-portal',
    description: 'Submit and follow service requests.',
    icon: Inbox,
  },
  {
    label: 'Case Management',
    slug: 'case-management',
    description: 'Manage complex HR cases.',
    icon: Briefcase,
  },
  {
    label: 'Service Automation',
    slug: 'service-automation',
    description: 'Automate repetitive workflows.',
    icon: Workflow,
  },
  {
    label: 'Chat Support',
    slug: 'chat-support',
    description: 'Live conversational support.',
    icon: MessageSquare,
  },
  {
    label: 'Omnichannel',
    slug: 'omnichannel',
    description: 'Unify email, chat and phone.',
    icon: Radio,
  },
  {
    label: 'Performance Metrics',
    slug: 'performance-metrics',
    description: 'KPIs and team analytics.',
    icon: Gauge,
  },
  {
    label: 'Continuous Improvement',
    slug: 'continuous-improvement',
    description: 'Feedback-driven improvements.',
    icon: Sparkles,
  },
];

export default function HrsdPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await HelpdeskAnalyticsApi.get());
    } catch {
      setError('Failed to load helpdesk summary. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const total = analytics?.total ?? 0;
  const open = analytics?.open ?? 0;
  const resolved = analytics?.resolved ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const kpis = [
    { title: 'Total Tickets', value: String(total) },
    { title: 'Open', value: String(open) },
    { title: 'Resolved', value: String(resolved) },
    { title: 'Resolution Rate', value: `${resolutionRate}%` },
  ];

  return (
    <div className="relative flex h-[calc(100vh-6rem)] flex-col space-y-8 overflow-y-auto pb-10 text-slate-900 dark:text-slate-100">
      <div className="flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Headset className="h-8 w-8 text-indigo-500" />
            HR Service Desk
          </h1>
          <p className="mt-1 text-lg text-slate-500">
            Manage your HRSD operations, requests and support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">{kpi.title}</h3>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <div className="text-3xl font-bold tabular-nums">{kpi.value}</div>
            )}
            <p className="mt-2 text-xs text-slate-400">Last 30 days</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.slug}
              href={`/dashboard/hr-helpdesk/${feature.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div>
                <Icon className="mb-3 h-7 w-7 text-indigo-500" />
                <h3 className="text-lg font-semibold">{feature.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{feature.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-500">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
