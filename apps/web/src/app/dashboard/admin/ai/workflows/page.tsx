"use client";

import React, { useState, useEffect } from 'react';
import {
    GitBranch,
    Plus,
    Play,
    Pause,
    Clock,
    Zap,
    Mail,
    Users,
    ArrowRight
} from 'lucide-react';

interface Workflow {
    id: string;
    name: string;
    description: string | null;
    trigger: string;
    triggerEvent: string | null;
    nodes: unknown[];
    edges: unknown[];
    isActive: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
    _count?: { instances: number };
}

export default function SmartWorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/v1/admin/workflows/')
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setWorkflows(result.data);
                } else {
                    setError(result.error || 'Failed to load workflows');
                }
            })
            .catch(err => {
                console.error('Failed to fetch workflows:', err);
                setError('Failed to load workflows. Please try again.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="animate-pulse">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-6">
                        <div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-56 mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80" />
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-28" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GitBranch className="w-6 h-6 text-indigo-500" />
                            Smart Workflows
                        </h1>
                    </div>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-indigo-500" />
                        Smart Workflows
                    </h1>
                    <p className="text-slate-500 text-sm">Automate processes with visual triggers and actions.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> New Workflow
                </button>
            </div>

            {workflows.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <GitBranch className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No workflows found.</p>
                        <p className="text-sm text-slate-400 mt-1">Create your first workflow to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {workflows.map((flow) => {
                        const totalRuns = flow._count?.instances ?? 0;
                        const stepsCount = Array.isArray(flow.nodes) ? flow.nodes.length : 0;
                        const triggerLabel = flow.triggerEvent || flow.trigger || 'Manual';

                        return (
                            <div key={flow.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-xl ${flow.isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'bg-slate-100 text-slate-400'}`}>
                                            <GitBranch className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{flow.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Zap className="w-3 h-3 text-amber-500" />
                                                <span>Trigger: <strong>{triggerLabel}</strong></span>
                                            </div>
                                            {flow.description && (
                                                <p className="text-xs text-slate-400 mt-1">{flow.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual Steps Mock */}
                                    <div className="flex-1 hidden md:flex items-center gap-2 opacity-50">
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">Trigger</div>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Users className="w-3 h-3" /> Task</div>
                                        {stepsCount > 2 && (
                                            <>
                                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold">+{stepsCount - 2}</div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{totalRuns}</div>
                                            <div className="text-xs text-slate-400">Total Runs</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className={`p-2 rounded-lg transition-colors ${flow.isActive ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                                {flow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
