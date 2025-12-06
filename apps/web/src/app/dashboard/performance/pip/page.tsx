"use client";

import React, { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Calendar,
    Target,
    ArrowRight,
    CheckCircle2,
    FileText,
    MoreVertical
} from 'lucide-react';

const PLANS = [
    { id: 1, employee: 'John Doe', role: 'Sales Exec', purpose: 'Target Miss (Q3)', start: 'Nov 01', end: 'Dec 01', status: 'Active', progress: 65, reviewer: 'Jane Smith' },
    { id: 2, employee: 'Emma Wilson', role: 'Support Agent', purpose: 'CSAT Scores', start: 'Oct 15', end: 'Nov 15', status: 'Completed', result: 'Success', reviewer: 'Mike Ross' },
    { id: 3, employee: 'Tom Brown', role: 'Developer', purpose: 'Code Quality', start: 'Dec 05', end: 'Jan 05', status: 'Draft', reviewer: 'Sarah J.' },
];

export default function PIPPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        PIP Management
                    </h1>
                    <p className="text-slate-500 text-sm">Performance Improvement Plans and structured monitoring.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <AlertTriangle className="w-4 h-4" /> Initiate PIP
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 overflow-y-auto pb-20">
                {PLANS.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                    {plan.employee.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{plan.employee}</h3>
                                    <div className="text-sm text-slate-500">{plan.role} • Reviewed by {plan.reviewer}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1
                                    ${plan.status === 'Active' ? 'bg-amber-100 text-amber-600' :
                                        plan.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                                            'bg-indigo-100 text-indigo-600'}
                                 `}>
                                    {plan.status === 'Active' && <Activity className="w-3 h-3" />}
                                    {plan.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                                    {plan.status}
                                </span>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Objective</div>
                                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> {plan.purpose}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Timeline</div>
                                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {plan.start} &rarr; {plan.end}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Outcome/Progress</div>
                                {plan.status === 'Active' ? (
                                    <div className="w-full">
                                        <div className="flex justify-between text-xs mb-1 font-bold">
                                            <span className="text-amber-600">{plan.progress}% on track</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${plan.progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`font-bold flex items-center gap-2
                                         ${plan.result === 'Success' ? 'text-emerald-500' : 'text-slate-400'}
                                     `}>
                                        {plan.result || 'Pending Start'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button className="text-sm font-bold text-slate-500 hover:text-indigo-500 flex items-center gap-1">
                                <FileText className="w-4 h-4" /> View Plan Details
                            </button>
                            <div className="flex-1"></div>
                            <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                Update Progress <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
