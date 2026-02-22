"use client";

import React, { useState } from 'react';
import {
    Droplets,
    AlertOctagon,
    BarChart3
} from 'lucide-react';

export default function WaterConservationPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Droplets className="w-6 h-6 text-indigo-500" />
                        Water Conservation
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor usage and detect leaks in real-time.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Daily Usage</div>
                    <div className="text-3xl font-bold text-indigo-600">12.5 kL</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">↓ 5% vs last week</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Weekly Goal</div>
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">100 kL</div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: '45%' }}></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Recycled Water</div>
                    <div className="text-3xl font-bold text-emerald-600">3.2 kL</div>
                    <div className="text-xs text-slate-400 mt-1">25% of total usage</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Alerts</div>
                    <div className="text-3xl font-bold text-rose-600 flex items-center gap-2">
                        1 <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Leak detected in Zone 4</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Zone Consumption Analysis</h3>
                <div className="space-y-4">
                    {[
                        { zone: 'Production Floor', usage: 4500, percent: 45, status: 'Normal' },
                        { zone: 'Cafeteria', usage: 2000, percent: 20, status: 'Normal' },
                        { zone: 'Restrooms', usage: 1500, percent: 15, status: 'Leak Suspected' },
                        { zone: 'Landscaping', usage: 2000, percent: 20, status: 'Optimized' },
                    ].map((zone, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">{zone.zone}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${zone.status === 'Leak Suspected' ? 'text-rose-500' : 'text-slate-500'
                                        }`}>{zone.status}</span>
                                    <span className="font-mono">{zone.usage} L</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className={`h-full ${zone.status === 'Leak Suspected' ? 'bg-rose-500' :
                                        zone.status === 'Optimized' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`} style={{ width: `${zone.percent}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

