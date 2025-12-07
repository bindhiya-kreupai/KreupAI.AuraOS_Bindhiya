"use client";

import React from 'react';
import {
    BarChart2,
    PieChart,
    Layers,
    TrendingUp,
    Users,
    ArrowRight,
    Globe
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts';

export default function OrgAnalyticsPage() {
    const growthData = [
        { month: 'Jan', count: 120 },
        { month: 'Feb', count: 125 },
        { month: 'Mar', count: 132 },
        { month: 'Apr', count: 140 },
        { month: 'May', count: 145 },
        { month: 'Jun', count: 158 },
    ];

    const distributionData = [
        { name: 'Engineering', value: 45, color: '#6366f1' },
        { name: 'Sales', value: 25, color: '#10b981' },
        { name: 'Product', value: 15, color: '#f59e0b' },
        { name: 'Marketing', value: 10, color: '#ec4899' },
        { name: 'Operations', value: 5, color: '#64748b' },
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Org Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Deep dive into organization demographics and structure metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Users className="w-4 h-4" /> Total Headcount
                    </div>
                    <div className="text-3xl font-bold mt-2">158</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">+12% vs Q1</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Max Depth
                    </div>
                    <div className="text-3xl font-bold mt-2">6</div>
                    <div className="text-xs text-slate-400 mt-1">Levels from CEO</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Locations
                    </div>
                    <div className="text-3xl font-bold mt-2">4</div>
                    <div className="text-xs text-slate-400 mt-1">Countries operated</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Mgr Ratio
                    </div>
                    <div className="text-3xl font-bold mt-2">1:6.5</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">Healthy</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Headcount Growth</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Function Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Department Distribution</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height={250}>
                            <RePieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            </RePieChart>
                        </ResponsiveContainer>
                        {/* Center Legend */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-2xl font-bold">100%</div>
                            <div className="text-[10px] uppercase text-slate-500 font-bold">Total</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {distributionData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{d.name}</span>
                                <span className="text-slate-400">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
