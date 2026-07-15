'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayCircle,
  Terminal,
  Cpu,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { WorkflowExecutionService, WorkflowService } from '../services';
import type { Workflow, WorkflowExecution } from '../types';
import { toast } from 'sonner';

export default function TestingModePage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedWfId, setSelectedWfId] = useState('');
  const [inputJson, setInputJson] = useState('{}');
  const [simResult, setSimResult] = useState<string>('');
  const [jsonError, setJsonError] = useState('');
  const [showAllExecutions, setShowAllExecutions] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wfs, execs] = await Promise.all([
        WorkflowService.getWorkflows(),
        WorkflowExecutionService.getExecutions(),
      ]);
      setWorkflows(wfs || []);
      setExecutions(execs || []);

      if (wfs && wfs.length > 0 && !selectedWfId) {
        const activeWf = wfs.find((w) => w.status === 'active');
        const first = activeWf || wfs[0];
        setSelectedWfId(first.id);
        autoGenerateSample(first);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const autoGenerateSample = (wf: Workflow) => {
    if (Array.isArray(wf.nodes) && wf.nodes.length > 0) {
      const sample: Record<string, any> = {};
      for (const node of wf.nodes) {
        const cfg = (node as any).config;
        if (cfg?.fields && Array.isArray(cfg.fields)) {
          for (const field of cfg.fields) {
            const key = field.name || field.id || field.fieldName;
            if (key) {
              sample[key] = field.defaultValue ?? field.value ?? '';
            }
          }
        }
      }
      if (Object.keys(sample).length > 0) {
        setInputJson(JSON.stringify(sample, null, 2));
        setJsonError('');
        return;
      }
    }
    setInputJson('{}');
    setJsonError('');
  };

  const validateJson = (value: string): boolean => {
    try {
      JSON.parse(value);
      setJsonError('');
      return true;
    } catch {
      setJsonError('Invalid JSON — check syntax');
      return false;
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedWfId) {
      toast.error('Select a workflow first');
      return;
    }
    if (!validateJson(inputJson)) return;

    const selectedWf = workflows.find((w) => w.id === selectedWfId);
    if (selectedWf && selectedWf.status !== 'active') {
      toast.error('Workflow must be ACTIVE to run simulation');
      return;
    }

    try {
      setSimulating(true);
      setSimResult('');
      const parsed = JSON.parse(inputJson);
      const processType = selectedWf?.category || 'GENERIC';
      const result = await WorkflowExecutionService.startExecution(
        selectedWfId,
        'system',
        'System',
        parsed,
        processType
      );
      const resultText = [
        `Simulation completed.`,
        `Execution ID: ${result?.id || 'N/A'}`,
        `Reference: ${result?.executionCode || 'N/A'}`,
        `Status: ${result?.status || 'UNKNOWN'}`,
        `Workflow: ${result?.workflowName || selectedWf?.workflowName || 'N/A'}`,
      ].join('\n');
      setSimResult(resultText);
      setExecutions((prev) => [result, ...prev]);
      toast.success('Simulation completed successfully');
    } catch (err: any) {
      const msg = err?.message || 'Invalid JSON or execution failed';
      setSimResult(`Error: ${msg}`);
      toast.error(msg);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const displayedExecutions = showAllExecutions ? executions : executions.slice(0, 15);
  const selectedWf = workflows.find((w) => w.id === selectedWfId);

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-emerald-500" />
            Simulation & Testing
          </h1>
          <p className="text-slate-500 text-sm">
            Dry-run workflows with mock data before deployment.
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ minHeight: '520px' }}>
        {/* Left Panel — Test Inputs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-500" /> Test Inputs
          </h3>
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Workflow Context</label>
              <select
                value={selectedWfId}
                onChange={(e) => {
                  setSelectedWfId(e.target.value);
                  const wf = workflows.find((w) => w.id === e.target.value);
                  if (wf) autoGenerateSample(wf);
                }}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm"
              >
                {workflows.length > 0 ? (
                  workflows.map((wf) => (
                    <option key={wf.id} value={wf.id}>
                      {wf.workflowName} (v{wf.version}) — {wf.status}
                    </option>
                  ))
                ) : (
                  <option>No workflows available</option>
                )}
              </select>
              {selectedWf && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Type: {selectedWf.category} | Status: {selectedWf.status} | Nodes:{' '}
                  {selectedWf.nodes?.length || 0}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Input JSON Payload
              </label>
              <textarea
                value={inputJson}
                onChange={(e) => {
                  setInputJson(e.target.value);
                  validateJson(e.target.value);
                }}
                className={`w-full h-48 mt-1 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg p-3 border-none resize-none ${
                  jsonError ? 'ring-2 ring-red-500' : ''
                }`}
                spellCheck={false}
              />
              {jsonError && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {jsonError}
                </p>
              )}
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={simulating || !selectedWfId || !!jsonError}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </button>
            {simResult && (
              <div
                className={`mt-3 p-3 font-mono text-xs rounded-lg border whitespace-pre-wrap ${
                  simResult.startsWith('Error:')
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-slate-900 text-emerald-400 border-emerald-800'
                }`}
              >
                {simResult}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Execution Log */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-6 font-mono text-sm overflow-y-auto">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
            <Terminal className="w-5 h-5" /> Execution Log
            <span className="text-[10px] text-slate-500 font-normal ml-auto">
              {executions.length} total
            </span>
          </h3>
          {displayedExecutions.length === 0 ? (
            <div className="text-slate-500 text-xs text-center py-8">
              No execution history. Run a simulation to see results.
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {displayedExecutions.map((exec, idx) => {
                const isCompleted = exec.status === 'completed';
                const isFailed = exec.status === 'failed';
                return (
                  <div
                    key={exec.id || idx}
                    className={`flex items-start gap-2 ${
                      isCompleted ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    ) : isFailed ? (
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <PlayCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-500">
                        [{exec.startDate ? new Date(exec.startDate).toLocaleTimeString() : 'N/A'}]
                      </span>{' '}
                      <span className="text-white">{exec.workflowName || 'Workflow'}</span>
                      <span className="text-slate-500"> — </span>
                      <span className="uppercase font-bold">{exec.status}</span>
                      {exec.executionCode && (
                        <span className="text-slate-600 ml-1">({exec.executionCode})</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {executions.length > 15 && !showAllExecutions && (
                <button
                  onClick={() => setShowAllExecutions(true)}
                  className="text-blue-400 hover:text-blue-300 text-[11px] mt-2"
                >
                  Show all {executions.length} executions...
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
