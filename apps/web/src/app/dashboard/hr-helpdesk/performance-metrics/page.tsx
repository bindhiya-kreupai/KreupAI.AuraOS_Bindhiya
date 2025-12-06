"use client";

import React, { useState } from 'react';
import {
    Gauge,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export default function PerformanceMetricsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gauge className="w-6 h-6 text-indigo-500" />
                        Performance Metrics
                    </h1>
                    <p className="text-slate-500 text-sm">Key Performance Indicators for the HRSD team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'First Response Time', value: '45m', trend: '-12%', status: 'good' },
                    { title: 'Avg Handle Time', value: '18m', trend: '+5%', status: 'bad' },
                    { title: 'Total Cases Closed', value: '842', trend: '+20%', status: 'good' },
                    { title: 'Re-open Rate', value: '3.2%', trend: '-0.5%', status: 'good' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{stat.title}</h3>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${stat.status === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                {stat.status === 'good' ? <ArrowUp className="w-3 h-3 rotate-45" /> : <ArrowUp className="w-3 h-3 rotate-180" />}
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-80 flex items-center justify-center text-slate-400">
                    <span className="font-bold">Team Productivity Trends Chart Placeholder</span>
                </div>
            </div>
        </div>
    );
}
