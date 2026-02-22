"use client";

import React from 'react';
import {
    Target,
    Plus,
    Calendar,
    CheckSquare,
    MoreVertical
} from 'lucide-react';

export default function CareerGoalsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Career Goals
                    </h1>
                    <p className="text-slate-500 text-sm">Set and track your professional milestones.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add New Goal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-20">
                {[
                    { title: 'Become a Team Lead', timeframe: 'Long Term (2-3 Years)', progress: 45, items: ['Complete Leadership Training', 'Mentor 2 Juniors', 'Lead a Feature Epics'] },
                    { title: 'Master React Server Components', timeframe: 'Short Term (Q1 2025)', progress: 80, items: ['Build a demo app', 'Read Documentation', 'Give a Tech Talk'] },
                    { title: 'Contribute to Open Source', timeframe: 'Ongoing', progress: 20, items: ['Find a repo', 'Submit 5 PRs'] },
                    { title: 'Improve Public Speaking', timeframe: 'Medium Term (1 Year)', progress: 10, items: ['Join Toastmasters', 'Speak at a Meetup'] }
                ].map((goal, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative">
                        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">
                                <Calendar className="w-3 h-3" /> {goal.timeframe}
                            </div>
                            <h3 className="text-xl font-bold">{goal.title}</h3>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500">Progress</span>
                                <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${goal.progress}%` }}
                                    className={`h-full rounded-full ${goal.progress >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-400 uppercase">Key Results</h4>
                            {goal.items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center
                                        ${idx === 0 ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {idx === 0 && <CheckSquare className="w-3 h-3" />}
                                    </div>
                                    <span className={`text-sm ${idx === 0 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

