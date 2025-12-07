"use client";

import React, { useState } from 'react';
import {
    Zap,
    Activity,
    AlertCircle,
    Power
} from 'lucide-react';

export default function SmartGridPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-indigo-500" />
                        Smart Grid Management
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time monitoring of energy loads and grid stability.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold mb-2 opacity-90">Current Load</h3>
                        <div className="text-4xl font-bold">4.2 MW</div>
                        <div className="text-sm opacity-80 mt-1">Peak: 5.1 MW (expected at 14:00)</div>
                    </div>
                    <div className="mt-8 flex items-center gap-2">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span className="font-bold">Grid Stable</span>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Substation Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: 'Station Alpha', load: '85%', status: 'Normal', temp: '42°C' },
                            { name: 'Station Beta', load: '92%', status: 'Warning', temp: '68°C' },
                            { name: 'Station Gamma', load: '45%', status: 'Normal', temp: '38°C' },
                        ].map((station, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${station.status === 'Warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-sm">{station.name}</div>
                                    <Power className={`w-4 h-4 ${station.status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                </div>
                                <div className="text-2xl font-bold mb-1">{station.load}</div>
                                <div className="text-xs text-slate-500">Temp: {station.temp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4">Consumption Trends (Last 24h)</h3>
                <div className="h-48 flex items-end justify-between gap-1 px-4">
                    {[30, 45, 50, 65, 80, 95, 85, 70, 60, 50, 40, 35, 30, 25, 30, 40, 55, 70, 85, 90, 80, 70, 60, 50].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-sm relative group">
                            <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400" style={{ height: `${h}%` }}></div>
                            <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded z-10">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:00</span>
                </div>
            </div>
        </div>
    );
}
