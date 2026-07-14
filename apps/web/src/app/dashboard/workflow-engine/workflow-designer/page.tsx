'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Plus, Box, Settings, Play, Loader2, PenLine } from 'lucide-react';
import { WorkflowService, WorkflowExecutionService } from '../services';
import { toast } from 'sonner';

export default function WorkflowDesignerPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await WorkflowService.getWorkflows();
      setWorkflows(data);
      if (data.length > 0) {
        const wf = data[0];
        const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
        if (nodes.length > 0) {
          const mapped = nodes.map((n: any, i: number) => ({
            id: n.id || `node-${i}`,
            type: n.type || 'action',
            label: n.label || n.name || `Step ${i + 1}`,
            x: n.x || n.position?.x || 50 + i * 200,
            y: n.y || n.position?.y || 150,
            color:
              n.type === 'start' || n.type === 'trigger'
                ? 'bg-emerald-500'
                : n.type === 'condition'
                  ? 'bg-amber-500'
                  : n.type === 'end'
                    ? 'bg-slate-500'
                    : 'bg-blue-500',
          }));
          setWorkflowNodes(mapped);
        }
      }
    } catch (error: any) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500" />
            Workflow Designer
          </h1>
          <p className="text-slate-500 text-sm">
            Visually design and configure automation workflows.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <PenLine className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
              placeholder="Workflow name"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await WorkflowExecutionService.startExecution(
                  selectedWorkflowId || workflows[0]?.id,
                  'system',
                  'System',
                  {}
                );
                toast.success('Test execution started');
              } catch (error: any) {
                console.error('Error starting test execution:', error);
                toast.error(error?.message || 'Failed to start test execution');
              }
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Test Run
          </button>
          <button
            onClick={async () => {
              try {
                await WorkflowService.createWorkflow({
                  name: workflowName || 'Untitled Workflow',
                  processType: 'GENERIC',
                  nodes: workflowNodes,
                } as any);
                toast.success('Workflow saved');
              } catch (error: any) {
                console.error('Error saving workflow:', error);
                toast.error(error?.message || 'Failed to save workflow');
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Workflow
          </button>
        </div>
      </div>

      <div className="flex gap-3 h-[600px]">
        <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Components</h3>

          <div className="space-y-2">
            <button
              onClick={() => {
                const idx = workflowNodes.length;
                const newNodes = [
                  ...workflowNodes,
                  {
                    id: `trigger-${Date.now()}`,
                    type: 'trigger',
                    label: `Trigger ${workflowNodes.filter((n: any) => n.type === 'trigger').length + 1}`,
                    config: {},
                    x: 200 + idx * 160,
                    y: 200,
                  },
                ];
                setWorkflowNodes(newNodes);
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <Play className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Trigger</span>
            </button>
            <button
              onClick={() => {
                const idx = workflowNodes.length;
                const newNodes = [
                  ...workflowNodes,
                  {
                    id: `action-${Date.now()}`,
                    type: 'action',
                    label: `Action ${workflowNodes.filter((n: any) => n.type === 'action').length + 1}`,
                    config: {},
                    x: 200 + idx * 160,
                    y: 200,
                  },
                ];
                setWorkflowNodes(newNodes);
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Action</span>
            </button>
            <button
              onClick={() => {
                const idx = workflowNodes.length;
                const newNodes = [
                  ...workflowNodes,
                  {
                    id: `condition-${Date.now()}`,
                    type: 'condition',
                    label: `Condition ${workflowNodes.filter((n: any) => n.type === 'condition').length + 1}`,
                    config: {},
                    x: 200 + idx * 160,
                    y: 200,
                  },
                ];
                setWorkflowNodes(newNodes);
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Condition</span>
            </button>
          </div>

          {workflows.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">
                Workflows
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {workflows.map((wf: any) => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`text-xs p-2 rounded cursor-pointer transition-colors ${selectedWorkflowId === wf.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                  >
                    {wf.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid-lg text-slate-200 dark:text-slate-800 opacity-20" />

          {workflowNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-500 mb-2">No Workflow Nodes</h3>
                <p className="text-sm text-slate-400">
                  Click components from the sidebar to start designing.
                </p>
              </div>
            </div>
          ) : (
            workflowNodes.map((node, idx) => (
              <div
                key={node.id}
                style={{ left: node.x, top: node.y }}
                className="absolute flex flex-col items-center group cursor-pointer"
              >
                <button
                  onClick={() =>
                    setWorkflowNodes((prev: any[]) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                  title="Remove node"
                >
                  &times;
                </button>
                <div
                  className={`w-12 h-12 rounded-xl text-white shadow-lg flex items-center justify-center mb-2 ${node.color} group-hover:scale-110 transition-transform`}
                >
                  <Settings className="w-5 h-5" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 text-xs font-bold whitespace-nowrap">
                  {node.label}
                </div>

                {node.type !== 'end' && (
                  <div className="absolute left-full top-6 w-32 h-0.5 bg-slate-300 dark:bg-slate-700 -z-10" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
