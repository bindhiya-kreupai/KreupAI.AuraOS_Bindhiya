"use client";

import React from 'react';
import {
    Rocket,
    Target,
    BookOpen
} from 'lucide-react';

export default function DevelopmentPlansPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Rocket className="w-6 h-6 text-indigo-500" />
                        Development Plans
                    </h1>
                    <p className="text-slate-500 text-sm">Create and track Individual Development Plans (IDPs).</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Target className="w-4 h-4" /> New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Leadership Training', type: 'Course', status: 'In Progress', progress: '45%', due: 'Mar 2026' },
                    { title: 'Learn Advanced React Patterns', type: 'Skill', status: 'Completed', progress: '100%', due: 'Dec 2025' },
                    { title: 'Public Speaking Workshop', type: 'Workshop', status: 'Not Started', progress: '0%', due: 'Jun 2026' },
                ].map((plan, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${plan.status === 'Completed' ? 'bg-emerald-500' :
                                plan.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-300'
                            }`}></div>

                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold uppercase">{plan.type}</span>
                            <span className="text-xs font-bold text-slate-500">Due: {plan.due}</span>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{plan.title}</h3>

                        <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-500">{plan.status}</span>
                                <span className="font-bold">{plan.progress}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${plan.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} style={{ width: plan.progress }}></div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="text-sm font-bold text-indigo-600 hover:underline">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
