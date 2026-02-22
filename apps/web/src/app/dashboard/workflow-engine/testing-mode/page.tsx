'use client';

import React, { useState, useEffect } from 'react';
import { PlayCircle, Terminal, Cpu, Loader2 } from 'lucide-react';
import { WorkflowExecutionService, WorkflowService } from '../services';

export default function TestingModePage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wfs, execs] = await Promise.all([
                WorkflowService.getWorkflows(),
                WorkflowExecutionService.getExecutions(),
            ]);
            setWorkflows(wfs || []);
            setExecutions(execs || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
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
                        <PlayCircle className="w-6 h-6 text-emerald-500" />
                        Simulation & Testing
                    </h1>
                    <p className="text-slate-500 text-sm">Dry-run workflows with mock data before deployment.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[500px]">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-slate-500" /> Test Inputs
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Workflow Context</label>
                            <select className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm">
                                {workflows.length > 0 ? (
                                    workflows.map((wf: any) => (
                                        <option key={wf.id} value={wf.id}>{wf.name} (v{wf.version})</option>
                                    ))
                                ) : (
                                    <option>No workflows available</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Input JSON Payload</label>
                            <textarea
                                className="w-full h-40 mt-1 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg p-3 border-none resize-none"
                                defaultValue={`{
  "request_id": "TEST-001",
  "employee_id": "EMP123",
  "amount": 5500.00,
  "category": "Travel"
}`}
                            />
                        </div>
                        <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                            Run Simulation
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-6 font-mono text-sm overflow-y-auto">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                        <Terminal className="w-5 h-5" /> Execution Log
                    </h3>
                    {executions.length === 0 ? (
                        <div className="text-slate-500 text-xs">No execution history. Run a simulation to see results.</div>
                    ) : (
                        <div className="space-y-2 text-xs">
                            {executions.slice(0, 10).map((exec: any, idx: number) => (
                                <div key={idx} className={exec.status === 'COMPLETED' ? 'text-emerald-400' : exec.status === 'FAILED' ? 'text-red-400' : 'text-blue-400'}>
                                    [{exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString() : 'N/A'}] {exec.definition?.name || 'Workflow'} - {exec.status}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

