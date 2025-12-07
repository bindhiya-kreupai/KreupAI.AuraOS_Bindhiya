"use client";

import React from 'react';
import {
    CalendarRange,
    Plus,
    Clock,
    CheckCircle2,
    Users
} from 'lucide-react';

export default function ReviewCyclesPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarRange className="w-6 h-6 text-indigo-500" />
                        Review Cycles
                    </h1>
                    <p className="text-slate-500 text-sm">Manage performance review periods and timelines.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {[
                    { name: 'Annual Review 2025', status: 'Active', stage: 'Manager Assessment', completion: '65%', due: 'Dec 31, 2025' },
                    { name: 'Mid-Year Review 2024', status: 'Completed', stage: 'Finalized', completion: '100%', due: 'Jul 31, 2024' },
                ].map((cycle, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-300 transition-colors cursor-pointer">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold">{cycle.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cycle.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>{cycle.status}</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {cycle.due}</span>
                                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 142 Participants</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Phase: {cycle.stage}</span>
                                <span className="font-bold">{cycle.completion}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${cycle.status === 'Completed' ? 'bg-slate-400' : 'bg-indigo-500'
                                    }`} style={{ width: cycle.completion }}></div>
                            </div>
                        </div>

                        <div>
                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
