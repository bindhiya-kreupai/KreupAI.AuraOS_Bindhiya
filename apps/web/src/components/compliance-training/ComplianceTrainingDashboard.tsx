'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Award,
  RefreshCw,
} from 'lucide-react';
import type { TrainingAssignment, TrainingStatus } from '@/services/complianceTrainingService';
import {
  ComplianceTrainingService,
  TRAINING_STATUS_META,
  TRAINING_CATEGORY_META,
} from '@/services/complianceTrainingService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TrainingStatus }) {
  const meta = TRAINING_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bgColor} dark:bg-opacity-20`}
    >
      {meta.label}
    </span>
  );
}

function _ComplianceScore({ score }: { score: number }) {
  const color = score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-500' : 'text-red-600';
  const ringColor =
    score >= 90 ? 'stroke-emerald-500' : score >= 70 ? 'stroke-amber-500' : 'stroke-red-500';

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={ringColor}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1">Compliance Score</p>
    </div>
  );
}

// ── Assignment card ───────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onStart,
}: {
  assignment: TrainingAssignment;
  onStart: (id: string) => void;
}) {
  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0;

  return (
    <div
      className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-shadow hover:shadow-md ${
        assignment.isOverdue
          ? 'border-red-200 dark:border-red-800'
          : isUrgent
            ? 'border-amber-200 dark:border-amber-800'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {assignment.moduleTitle}
            </span>
            <StatusBadge status={assignment.status} />
          </div>
          <p className="text-xs text-slate-500">
            {TRAINING_CATEGORY_META[assignment.category]?.label ?? assignment.category}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {assignment.status === 'in_progress' && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {assignment.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${assignment.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div>
          {assignment.isOverdue ? (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Overdue since{' '}
              {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          ) : (
            <span
              className={`text-xs ${isUrgent ? 'text-amber-600 font-medium' : 'text-slate-500'}`}
            >
              Due {new Date(assignment.dueDate).toLocaleDateString()}
              {isUrgent && ` (${daysUntilDue}d left)`}
            </span>
          )}
        </div>

        {(assignment.status === 'not_started' ||
          assignment.status === 'in_progress' ||
          assignment.status === 'overdue') && (
          <button
            onClick={() => onStart(assignment.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ComplianceTrainingDashboardProps {
  employeeId?: string;
  onStartTraining: (assignmentId: string) => void;
  onViewAll: () => void;
  onViewCertifications: () => void;
}

export function ComplianceTrainingDashboard({
  employeeId = 'emp-001',
  onStartTraining,
  onViewAll,
  onViewCertifications,
}: ComplianceTrainingDashboardProps) {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ComplianceTrainingService.getAssignedTrainings(employeeId)
      .then(setAssignments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [employeeId]);

  const completed = assignments.filter((a) => a.status === 'completed');
  const overdue = assignments.filter((a) => a.isOverdue);
  const inProgress = assignments.filter((a) => a.status === 'in_progress');
  const upcoming = assignments.filter((a) => a.status === 'not_started' && !a.isOverdue);

  // Overall compliance score: ratio of completed non-expired to total mandatory
  const complianceScore =
    assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0;

  const prioritized = [...overdue, ...inProgress, ...upcoming].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Compliance Training
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Mandatory regulatory training — stay compliant and certified
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            All Trainings
          </button>
        </div>
      </div>

      {/* Compliance overview */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-indigo-200" />
              <span className="text-sm font-medium text-indigo-200">Your Compliance Status</span>
            </div>
            <p className="text-3xl font-bold mt-1">
              {overdue.length > 0 ? (
                <span className="text-red-300">{overdue.length} Overdue</span>
              ) : (
                <span className="text-emerald-300">On Track</span>
              )}
            </p>
            <p className="text-sm text-indigo-200 mt-1">
              {completed.length} of {assignments.length} trainings completed
            </p>

            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { label: 'Completed', value: completed.length, icon: CheckCircle2 },
                { label: 'In Progress', value: inProgress.length, icon: Clock },
                { label: 'Overdue', value: overdue.length, icon: AlertTriangle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon className="w-4 h-4 text-indigo-300" />
                    <span className="text-2xl font-bold">{value}</span>
                  </div>
                  <p className="text-xs text-indigo-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 - (complianceScore / 100) * 2 * Math.PI * 36}
                  strokeLinecap="round"
                  stroke={complianceScore >= 80 ? '#6ee7b7' : '#fca5a5'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{complianceScore}%</span>
                <span className="text-xs text-indigo-300">Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Assigned',
            value: assignments.length,
            icon: BookOpen,
            color: 'text-slate-700 dark:text-slate-200',
            bg: 'bg-slate-100 dark:bg-slate-800',
          },
          {
            label: 'Overdue',
            value: overdue.length,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            label: 'Due This Month',
            value: upcoming.filter((a) => new Date(a.dueDate).getMonth() === new Date().getMonth())
              .length,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Certificates',
            value: completed.filter((a) => a.certificateId).length,
            icon: Award,
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            onClick: onViewCertifications,
          },
        ].map(({ label, value, icon: Icon, color, bg, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex flex-col gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left ${!onClick ? 'cursor-default' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
              </span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </button>
        ))}
      </div>

      {/* Priority trainings */}
      {prioritized.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Priority Trainings
            </h3>
            <button
              onClick={onViewAll}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prioritized.map((a) => (
                <AssignmentCard key={a.id} assignment={a} onStart={onStartTraining} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coming up this quarter */}
      {assignments.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Training Timeline
            </h3>
          </div>
          <div className="space-y-2">
            {assignments
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map((a) => {
                const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          a.isOverdue
                            ? 'bg-red-500'
                            : daysLeft <= 7
                              ? 'bg-amber-500'
                              : a.status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                        }`}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {a.moduleTitle}
                      </span>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={a.status} />
                      <p
                        className={`text-xs mt-0.5 ${a.isOverdue ? 'text-red-600' : 'text-slate-500'}`}
                      >
                        {a.isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
