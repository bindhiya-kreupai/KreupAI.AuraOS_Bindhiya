/**
 * @module CareerPlanningPage
 * @description Career Planning module hub — links to the implemented dashboard
 *              career sub-features (ladders, mobility, goals, aspirations).
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Building2, Target, Sparkles, ArrowRight, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const FEATURES: { title: string; description: string; href: string; icon: LucideIcon }[] = [
  {
    title: 'Career Ladders',
    description: 'Visualize growth paths, levels, and promotion rubrics.',
    href: '/dashboard/career/career-ladders',
    icon: TrendingUp,
  },
  {
    title: 'Internal Mobility',
    description: 'Explore open internal roles and track your applications.',
    href: '/dashboard/career/internal-mobility',
    icon: Building2,
  },
  {
    title: 'Career Goals',
    description: 'Set, track, and complete professional milestones.',
    href: '/dashboard/career/career-goals',
    icon: Target,
  },
  {
    title: 'Aspirations',
    description: 'Define your long-term vision and preferences.',
    href: '/dashboard/career/aspirations',
    icon: Sparkles,
  },
];

export default function CareerPlanningPage() {
  return (
    <div className="space-y-8 pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutGrid className="w-8 h-8 text-indigo-500" />
          Career Planning
        </h1>
        <p className="text-slate-500 text-lg mt-1">
          Grow your career: explore ladders, internal roles, goals, and aspirations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="mb-4 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{feature.description}</p>
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
