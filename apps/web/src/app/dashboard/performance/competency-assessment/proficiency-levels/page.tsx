"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../../core/services';
import {
    Signal,
    CheckCircle2,
    Edit2,
    ArrowRight
} from 'lucide-react';

export default function ProficiencyLevelsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Signal className="w-6 h-6 text-indigo-500" />
                        Proficiency Levels
                    </h1>
                    <p className="text-slate-500 text-sm">Define what success looks like at each level (L1-L5).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Levels Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {['L1: Novice / Learner', 'L2: Intermediate / Doer', 'L3: Advanced / Expert', 'L4: Master / Mentor', 'L5: Visionary / Strategist'].map((level, i) => (
                        <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all
                            ${i === 2 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-md transform scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                        `}>
                            <div className="flex justify-between items-center">
                                <span className={`font-bold text-sm ${i === 2 ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {level}
                                </span>
                                {i === 2 && <ArrowRight className="w-4 h-4 text-indigo-500" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 h-full overflow-y-auto">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Selected Level</div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">L3: Advanced / Expert</h2>
                                <p className="text-slate-500 mt-2 text-lg">
                                    "Can perform task independently with high quality and troubleshoot complex issues."
                                </p>
                            </div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    Behavioral Indicators
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Consistently delivers high-quality work without supervision.",
                                        "Proactively identifies potential issues and implements solutions.",
                                        "Mentors junior team members on basic tasks.",
                                        "Adapts to changing requirements effectively."
                                    ].map((text, i) => (
                                        <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase">Knowledge Depth</h4>
                                    <p className="text-sm">Deep understanding of core principles and ability to apply them in complex scenarios.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase">Autonomy</h4>
                                    <p className="text-sm">Works independently. Requires guidance only on highly ambiguous or strategic matters.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
