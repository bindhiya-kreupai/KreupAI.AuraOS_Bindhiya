"use client";

import React from 'react';
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

export default function SmartWorkflowsPage() {
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

            <div className="grid grid-cols-1 gap-6">
                {[
                    { name: 'Onboarding Sequence', trigger: 'New Employee Added', steps: 5, active: true, runs: 124 },
                    { name: 'Birthday Wishes', trigger: 'Date = Birthday', steps: 1, active: true, runs: 850 },
                    { name: 'Probation End Alert', trigger: '90 Days after Start', steps: 3, active: false, runs: 0 },
                    { name: 'Exit Interview Scheduler', trigger: 'Resignation Submitted', steps: 4, active: true, runs: 12 },
                ].map((flow, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-xl ${flow.active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'bg-slate-100 text-slate-400'}`}>
                                    <GitBranch className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{flow.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        <span>Trigger: <strong>{flow.trigger}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Steps Mock */}
                            <div className="flex-1 hidden md:flex items-center gap-2 opacity-50">
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">Trigger</div>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Users className="w-3 h-3" /> Task</div>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold">+{flow.steps - 2}</div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-sm font-bold">{flow.runs}</div>
                                    <div className="text-xs text-slate-400">Total Runs</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className={`p-2 rounded-lg transition-colors ${flow.active ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                        {flow.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
