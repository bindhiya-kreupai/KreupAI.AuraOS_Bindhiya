'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Layers,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  CompetencyService,
  FrameworkService,
  JobRoleService,
  AssessmentService,
  GapAnalysisService,
} from '@/services/competency-library.service';

const BASE = '/dashboard/performance/competency-assessment';

interface HubCard {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
  count: number | null;
}

/**
 * Competency Library / Assessment hub. Links to every sub-module and surfaces
 * live counts from the unified /api/competency-library/* data model
 * (prisma.competencyCatalog et al) rather than the legacy
 * /api/performance/competencies endpoint.
 */
export default function CompetencyAssessmentHubPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [competencies, frameworks, jobRoles, assessments, gaps] = await Promise.all([
          CompetencyService.getAll({ pageSize: 1 }),
          FrameworkService.getAll(),
          JobRoleService.getAll(),
          AssessmentService.getAll(),
          GapAnalysisService.getAll(),
        ]);

        if (!active) return;

        const anyFailed =
          !competencies.success ||
          !frameworks.success ||
          !jobRoles.success ||
          !assessments.success ||
          !gaps.success;

        if (anyFailed) {
          setError('Some competency data could not be loaded. Showing partial results.');
        }

        setCounts({
          catalog: competencies.total ?? competencies.data.length,
          frameworks: frameworks.data?.length ?? 0,
          jobRoles: jobRoles.data?.length ?? 0,
          assessments: assessments.total ?? assessments.data.length,
          gaps: gaps.data?.length ?? 0,
        });
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to load competency data.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const cards: HubCard[] = [
    {
      key: 'catalog',
      title: 'Competency Catalog',
      description: 'Browse and manage the organizational competency library.',
      href: `${BASE}/competency-catalog`,
      icon: <BookMarked className="w-5 h-5" />,
      accent: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
      count: counts.catalog ?? null,
    },
    {
      key: 'frameworks',
      title: 'Proficiency Levels',
      description: 'Define proficiency frameworks and rating scales.',
      href: `${BASE}/proficiency-levels`,
      icon: <Layers className="w-5 h-5" />,
      accent: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      count: counts.frameworks ?? null,
    },
    {
      key: 'jobRoles',
      title: 'Job-Competency Map',
      description: 'Map required competencies to job roles.',
      href: `${BASE}/job-competency-map`,
      icon: <Briefcase className="w-5 h-5" />,
      accent: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
      count: counts.jobRoles ?? null,
    },
    {
      key: 'assessments',
      title: 'Skill Assessment',
      description: 'Run assessment cycles and capture proficiency ratings.',
      href: `${BASE}/skill-assessment`,
      icon: <ClipboardCheck className="w-5 h-5" />,
      accent: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
      count: counts.assessments ?? null,
    },
    {
      key: 'gaps',
      title: 'Gap Analysis',
      description: 'Identify competency gaps and plan development.',
      href: `${BASE}/gap-analysis`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
      count: counts.gaps ?? null,
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-celestial-indigo" />
          Competency Library
        </h1>
        <p className="text-silver-mist text-sm">
          Define and manage the skills framework, assessments, and development plans for your
          organization.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-5 hover:border-celestial-indigo/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-2.5 rounded-xl ${card.accent}`}>{card.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                    {card.count ?? '—'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-silver-mist">Items</div>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-1">
                {card.title}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-silver-mist mt-1">{card.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
