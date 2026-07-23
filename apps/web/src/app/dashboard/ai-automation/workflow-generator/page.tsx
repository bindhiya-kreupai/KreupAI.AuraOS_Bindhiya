'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Connection, Edge, Node } from 'reactflow';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Sparkles,
  Play,
  GitBranch,
  Terminal,
  Wand2,
  Calendar,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  Webhook,
  Save,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  workflowGenerator,
  type WorkflowGenerateResponse,
  type WorkflowGeneratedStep,
} from '@/lib/services/ai-automation-client';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';
import { canvasFromStored } from '@/lib/ai/workflow-generator-layout';

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  trigger: Play,
  action: Terminal,
  approval: UserCheck,
  condition: GitBranch,
  notification: Mail,
  wait: Calendar,
  integration: Webhook,
};

const EMPTY_CANVAS: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: 'placeholder',
      type: 'input',
      data: { label: 'Describe a workflow above to generate' },
      position: { x: 250, y: 120 },
      style: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
        background: '#f8fafc',
        color: '#64748b',
        fontSize: '13px',
        minWidth: '220px',
      },
    },
  ],
  edges: [],
};

export default function WorkflowGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(EMPTY_CANVAS.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(EMPTY_CANVAS.edges);
  const [generation, setGeneration] = useState<WorkflowGenerateResponse | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [flowKey, setFlowKey] = useState(0);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}`, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const [configRes, listRes] = await Promise.all([
          workflowGenerator.getConfig(),
          workflowGenerator.getWorkflows(),
        ]);
        if (configRes.success && configRes.data) {
          setAiEnabled(configRes.data.aiEnabled);
        }
        if (listRes.success && listRes.data?.workflows?.length) {
          const latest = listRes.data.workflows[0];
          const canvas = canvasFromStored(latest.nodes, latest.edges);
          if (canvas) {
            setNodes(canvas.nodes as Node[]);
            setEdges(
              canvas.edges.map((e) => ({
                ...e,
                markerEnd: { type: MarkerType.ArrowClosed },
              })) as Edge[]
            );
            setFlowKey((k) => k + 1);
          }
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setNodes([]);
    setEdges([]);
    try {
      const result = await workflowGenerator.generateWorkflow(prompt.trim());
      if (!result.success || !result.data) {
        addToast('error', result.error || 'Failed to generate workflow');
        setNodes(EMPTY_CANVAS.nodes);
        setEdges(EMPTY_CANVAS.edges);
        return;
      }
      const data = result.data;
      setGeneration(data);

      const nextNodes = (data.nodes ?? []).filter((n) => n.id !== 'placeholder') as Node[];
      const nextEdges = (data.edges ?? []).map((e) => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed },
      })) as Edge[];

      setNodes(nextNodes.length > 0 ? nextNodes : EMPTY_CANVAS.nodes);
      setEdges(nextEdges);
      setFlowKey((k) => k + 1);

      addToast(
        'success',
        data.aiEnabled
          ? `Workflow generated with ${data.provider || 'AI'}`
          : 'Workflow generated (rules-based — add LLM keys for AI generation)'
      );
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to generate workflow');
      setNodes(EMPTY_CANVAS.nodes);
      setEdges(EMPTY_CANVAS.edges);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (activate: boolean) => {
    if (!generation && nodes.length <= 1) {
      addToast('warning', 'Generate a workflow first');
      return;
    }
    setIsSaving(true);
    try {
      const result = await workflowGenerator.saveWorkflow({
        name: generation?.name || 'AI Generated Workflow',
        description: generation?.description,
        trigger: generation?.trigger,
        triggerEvent: generation?.triggerEvent,
        nodes,
        edges,
        steps: generation?.steps,
        prompt: prompt.trim() || undefined,
        activate,
      });
      if (!result.success || !result.data) {
        addToast('error', result.error || 'Failed to save workflow');
        return;
      }
      setLastSavedId(result.data.workflow.id);
      addToast('success', result.data.message);
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const steps: WorkflowGeneratedStep[] = generation?.steps ?? [];
  const efficiencyScore = generation?.efficiencyScore ?? null;
  const hoursSaved = generation?.estimatedHoursSaved ?? null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="bg-white dark:bg-stellar-blue p-6 border-b border-cloud dark:border-nebula-purple/50">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-indigo-500" />
              AI Workflow Generator
            </h1>
            {aiEnabled !== null && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  aiEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }`}
              >
                {aiEnabled ? 'AI enabled' : 'Rules-based mode'}
              </span>
            )}
          </div>

          {generation?.name && (
            <p className="text-sm text-silver-mist mb-3">
              <span className="font-semibold text-ink-black dark:text-pearl">
                {generation.name}
              </span>
              {generation.description ? ` — ${generation.description}` : ''}
            </p>
          )}

          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              placeholder="Describe a workflow, e.g., 'When an employee resigns, notify manager, schedule exit interview, and disable access after 30 days.'"
              className="w-full pl-5 pr-32 py-4 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate
                </>
              )}
            </button>
          </div>

          {generation?.suggestions && generation.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {generation.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex bg-slate-50 dark:bg-slate-900/20 relative min-h-0">
        <div className="flex-1 h-full min-w-0">
          <ReactFlow
            key={flowKey}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.25 }}
          >
            <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.2 }} />
            <Controls className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" />
            <MiniMap
              nodeStrokeColor="#e2e8f0"
              nodeColor="#fff"
              maskColor="rgba(240, 245, 255, 0.6)"
              className="bg-white border border-slate-200 shadow-sm rounded-lg"
            />
          </ReactFlow>
        </div>

        <div className="w-80 bg-white dark:bg-stellar-blue border-l border-cloud dark:border-nebula-purple/50 p-6 flex flex-col gap-3 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-4">
              Steps {steps.length > 0 ? `(${steps.length})` : ''}
            </h3>
            {steps.length === 0 ? (
              <p className="text-sm text-silver-mist">
                Generate a workflow to see steps, timing, and efficiency metrics.
              </p>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />
                {steps.map((step) => {
                  const Icon = STEP_ICONS[step.type] || Bell;
                  return (
                    <div
                      key={step.id}
                      className="relative flex items-start gap-3 bg-white dark:bg-stellar-blue p-2 rounded-lg z-10"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-ink-black dark:text-pearl">
                          {step.label}
                        </p>
                        {step.description && (
                          <p className="text-[10px] text-silver-mist mt-0.5 line-clamp-2">
                            {step.description}
                          </p>
                        )}
                        <p className="text-[10px] text-silver-mist font-medium flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {step.timing || '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {efficiencyScore !== null && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  Efficiency Score
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {efficiencyScore}%
              </p>
              {hoursSaved !== null && (
                <p className="text-[10px] text-emerald-600/80 mt-1">
                  Estimated to save <strong>{hoursSaved} hours</strong> per run.
                  {generation?.confidenceScore != null && (
                    <> Confidence: {generation.confidenceScore}%.</>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="mt-auto space-y-2 pt-4">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving || !generation}
              className="w-full py-2.5 border border-slate-300 dark:border-slate-600 text-ink-black dark:text-pearl font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving || !generation}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Activate Workflow
            </button>
            {lastSavedId && (
              <Link
                href={`/dashboard/workflow-engine/workflow-designer?id=${lastSavedId}`}
                className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline py-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Workflow Engine
              </Link>
            )}
            <p className="text-[10px] text-silver-mist text-center leading-relaxed">
              Activation registers the workflow with the Workflow Engine. Execution is handled there
              — this page is the AI design layer only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
