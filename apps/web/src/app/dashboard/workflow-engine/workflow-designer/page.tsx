'use client';

import React, { useState, useEffect, useCallback, Suspense, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Connection, Edge, Node, NodeProps } from 'reactflow';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  GitBranch,
  Loader2,
  ExternalLink,
  AlertCircle,
  Save,
  Play,
  CheckCircle2,
  Zap,
  Mail,
  UserCheck,
  Clock,
  Webhook,
  Settings,
  StopCircle,
  Search,
} from 'lucide-react';

type WorkflowRow = {
  id: string;
  name: string;
  description?: string | null;
  nodes?: unknown;
  edges?: unknown;
  isActive?: boolean;
  trigger?: string;
  triggerEvent?: string | null;
};

type StepKind =
  | 'start'
  | 'trigger'
  | 'approval'
  | 'condition'
  | 'email'
  | 'notification'
  | 'wait'
  | 'webhook'
  | 'end'
  | 'action';

type StepData = {
  label: string;
  stepType: StepKind;
  description?: string;
};

const KIND_META: Record<
  StepKind,
  { title: string; icon: React.ComponentType<{ className?: string }>; chip: string; accent: string }
> = {
  start: {
    title: 'Trigger',
    icon: Zap,
    chip: 'bg-celestial-indigo/10 text-celestial-indigo',
    accent: 'border-celestial-indigo',
  },
  trigger: {
    title: 'Trigger',
    icon: Zap,
    chip: 'bg-celestial-indigo/10 text-celestial-indigo',
    accent: 'border-celestial-indigo',
  },
  approval: {
    title: 'Approval',
    icon: UserCheck,
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    accent: 'border-violet-400',
  },
  condition: {
    title: 'Condition',
    icon: GitBranch,
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    accent: 'border-amber-400',
  },
  email: {
    title: 'Email',
    icon: Mail,
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    accent: 'border-sky-400',
  },
  notification: {
    title: 'Notify',
    icon: Mail,
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    accent: 'border-emerald-400',
  },
  wait: {
    title: 'Wait',
    icon: Clock,
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    accent: 'border-orange-400',
  },
  webhook: {
    title: 'Integration',
    icon: Webhook,
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    accent: 'border-cyan-400',
  },
  end: {
    title: 'End',
    icon: StopCircle,
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    accent: 'border-slate-400',
  },
  action: {
    title: 'Action',
    icon: Settings,
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    accent: 'border-cloud dark:border-nebula-purple/50',
  },
};

function normalizeKind(raw: string): StepKind {
  if (raw in KIND_META) return raw as StepKind;
  return 'action';
}

