'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, Lock, Award, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CareerLadderService } from '../services';
import type { CareerLadder, CareerLevel } from '../types';

export default function CareerLaddersPage() {
  const [ladders, setLadders] = useState<CareerLadder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLadderIdx, setSelectedLadderIdx] = useState(0);
  const [rubricLevel, setRubricLevel] = useState<CareerLevel | null>(null);

  const loadLadders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CareerLadderService.getAllLadders({ isActive: true });
      setLadders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load career ladders', error);
      toast.error('Failed to load career ladders');
      setLadders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLadders();
  }, [loadLadders]);

  const ladder = ladders[selectedLadderIdx];
  const levels: CareerLevel[] = (ladder?.levels ?? [])
    .slice()
    .sort((a, b) => (a.levelNumber ?? 0) - (b.levelNumber ?? 0));

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            Career Ladders
          </h1>
          <p className="text-slate-500 text-sm">
            Visualize your growth path and promotion readiness.
          </p>
        </div>
        {ladders.length > 1 && (
          <select
            value={selectedLadderIdx}
            onChange={(e) => setSelectedLadderIdx(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ladders.map((l, i) => (
              <option key={l.ladderId} value={i}>
                {l.ladderName}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : ladders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <TrendingUp className="w-10 h-10 text-slate-300" />
          <p className="text-slate-500">No career ladders have been configured yet.</p>
        </div>
      ) : (
        <>
          {/* Path Visualization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-x-auto">
            <div className="min-w-[800px] relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>
              <div className="flex justify-between items-center gap-8">
                {levels.map((level, i) => {
                  const isCurrent = i === 0;
                  return (
                    <button
                      key={level.levelId}
                      onClick={() => setRubricLevel(level)}
                      className="flex flex-col items-center gap-3 relative group cursor-pointer"
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 z-10 transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 border-white dark:border-slate-900 text-white shadow-xl scale-110'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-indigo-300'
                        }`}
                      >
                        {isCurrent ? (
                          <Award className="w-8 h-8" />
                        ) : (
                          <span className="text-lg font-bold">L{level.levelNumber}</span>
                        )}
                      </div>
                      <div className="text-center">
                        <h3
                          className={`font-bold ${
                            isCurrent
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {level.jobTitle || level.levelName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {level.gradeLevel || `Level ${level.levelNumber}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">{ladder?.ladderName}</h3>
                <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-sm font-bold">
                  {ladder?.jobFamily || ladder?.department}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{ladder?.description}</p>
              <div className="space-y-4">
                {(levels[1]?.requiredSkills ?? levels[0]?.requiredSkills ?? []).map((skill) => (
                  <div
                    key={skill.skillId}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        skill.isCritical
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200">
                        {skill.skillName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {skill.skillCategory} · {skill.requiredProficiency}
                      </p>
                    </div>
                  </div>
                ))}
                {(levels[1]?.requiredSkills ?? levels[0]?.requiredSkills ?? []).length === 0 && (
                  <p className="text-sm text-slate-400">
                    Select a level to view its detailed rubric.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center">
              <Award className="w-16 h-16 mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">{ladder?.ladderName}</h3>
              <p className="text-indigo-100 mb-6 max-w-sm">
                Review the full promotion rubric for the next level, including required skills,
                experience, and promotion criteria.
              </p>
              <button
                onClick={() => setRubricLevel(levels[1] ?? levels[0] ?? null)}
                disabled={levels.length === 0}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors w-full md:w-auto disabled:opacity-50"
              >
                View Detailed Rubric
              </button>
            </div>
          </div>
        </>
      )}

      {/* Rubric Modal */}
      {rubricLevel && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setRubricLevel(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">
                  {rubricLevel.jobTitle || rubricLevel.levelName}
                </h3>
                <p className="text-sm text-slate-500">
                  Level {rubricLevel.levelNumber} · {rubricLevel.gradeLevel}
                </p>
              </div>
              <button
                onClick={() => setRubricLevel(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {rubricLevel.description}
            </p>

            {rubricLevel.responsibilities?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">
                  Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {rubricLevel.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {rubricLevel.requiredSkills?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">Required Skills</h4>
                <div className="space-y-2">
                  {rubricLevel.requiredSkills.map((skill) => (
                    <div key={skill.skillId} className="flex items-center justify-between text-sm">
                      <span>{skill.skillName}</span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {skill.requiredProficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rubricLevel.promotionCriteria && (
              <div>
                <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">
                  Promotion Criteria
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <p>
                    Minimum time in level: {rubricLevel.promotionCriteria.minimumTimeInLevel} months
                  </p>
                  <p>
                    Performance rating required:{' '}
                    {rubricLevel.promotionCriteria.performanceRatingRequired}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
