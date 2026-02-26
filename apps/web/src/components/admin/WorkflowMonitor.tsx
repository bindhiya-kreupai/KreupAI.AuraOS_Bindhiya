'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Activity,
  ArrowRight,
  Plus,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import type {
  WorkflowInstance,
  WorkflowMetrics,
  WorkflowDefinition,
  Delegation,
  SLAStatus,
  InstanceStatus,
} from '@/services/workflowEngineService';
import {
  getWorkflowDefinitions,
  getActiveInstances,
  getWorkflowMetrics,
  getDelegations,
  advanceStep,
} from '@/services/workflowEngineService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SLA_STYLES: Record<SLAStatus, { bg: string; text: string; border: string; label: string }> = {
  on_track: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    label: 'On Track',
  },
  at_risk: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    label: 'At Risk',
  },
  breached: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    label: 'Breached',
  },
};

const INSTANCE_STATUS_STYLES: Record<InstanceStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-600' },
  in_progress: { bg: 'bg-sky-100', text: 'text-sky-700' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500' },
  failed: { bg: 'bg-rose-100', text: 'text-rose-700' },
  on_hold: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

function SLABadge({ status }: { status: SLAStatus }) {
  const s = SLA_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {status === 'on_track' ? (
        <CheckCircle2 size={10} />
      ) : status === 'at_risk' ? (
        <Clock size={10} />
      ) : (
        <AlertTriangle size={10} />
      )}
      {s.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Delegation Panel ─────────────────────────────────────────────────────────

function DelegationPanel({ delegations, onNew }: { delegations: Delegation[]; onNew: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Users size={14} /> Active Delegations
        </h3>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus size={12} /> New
        </button>
      </div>
      {delegations.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No active delegations</p>
      ) : (
        delegations.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-700">
                {d.delegatorName} → {d.delegateeName}
              </p>
              {d.isActive && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Scope: {d.scope}</p>
            <p className="text-xs text-slate-400">
              {d.startDate} → {d.endDate}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 italic">{d.reason}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ── Bottleneck Chart ─────────────────────────────────────────────────────────

function BottleneckChart({ steps }: { steps: WorkflowMetrics['bottleneckSteps'] }) {
  const max = Math.max(...steps.map((s) => s.avgDurationHours));
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.stepName + step.definitionName}>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span className="font-medium truncate flex-1 mr-2">{step.stepName}</span>
            <span className="text-slate-400 shrink-0">
              {step.avgDurationHours.toFixed(1)}h avg • {step.instances} items
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(step.avgDurationHours / max) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{step.definitionName}</p>
        </div>
      ))}
    </div>
  );
}

// ── Instance Row ─────────────────────────────────────────────────────────────

function InstanceRow({
  instance,
  onAction,
}: {
  instance: WorkflowInstance;
  onAction: (id: string, decision: 'approve' | 'reject') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const istyle = INSTANCE_STATUS_STYLES[instance.status];

  return (
    <>
      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown size={14} className="text-slate-400" />
            ) : (
              <ChevronRight size={14} className="text-slate-400" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-800">{instance.definitionName}</p>
              <p className="text-xs text-slate-400">{instance.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs font-medium text-slate-700">{instance.currentStepName}</p>
          <p className="text-xs text-slate-400">{instance.currentAssignee}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-slate-600">{instance.initiatedBy}</p>
          <p className="text-xs text-slate-400">{instance.initiatedAt.split('T')[0]}</p>
        </td>
        <td className="px-4 py-3">
          <SLABadge status={instance.slaStatus} />
          <p className="text-xs text-slate-400 mt-0.5">
            {instance.slaHoursRemaining >= 0
              ? `${instance.slaHoursRemaining}h left`
              : `${Math.abs(instance.slaHoursRemaining)}h over`}
          </p>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${istyle.bg} ${istyle.text}`}
          >
            {instance.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-3">
          {instance.status === 'in_progress' && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(instance.id, 'approve');
                }}
                className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
              >
                Advance
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(instance.id, 'reject');
                }}
                className="px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100"
              >
                Reject
              </button>
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="px-6 pb-4 bg-slate-50">
            <div className="pt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Step History</p>
              <div className="space-y-1">
                {instance.stepHistory.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${step.completedAt ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    />
                    <span className="font-medium text-slate-700">{step.stepName}</span>
                    <span className="text-slate-400">{step.assignee}</span>
                    {step.decision && (
                      <span className="text-slate-500 capitalize">{step.decision}</span>
                    )}
                    {step.durationHours && (
                      <span className="text-slate-400">{step.durationHours}h</span>
                    )}
                    {step.comments && (
                      <span className="text-slate-400 italic">&quot;{step.comments}&quot;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type ViewTab = 'instances' | 'definitions' | 'delegations' | 'metrics';

export default function WorkflowMonitor() {
  const [activeTab, setActiveTab] = useState<ViewTab>('instances');
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [slaFilter, setSlaFilter] = useState<SLAStatus | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [met, inst, defs, dels] = await Promise.all([
      getWorkflowMetrics(),
      getActiveInstances(),
      getWorkflowDefinitions(),
      getDelegations('CURRENT_USER'),
    ]);
    setMetrics(met);
    setInstances(inst);
    setDefinitions(defs.definitions);
    setDelegations(dels);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInstanceAction(id: string, decision: 'approve' | 'reject') {
    await advanceStep(id, decision);
    load();
  }

  const filteredInstances =
    slaFilter === 'all' ? instances : instances.filter((i) => i.slaStatus === slaFilter);

  const tabs: Array<{ id: ViewTab; label: string; icon: React.ReactNode }> = [
    { id: 'instances', label: 'Active Instances', icon: <Activity size={14} /> },
    { id: 'definitions', label: 'Definitions', icon: <GitBranch size={14} /> },
    { id: 'delegations', label: 'Delegations', icon: <Users size={14} /> },
    { id: 'metrics', label: 'Metrics', icon: <TrendingUp size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitBranch size={20} className="text-indigo-600" /> Workflow Monitor
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time workflow orchestration, SLA tracking, and delegation management
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-6 gap-3">
            <MetricCard
              label="Active Instances"
              value={metrics.totalActiveInstances}
              color="bg-sky-100 text-sky-600"
              icon={<Activity size={18} />}
            />
            <MetricCard
              label="Completed Today"
              value={metrics.totalCompletedToday}
              color="bg-emerald-100 text-emerald-600"
              icon={<CheckCircle2 size={18} />}
            />
            <MetricCard
              label="Avg Completion"
              value={`${metrics.avgCompletionHours}h`}
              color="bg-indigo-100 text-indigo-600"
              icon={<Clock size={18} />}
            />
            <MetricCard
              label="SLA Compliance"
              value={`${metrics.slaCompliancePercent}%`}
              color="bg-purple-100 text-purple-600"
              icon={<Zap size={18} />}
            />
            <MetricCard
              label="SLA Breached Today"
              value={metrics.breachedSLAsToday}
              color="bg-rose-100 text-rose-600"
              icon={<AlertTriangle size={18} />}
            />
            <MetricCard
              label="Active Definitions"
              value={metrics.activeDefinitions}
              color="bg-amber-100 text-amber-600"
              icon={<GitBranch size={18} />}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <>
            {/* Active Instances Tab */}
            {activeTab === 'instances' && (
              <div className="space-y-4">
                {/* SLA Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">SLA Status:</span>
                  {(['all', 'on_track', 'at_risk', 'breached'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSlaFilter(f)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${slaFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                      {f === 'all' ? 'All' : SLA_STYLES[f as SLAStatus].label}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-auto">
                    {filteredInstances.length} instances
                  </span>
                </div>

                {/* SLA Alert */}
                {metrics && metrics.breachedSLAsToday > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-800">
                        {metrics.breachedSLAsToday} SLA breaches detected today
                      </p>
                      <p className="text-xs text-rose-600 mt-0.5">
                        Immediate action required on breached workflow instances
                      </p>
                    </div>
                  </div>
                )}

                {/* Instances Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Workflow
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Current Step
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Initiated By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          SLA
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInstances.map((inst) => (
                        <InstanceRow
                          key={inst.id}
                          instance={inst}
                          onAction={handleInstanceAction}
                        />
                      ))}
                      {filteredInstances.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                            No workflow instances found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Definitions Tab */}
            {activeTab === 'definitions' && (
              <div className="space-y-3">
                {definitions.map((def) => (
                  <div key={def.id} className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{def.name}</h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${def.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {def.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{def.description}</p>
                      </div>
                      <span className="text-xs text-slate-400">v{def.version}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Trigger</p>
                        <p className="font-medium text-slate-700 text-xs mt-0.5">{def.trigger}</p>
                      </div>
                      <div className="bg-sky-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Active</p>
                        <p className="font-bold text-sky-700 text-lg">{def.activeInstances}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Completed</p>
                        <p className="font-bold text-emerald-700 text-lg">
                          {def.completedInstances}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">SLA Compliance</p>
                        <p className="font-bold text-purple-700 text-lg">
                          {def.slaCompliancePercent}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 flex-wrap">
                      {def.steps.map((step) => (
                        <div key={step.stepId} className="flex items-center gap-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                            {step.name}
                          </span>
                          <ArrowRight size={10} className="text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delegations Tab */}
            {activeTab === 'delegations' && (
              <div className="max-w-xl">
                <DelegationPanel delegations={delegations} onNew={() => {}} />
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && metrics && (
              <div className="grid grid-cols-3 gap-6">
                {/* Bottlenecks */}
                <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Bottleneck Steps
                  </h3>
                  <BottleneckChart steps={metrics.bottleneckSteps} />
                </div>

                {/* Instance Status Distribution */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Instance Status</h3>
                  <div className="space-y-2">
                    {(Object.entries(metrics.instancesByStatus) as [InstanceStatus, number][]).map(
                      ([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${INSTANCE_STATUS_STYLES[status].bg} ${INSTANCE_STATUS_STYLES[status].text}`}
                          >
                            {status.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Top Workflows */}
                <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-500" /> Top Workflows by Volume
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-2 text-left text-xs font-semibold text-slate-400">
                          Workflow
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold text-slate-400">
                          Instances
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold text-slate-400">
                          Avg Time
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold text-slate-400">
                          SLA %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {metrics.topWorkflows.map((wf) => (
                        <tr key={wf.name}>
                          <td className="py-2.5 text-slate-700 font-medium">{wf.name}</td>
                          <td className="py-2.5 text-right text-slate-600">
                            {wf.instances.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right text-slate-600">{wf.avgHours}h</td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`text-xs font-semibold ${wf.slaPercent >= 90 ? 'text-emerald-600' : wf.slaPercent >= 80 ? 'text-amber-600' : 'text-rose-600'}`}
                            >
                              {wf.slaPercent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Completion Trend */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-sky-500" /> 7-Day Trend
                  </h3>
                  <div className="space-y-2">
                    {metrics.completionTrend.map((d) => (
                      <div key={d.date} className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 w-20 shrink-0">{d.date.slice(5)}</span>
                        <div className="flex-1 flex gap-1">
                          <div
                            className="h-4 bg-emerald-400 rounded"
                            style={{ width: `${(d.completed / 30) * 100}%`, minWidth: 4 }}
                            title={`${d.completed} completed`}
                          />
                          <div
                            className="h-4 bg-sky-300 rounded"
                            style={{ width: `${(d.initiated / 30) * 100}%`, minWidth: 4 }}
                            title={`${d.initiated} initiated`}
                          />
                        </div>
                        <span className="text-slate-400 w-12 text-right">
                          {d.completed}/{d.initiated}
                        </span>
                      </div>
                    ))}
                    <div className="flex gap-3 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-2 bg-emerald-400 rounded inline-block" /> Completed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-2 bg-sky-300 rounded inline-block" /> Initiated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
