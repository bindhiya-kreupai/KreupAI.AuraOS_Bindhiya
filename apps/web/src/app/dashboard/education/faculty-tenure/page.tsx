"use client";

import React, { useState } from 'react';
import {
    GraduationCap,
    FileCheck,
    Clock,
    UserCheck
} from 'lucide-react';

export default function FacultyTenurePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-500" />
                        Faculty Tenure
                    </h1>
                    <p className="text-slate-500 text-sm">Track tenure track progress and reviews.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Tenure Review Pipeline</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Dr. Alan Grant', dept: 'Paleontology', year: 'Year 5', status: 'Review In Progress' },
                                { name: 'Dr. Ellie Sattler', dept: 'Paleobotany', year: 'Year 3', status: 'On Track' },
                                { name: 'Dr. Ian Malcolm', dept: 'Mathematics', year: 'Year 6', status: 'Decision Pending' },
                            ].map((prof, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            {prof.name.split(' ')[1][0]}
                                        </div>
                                        <div>
                                            <div className="font-bold">{prof.name}</div>
                                            <div className="text-xs text-slate-500">{prof.dept} • {prof.year}</div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${prof.status === 'On Track' ? 'bg-emerald-100 text-emerald-600' :
                                            prof.status === 'Review In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-amber-100 text-amber-600'
                                        }`}>{prof.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-indigo-500 mt-0.5" />
                                <div>
                                    <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">Dossier Submission</div>
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">Oct 30 • 3 Faculty members</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
                                <div>
                                    <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">Committee Vote</div>
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">Nov 15 • Mathematics Dept</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
                                <div>
                                    <div className="font-bold text-sm text-indigo-800 dark:text-indigo-200">Provost Review</div>
                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">Dec 01 • Final approvals</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
