/**
 * @module WorkflowMonitor
 * @description Workflow instance monitor — active instances, step timelines,
 *              SLA tracking, overdue alerts, and bulk actions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Search,
  Users,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Circle,
  GitMerge,
  Mail,
  Timer,
  Zap,
  GitBranch,
  UserCheck,
} from 'lucide-react';
import {
  WorkflowAutomationService,
  type WorkflowInstance,
  type WorkflowInstanceStep,
  type InstanceStatus,
  type StepType,
} from '@/services/workflowAutomationService';

// ── Step Type Icons ──────────────────────────────────────────────────────────

const STEP_TYPE_ICONS: Record<StepType, React.ElementType> = {
  approval: UserCheck,
  condition: GitBranch,
  action: Zap,
  notification: Mail,
  wait: Timer,
  parallel: GitMerge,
};

// ── Status Config ─────────────────────────────────────────────────────────────

const INSTANCE_STATUS_CONFIG: Record<
  InstanceStatus,
  { label: string; className: string; dotClass: string }
> = {
  running: { label: 'Running', className: 'bg-blue-100 text-blue-700', dotClass: 'bg-blue-500' },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600',
    dotClass: 'bg-slate-400',
  },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700', dotClass: 'bg-red-500' },
  suspended: {
    label: 'Suspended',
    className: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-500',
  },
};

// ── Instance Step Timeline ─────────────────────────────────────────────────────

function StepTimeline({ steps }: { steps: WorkflowInstanceStep[] }) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const StepIcon = STEP_TYPE_ICONS[step.stepType] ?? Circle;
        const isLast = idx === steps.length - 1;

        const iconClass =
          step.status === 'completed'
            ? 'bg-emerald-500 text-white'
            : step.status === 'current'
              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : step.status === 'failed'
                ? 'bg-red-500 text-white'
                : step.status === 'skipped'
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-slate-100 text-slate-400';

        const lineClass =
          step.status === 'completed'
            ? 'bg-emerald-400'
            : step.status === 'current'
              ? 'bg-blue-200'
              : 'bg-slate-200';

        return (
          <div key={step.stepId} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconClass}`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <div className="text-center mt-1 w-20">
                <p className="text-xs font-medium text-slate-700 leading-tight line-clamp-2 text-center">
                  {step.stepName}
                </p>
                {step.isOverdue && (
                  <span className="text-xs text-red-500 font-medium">Overdue</span>
                )}
                {step.assigneeName && step.status === 'current' && (
                  <p className="text-xs text-blue-600 truncate">{step.assigneeName}</p>
                )}
              </div>
            </div>
            {!isLast && <div className={`w-8 h-0.5 shrink-0 ${lineClass} mx-1`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Instance Card ─────────────────────────────────────────────────────────────

function InstanceCard({
  instance,
  selected,
  onSelect,
  onReassign,
  onCancel,
}: {
  instance: WorkflowInstance;
  selected: boolean;
  onSelect: () => void;
  onReassign: () => void;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = INSTANCE_STATUS_CONFIG[instance.status];

  const daysRunning = Math.ceil(
    (Date.now() - new Date(instance.startedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`rounded-xl border transition-all ${
        instance.isOverdue
          ? 'border-red-300 bg-red-50/30'
          : selected
            ? 'border-blue-400 bg-blue-50/30'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          {instance.status === 'running' && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
            />
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                    />
                    {statusCfg.label}
                  </span>
                  {instance.isOverdue && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue by {Math.abs(instance.slaDueDays ?? 0)} days
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{instance.workflowName}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {instance.entityTitle}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initiated by {instance.initiatedByName} &middot; {daysRunning}d ago
                  {instance.currentAssigneeName && (
                    <>
                      {' '}
                      &middot; Pending:{' '}
                      <span className="font-medium text-slate-700">
                        {instance.currentAssigneeName}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {instance.status === 'running' && (
                  <>
                    <button
                      onClick={onReassign}
                      title="Reassign"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={onCancel}
                      title="Cancel"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Timeline */}
        <div className="mt-3 pl-7">
          <StepTimeline steps={instance.steps} />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100">
          <div className="space-y-2 pt-3">
            {instance.steps.map((step) => {
              const StepIcon = STEP_TYPE_ICONS[step.stepType] ?? Circle;
              return (
                <div key={step.stepId} className="flex items-start gap-3 text-sm">
                  <div
                    className={`mt-0.5 p-1 rounded-full ${
                      step.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : step.status === 'current'
                          ? 'bg-blue-100 text-blue-600'
                          : step.status === 'failed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StepIcon className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{step.stepName}</span>
                      {step.assigneeName && (
                        <span className="text-xs text-slate-500">— {step.assigneeName}</span>
                      )}
                      {step.completedAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {step.comment && (
                      <p className="text-xs text-slate-600 italic mt-0.5">
                        &quot;{step.comment}&quot;
                      </p>
                    )}
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

// ── Main Component ────────────────────────────────────────────────────────────

interface WorkflowMonitorProps {
  workflowId?: string;
}

export function WorkflowMonitor({ workflowId }: WorkflowMonitorProps) {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WorkflowAutomationService.getWorkflowInstances(workflowId);
      setInstances(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = instances.filter((i) => {
    const matchSearch =
      !search ||
      i.entityTitle.toLowerCase().includes(search.toLowerCase()) ||
      i.workflowName.toLowerCase().includes(search.toLowerCase()) ||
      i.initiatedByName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const overdue = instances.filter((i) => i.isOverdue && i.status === 'running');
  const running = instances.filter((i) => i.status === 'running');
  const completed = instances.filter((i) => i.status === 'completed');

  const handleSelectAll = () => {
    const runningIds = filtered.filter((i) => i.status === 'running').map((i) => i.id);
    if (selectedIds.size === runningIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(runningIds));
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.size === 0) return;
    const reason = prompt(`Cancel ${selectedIds.size} instance(s)? Enter reason:`);
    if (!reason) return;
    for (const id of selectedIds) {
      await WorkflowAutomationService.cancelInstance(id, reason);
    }
    await load();
    setSelectedIds(new Set());
  };

  const handleReassign = async (instanceId: string) => {
    const newAssignee = prompt('Enter new assignee ID:');
    if (!newAssignee) return;
    await WorkflowAutomationService.reassignInstance(instanceId, newAssignee);
    await load();
  };

  const handleCancel = async (instanceId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    await WorkflowAutomationService.cancelInstance(instanceId, reason);
    await load();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workflow Monitor</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track active workflow instances and resolve bottlenecks
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Running',
            value: running.length,
            icon: Activity,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Overdue',
            value: overdue.length,
            icon: AlertTriangle,
            color: 'text-red-600 bg-red-50',
          },
          {
            label: 'Completed',
            value: completed.length,
            icon: CheckCircle,
            color: 'text-emerald-600 bg-emerald-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert Banner */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overdue.length} workflow instance{overdue.length > 1 ? 's' : ''} past SLA deadline
            </p>
            <p className="text-sm text-red-600">
              {overdue
                .map((i) => i.entityTitle)
                .slice(0, 2)
                .join(', ')}
              {overdue.length > 2 && ` and ${overdue.length - 2} more`}
            </p>
          </div>
        </div>
      )}

      {/* Filters + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by entity, workflow, or requester..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InstanceStatus | 'all')}
          className="text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Cancel ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Bulk Select Header */}
      {running.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              selectedIds.size === filtered.filter((i) => i.status === 'running').length &&
              selectedIds.size > 0
            }
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm text-slate-500">Select all running instances</span>
        </div>
      )}

      {/* Instance List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">
          No workflow instances match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              selected={selectedIds.has(instance.id)}
              onSelect={() => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(instance.id)) next.delete(instance.id);
                  else next.add(instance.id);
                  return next;
                });
              }}
              onReassign={() => handleReassign(instance.id)}
              onCancel={() => handleCancel(instance.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkflowMonitor;
