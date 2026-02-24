"use client";

import React, { useState } from 'react';
import {
    GitMerge,
    Plus,
    Play,
    Settings,
    MoreVertical,
    ArrowRight,
    CheckCircle2,
    X,
    Mail,
    UserCheck,
    AlertTriangle,
    Clock,
    Save,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const WORKFLOWS = [
    {
        id: 'WF-001',
        name: 'High Value Expense Approval',
        trigger: 'Expense Claim > ₹50,000',
        steps: 3,
        status: 'Active',
        lastRun: '2 mins ago'
    },
    {
        id: 'WF-002',
        name: 'Probation Confirmation',
        trigger: 'Probation End Date - 15 Days',
        steps: 4,
        status: 'Active',
        lastRun: '1 day ago'
    },
    {
        id: 'WF-003',
        name: 'Asset Replacement Request',
        trigger: 'Ticket Category = Hardware Fault',
        steps: 2,
        status: 'Draft',
        lastRun: 'Never'
    }
];

const NODES = [
    { type: 'Trigger', icon: Play, label: 'Start', color: 'bg-emerald-500' },
    { type: 'Action', icon: UserCheck, label: 'Approval', color: 'bg-indigo-500' },
    { type: 'Action', icon: Mail, label: 'Send Email', color: 'bg-sky-500' },
    { type: 'Condition', icon: GitMerge, label: 'If / Else', color: 'bg-amber-500' },
    { type: 'End', icon: CheckCircle2, label: 'End Flow', color: 'bg-slate-500' },
];

export default function WorkflowsPage() {
    const [viewMode, setViewMode] = useState<'List' | 'Builder'>('List');
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitMerge className="w-6 h-6 text-indigo-500" />
                        Workflow Automation
                    </h1>
                    <p className="text-silver-mist text-sm">Design visual approval chains and automated triggers.</p>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'Builder' ? (
                        <>
                            <button
                                onClick={() => setViewMode('List')}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20">
                                <Save className="w-4 h-4" /> Save Workflow
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => { setSelectedWorkflow(null); setViewMode('Builder'); }}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" /> Create Workflow
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {viewMode === 'List' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto h-full pr-2 pb-20">
                        {WORKFLOWS.map(wf => (
                            <div key={wf.id} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600`}>
                                        <Layout className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                            ${wf.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {wf.status}
                                        </span>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-2">{wf.name}</h3>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Play className="w-3 h-3 text-emerald-500" />
                                        <span className="font-bold">Trigger:</span>
                                        <span className="truncate">{wf.trigger}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                                        <span>{wf.steps} Steps Configured</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-cloud dark:border-slate-800 flex justify-between items-center">
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Last run {wf.lastRun}
                                    </div>
                                    <button
                                        onClick={() => { setSelectedWorkflow(wf); setViewMode('Builder'); }}
                                        className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                    >
                                        Edit Flow <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col lg:flex-row gap-3 overflow-hidden">
                        {/* Builder Canvas (Mock) */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-cloud dark:border-slate-800 relative overflow-hidden flex items-center justify-center">
                            {/* Grid Pattern Background */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            {/* Zoom Controls */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <button className="w-8 h-8 bg-white dark:bg-stellar-blue rounded-lg shadow-sm border border-cloud dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 hover:text-indigo-500">-</button>
                                <button className="w-8 h-8 bg-white dark:bg-stellar-blue rounded-lg shadow-sm border border-cloud dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 hover:text-indigo-500">100%</button>
                                <button className="w-8 h-8 bg-white dark:bg-stellar-blue rounded-lg shadow-sm border border-cloud dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 hover:text-indigo-500">+</button>
                            </div>

                            {/* Mock Flow Diagram */}
                            <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-lg">
                                {/* Start Node */}
                                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center gap-3 w-48 relative">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500">
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Trigger</div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">Expense Submitted</div>
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-300 dark:bg-slate-700"></div>
                                </div>

                                {/* Condition Node */}
                                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3 w-48 relative">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-500">
                                        <GitMerge className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Condition</div>
                                        <div className="text-sm font-bold text-ink-black dark:text-pearl">Amount &gt; 50k</div>
                                    </div>
                                    {/* Branches */}
                                    <div className="absolute -bottom-8 left-1/4 w-0.5 h-8 bg-slate-300 dark:bg-slate-700"></div>
                                    <div className="absolute -bottom-8 right-1/4 w-0.5 h-8 bg-slate-300 dark:bg-slate-700"></div>
                                    <div className="absolute bottom-[-16px] left-1/4 w-[50%] h-0.5 bg-slate-300 dark:bg-slate-700"></div>
                                </div>

                                {/* Action Nodes */}
                                <div className="flex gap-16">
                                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm flex items-center gap-3 w-48 relative">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500">
                                            <UserCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Approval</div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">VP Finance</div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-sm flex items-center gap-3 w-48 relative opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Auto-Approve</div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">System</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Palette */}
                        <div className="w-full lg:w-72 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 flex flex-col overflow-hidden shrink-0">
                            <div className="p-4 border-b border-cloud dark:border-slate-800">
                                <h3 className="font-bold text-ink-black dark:text-pearl">Workflow Components</h3>
                                <p className="text-xs text-silver-mist">Drag items to the canvas.</p>
                            </div>

                            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                                {NODES.map((node, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-cloud dark:border-slate-800 flex items-center gap-3 cursor-grab hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                        <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center text-white shadow-sm`}>
                                            <node.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{node.label}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{node.type}</div>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 m-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Tip</div>
                                        <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1">
                                            Connect "Condition" nodes to create branching logic paths.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

