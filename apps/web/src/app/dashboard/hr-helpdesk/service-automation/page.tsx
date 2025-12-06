"use client";

import React, { useState } from 'react';
import {
    Zap,
    Play,
    Settings,
    Activity
} from 'lucide-react';

export default function ServiceAutomationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500" />
                        Service Automation
                    </h1>
                    <p className="text-slate-500 text-sm">Configure automated workflows for service requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Workflows */}
                {[
                    { name: 'Laptop Provisioning', trigger: 'New Request (IT Hardware)', steps: 4, executions: 145, status: 'Active' },
                    { name: 'Address Change Update', trigger: 'Profile Update', steps: 2, executions: 890, status: 'Active' },
                    { name: 'Onboarding Kit Dispatch', trigger: 'New Hire (T-7 Days)', steps: 5, executions: 32, status: 'Paused' },
                ].map((wf, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{wf.name}</h3>
                                <p className="text-sm text-slate-500">Trigger: {wf.trigger}</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${wf.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        </div>

                        <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <Activity className="w-4 h-4" /> {wf.executions} Runs
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <Settings className="w-4 h-4" /> {wf.steps} Steps
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200">Edit Workflow</button>
                            <button className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600">View Logs</button>
                        </div>
                    </div>
                ))}

                {/* Create New Placeholder */}
                <button className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors">
                    <Zap className="w-12 h-12 mb-2" />
                    <span className="font-bold">Create New Automation</span>
                </button>
            </div>
        </div>
    );
}
