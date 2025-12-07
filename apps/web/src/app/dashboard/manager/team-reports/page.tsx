"use client";

import React, { useState } from 'react';
import {
    BarChart2,
    PieChart,
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Download
} from 'lucide-react';

export default function TeamReportsPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Team Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Analytics on team performance, attendance, and resource utilization.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> This Month
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Team Size', value: '12', change: '+2', trend: 'up', icon: Users, color: 'text-indigo-500' },
                    { label: 'Avg Attendance', value: '96%', change: '+1.5%', trend: 'up', icon: Calendar, color: 'text-emerald-500' },
                    { label: 'Project Delays', value: '3', change: '-1', trend: 'down', good: true, icon: TrendingUp, color: 'text-rose-500' },
                    { label: 'Leave Utilization', value: '45%', change: '+5%', trend: 'up', icon: PieChart, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.good || stat.trend === 'up' && !stat.good ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                {/* Leave Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Leave Distribution</h3>
                    <div className="flex-1 flex items-end gap-4 px-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        {[
                            { type: 'Sick', val: 30, color: 'bg-rose-400' },
                            { type: 'Casual', val: 65, color: 'bg-emerald-400' },
                            { type: 'Privilege', val: 45, color: 'bg-indigo-400' },
                            { type: 'Unpaid', val: 10, color: 'bg-slate-400' },
                        ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative h-[250px] bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end">
                                    <div
                                        className={`w-full ${bar.color} rounded-t-xl transition-all duration-1000 group-hover:opacity-80`}
                                        style={{ height: `${bar.val}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{bar.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Allocation */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Resource Allocation</h3>
                    <div className="space-y-6">
                        {[
                            { project: 'Project Alpha', count: 5, pct: 45, color: 'bg-indigo-500' },
                            { project: 'Project Beta', count: 3, pct: 25, color: 'bg-emerald-500' },
                            { project: 'Maintenance', count: 2, pct: 15, color: 'bg-amber-500' },
                            { project: 'Bench / Training', count: 2, pct: 15, color: 'bg-slate-400' },
                        ].map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">{proj.project}</span>
                                    <span className="text-slate-500">{proj.count} Members ({proj.pct}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.pct}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex gap-3 text-sm text-indigo-700 dark:text-indigo-300">
                        <div className="shrink-0 bg-indigo-100 dark:bg-indigo-800 rounded-lg p-2 h-fit">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold">Insight:</span> 2 members are currently on the bench and available for new assignments starting next week.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
