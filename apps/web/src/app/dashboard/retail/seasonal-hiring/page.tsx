"use client";

import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Calendar,
    CheckCircle2
} from 'lucide-react';

export default function SeasonalHiringPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Seasonal Hiring
                    </h1>
                    <p className="text-slate-500 text-sm">Recruit and onboard staff for peak seasons.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Post Seasonal Job
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Hiring Progress (Holiday 2024)</h3>
                    <div className="flex items-center justify-center py-6">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="text-indigo-500" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">75%</span>
                                <span className="text-xs text-slate-500 font-bold uppercase">To Goal</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="text-2xl font-bold text-indigo-600">45</div>
                            <div className="text-xs text-slate-500">Hired</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="text-2xl font-bold text-slate-400">15</div>
                            <div className="text-xs text-slate-500">Remaining</div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Candidate Pipeline</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { name: 'Michael Scott', role: 'Sales Associate', stage: 'Interview', date: 'Oct 12' },
                            { name: 'Pam Beesly', role: 'Gift Wrapper', stage: 'Offer Sent', date: 'Oct 10' },
                            { name: 'Jim Halpert', role: 'Stock Clerk', stage: 'Screening', date: 'Oct 14' },
                            { name: 'Dwight Schrute', role: 'Security', stage: 'Hired', date: 'Oct 08' },
                        ].map((cand, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                        {cand.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{cand.name}</div>
                                        <div className="text-xs text-slate-500">{cand.role}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" /> {cand.date}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cand.stage === 'Hired' ? 'bg-emerald-100 text-emerald-600' :
                                            cand.stage === 'Offer Sent' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>{cand.stage}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
