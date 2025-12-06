"use client";

import React from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,
    Users,
    BarChart3
} from 'lucide-react';

export default function ProductionPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-sky-500" />
                        Production & Efficiency
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time OEE, labor costs, and output tracking.</p>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-xl text-sky-700 dark:text-sky-400 text-sm font-bold border border-sky-100 dark:border-sky-800/30">
                    OEE: 87% (Target: 85%)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Zap className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Output Today</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">12,450 <span className="text-sm font-normal text-slate-400">units</span></div>
                    <div className="text-xs text-emerald-500 font-bold flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +5% vs avg</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div> {/* Fixed: Clock import needed, adding mock for now or use Lucide one if available above. Ah, I missed importing Clock in this file but used it. Let's fix imports.*/}
                        {/* Wait, I didn't import Clock. Let's use Zap or something else, or adding Clock to imports. I'll stick to imports available: Zap, Activity... */}
                        {/* Actually let's just use Zap again or something generic from available imports or just assume Clock is available if I add it. I will add Clock to imports.*/}
                        <span className="text-sm font-bold text-slate-500">Downtime</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">42 <span className="text-sm font-normal text-slate-400">mins</span></div>
                    <div className="text-xs text-rose-500 font-bold flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +12% vs avg</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Users className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Labor Cost</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">$0.45 <span className="text-sm font-normal text-slate-400">/ unit</span></div>
                    <div className="text-xs text-emerald-500 font-bold flex items-center mt-1"><TrendingDown className="w-3 h-3 mr-1" /> -2% vs avg</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Utilization</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">92% <span className="text-sm font-normal text-slate-400">peak</span></div>
                    <div className="text-xs text-slate-400 font-bold flex items-center mt-1">Stable</div>
                </div>
            </div>

            {/* Productivity Heatmap Mock */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Productivity Heatmap (Last 24h)
                </h3>

                <div className="grid grid-cols-12 gap-1 h-32">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const productive = [8, 9, 10, 11, 14, 15, 16, 17].includes(i);
                        const moderate = [7, 12, 13, 18, 19].includes(i);
                        const low = [0, 1, 2, 3, 4, 5, 6, 20, 21, 22, 23].includes(i);

                        const bg = productive ? 'bg-emerald-500' : moderate ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-800';
                        const h = productive ? 'h-full' : moderate ? 'h-2/3' : 'h-1/3';

                        return (
                            <div key={i} className="flex flex-col justify-end items-center group relative">
                                <div className={`w-full ${h} ${bg} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}></div>
                                <span className="text-[10px] text-slate-400 mt-2">{i}:00</span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                    Output: {productive ? 'High' : 'Low'}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> High Output
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="w-3 h-3 bg-indigo-400 rounded-sm"></span> Moderate
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded-sm"></span> Low / Shift Change
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to avoid Import error since I used Clock but didn't import properly in the first snippet.
// React-icons or lucide-react might surely have it.
import { Clock } from 'lucide-react';
// Re-adding imports correctly at top... actually I can just fix it in the file.
