"use client";

import React from 'react';
import {
    GraduationCap,
    BookOpen,
    Award,
    Clock,
    CheckCircle,
    FileText
} from 'lucide-react';

export default function TenurePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-500" />
                        Faculty Tenure Track
                    </h1>
                    <p className="text-slate-500 text-sm">Track milestones, publications, and tenure reviews.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <FileText className="w-4 h-4" /> Start Review Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Faculty List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    {[
                        { name: 'Dr. Alan Grant', dept: 'Paleontology', year: 5, track: 'Tenure-Track', status: 'Review In Progress' },
                        { name: 'Dr. Ellie Sattler', dept: 'Paleobotany', year: 3, track: 'Tenure-Track', status: 'On Track' },
                        { name: 'Dr. Ian Malcolm', dept: 'Mathematics', year: 6, track: 'Tenure-Track', status: 'Decision Pending' },
                        { name: 'Prof. Henry Wu', dept: 'Genetics', year: 2, track: 'Tenure-Track', status: 'Warning' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-lg">
                                    {f.name.substring(4, 6)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{f.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{f.dept}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Year {f.year} of 7
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden md:block w-32">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round((f.year / 7) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(f.year / 7) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${f.status === 'On Track' ? 'bg-emerald-100 text-emerald-600' :
                                            f.status === 'Review In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                                f.status === 'Decision Pending' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-rose-100 text-rose-600'}
                                    `}>
                                        {f.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">View Dossier</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-500" /> Research Output
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Publications Tracking</div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">142 <span className="text-sm font-normal text-slate-400">papers</span></div>
                                <div className="text-[10px] text-emerald-500 font-bold mt-1">+12% vs last year</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Grant Funding</div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">$4.2M <span className="text-sm font-normal text-slate-400">active</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> Tenure Decisions
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Approved</span>
                                <span className="font-bold text-emerald-500">12</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Denied</span>
                                <span className="font-bold text-rose-500">2</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Deferred</span>
                                <span className="font-bold text-amber-500">1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

