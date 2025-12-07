"use client";

import React, { useState } from 'react';
import {
    Users,
    TrendingUp,
    PlayCircle,
    Smartphone
} from 'lucide-react';

export default function AudienceMetricsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Audience Metrics
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze viewer engagement, demographics, and retention.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Concurrent Viewers (Last 24h)</h3>
                    <div className="h-64 flex items-end justify-between gap-1">
                        {[40, 55, 45, 60, 85, 120, 150, 140, 110, 90, 80, 70, 60, 50, 45, 55, 75, 95, 110, 130, 145, 125, 100, 80].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-50 dark:bg-indigo-900/10 rounded-t-sm relative group">
                                <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400" style={{ height: `${(h / 150) * 100}%` }}></div>
                                <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded z-10 font-bold whitespace-nowrap">
                                    {h}k Users
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Device Split</h3>
                        <div className="space-y-4">
                            {[
                                { type: 'Mobile', percent: 65, icon: Smartphone, color: 'text-indigo-500' },
                                { type: 'Smart TV', percent: 25, icon: PlayCircle, color: 'text-emerald-500' },
                                { type: 'Desktop', percent: 10, icon: TrendingUp, color: 'text-slate-500' },
                            ].map((dev, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <dev.icon className={`w-5 h-5 ${dev.color}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold">{dev.type}</span>
                                            <span>{dev.percent}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full ${dev.color.replace('text', 'bg')}`} style={{ width: `${dev.percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="text-xs font-bold opacity-80 uppercase mb-1">Avg Watch Time</div>
                        <div className="text-3xl font-bold">42m 15s</div>
                        <div className="text-xs font-bold text-emerald-300 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +5.2% this week
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
