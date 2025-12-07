"use client";

import React from 'react';
import { GitMerge, ArrowUp, Milestone } from 'lucide-react';

const CAREER_PATH = [
    { title: 'Junior Engineer', level: 'L1', years: '0-2 Yrs', active: false, done: true },
    { title: 'Software Engineer', level: 'L2', years: '2-4 Yrs', active: true, done: false },
    { title: 'Senior Engineer', level: 'L3', years: '4-7 Yrs', active: false, done: false },
    { title: 'Staff Engineer', level: 'L4', years: '7+ Yrs', active: false, done: false },
    { title: 'Principal Engineer', level: 'L5', years: '10+ Yrs', active: false, done: false },
];

const LATERAL_MOVES = [
    { title: 'Product Manager', reason: 'Strong domain knowledge & communication.' },
    { title: 'Engineering Manager', reason: 'High leadership potential.' },
];

export default function CareerPathingPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <GitMerge className="w-8 h-8 text-indigo-500" />
                        Career Pathing
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Visualizing typical progression and lateral opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Path */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                        <ArrowUp className="w-5 h-5 text-emerald-500" /> Engineering Individual Contributor (IC) Track
                    </h3>

                    <div className="space-y-0 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-4 bottom-4 w-1 bg-slate-100 dark:bg-slate-800 z-0" />

                        {CAREER_PATH.map((step, i) => (
                            <div key={step.title} className="relative z-10 flex gap-6 pb-8 last:pb-0 group">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-4 transition-all ${step.active ? 'bg-indigo-600 text-white border-indigo-100 dark:border-indigo-900' :
                                        step.done ? 'bg-emerald-500 text-white border-emerald-100 dark:border-emerald-900' :
                                            'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 group-hover:border-indigo-200'
                                    }`}>
                                    {step.level}
                                </div>
                                <div className={`flex-1 p-6 rounded-2xl border transition-all ${step.active ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' :
                                        'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 group-hover:border-indigo-200'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-lg ${step.active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {step.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Typical Tenure: {step.years}</p>
                                        </div>
                                        {step.active && (
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Current</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lateral Moves */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                        <Milestone className="w-8 h-8 mb-4 opacity-80" />
                        <h3 className="font-bold text-xl mb-2">Lateral Opportunities</h3>
                        <p className="text-indigo-100 text-sm opacity-90">Based on your skill profile, these parallel tracks might be a good fit.</p>
                    </div>

                    <div className="space-y-4">
                        {LATERAL_MOVES.map((move) => (
                            <div key={move.title} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer group">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 transition-colors">{move.title}</h4>
                                <p className="text-sm text-slate-500">{move.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
