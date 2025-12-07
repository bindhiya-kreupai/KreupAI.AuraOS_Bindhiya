'use client';

import React from 'react';
import { Target, Calendar, UserCheck } from 'lucide-react';

const PLAN = [
    { quarter: 'Q1', goal: 25, hired: 22, focus: 'Engineering Scale-up' },
    { quarter: 'Q2', goal: 30, hired: 5, focus: 'Sales Expansion APAC' },
    { quarter: 'Q3', goal: 40, hired: 0, focus: 'Customer Success & Support' },
    { quarter: 'Q4', goal: 15, hired: 0, focus: 'Backfill & Admin' },
];

export default function TalentAcquisitionPlanPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-rose-500" />
                        Talent Acquisition Plan
                    </h1>
                    <p className="text-slate-500 text-sm">Strategic hiring roadmap aligned with business goals.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLAN.map((q) => (
                    <div key={q.quarter} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="text-4xl font-bold text-slate-200 dark:text-slate-800 absolute right-4 top-4">{q.quarter}</div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">{q.focus}</h3>

                            <div className="flex justify-between items-end mb-2">
                                <div className="text-sm text-slate-500">Progress</div>
                                <div className="font-bold text-slate-800 dark:text-white">{q.hired} / {q.goal}</div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-indigo-500" style={{ width: `${(q.hired / q.goal) * 100}%` }} />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" /> Targeted Campaign
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
