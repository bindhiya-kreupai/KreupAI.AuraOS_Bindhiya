"use client";

import React, { useState } from 'react';
import {
    Activity,
    TrendingUp,
    Clock,
    Zap
} from 'lucide-react';

export default function ProductionEfficiencyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Production Efficiency
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor OEE, downtime, and output metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'OEE Score', value: '87%', change: '+2.4%', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500' },
                    { label: 'Total Output', value: '12,450', change: '+5.1%', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                    { label: 'Downtime', value: '45m', change: '-12%', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500' },
                    { label: 'Quality Rate', value: '99.2%', change: '+0.1%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{stat.change}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                            <div className={`h-full ${stat.bg} w-[70%]`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-6">Efficiency Trends (Last 7 Days)</h3>
                <div className="flex text-lg items-end justify-between h-48 gap-2">
                    {[65, 72, 68, 85, 82, 90, 87].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-t-lg relative group">
                            <div
                                className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                                style={{ height: `${h}%` }}
                            ></div>
                            <div className="absolute -top-8 w-full text-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>
        </div>
    );
}
