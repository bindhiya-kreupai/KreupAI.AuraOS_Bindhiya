"use client";

import React, { useState } from 'react';
import {
    HardHat,
    Calendar,
    CheckSquare,
    TrendingUp
} from 'lucide-react';

export default function ProjectManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HardHat className="w-6 h-6 text-indigo-500" />
                        Project Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track construction milestones and site progress.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> New Project
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[
                    { name: 'Skyline Tower B', status: 'On Track', progress: 65, deadline: 'Dec 2025', budget: '$12M', spent: '$7.8M' },
                    { name: 'Riverside Complex', status: 'Delayed', progress: 42, deadline: 'Jun 2026', budget: '$8.5M', spent: '$3.9M' },
                    { name: 'Metro Station 4', status: 'On Track', progress: 88, deadline: 'Mar 2025', budget: '$22M', spent: '$19.5M' },
                    { name: 'Highway Extension', status: 'Ahead', progress: 30, deadline: 'Nov 2026', budget: '$45M', spent: '$12M' },
                ].map((proj, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{proj.name}</h3>
                                <div className="text-sm text-slate-500 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Due: {proj.deadline}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${proj.status === 'Delayed' ? 'bg-rose-100 text-rose-600' :
                                    proj.status === 'Ahead' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>{proj.status}</span>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">Progress</span>
                                <span className="text-slate-500">{proj.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${proj.status === 'Delayed' ? 'bg-rose-500' : 'bg-indigo-500'
                                    }`} style={{ width: `${proj.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Budget</div>
                                <div className="font-bold">{proj.budget}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 uppercase">Spent</div>
                                <div className="font-bold">{proj.spent}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

