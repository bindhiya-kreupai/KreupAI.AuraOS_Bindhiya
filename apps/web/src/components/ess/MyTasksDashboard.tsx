/**
 * @module MyTasksDashboard
 * @description ESS My Tasks dashboard — stats bar, priority/module views,
 *              task cards with action buttons, snooze with date picker,
 *              bulk mark-all-done (Sec 17.8)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  BellOff,
  CheckCheck,
  Loader2,
  LayoutGrid,
  List,
  X,
  Briefcase,
  DollarSign,
  GraduationCap,
  Shield,
  User,
  MessageSquare,
  Heart,
} from 'lucide-react';
import {
  TaskAggregatorService,
  type AggregatedTask,
  type TaskStats,
  type TaskModule,
  type TaskPriority,
} from '@/services/taskAggregatorService';

// ── Constants ─────────────────────────────────────────────────────────────────

const MODULE_CONFIG: Record<
  TaskModule,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  hr: { label: 'HR', icon: Briefcase, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  finance: { label: 'Finance', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  training: { label: 'Training', icon: GraduationCap, color: 'text-blue-700', bg: 'bg-blue-100' },
  compliance: { label: 'Compliance', icon: Shield, color: 'text-red-700', bg: 'bg-red-100' },
  profile: { label: 'Profile', icon: User, color: 'text-purple-700', bg: 'bg-purple-100' },
  survey: { label: 'Survey', icon: MessageSquare, color: 'text-amber-700', bg: 'bg-amber-100' },
  benefits: { label: 'Benefits', icon: Heart, color: 'text-pink-700', bg: 'bg-pink-100' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; cls: string; dot: string }> = {
  critical: { label: 'Critical', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { label: 'High', cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  low: { label: 'Low', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-300' },
};

const SNOOZE_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'In 3 days', hours: 72 },
  { label: 'Next week', hours: 168 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = '2025-02-25';

function isOverdue(task: AggregatedTask) {
  return task.dueDate < TODAY && task.status === 'pending';
}

function isDueToday(task: AggregatedTask) {
  return task.dueDate === TODAY;
}

function formatDueDate(dueDate: string) {
  if (dueDate < TODAY)
    return `Overdue (${new Date(dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })})`;
  if (dueDate === TODAY) return 'Due Today';
  const diff = Math.ceil((new Date(dueDate).getTime() - new Date(TODAY).getTime()) / 86400000);
  if (diff === 1) return 'Due Tomorrow';
  if (diff <= 7) return `Due in ${diff} days`;
  return `Due ${new Date(dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`;
}

// ── Stat Badge ────────────────────────────────────────────────────────────────

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex-1 rounded-xl border p-3 text-center min-w-20 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onComplete,
  onSnooze,
}: {
  task: AggregatedTask;
  onComplete: (id: string) => void;
  onSnooze: (id: string, until: string) => void;
}) {
  const [showSnooze, setShowSnooze] = useState(false);
  const [completing, setCompleting] = useState(false);
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const { label: priorityLabel, cls: priorityCls, dot } = PRIORITY_CONFIG[task.priority];
  const { icon: ModIcon, color: modColor, bg: modBg, label: modLabel } = MODULE_CONFIG[task.module];

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(task.id);
    setCompleting(false);
  };

  const handleSnooze = (hours: number) => {
    const until = new Date(Date.now() + hours * 3600000).toISOString();
    onSnooze(task.id, until);
    setShowSnooze(false);
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${overdue ? 'border-red-200 shadow-sm shadow-red-50' : dueToday ? 'border-amber-200' : 'border-slate-200'}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Module Icon */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${modBg}`}
          >
            <ModIcon
              className={`w-4.5 h-4.5 ${modColor}`}
              style={{ width: '1.125rem', height: '1.125rem' }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-slate-800 text-sm leading-tight">{task.title}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${priorityCls}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {priorityLabel}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs font-medium flex items-center gap-1 ${overdue ? 'text-red-600' : dueToday ? 'text-amber-600' : 'text-slate-500'}`}
              >
                <Clock className="w-3 h-3" />
                {formatDueDate(task.dueDate)}
              </span>
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${modBg} ${modColor}`}
              >
                {modLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={task.actionUrl ?? '#'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {task.actionLabel}
            <ChevronRight className="w-3 h-3" />
          </a>
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
            title="Mark complete"
          >
            {completing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSnooze((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              title="Snooze"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
            {showSnooze && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-36 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Snooze until
                </div>
                {SNOOZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSnooze(opt.hours)}
                    className="w-full px-3 py-2 text-xs text-slate-700 text-left hover:bg-indigo-50 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MyTasksDashboard() {
  const [tasks, setTasks] = useState<AggregatedTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'priority' | 'module'>('priority');
  const [moduleFilter, setModuleFilter] = useState<TaskModule | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const [t, s] = await Promise.all([
      TaskAggregatorService.getTasksByPriority(),
      TaskAggregatorService.getTaskStats(),
    ]);
    setTasks(t);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    await TaskAggregatorService.completeTask(id, task?.module ?? 'hr');
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setStats((prev) =>
      prev ? { ...prev, total: prev.total - 1, completed: prev.completed + 1 } : prev
    );
    showToast('Task marked as complete!');
  };

  const handleSnooze = async (id: string, until: string) => {
    await TaskAggregatorService.snoozeTask(id, until);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task snoozed');
  };

  const handleMarkAllDone = async () => {
    setBulkLoading(true);
    for (const task of filteredTasks) {
      await TaskAggregatorService.completeTask(task.id, task.module);
    }
    await load();
    setBulkLoading(false);
    showToast(`${filteredTasks.length} tasks marked as complete!`);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchModule = moduleFilter === 'all' || t.module === moduleFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchModule && matchPriority;
    });
  }, [tasks, moduleFilter, priorityFilter]);

  // Group by module for module view
  const tasksByModule = useMemo(() => {
    return filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.module]) acc[task.module] = [];
        acc[task.module].push(task);
        return acc;
      },
      {} as Record<TaskModule, AggregatedTask[]>
    );
  }, [filteredTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const _overdueCount = tasks.filter(isOverdue).length;
  const _dueTodayCount = tasks.filter(isDueToday).length;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Aggregated from all modules</p>
        </div>
        {filteredTasks.length > 0 && (
          <button
            onClick={handleMarkAllDone}
            disabled={bulkLoading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {bulkLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark All Done
          </button>
        )}
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <StatBadge
            label="Total"
            value={stats.total}
            color="border-slate-200 bg-white text-slate-700"
          />
          <StatBadge
            label="Overdue"
            value={stats.overdue}
            color="border-red-200 bg-red-50 text-red-700"
          />
          <StatBadge
            label="Due Today"
            value={stats.dueToday}
            color="border-amber-200 bg-amber-50 text-amber-700"
          />
          <StatBadge
            label="This Week"
            value={stats.dueThisWeek}
            color="border-blue-200 bg-blue-50 text-blue-700"
          />
          <StatBadge
            label="Snoozed"
            value={stats.snoozed}
            color="border-slate-200 bg-slate-50 text-slate-500"
          />
        </div>
      )}

      {/* Filters + View Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View Toggle */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView('priority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'priority' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
          >
            <List className="w-3.5 h-3.5" />
            Priority
          </button>
          <button
            onClick={() => setView('module')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'module' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Module
          </button>
        </div>

        {/* Module Filter */}
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value as TaskModule | 'all')}
          className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="all">All Modules</option>
          {(Object.keys(MODULE_CONFIG) as TaskModule[]).map((m) => (
            <option key={m} value={m}>
              {MODULE_CONFIG[m].label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
          className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="all">All Priorities</option>
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_CONFIG[p].label}
            </option>
          ))}
        </select>

        {(moduleFilter !== 'all' || priorityFilter !== 'all') && (
          <button
            onClick={() => {
              setModuleFilter('all');
              setPriorityFilter('all');
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-2 py-1.5"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400 font-medium">
          {filteredTasks.length} tasks
        </span>
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-14 h-14 text-emerald-300 mx-auto mb-3" />
          <p className="text-xl font-bold text-slate-700">All caught up!</p>
          <p className="text-sm text-slate-400 mt-1">No pending tasks at the moment.</p>
        </div>
      ) : view === 'priority' ? (
        <div className="space-y-3">
          {/* Critical tasks first with a banner */}
          {filteredTasks.filter((t) => t.priority === 'critical' || isOverdue(t)).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-1">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                <AlertTriangle className="w-4 h-4" />
                Critical & Overdue (
                {filteredTasks.filter((t) => t.priority === 'critical' || isOverdue(t)).length})
              </div>
              <div className="space-y-3">
                {filteredTasks
                  .filter((t) => t.priority === 'critical' || isOverdue(t))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onSnooze={handleSnooze}
                    />
                  ))}
              </div>
            </div>
          )}
          {/* Remaining tasks */}
          {filteredTasks
            .filter((t) => t.priority !== 'critical' && !isOverdue(t))
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onSnooze={handleSnooze}
              />
            ))}
        </div>
      ) : (
        // Module view
        <div className="space-y-4">
          {(Object.keys(tasksByModule) as TaskModule[]).map((module) => {
            const moduleTasks = tasksByModule[module];
            const { icon: Icon, label, color, bg } = MODULE_CONFIG[module];
            return (
              <div key={module}>
                <div className={`flex items-center gap-2 mb-2 px-2`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${bg} ${color}`}>
                    {moduleTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {moduleTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onSnooze={handleSnooze}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
