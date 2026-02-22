"use client";

import React, { useState } from 'react';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle,
    FileText
} from 'lucide-react';

export default function SiteSafetyPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-indigo-500" />
                        Site Safety
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor safety incidents and compliance audits.</p>
                </div>
                <button className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Report Incident
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                        <span className="text-3xl font-bold">142</span>
                    </div>
                    <div className="text-lg font-bold">Days Incident Free</div>
                    <div className="text-sm text-slate-500">Last incident: Minor injury at Site B</div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Audits</h3>
                    <div className="space-y-4">
                        {[
                            { site: 'Skyline Tower B', date: 'Dec 02, 2024', score: 98, status: 'Passed', auditor: 'John Safety' },
                            { site: 'Riverside Complex', date: 'Nov 28, 2024', score: 85, status: 'Warning', auditor: 'Sarah Health' },
                            { site: 'Metro Station 4', date: 'Nov 15, 2024', score: 100, status: 'Passed', auditor: 'Mike Risk' },
                        ].map((audit, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-lg">{audit.site}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Audited on {audit.date} by {audit.auditor}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${audit.score >= 90 ? 'text-emerald-600' : 'text-amber-600'
                                        }`}>{audit.score}%</div>
                                    <div className={`text-xs font-bold ${audit.status === 'Passed' ? 'text-emerald-500' : 'text-amber-500'
                                        }`}>{audit.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

