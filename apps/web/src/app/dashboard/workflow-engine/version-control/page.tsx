// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import { History, GitCommit, RotateCcw, Loader2 } from 'lucide-react';
import { WorkflowService } from '../services';

export default function VersionControlPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [workflowName, setWorkflowName] = useState('Workflow History');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVersionHistory();
    }, []);

    const fetchVersionHistory = async () => {
        try {
            setLoading(true);
            const workflows = await WorkflowService.getWorkflows();
            if (workflows.length > 0) {
                setWorkflowName(workflows[0].name || 'Workflow History');
                const versions = workflows.map((wf: any, idx: number) => ({
                    id: `v${wf.version || idx + 1}`,
                    message: wf.description || wf.name,
                    user: wf.createdBy || 'System',
                    date: wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'N/A',
                    active: idx === 0,
                }));
                setHistory(versions);
            }
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    <p className="text-slate-500 text-sm">Track changes and rollback to previous configurations.</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Version History</h3>
                    <p className="text-sm text-slate-400">Create and update workflows to build version history.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-lg">{workflowName}</h2>
                    </div>

                    <div className="relative p-6">
                        <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

                        <div className="space-y-8">
                            {history.map((commit) => (
                                <div key={commit.id} className="relative flex items-start gap-3 group">
                                    <div className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900 ${commit.active ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 dark:border-slate-600 text-slate-300'}`}>
                                        <GitCommit className="w-3 h-3 fill-current" />
                                    </div>

                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold flex items-center gap-2">
                                                {commit.id}
                                                {commit.active && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Current</span>}
                                            </div>
                                            <div className="text-xs text-slate-400">{commit.date}</div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{commit.message}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">By: {commit.user}</span>
                                            {!commit.active && (
                                                <button className="text-indigo-600 hover:underline flex items-center gap-1">
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

