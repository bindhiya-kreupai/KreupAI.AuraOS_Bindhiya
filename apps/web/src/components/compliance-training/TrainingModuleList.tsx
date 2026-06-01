// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Star,
  Shield,
  HardHat,
  Lock,
  Users,
  DollarSign,
  Leaf,
  Scale,
  Search,
  SlidersHorizontal,
  Play,
  CheckCircle2,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react';
import type {
  TrainingModule,
  TrainingAssignment,
  TrainingCategory,
  TrainingStatus,
} from '@/services/complianceTrainingService';
import {
  ComplianceTrainingService,
  TRAINING_STATUS_META,
  TRAINING_CATEGORY_META,
} from '@/services/complianceTrainingService';

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Scale,
  HardHat,
  Lock,
  Shield,
  BookOpen,
  Users,
  DollarSign,
  Leaf,
};

function _CategoryIcon({ category }: { category: TrainingCategory }) {
  const meta = TRAINING_CATEGORY_META[category];
  const Icon = ICON_MAP[meta?.icon ?? 'BookOpen'] ?? BookOpen;
  return <Icon className={`w-5 h-5 ${meta?.color ?? 'text-indigo-600'}`} />;
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: TrainingStatus }) {
  const meta = TRAINING_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bgColor} dark:bg-opacity-20`}
    >
      {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
      {meta.label}
    </span>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  assignment,
  onAction,
}: {
  module: TrainingModule;
  assignment?: TrainingAssignment;
  onAction: (assignmentId: string, action: 'start' | 'continue') => void;
}) {
  const categoryMeta = TRAINING_CATEGORY_META[module.category];
  const CategoryIcon2 = ICON_MAP[categoryMeta?.icon ?? 'BookOpen'] ?? BookOpen;

  const status = assignment?.status ?? 'not_started';
  const progress = assignment?.progress ?? 0;
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className={`px-5 pt-5 pb-4 ${isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shrink-0">
            <CategoryIcon2 className={`w-5 h-5 ${categoryMeta?.color ?? 'text-indigo-600'}`} />
          </div>
          <div className="flex flex-col items-end gap-1">
            {assignment && <StatusPill status={assignment.status} />}
            {module.isMandatory && (
              <span className="text-xs text-red-600 font-medium">Mandatory</span>
            )}
          </div>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 leading-snug">
          {module.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{module.description}</p>
      </div>

      {/* Progress bar (if in progress) */}
      {isInProgress && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Meta row */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {module.durationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {module.passingScore}% to pass
          </span>
          <span className="capitalize">{module.frequency.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Regulatory tags */}
      {module.regulatoryFramework && module.regulatoryFramework.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {module.regulatoryFramework.map((fw) => (
            <span
              key={fw}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium"
            >
              {fw}
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      <div className="px-5 pb-5">
        {assignment ? (
          isCompleted ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                Completed {assignment.completedDate ? `· Score ${assignment.score}%` : ''}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onAction(assignment.id, isInProgress ? 'continue' : 'start')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isInProgress ? (
                <>
                  <ArrowRight className="w-4 h-4" /> Continue
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Training
                </>
              )}
            </button>
          )
        ) : (
          <div className="text-xs text-slate-400 italic">Not assigned</div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface TrainingModuleListProps {
  employeeId?: string;
  onStartTraining: (assignmentId: string) => void;
}

export function TrainingModuleList({
  employeeId = 'emp-001',
  onStartTraining,
}: TrainingModuleListProps) {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TrainingCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      ComplianceTrainingService.getTrainingModules(),
      ComplianceTrainingService.getAssignedTrainings(employeeId),
    ])
      .then(([mods, asgns]) => {
        setModules(mods);
        setAssignments(asgns);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [employeeId]);

  const assignmentByModule = Object.fromEntries(assignments.map((a) => [a.moduleId, a]));

  const filtered = modules.filter((m) => {
    const a = assignmentByModule[m.id];
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || m.category === categoryFilter;
    const matchStatus =
      !statusFilter || (a && a.status === statusFilter) || (!a && statusFilter === 'not_started');
    return matchSearch && matchCategory && matchStatus;
  });

  const categoryOptions = Array.from(new Set(modules.map((m) => m.category)));
  const activeFilters = [categoryFilter, statusFilter].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search trainings..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`inline-flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
            activeFilters > 0
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
        <button
          onClick={load}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <select
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TrainingCategory | '')}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {TRAINING_CATEGORY_META[c]?.label ?? c}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TrainingStatus | '')}
          >
            <option value="">All Status</option>
            {Object.entries(TRAINING_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {activeFilters > 0 && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>{' '}
        of <span className="font-semibold">{modules.length}</span> trainings
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No trainings found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              assignment={assignmentByModule[module.id]}
              onAction={onStartTraining}
            />
          ))}
        </div>
      )}
    </div>
  );
}
