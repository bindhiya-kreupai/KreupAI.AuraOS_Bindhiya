"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

export default function ComplianceTrainingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Compliance Training
                    </h1>
                    <p className="text-slate-500 text-sm">Mandatory training modules and completion tracking.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Overall Compliance</div>
                        <div className="text-3xl font-bold text-emerald-600">92%</div>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-emerald-100" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Pending Actions</div>
                        <div className="text-3xl font-bold text-amber-500">45</div>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-amber-100" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Audit Risk</div>
                        <div className="text-3xl font-bold text-indigo-600">Low</div>
                    </div>
                    <CheckCircle className="w-10 h-10 text-indigo-100" />
                </div>

                {/* Training Modules */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Mandatory Modules (2024)</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Data Privacy & GDPR', due: 'Nov 30, 2024', status: 'In Progress', progress: 60, criticality: 'High' },
                            { name: 'Anti-Harassment Policy', due: 'Dec 15, 2024', status: 'Not Started', progress: 0, criticality: 'High' },
                            { name: 'Code of Conduct', due: 'Oct 15, 2024', status: 'Completed', progress: 100, criticality: 'Medium' },
                        ].map((mod, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-sm">{mod.name}</h4>
                                        {mod.criticality === 'High' && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded uppercase">High Priority</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">Due: {mod.due}</div>
                                </div>
                                <div className="w-32">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>{mod.status}</span>
                                        <span>{mod.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${mod.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${mod.progress}%` }}></div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                                    {mod.status === 'Completed' ? 'Review' : 'Start'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
