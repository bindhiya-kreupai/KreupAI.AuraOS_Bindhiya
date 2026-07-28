'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Loader2, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { WorkflowService } from '../services';
import { toast } from 'sonner';

interface ConditionRule {
  id: string;
  workflowId: string;
  workflowName: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
  nodeIndex: number;
}

export default function ConditionalLogicPage() {
  const router = useRouter();
  const [rules, setRules] = useState<ConditionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await WorkflowService.getWorkflows();
      const extracted: ConditionRule[] = (data || []).flatMap((wf: any) => {
        const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
        return nodes
          .filter((n: any) => n.type === 'condition' || n.type === 'conditional')
          .map((n: any, idx: number) => ({
            id: `${wf.id}-${idx}`,
            workflowId: wf.id,
            workflowName: wf.name || 'Unnamed Workflow',
            name: n.label || n.name || n.data?.label || `Condition ${idx + 1}`,
            condition: n.config?.expression || n.condition || `No expression defined`,
            action:
              n.config?.action || n.config?.trueAction || n.config?.falseAction || 'Not configured',
            active: wf.isActive ?? false,
            nodeIndex: idx,
          }));
      });
      setRules(extracted);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load conditional rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule: ConditionRule) => {
    try {
      setToggling(rule.id);
      await WorkflowService.updateWorkflow(rule.workflowId, { isActive: !rule.active } as any);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)));
      toast.success(`Rule ${rule.active ? 'disabled' : 'enabled'}`);
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error('Failed to update rule status');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-emerald-500" />
            Conditional Logic
          </h1>
          <p className="text-slate-500 text-sm">
            Business rules extracted from workflow condition nodes. Edit conditions in the Workflow
            Designer.
          </p>
        </div>
        <button
          onClick={() => router.push('/workflow-engine/designer')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Add Condition Node
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Code className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No Conditional Rules</h3>
          <p className="text-sm text-slate-400 mb-4">
            Add condition nodes to your workflows to see rules here.
          </p>
          <button
            onClick={() => router.push('/workflow-engine/designer')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            Open Designer
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Workflow</th>
                <th className="px-6 py-4">Condition (Pseudo-code)</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold">{rule.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{rule.workflowName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded w-fit max-w-xs truncate">
                    {rule.condition}
                  </td>
                  <td className="px-6 py-4">{rule.action}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(rule)}
                      disabled={toggling === rule.id}
                      className="flex items-center"
                    >
                      {rule.active ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push('/workflow-engine/designer')}
                      className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-sm"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
