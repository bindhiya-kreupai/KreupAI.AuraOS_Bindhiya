"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Trophy,
  ChevronRight,
} from "lucide-react";

interface ActivePath {
  pathId: string;
  title: string;
  progress: number;
  lastAccessed: string;
}

interface CompletedPath {
  pathId: string;
  title: string;
  completedAt?: string;
}

interface OverallStats {
  totalPathsEnrolled: number;
  pathsCompleted: number;
  pathsInProgress: number;
  totalHoursSpent: number;
  averageScore: number;
  streak: number;
  lastActivity: string | null;
}

interface ProgressData {
  userId: string;
  overallStats: OverallStats;
  activePaths: ActivePath[];
  completedPaths: CompletedPath[];
}

export default function PathProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/learning/progress')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setProgress(result.data);
        } else {
          setError('Failed to load learning progress');
        }
      })
      .catch((err) => {
        console.error('PathProgress fetch error:', err);
        setError('Failed to load learning progress');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-56 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-6" />
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full mb-4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-60" />
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          {error || 'No progress data available'}
        </div>
      </div>
    );
  }

  const stats = progress.overallStats;
  const overallProgress = stats.totalPathsEnrolled > 0
    ? Math.round((stats.pathsCompleted / stats.totalPathsEnrolled) * 100)
    : 0;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Learning Progress
          </h1>
          <p className="text-silver-mist mt-1">
            {stats.totalHoursSpent} hours spent learning
          </p>
        </div>

        {/* Overall Progress */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-ink-black dark:text-pearl">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-celestial-indigo">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-celestial-indigo to-aurora-green transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-silver-mist">
            <span>
              {stats.pathsCompleted} of {stats.totalPathsEnrolled} paths completed
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{stats.totalHoursSpent}h total</span>
            </div>
          </div>
        </div>

        {/* Active Paths */}
        {progress.activePaths.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-celestial-indigo" />
              Active Paths ({progress.activePaths.length})
            </h2>
            <div className="space-y-3">
              {progress.activePaths.map((path) => (
                <div
                  key={path.pathId}
                  className="rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {path.title}
                    </h3>
                    <span className="text-sm font-bold text-celestial-indigo">{path.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
                    <div
                      className="h-full rounded-full bg-celestial-indigo transition-all"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-silver-mist">
                      Last accessed: {new Date(path.lastAccessed).toLocaleDateString()}
                    </span>
                    <button className="text-xs font-medium text-celestial-indigo hover:underline flex items-center gap-1">
                      Continue <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Paths */}
        {progress.completedPaths.length > 0 && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
            <div className="p-4 border-b border-cloud dark:border-nebula-purple/50">
              <h2 className="text-lg font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-celestial-indigo" />
                Completed Paths ({progress.completedPaths.length})
              </h2>
            </div>
            <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {progress.completedPaths.map((path) => (
                <div key={path.pathId} className="flex items-center gap-4 px-5 py-3">
                  <CheckCircle2 className="w-5 h-5 text-aurora-green" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {path.title}
                    </p>
                  </div>
                  {path.completedAt && (
                    <span className="text-xs text-aurora-green">
                      Completed {new Date(path.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {progress.activePaths.length === 0 && progress.completedPaths.length === 0 && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
            <Circle className="w-12 h-12 text-silver-mist mx-auto mb-3" />
            <p className="text-sm text-silver-mist">
              No learning paths enrolled yet. Explore the catalog to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
