'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Box, ArrowRight, Settings, Play } from 'lucide-react';
import { WorkflowService } from '../services';

const WORKFLOW_NODES = [
    { id: 'start', type: 'trigger', label: 'Form Submitted', x: 50, y: 150, color: 'bg-emerald-500' },
    { id: 'step1', type: 'action', label: 'Manager Approval', x: 250, y: 150, color: 'bg-blue-500' },
    { id: 'step2', type: 'condition', label: 'Amount > $1000', x: 450, y: 150, color: 'bg-amber-500' },
    { id: 'step3a', type: 'action', label: 'Finance Review', x: 650, y: 80, color: 'bg-indigo-500' },
    { id: 'step3b', type: 'action', label: 'Auto-Approve', x: 650, y: 220, color: 'bg-indigo-500' },
    { id: 'end', type: 'end', label: 'End Process', x: 850, y: 150, color: 'bg-slate-500' },
];

export default function WorkflowDesignerPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-indigo-500" />
                        Workflow Designer
                    </h1>
                    <p className="text-slate-500 text-sm">Visually design and configure automation workflows.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4" /> Test Run
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Save Workflow
                    </button>
                </div>
            </div>

            <div className="flex gap-6 h-[600px]">
                {/* Toolbox */}
                <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Components</h3>

                    <div className="space-y-2">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><Play className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Trigger</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><Box className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Action</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center"><GitBranch className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">Condition</span>
                        </div>
                    </div>
                </div>

                {/* Canvas Area (Mock) */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 pattern-grid-lg text-slate-200 dark:text-slate-800 opacity-20" />

                    {/* Mock Nodes */}
                    {WORKFLOW_NODES.map((node) => (
                        <div
                            key={node.id}
                            style={{ left: node.x, top: node.y }}
                            className="absolute flex flex-col items-center group cursor-pointer"
                        >
                            <div className={`w-12 h-12 rounded-xl text-white shadow-lg flex items-center justify-center mb-2 ${node.color} group-hover:scale-110 transition-transform`}>
                                <Settings className="w-5 h-5" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 text-xs font-bold whitespace-nowrap">
                                {node.label}
                            </div>

                            {/* Connection Lines (Simulated) */}
                            {node.type !== 'end' && (
                                <div className="absolute left-full top-6 w-32 h-0.5 bg-slate-300 dark:bg-slate-700 -z-10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
