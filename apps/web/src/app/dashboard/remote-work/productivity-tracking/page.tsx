"use client";

import React from 'react';
import {
    Activity,
    Clock,
    BarChart2,
    Layout,
    CheckCircle,
    Coffee
} from 'lucide-react';

export default function ProductivityTrackingPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Productivity Insights
                    </h1>
                    <p className="text-slate-500 text-sm">Analytics aimed at balancing performance and well-being.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button className="px-3 py-1 bg-white dark:bg-slate-700 shadow-sm rounded text-xs font-bold text-indigo-600 dark:text-indigo-400">Team View</button>
                    <button className="px-3 py-1 text-xs font-bold text-slate-500">My Stats</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">Team Focus Score</h3>
                    <div className="flex items-end gap-2">
                        <div className="text-4xl font-black text-indigo-600">8.4</div>
                        <div className="text-sm font-bold text-emerald-500 mb-1">↑ 12%</div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Based on task completion velocity</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">Meeting Load</h3>
                    <div className="flex items-end gap-2">
                        <div className="text-4xl font-black text-rose-500">18h</div>
                        <div className="text-sm font-bold text-rose-500 mb-1">High</div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Average weekly meeting duration</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">Deep Work</h3>
                    <div className="flex items-end gap-2">
                        <div className="text-4xl font-black text-emerald-500">22h</div>
                        <div className="text-sm font-bold text-slate-400 mb-1">/ week</div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Uninterrupted block time</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Work Patterns (Heatmap)</h3>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-200 rounded"></div> Low Activity</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded"></div> High Activity</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded"></div> Meeting</span>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-1 h-32">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-1 items-center">
                            <div className={`w-full flex-1 rounded-lg ${i % 3 === 0 ? 'bg-indigo-500' : i % 2 === 0 ? 'bg-indigo-300' : 'bg-amber-400'
                                } opacity-80 hover:opacity-100 transition-opacity`}></div>
                            <span className="text-[10px] font-bold text-slate-400">{8 + i}am</span>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4 text-xs text-slate-500 italic">
                    * Data is aggregated and anonymized to protect employee privacy.
                </div>
            </div>
        </div>
    );
}
