"use client";

import React from 'react';
import {
    GitFork,
    PlayCircle,
    Save,
    Settings,
    Plus,
    Users,
    Mail,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

export default function WorkflowDesignerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitFork className="w-6 h-6 text-indigo-500" />
                        Workflow Designer
                    </h1>
                    <p className="text-slate-500 text-sm">Create and automate approval flows for any process.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                        Cancel
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Workflow
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full min-h-0 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Sidebar / Toolkit */}
                <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Triggers</h3>
                        <div className="space-y-2">
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm cursor-grab flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-emerald-500" /> Form Submitted
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm cursor-grab flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-emerald-500" /> Record Updated
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Actions</h3>
                        <div className="space-y-2">
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm cursor-grab flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" /> Approval Step
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm cursor-grab flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-500" /> Send Email
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm cursor-grab flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-indigo-500" /> Update Status
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] p-10 flex justify-center">
                    <div className="flex flex-col items-center gap-8 relative max-w-md w-full">
                        {/* Trigger Node */}
                        <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg w-64 border-2 border-emerald-600 relative z-10">
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <PlayCircle className="w-5 h-5" /> Start
                            </div>
                            <div className="text-xs opacity-90">When "Travel Request" is created</div>
                            {/* Connector */}
                            <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-slate-400 dark:bg-slate-600 -translate-x-1/2"></div>
                            <div className="absolute left-1/2 -bottom-2 w-2 h-2 bg-slate-400 dark:bg-slate-600 rotate-45 -translate-x-1/2"></div>
                        </div>

                        {/* Action 1 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg w-64 border border-slate-200 dark:border-slate-700 relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                    <Users className="w-5 h-5 text-indigo-500" /> Manager Approval
                                </div>
                                <button className="text-slate-400 hover:text-slate-600"><Settings className="w-4 h-4" /></button>
                            </div>
                            <div className="text-xs text-slate-500">Assign to specific user or role</div>
                            {/* Connectors */}
                            <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-slate-400 dark:bg-slate-600 -translate-x-1/2"></div>

                            {/* Branching Logic Visual */}
                            <div className="absolute left-1/2 -bottom-4 w-32 h-0.5 bg-slate-400 dark:bg-slate-600 -translate-x-1/2"></div>
                            <div className="absolute left-[calc(50%-64px)] -bottom-8 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                            <div className="absolute left-[calc(50%+64px)] -bottom-8 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                        </div>

                        <div className="flex gap-16 w-full justify-between px-4">
                            {/* Path A */}
                            <div className="flex flex-col items-center gap-8">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow w-32 text-center border-l-4 border-rose-500 text-xs font-bold text-slate-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-900/20">
                                    If Rejected
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg w-48 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        <Mail className="w-4 h-4 text-sky-500" /> Email Requester
                                    </div>
                                    <div className="text-[10px] text-slate-500">Template: Reject_V1</div>
                                </div>
                            </div>

                            {/* Path B */}
                            <div className="flex flex-col items-center gap-8">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow w-32 text-center border-l-4 border-emerald-500 text-xs font-bold text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/20">
                                    If Approved
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg w-48 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Update Status
                                    </div>
                                    <div className="text-[10px] text-slate-500">Set to "Booked"</div>
                                </div>
                            </div>
                        </div>

                        {/* End Nodes */}
                        <div className="bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-full mt-4">
                            End Workflow
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
