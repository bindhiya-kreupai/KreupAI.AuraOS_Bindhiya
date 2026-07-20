'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Scale, AlertCircle, BarChart3, Loader2, X } from 'lucide-react';
import { JobEvaluationService } from '../services';
import type { EvaluationBoard, JobEvaluation } from '../types';

const METHOD_LABELS: Record<string, string> = {
  point_factor: 'Point Factor',
  hay_system: 'Hay System',
  classification: 'Classification',
  ranking: 'Ranking',
};

function methodLabel(method: string): string {
  return METHOD_LABELS[method] || method;
}

const EMPTY_BOARD: EvaluationBoard = {
  pending: [],
  completed: [],
  distribution: [],
  total: 0,
};

export default function JobEvaluationPage() {
  const [board, setBoard] = useState<EvaluationBoard>(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [grading, setGrading] = useState<JobEvaluation | null>(null);
  const [score, setScore] = useState('');
  const [assignedGrade, setAssignedGrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoard(await JobEvaluationService.board());
    } catch (err) {
      console.error(err);
      setError('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const startGrading = async (evaluation: JobEvaluation) => {
    try {
      if (evaluation.status !== 'in_progress') {
        await JobEvaluationService.start(evaluation.id);
      }
      setGrading(evaluation);
      setScore('');
      setAssignedGrade('');
      setFormError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start grading');
    }
  };

  const submitGrade = async () => {
    if (!grading) return;
    const numericScore = Number(score);
    if (!score || Number.isNaN(numericScore) || !assignedGrade.trim()) {
      setFormError('A numeric score and assigned grade are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await JobEvaluationService.complete(grading.id, numericScore, assignedGrade.trim());
      setNotice('Evaluation completed');
      setGrading(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to complete evaluation');
    } finally {
      setSaving(false);
    }
  };

  const maxCount = board.distribution.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            Job Evaluation
          </h1>
          <p className="text-slate-500 text-sm">Systematic scoring and grading of job roles.</p>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm shrink-0">
          {notice}
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm shrink-0">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Evaluation
            </h3>
            <div className="space-y-3">
              {board.pending.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No pending evaluations.</p>
              ) : (
                board.pending.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-sm">{role.jobTitle}</h4>
                      <div className="text-xs text-slate-500">
                        {(role.familyName || 'Unassigned') + ' • ' + methodLabel(role.method)}
                      </div>
                    </div>
                    <button
                      onClick={() => startGrading(role)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                    >
                      {role.status === 'in_progress' ? 'Resume Grading' : 'Start Grading'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-80 flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Grade Distribution
            </h3>
            {board.distribution.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <BarChart3 className="w-14 h-14 opacity-20 mb-3" />
                <span className="text-sm font-bold">No completed evaluations yet</span>
              </div>
            ) : (
              <div className="flex-1 flex items-end gap-3 pt-4">
                {board.distribution.map((bucket) => (
                  <div key={bucket.grade} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-bold text-slate-500">{bucket.count}</div>
                    <div
                      className="w-full bg-indigo-500 rounded-t-lg transition-all"
                      style={{ height: `${(bucket.count / maxCount) * 180}px` }}
                    />
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {bucket.grade}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50">
              Recently Completed Evaluations
            </div>
            {board.completed.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No completed evaluations.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Assigned Grade</th>
                    <th className="px-6 py-4">Evaluator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {board.completed.map((evalItem) => (
                    <tr key={evalItem.id}>
                      <td className="px-6 py-4 font-bold">{evalItem.jobTitle}</td>
                      <td className="px-6 py-4">{methodLabel(evalItem.method)}</td>
                      <td className="px-6 py-4 font-mono">{evalItem.score ?? '-'}</td>
                      <td className="px-6 py-4">
                        {evalItem.assignedGrade ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">
                            {evalItem.assignedGrade}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{evalItem.evaluatorName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Grade: {grading.jobTitle}</h2>
              <button
                onClick={() => setGrading(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="text-xs text-slate-500">Method: {methodLabel(grading.method)}</div>

            <div>
              <label className="text-xs font-bold text-slate-500">Evaluation Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Assigned Grade</label>
              <input
                value={assignedGrade}
                onChange={(e) => setAssignedGrade(e.target.value)}
                placeholder="e.g. L5"
                className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGrading(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={submitGrade}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
