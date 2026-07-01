'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  MoreVertical,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { CareerGoalService } from '../services';
import type { CareerGoal, GoalMilestone } from '../types';

const GOAL_TYPES: CareerGoal['goalType'][] = [
  'promotion',
  'skill_development',
  'project_completion',
  'certification',
  'leadership',
  'other',
];

function computeProgress(milestones: GoalMilestone[]): number {
  if (!milestones || milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.status === 'completed').length;
  return Math.round((done / milestones.length) * 100);
}

export default function CareerGoalsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    goalTitle: '',
    goalType: 'skill_development' as CareerGoal['goalType'],
    description: '',
    targetDate: '',
    keyResults: '',
  });

  const loadGoals = useCallback(async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const data = await CareerGoalService.getGoalsByEmployeeId(user.employeeId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load goals', error);
      toast.error('Failed to load career goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (!authLoading) void loadGoals();
  }, [authLoading, loadGoals]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!user?.employeeId) return;
    if (!form.goalTitle.trim()) {
      toast.error('Goal title is required');
      return;
    }
    setSaving(true);
    try {
      const milestones: GoalMilestone[] = form.keyResults
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          milestoneId: `m-${Date.now()}-${i}`,
          milestoneName: name,
          description: '',
          targetDate: form.targetDate ? new Date(form.targetDate) : new Date(),
          status: 'not_started',
          successMetrics: [],
        }));

      await CareerGoalService.createGoal({
        employeeId: user.employeeId,
        goalTitle: form.goalTitle.trim(),
        goalType: form.goalType,
        description: form.description.trim(),
        targetDate: form.targetDate ? new Date(form.targetDate) : undefined,
        priority: 'medium',
        alignedToCompanyGoals: false,
        milestones,
        progressPercentage: 0,
        status: 'not_started',
        managerSupport: false,
      });
      toast.success('Goal created');
      setShowForm(false);
      setForm({
        goalTitle: '',
        goalType: 'skill_development',
        description: '',
        targetDate: '',
        keyResults: '',
      });
      await loadGoals();
    } catch (error) {
      console.error('Failed to create goal', error);
      toast.error('Failed to create goal');
    } finally {
      setSaving(false);
    }
  }, [form, user?.employeeId, loadGoals]);

  const handleDelete = useCallback(
    async (goalId: string) => {
      setOpenMenu(null);
      try {
        await CareerGoalService.deleteGoal(goalId);
        toast.success('Goal deleted');
        await loadGoals();
      } catch (error) {
        console.error('Failed to delete goal', error);
        toast.error('Failed to delete goal');
      }
    },
    [loadGoals]
  );

  const toggleMilestone = useCallback(
    async (goal: CareerGoal, milestone: GoalMilestone) => {
      const nextStatus = milestone.status === 'completed' ? 'not_started' : 'completed';
      const milestones = (goal.milestones ?? []).map((m) =>
        m.milestoneId === milestone.milestoneId
          ? {
              ...m,
              status: nextStatus as GoalMilestone['status'],
              completionDate: nextStatus === 'completed' ? new Date() : undefined,
            }
          : m
      );
      const progressPercentage = computeProgress(milestones);
      try {
        await CareerGoalService.updateGoal(goal.goalId, {
          milestones,
          progressPercentage,
          status: progressPercentage === 100 ? 'completed' : 'in_progress',
        });
        await loadGoals();
      } catch (error) {
        console.error('Failed to update goal', error);
        toast.error('Failed to update goal');
      }
    },
    [loadGoals]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Career Goals
          </h1>
          <p className="text-slate-500 text-sm">Set and track your professional milestones.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <Target className="w-10 h-10 text-slate-300" />
          <p className="text-slate-500">No career goals yet. Add your first goal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20 overflow-y-auto">
          {goals.map((goal) => {
            const progress = goal.progressPercentage ?? computeProgress(goal.milestones ?? []);
            return (
              <div
                key={goal.goalId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative"
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setOpenMenu(openMenu === goal.goalId ? null : goal.goalId)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Goal actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === goal.goalId && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1"
                    >
                      <button
                        onClick={() => handleDelete(goal.goalId)}
                        className="w-full text-left px-3 py-1.5 text-sm text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">
                    <Calendar className="w-3 h-3" /> {goal.goalType?.replace(/_/g, ' ')}
                  </div>
                  <h3 className="text-xl font-bold">{goal.goalTitle}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${
                        progress >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase">Key Results</h4>
                  {(goal.milestones ?? []).map((milestone) => {
                    const done = milestone.status === 'completed';
                    return (
                      <button
                        key={milestone.milestoneId}
                        onClick={() => toggleMilestone(goal, milestone)}
                        className="flex items-start gap-3 w-full text-left"
                      >
                        <span
                          className={`mt-0.5 shrink-0 ${done ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}
                        >
                          {done ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </span>
                        <span
                          className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {milestone.milestoneName}
                        </span>
                      </button>
                    );
                  })}
                  {(goal.milestones ?? []).length === 0 && (
                    <p className="text-xs text-slate-400">No key results defined.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">New Career Goal</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input
                value={form.goalTitle}
                onChange={(e) => setForm((f) => ({ ...f, goalTitle: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Become a Team Lead"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Type</label>
              <select
                value={form.goalType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goalType: e.target.value as CareerGoal['goalType'] }))
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Target Date</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Key Results (one per line)</label>
              <textarea
                value={form.keyResults}
                onChange={(e) => setForm((f) => ({ ...f, keyResults: e.target.value }))}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder={'Complete Leadership Training\nMentor 2 Juniors'}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
