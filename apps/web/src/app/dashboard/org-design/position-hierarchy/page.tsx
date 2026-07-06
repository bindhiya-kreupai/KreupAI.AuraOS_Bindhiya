'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Layers, ChevronRight, Briefcase, Award, AlertCircle, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface HierarchyLevel {
  gradeId: string;
  gradeName: string;
  titles: string[];
  positionCount: number;
  salaryMin: number;
  salaryMax: number;
}

interface HierarchyResponse {
  levels: HierarchyLevel[];
  totalLevels: number;
}

const SHADES = [
  'bg-indigo-600',
  'bg-indigo-500',
  'bg-indigo-400',
  'bg-indigo-300',
  'bg-indigo-200',
  'bg-indigo-100',
];

function formatCurrency(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Not set';
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${fmt(min)} - ${fmt(max)}`;
}

export default function PositionHierarchyPage() {
  const [levels, setLevels] = useState<HierarchyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/hierarchy');
      const data = APIClient.unwrapItem<HierarchyResponse>(res);
      setLevels(data?.levels ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hierarchy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            Position Hierarchy
          </h1>
          <p className="text-slate-500 text-sm">
            Job architecture and levels derived from live position grades.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading hierarchy...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : levels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <Layers className="w-10 h-10" />
          <p className="text-sm">No graded positions defined yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col w-full max-w-[200px] gap-1">
              {levels.map((level, i) => (
                <div
                  key={level.gradeId}
                  className={`h-10 rounded-md shadow-sm flex items-center justify-center text-xs font-bold text-white ${
                    SHADES[i % SHADES.length]
                  }`}
                  style={{ width: `${Math.max(40, 100 - i * 12)}%`, margin: '0 auto' }}
                >
                  {level.gradeName}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-6 text-center font-medium opacity-80">
              Visualizing organizational depth by grade.
            </p>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {levels.map((level, i) => (
              <div
                key={level.gradeId}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${
                        SHADES[i % SHADES.length]
                      } opacity-90 flex items-center justify-center text-white font-bold shadow-sm`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{level.gradeName}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {level.positionCount} titles
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />{' '}
                          {formatCurrency(level.salaryMin, level.salaryMax)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pl-16">
                  <div className="flex flex-wrap gap-2">
                    {level.titles.map((title) => (
                      <div
                        key={title}
                        className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
                      >
                        {title}
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