const WorkflowStepNode = memo(function WorkflowStepNode({ data }: NodeProps<StepData>) {
  const kind = normalizeKind(data.stepType || 'action');
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const isStart = kind === 'start' || kind === 'trigger';
  const isEnd = kind === 'end';

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-xl bg-white dark:bg-stellar-blue border-2 ${meta.accent} w-64 hover:shadow-lg transition-shadow`}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-300 dark:!bg-slate-600 !border-2 !border-white dark:!border-slate-900"
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.chip}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-silver-mist">
            {meta.title}
          </div>
          <div className="font-bold text-sm text-ink-black dark:text-pearl leading-snug truncate">
            {data.label}
          </div>
          {data.description && (
            <p className="text-[11px] text-silver-mist mt-1 line-clamp-2">{data.description}</p>
          )}
        </div>
      </div>

      {!isEnd && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-celestial-indigo !border-2 !border-white dark:!border-slate-900"
        />
      )}
    </div>
  );
});

const nodeTypes = { workflowStep: WorkflowStepNode };

function storedToFlow(nodes: unknown, edges: unknown): { nodes: Node<StepData>[]; edges: Edge[] } {
  const rawNodes = Array.isArray(nodes) ? nodes : [];
  const rawEdges = Array.isArray(edges) ? edges : [];

  // Prefer a clean vertical layout for readability (engine often stores horizontal rows)
  const flowNodes: Node<StepData>[] = rawNodes.map((n: any, i: number) => {
    const kind = normalizeKind(String(n.type || n.data?.stepType || 'action'));
    const label = String(n.label || n.data?.label || n.name || `Step ${i + 1}`);
    const description =
      typeof n.config?.message === 'string'
        ? n.config.message
        : typeof n.description === 'string'
          ? n.description
          : undefined;

    return {
      id: String(n.id || `node-${i}`),
      type: 'workflowStep',
      position: { x: 280, y: 40 + i * 140 },
      data: { label, stepType: kind, description },
    };
  });

  const flowEdges: Edge[] = rawEdges
    .map((e: any, i: number) => ({
      id: String(e.id || `edge-${i}`),
      source: String(e.source || e.fromNode || e.sourceNodeId || ''),
      target: String(e.target || e.toNode || e.targetNodeId || ''),
      label: e.label ? String(e.label) : undefined,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }))
    .filter((e) => e.source && e.target);

  return { nodes: flowNodes, edges: flowEdges };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (typeof body?.error === 'string' && body.error) ||
      body?.error?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

async function loadWorkflowById(id: string): Promise<WorkflowRow | null> {
  try {
    const res = await fetchJson<{ success: boolean; data?: WorkflowRow }>(
      `/api/v1/admin/workflows/${id}`
    );
    if (res.data?.id) return res.data;
  } catch {
    /* ignore */
  }
  return null;
}

async function loadWorkflowList(): Promise<WorkflowRow[]> {
  try {
    const ai = await fetchJson<{ success: boolean; data?: { workflows?: WorkflowRow[] } }>(
      '/api/ai/workflow'
    );
    if (Array.isArray(ai.data?.workflows)) return ai.data.workflows;
  } catch {
    /* ignore */
  }

  try {
    const list = await fetchJson<{ success: boolean; data?: WorkflowRow[] }>(
      '/api/workflows?type=definitions'
    );
    if (Array.isArray(list.data)) return list.data;
  } catch {
    /* ignore */
  }

  return [];
}

function DesignerCanvas({
  workflow,
  onSaved,
}: {
  workflow: WorkflowRow;
  onSaved: (wf: WorkflowRow) => void;
}) {
  const initial = storedToFlow(workflow.nodes, workflow.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const next = storedToFlow(workflow.nodes, workflow.edges);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [workflow.id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const payload = {
        name: workflow.name,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.stepType || 'action',
          label: n.data.label || n.id,
          position: n.position,
          config: {},
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: typeof e.label === 'string' ? e.label : undefined,
        })),
      };

      const res = await fetchJson<{ success: boolean; data?: WorkflowRow }>(
        `/api/v1/admin/workflows/${workflow.id}`,
        { method: 'PUT', body: JSON.stringify(payload) }
      );

      onSaved({
        ...workflow,
        ...(res.data || {}),
        nodes: payload.nodes,
        edges: payload.edges,
      });
      setSaveMsg('Saved');
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 2500);
    }
  };

  const steps = nodes.map((n) => n.data);

  return (
    <div className="flex-1 min-w-0 min-h-0 flex overflow-hidden">
      <div className="flex-1 min-w-0 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-50 dark:bg-deep-cosmos/40"
        >
          <Background color="#94a3b8" gap={22} size={1} className="opacity-20" />
          <Controls className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 shadow-sm rounded-lg overflow-hidden" />
          <MiniMap
            nodeStrokeColor="#e2e8f0"
            nodeColor="#ffffff"
            maskColor="rgba(248, 250, 252, 0.65)"
            className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 shadow-sm rounded-lg"
          />
          <Panel position="top-right" className="flex items-center gap-2">
            {saveMsg && (
              <span className="text-xs text-silver-mist bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {saveMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium shadow-sm hover:bg-celestial-indigo/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <aside className="w-80 shrink-0 bg-white dark:bg-stellar-blue border-l border-cloud dark:border-nebula-purple/50 p-5 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-1">
            Workflow
          </h3>
          <h2 className="font-bold text-ink-black dark:text-pearl text-base leading-snug">
            {workflow.name}
          </h2>
          {workflow.description && (
            <p className="text-xs text-silver-mist mt-1.5 leading-relaxed">
              {workflow.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                workflow.isActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}
            >
              {workflow.isActive ? 'Active' : 'Draft'}
            </span>
            <span className="text-[10px] font-medium text-silver-mist px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {steps.length} steps
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-3">
            Steps
          </h3>
          <div className="space-y-3 relative">
            <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />
            {steps.map((step, i) => {
              const meta = KIND_META[normalizeKind(step.stepType)];
              const Icon = meta.icon;
              return (
                <div key={`${step.label}-${i}`} className="relative flex items-start gap-3 z-10">
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-white dark:border-stellar-blue flex items-center justify-center shrink-0 ${meta.chip}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[10px] uppercase font-bold text-silver-mist tracking-wide">
                      {meta.title}
                    </p>
                    <p className="text-xs font-bold text-ink-black dark:text-pearl">{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link
            href="/dashboard/ai-automation/workflow-generator"
            className="w-full py-2.5 border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Edit in AI Generator
          </Link>
        </div>
      </aside>
    </div>
  );
}

function WorkflowDesignerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');

  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [selected, setSelected] = useState<WorkflowRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [list, byId] = await Promise.all([
          loadWorkflowList(),
          workflowId ? loadWorkflowById(workflowId) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        let merged = list;
        if (byId && !list.some((w) => w.id === byId.id)) {
          merged = [byId, ...list];
        }
        setWorkflows(merged);

        const pick =
          (workflowId && (byId || merged.find((w) => w.id === workflowId))) || merged[0] || null;
        setSelected(pick);

        if (!merged.length) {
          setLoadError(
            'No saved workflows yet. Generate one in AI Workflow Generator and click Save / Activate.'
          );
        } else if (workflowId && !pick) {
          setLoadError(`Could not find workflow ${workflowId}.`);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load workflows');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workflowId]);

  const onSelect = (wf: WorkflowRow) => {
    setSelected(wf);
    router.replace(`/dashboard/workflow-engine/workflow-designer?id=${wf.id}`, { scroll: false });
  };

  const filtered = workflows.filter((w) =>
    !query.trim() ? true : w.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] gap-3 text-silver-mist">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        Loading workflows…
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col -m-2">
      <div className="shrink-0 bg-white dark:bg-stellar-blue px-5 py-4 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-celestial-indigo" />
            Workflow Designer
          </h1>
          <p className="text-xs text-silver-mist mt-0.5">
            Inspect and refine automation flows saved from the AI generator.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/ai-automation/workflow-generator"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos"
          >
            <ExternalLink className="w-4 h-4" />
            AI Generator
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="shrink-0 mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <ReactFlowProvider>
        <div className="flex flex-1 min-h-0">
          <aside className="w-64 shrink-0 bg-white dark:bg-stellar-blue border-r border-cloud dark:border-nebula-purple/50 p-4 flex flex-col gap-3 overflow-hidden">
            <div>
              <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">
                Saved workflows
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-silver-mist" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos/50 text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 -mx-1 px-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-silver-mist px-1 py-6 text-center">
                  No workflows match.
                </p>
              ) : (
                filtered.map((wf) => {
                  const active = selected?.id === wf.id;
                  const stepCount = Array.isArray(wf.nodes) ? wf.nodes.length : 0;
                  return (
                    <button
                      type="button"
                      key={wf.id}
                      onClick={() => onSelect(wf)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors border ${
                        active
                          ? 'bg-celestial-indigo/10 border-celestial-indigo/30 text-ink-black dark:text-pearl'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-deep-cosmos/50'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">{wf.name}</div>
                      <div className="text-[10px] text-silver-mist mt-1 flex items-center gap-1.5">
                        <Play className="w-3 h-3" />
                        {stepCount} steps
                        <span>·</span>
                        {wf.isActive ? 'Active' : 'Draft'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {selected ? (
            <DesignerCanvas
              key={selected.id}
              workflow={selected}
              onSaved={(wf) => {
                setSelected(wf);
                setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? { ...w, ...wf } : w)));
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-deep-cosmos/40 text-silver-mist text-sm">
              Select a workflow from the list
            </div>
          )}
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default function WorkflowDesignerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
        </div>
      }
    >
      <WorkflowDesignerContent />
    </Suspense>
  );
}
