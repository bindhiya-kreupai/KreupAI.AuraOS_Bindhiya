"use client";

import React from 'react';
import {
    TrendingUp,
    ChevronRight,
    CheckCircle2,
    Lock,
    Award
} from 'lucide-react';

export default function CareerLaddersPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Career Ladders
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize your growth path and promotion readiness.</p>
                </div>
            </div>

            {/* Path Visualization */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-x-auto">
                <div className="min-w-[800px] relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>

                    <div className="flex justify-between items-center gap-8">
                        {[
                            { title: 'Junior Engineer', level: 'L1', status: 'completed', date: 'Joined 2022' },
                            { title: 'Software Engineer', level: 'L2', status: 'current', date: 'Promoted 2023' },
                            { title: 'Senior Engineer', level: 'L3', status: 'next', readiness: '85%' },
                            { title: 'Staff Engineer', level: 'L4', status: 'future', readiness: '0%' },
                            { title: 'Principal Engineer', level: 'L5', status: 'future', readiness: '0%' },
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 relative group cursor-pointer">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 z-10 transition-all
                                    ${step.status === 'completed' ? 'bg-emerald-500 border-white dark:border-slate-900 text-white shadow-lg' :
                                        step.status === 'current' ? 'bg-indigo-600 border-white dark:border-slate-900 text-white shadow-xl scale-110' :
                                            'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    {step.status === 'completed' ? <CheckCircle2 className="w-8 h-8" /> :
                                        step.status === 'current' ? <Award className="w-8 h-8" /> :
                                            <span className="text-xl font-bold">{step.level}</span>}
                                </div>
                                <div className="text-center">
                                    <h3 className={`font-bold ${step.status === 'current' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {step.date || (step.status === 'next' ? `Readiness: ${step.readiness}` : <Lock className="w-3 h-3 mx-auto" />)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Requirements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Requirements for L3 (Senior)</h3>
                        <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-sm font-bold">In Progress</span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { req: 'System Design Proficiency', status: 'met', note: 'Certified Oct 2023' },
                            { req: 'Mentorship (2 Juniors)', status: 'met', note: 'Mentoring Sarah & Mike' },
                            { req: 'Lead 2 Major Projects', status: 'in-progress', note: '1/2 Completed' },
                            { req: 'Technical Interviewer', status: 'pending', note: 'Training Scheduled' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0
                                    ${item.status === 'met' ? 'bg-emerald-100 text-emerald-600' :
                                        item.status === 'in-progress' ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-100 text-slate-400'}`}>
                                    {item.status === 'met' ? <CheckCircle2 className="w-3 h-3" /> :
                                        item.status === 'in-progress' ? <div className="w-2 h-2 rounded-full bg-current" /> :
                                            <div className="w-2 h-2 rounded-full border border-current" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-medium ${item.status === 'pending' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.req}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center">
                    <Award className="w-16 h-16 mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold mb-2">Promotion Cycle Opening Soon</h3>
                    <p className="text-indigo-100 mb-6 max-w-sm">
                        The next review cycle begins in March 2025. Ensure all requirements are met by Feb 28th.
                    </p>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors w-full md:w-auto">
                        View Detailed Rubric
                    </button>
                </div>
            </div>
        </div>
    );
}
