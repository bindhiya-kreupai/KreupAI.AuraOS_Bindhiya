'use client';

import React from 'react';
import { Users, Briefcase, MapPin, PieChart } from 'lucide-react';
import {
    PieChart as RePieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const DEPT_DATA = [
    { name: 'Engineering', value: 450, color: '#6366f1' },
    { name: 'Sales', value: 300, color: '#10b981' },
    { name: 'Marketing', value: 150, color: '#f43f5e' },
    { name: 'Support', value: 200, color: '#f59e0b' },
    { name: 'Admin', value: 100, color: '#8b5cf6' },
];

const TENURE_DATA = [
    { name: '< 1 Yr', count: 300 },
    { name: '1-3 Yrs', count: 500 },
    { name: '3-5 Yrs', count: 250 },
    { name: '5+ Yrs', count: 150 },
];

export default function SupplyAnalysisPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Supply Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze current workforce demographics and distribution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Users className="w-5 h-5" /></div>
                    <div>
                        <div className="text-2xl font-bold">1,200</div>
                        <div className="text-xs text-slate-500">Total Employees</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"><Briefcase className="w-5 h-5" /></div>
                    <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-xs text-slate-500">Departments</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600"><MapPin className="w-5 h-5" /></div>
                    <div>
                        <div className="text-2xl font-bold">5</div>
                        <div className="text-xs text-slate-500">Office Locations</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600"><PieChart className="w-5 h-5" /></div>
                    <div>
                        <div className="text-2xl font-bold">4.2%</div>
                        <div className="text-xs text-slate-500">Attrition Rate</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Department Distribution</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={DEPT_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {DEPT_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {DEPT_DATA.map(d => (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Tenure Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TENURE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" name="Employees" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
