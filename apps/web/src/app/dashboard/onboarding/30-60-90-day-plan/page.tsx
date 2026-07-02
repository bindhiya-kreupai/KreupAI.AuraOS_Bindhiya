'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Flag,
  Target,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { Day30_60_90PlanService, OnboardingTaskService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import type { TaskStatus } from '../types';

type Goal = {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  progress: number;
};

type PlanPhase = {
  key: '30 Days' | '60 Days' | '90 Days';
  title: string;
  focus: string;
  desc: string;
  goals: Goal[];
};

type RawGoal = {
  goalId?: string;
  description?: string;
  status?: string;
};

type RawMilestone = {
  goals?: RawGoal[];
};

type RawPlan = {
  day30Goals?: RawMilestone;
  day60Goals?: RawMilestone;
  day90Goals?: RawMilestone;
};

function mapStatus(status: string | undefined): Goal['status'] {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In Progress';
  return 'Pending';
}

function buildPhase(
  milestone: RawMilestone | undefined,
  key: PlanPhase['key'],
  focus: string,
  desc: string
): PlanPhase {
  const goals: Goal[] = (milestone?.goals ?? []).map((g, index) => {
    const status = mapStatus(g.status);
    return {
      id: g.goalId ?? String(index),
      title: g.description ?? 'Goal',
      status,
      progress: status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0,
    };
  });
  return { key, title: key, focus, desc, goals };
}

export default function PlansPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<PlanPhase['key']>('30 Days');
  const [phases, setPhases] = useState<PlanPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const plans = await Day30_60_90PlanService.getPlans();
      if (plans.length > 0) {
        const plan = plans[0] as unknown as RawPlan;
        setPhases([
          buildPhase(
            plan.day30Goals,
            '30 Days',
            'Learn & Connect',
            'Understand the product, meet the team, and complete initial training.'
          ),
          buildPhase(
            plan.day60Goals,
            '60 Days',
            'Contribute',
            'Take ownership of small features and participate in code reviews.'
          ),
          buildPhase(
            plan.day90Goals,
            '90 Days',
            'Lead & Innovate',
            'Propose improvements, mentor junior members, and act independently.'
          ),
        ]);
      } else {
        setPhases([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load day plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cycleGoalStatus = useCallback(
    async (goal: Goal) => {
      // Pending -> In Progress -> Completed -> Pending
      const nextStatus: TaskStatus = (
        goal.status === 'Pending'
          ? 'in_progress'
          : goal.status === 'In Progress'
            ? 'completed'
            : 'pending'
      ) as TaskStatus;

      setSavingGoalId(goal.id);
      setMessage('');
      try {
        await OnboardingTaskService.updateTaskStatus(goal.id, nextStatus, user?.employeeId);
        await load();
        setMessage('Goal progress updated');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to update goal');
      } finally {
        setSavingGoalId(null);
      }
    },
    [load, user?.employeeId]
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading 30-60-90 day plan...</p>
        </div>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
            No Day Plan Available
          </h3>
          <p className="text-sm text-silver-mist">
            {message || 'Your 30-60-90 day plan will appear here once it has been created.'}
          </p>
        </div>
      </div>
    );
  }

  const currentPhase = phases.find((p) => p.key === activeTab) || phases[0];

  const allGoals = phases.flatMap((p) => p.goals);
  const completedGoals = allGoals.filter((g) => g.status === 'Completed');
  const overallProgress =
    allGoals.length > 0 ? Math.round((completedGoals.length / allGoals.length) * 100) : 0;

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            30-60-90 Day Plan
          </h1>
          <p className="text-slate-500 text-sm">
            Structured goals to ensure a successful ramp-up period.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Calendar className="w-4 h-4" /> {overallProgress}% Overall Progress
        </div>
      </div>

      {message ? (
        <p className="text-sm font-medium text-indigo-600" role="status">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Phase Navigation */}
        <div className="lg:col-span-1 space-y-4">
          {phases.map((phase) => (
            <button
              type="button"
              key={phase.key}
              onClick={() => setActiveTab(phase.key)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeTab === phase.key
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3
                  className={`font-bold ${
                    activeTab === phase.key
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {phase.title}
                </h3>
                {activeTab === phase.key && <Flag className="w-4 h-4 text-indigo-500" />}
              </div>
              <div className="text-xs text-slate-500">{phase.focus}</div>
            </button>
          ))}

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-sm">Progress Overview</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-right">
              {overallProgress}% Completed
            </div>
          </div>
        </div>

        {/* Right: Goals List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px] flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {currentPhase.title} Goals
                <span className="text-sm font-normal px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                  {currentPhase.focus}
                </span>
              </h2>
              <p className="text-slate-500 mt-2">{currentPhase.desc}</p>
            </div>

            <div className="space-y-4 flex-1">
              {currentPhase.goals.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-silver-mist">
                  No goals defined for this phase yet.
                </div>
              ) : (
                currentPhase.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={savingGoalId === goal.id}
                          aria-label={`Advance status for ${goal.title}`}
                          onClick={() => cycleGoalStatus(goal)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center disabled:opacity-50 ${
                            goal.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : goal.status === 'Pending'
                                ? 'bg-slate-100 border-slate-200 text-slate-300'
                                : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {savingGoalId === goal.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : goal.status === 'Completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : null}
                        </button>
                        <div>
                          <h4
                            className={`font-bold text-lg ${
                              goal.status === 'Completed' ? 'text-slate-500 line-through' : ''
                            }`}
                          >
                            {goal.title}
                          </h4>
                          <div
                            className={`text-xs font-bold uppercase mt-1 px-2 py-0.5 rounded-md inline-block ${
                              goal.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-600'
                                : goal.status === 'In Progress'
                                  ? 'bg-indigo-100 text-indigo-600'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {goal.status}
                          </div>
                        </div>
                      </div>
                    </div>

                    {goal.status === 'In Progress' && (
                      <div className="pl-10 pr-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => load()}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
