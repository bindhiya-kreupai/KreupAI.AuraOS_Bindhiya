"use client";

import React from 'react';
import {
    Sprout,
    CalendarDays,
    Users,
    CloudRain,
    TrendingUp,
    Leaf
} from 'lucide-react';

export default function CropsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sprout className="w-6 h-6 text-emerald-500" />
                        Crop Cycle Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Aligning workforce demand with planting and harvest windows.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <CalendarDays className="w-4 h-4" /> Add Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Visual Timeline (Mockup) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-hidden">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Seasonal Forecast</h3>

                    {/* Mock Gantt Chart */}
                    <div className="flex-1 space-y-4 overflow-y-auto">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /> Corn (Field A)</span>
                                <span className="text-xs text-slate-400 font-bold">Harvest: Oct 15 - Nov 01</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg relative overflow-hidden">
                                <div className="absolute left-[30%] width-[40%] h-full bg-emerald-200 dark:bg-emerald-900/30 border-l border-r border-emerald-300 dark:border-emerald-700"></div>
                                <div className="absolute left-[60%] w-[20%] h-full bg-amber-400/80 flex items-center justify-center text-[10px] font-bold text-amber-900">Harvest</div>
                            </div>
                            <div className="mt-1 flex gap-2 text-xs text-slate-400">
                                <span className="font-bold text-indigo-500">Need: 25 Staff</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold flex items-center gap-2"><Leaf className="w-4 h-4 text-rose-500" /> Strawberries (Field B)</span>
                                <span className="text-xs text-slate-400 font-bold">Harvest: Current</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg relative overflow-hidden">
                                <div className="absolute left-[10%] w-[30%] h-full bg-rose-400/80 flex items-center justify-center text-[10px] font-bold text-rose-900">Harvest</div>
                            </div>
                            <div className="mt-1 flex gap-2 text-xs text-slate-400">
                                <span className="font-bold text-indigo-500">Need: 50 Staff</span> (Allocated: 48)
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold flex items-center gap-2"><Leaf className="w-4 h-4 text-amber-500" /> Wheat (Field C)</span>
                                <span className="text-xs text-slate-400 font-bold">Planting: Next Week</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg relative overflow-hidden">
                                <div className="absolute left-[50%] w-[15%] h-full bg-sky-200 dark:bg-sky-900/30 border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500">Prep</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather & Demand */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CloudRain className="w-5 h-5 text-sky-200" /> Weather Impact
                        </h3>
                        <div className="text-4xl font-bold mb-1">Rain</div>
                        <div className="text-sm opacity-80 mb-4">Expected Thursday. Harvest for Field B expedited.</div>
                        <div className="flex gap-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">+10 Staff needed tmrw</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Labor Demand Forecast</h3>
                        <div className="space-y-3">
                            {[
                                { month: 'October', demand: 'High', count: '120 Pax' },
                                { month: 'November', demand: 'Medium', count: '80 Pax' },
                                { month: 'December', demand: 'Low', count: '15 Pax' },
                            ].map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{d.month}</span>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{d.count}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">{d.demand}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

