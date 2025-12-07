"use client";

import React from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    DollarSign,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';

// --- MOCK DATA ---

const REVENUE_DATA = [
    { month: 'Jan', value: 2.4 },
    { month: 'Feb', value: 2.8 },
    { month: 'Mar', value: 3.2 },
    { month: 'Apr', value: 3.5 },
    { month: 'May', value: 3.1 },
    { month: 'Jun', value: 3.8 },
];

const DIVERSITY_DATA = [
    { name: 'Male', value: 55, color: '#3b82f6' },
    { name: 'Female', value: 42, color: '#ec4899' },
    { name: 'Other', value: 3, color: '#a855f7' },
];

export default function ExecutiveDashboardsPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                        Executive Overview
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">High-level insights for strategic decision making.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-bold text-sm shadow-sm">
                        <option>Q3 2024</option>
                        <option>Q2 2024</option>
                        <option>FY 2023</option>
                    </select>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Revenue per Employee"
                    value="$245k"
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                />
                <KPICard
                    title="eNPS Score"
                    value="42"
                    trend="+4"
                    trendUp={true}
                    icon={Users}
                    color="text-blue-500"
                    sub="Excellent"
                />
                <KPICard
                    title="Global Headcount"
                    value="1,240"
                    trend="+5%"
                    trendUp={true}
                    icon={Globe}
                    color="text-indigo-500"
                />
                <KPICard
                    title="Attrition Rate"
                    value="12.5%"
                    trend="+1.2%"
                    trendUp={false}
                    icon={TrendingUp}
                    color="text-rose-500"
                    inverse={true}
                />
            </div>

            {/* Main Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue/Productivity Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" /> Productivity Growth (Revenue in Millions)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Diversity Breakdown */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" /> Diversity Ratio
                    </h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={DIVERSITY_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {DIVERSITY_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">42%</span>
                            <span className="text-xs text-slate-500 font-bold">Female</span>
                        </div>
                    </div>
                    <div className="space-y-3 mt-4">
                        {DIVERSITY_DATA.map((d) => (
                            <div key={d.name} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="font-medium text-slate-600 dark:text-slate-400">{d.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" /> Department Performance (Goals Met %)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Engineering', value: 85 },
                            { name: 'Sales', value: 92 },
                            { name: 'Marketing', value: 78 },
                            { name: 'HR', value: 88 },
                            { name: 'Finance', value: 95 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, trendUp, icon: Icon, color, sub, inverse }: any) {
    const isPositive = inverse ? !trendUp : trendUp;
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 w-fit ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500">{title}</div>
            {sub && <div className="text-xs font-bold text-indigo-500 mt-2">{sub}</div>}
        </div>
    );
}
