"use client";

import React, { useState } from 'react';
import {
    GitMerge,
    ShieldAlert,
    UserPlus
} from 'lucide-react';

export default function EscalationMatrixPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitMerge className="w-6 h-6 text-indigo-500" />
                        Escalation Matrix
                    </h1>
                    <p className="text-slate-500 text-sm">Define rules for automatic ticket escalation based on time or priority.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Level 1 -> 2 -> 3 */}
                {[
                    { level: 'Level 1: SLA Breach Warning', trigger: '50% Time Elapsed', action: 'Notify Agent & Team Lead', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { level: 'Level 2: SLA Breach imminent', trigger: '90% Time Elapsed', action: 'Notify Manager, Re-assign Priority', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { level: 'Level 3: SLA BREACHED', trigger: '100% Time Elapsed', action: 'Escalate to HR Director, Flag for Audit', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                ].map((lvl, i) => (
                    <div key={i} className="relative pl-8 md:pl-0">
                        {/* Connecting Line */}
                        {i !== 2 && <div className="absolute left-8 md:left-1/2 top-16 md:top-full w-0.5 h-6 bg-slate-300 dark:bg-slate-700 -ml-px z-0"></div>}

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lvl.bg} ${lvl.color}`}>
                                <lvl.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{lvl.level}</h3>
                                <div className="flex gap-4 text-sm">
                                    <span className="text-slate-500">Trigger: <span className="font-bold text-slate-700 dark:text-slate-300">{lvl.trigger}</span></span>
                                    <span className="text-slate-500">Action: <span className="font-bold text-slate-700 dark:text-slate-300">{lvl.action}</span></span>
                                </div>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                Configure
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
