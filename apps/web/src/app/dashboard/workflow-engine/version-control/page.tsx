'use client';

import React, { useState, useEffect } from 'react';
import { History, GitCommit, RotateCcw, Loader2, GitBranch } from 'lucide-react';
import { WorkflowService } from '../services';
import { toast } from 'sonner';
import type { Workflow } from '../types';

interface VersionEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  version: string;
  description: string;
  updatedBy: string;
  date: string;
  isActive: boolean;
}

export default function VersionControlPage() {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await WorkflowService.getWorkflows();
      setWorkflows(data);
      const entries: VersionEntry[] = data.map((wf: any) => ({
        id: `${wf.id}-v${wf.version || '1.0'}`,
        workflowId: wf.id,
        workflowName: wf.name || 'Unnamed',
        version: wf.version || '1.0',
        description: wf.description || 'No description',
        updatedBy: wf.updatedBy || wf.createdBy || 'System',
        date: wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'N/A',
        isActive: wf.status === 'ACTIVE' || wf.isActive === true,
      }));
      entries.sort((a, b) => b.date.localeCompare(a.date));
      setVersions(entries);
    } catch (error: any) {
      console.error('Failed to load version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: VersionEntry) => {
    toast.info(
      `Rollback for "${version.workflowName}" version ${version.version} — feature requires workflow snapshot storage`
    );
  };

  const filtered =
    selectedWorkflow === 'all'
      ? versions
      : versions.filter((v) => v.workflowId === selectedWorkflow);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-slate-500" />
            Version Control
          </h1>
          <p className="text-slate-500 text-sm">Track changes to workflow definitions.</p>
        </div>
        <select
          value={selectedWorkflow}
          onChange={(e) => setSelectedWorkflow(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Workflows</option>
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>
              {(wf as any).name || wf.id}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-500 mb-2">No Version History</h3>
          <p className="text-sm text-slate-400">
            {selectedWorkflow === 'all'
              ? 'Create and update workflows to build version history.'
              : 'No versions found for the selected workflow.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="relative p-6">
            <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-6">
              {filtered.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-3 group">
                  <div
                    className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900 ${entry.isActive ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 dark:border-slate-600 text-slate-300'}`}
                  >
                    <GitCommit className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold flex items-center gap-2">
                        <GitBranch className="w-3 h-3 text-slate-400" />
                        {entry.workflowName}
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          v{entry.version}
                        </span>
                        {entry.isActive && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{entry.date}</div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {entry.description}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">By: {entry.updatedBy}</span>
                      {!entry.isActive && (
                        <button
                          disabled
                          title="Rollback requires workflow snapshot storage — not yet implemented"
                          className="text-slate-300 dark:text-slate-600 cursor-not-allowed flex items-center gap-1 opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
