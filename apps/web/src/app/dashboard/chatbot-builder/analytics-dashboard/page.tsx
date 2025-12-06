"use client";

import React from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    ThumbsUp,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';

export default function ChatbotAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor bot performance and user engagement.</p>
                </div>
                <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sessions', value: '1,284', trend: '+12%', icon: MessageSquare, color: 'text-indigo-500' },
                    { label: 'Deflection Rate', value: '78%', trend: '+5%', icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'CSAT Score', value: '4.6/5', trend: '+0.2', icon: ThumbsUp, color: 'text-amber-500' },
                    { label: 'Handoffs', value: '142', trend: '-8%', icon: Users, color: 'text-rose-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-slate-500 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section (Mocked) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold mb-6">Volume vs. Handoffs</h3>
                    <div className="h-64 flex items-end justify-between px-2 gap-2">
                        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-t-lg relative group">
                                <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%` }}></div>
                                <div className="absolute bottom-0 w-full bg-rose-400 rounded-t-lg opacity-50 transition-all" style={{ height: `${h * 0.2}%` }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-4">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold mb-6">Top Intents</h3>
                    <div className="space-y-4">
                        {[
                            { name: '#ApplyLeave', val: 35, color: 'bg-indigo-500' },
                            { name: '#PayrollQuery', val: 28, color: 'bg-emerald-500' },
                            { name: '#ITSupport', val: 15, color: 'bg-amber-500' },
                            { name: '#PolicyInfo', val: 12, color: 'bg-cyan-500' },
                            { name: 'Unknown', val: 10, color: 'bg-rose-300' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span>{item.name}</span>
                                    <span>{item.val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
