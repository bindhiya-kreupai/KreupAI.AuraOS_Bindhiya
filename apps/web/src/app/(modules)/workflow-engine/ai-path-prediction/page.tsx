'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Loader2, BarChart2, AlertTriangle } from 'lucide-react';
import {
  WorkflowService,
  WorkflowExecutionService,
} from '@/app/dashboard/workflow-engine/services';
import { toast } from 'sonner';

interface PathAnalysis {
  id: string;
  name: string;
  totalRuns: number;
  successRate: string;
  bottleneck: string;
  confidence: number;
  nodeCount: number;
}

export default function AIPathPredictionPage() {
  const [analyses, setAnalyses] = useState<PathAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const [workflows, executions] = await Promise.all([
        WorkflowService.getWorkflows(),
        WorkflowExecutionService.getExecutions(),
      ]);

      const executionWorkflowIds = new Set(
        executions.map((e: any) => e.workflowId).filter(Boolean)
      );

      const workflowTypes = new Set([
        'GENERIC',
        'LEAVE_REQUEST',
        'EXPENSE_CLAIM',
        'PURCHASE_ORDER',
        'ONBOARDING',
        'OFFBOARDING',
      ]);
      const relevantWorkflows = workflows.filter(
        (wf: any) => workflowTypes.has((wf as any).category) || executionWorkflowIds.has(wf.id)
      );

      const results: PathAnalysis[] = relevantWorkflows
        .map((wf: any) => {
          const wfExecs = executions.filter((e: any) => e.workflowId === wf.id);
          const completed = wfExecs.filter(
            (e: any) => e.status === 'completed' || e.status === 'approved'
          );
          const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
          return {
            id: wf.id,
            name: wf.workflowName || 'Unnamed Workflow',
            totalRuns: wfExecs.length,
            successRate:
              wfExecs.length > 0 ? ((completed.length / wfExecs.length) * 100).toFixed(1) : '0.0',
            bottleneck:
              nodes.length > 2
                ? nodes[Math.floor(nodes.length / 2)]?.name || 'Middle step'
                : nodes.length > 0
                  ? nodes[nodes.length - 1]?.name || 'Last step'
                  : 'N/A',
            confidence: wfExecs.length >= 5 ? Math.min(95, 50 + wfExecs.length * 3) : 0,
            nodeCount: nodes.length,
          };
        })
        .filter((a: PathAnalysis) => a.totalRuns > 0);

      setAnalyses(results);
    } catch (error: any) {
      console.error('Failed to load path analyses:', error);
      toast.error('Failed to load path analyses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Path Analysis
          </h1>
          <p className="text-slate-500 text-sm">
            Performance analysis based on historical execution data.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <span className="text-amber-700 dark:text-amber-300">
          Predictions are based on simple heuristics (node position, execution count). A proper
          ML-based analysis service would be needed for accurate path optimization.
        </span>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No Workflows to Analyze</h3>
          <p className="text-sm text-slate-400">
            Create and run workflows to generate path analyses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                {a.confidence > 0 && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                    {a.confidence}% confidence
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2">{a.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Runs</span>
                  <span className="font-bold">{a.totalRuns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Success Rate</span>
                  <span className="font-bold text-emerald-600">{a.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Likely Bottleneck</span>
                  <span className="font-bold text-orange-600">{a.bottleneck}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Workflow Nodes</span>
                  <span className="font-bold">{a.nodeCount}</span>
                </div>
              </div>
              {a.totalRuns < 5 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Need {5 - a.totalRuns} more runs for higher confidence
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
