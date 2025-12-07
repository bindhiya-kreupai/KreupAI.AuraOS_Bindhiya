'use client';

import React from 'react';
import { TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const FORECAST_DATA = [
    { quarter: 'Q1', current: 1200, projected: 1250 },
    { quarter: 'Q2', current: 1240, projected: 1320 },
    { quarter: 'Q3', current: 1300, projected: 1450 },
    { quarter: 'Q4', current: 1420, projected: 1600 },
];

const HIRING_NEEDS = [
    { role: 'Software Engineer', count: 45, priority: 'High', dept: 'Engineering' },
    { role: 'Product Manager', count: 12, priority: 'High', dept: 'Product' },
    { role: 'Sales Executive', count: 30, priority: 'Medium', dept: 'Sales' },
    { role: 'Customer Support', count: 20, priority: 'Low', dept: 'Support' },
];

export default function DemandForecastingPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Demand Forecasting
                    </h1>
                    <p className="text-slate-500 text-sm">Predict future workforce needs based on business growth.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm">
                        <option>Linear Growth Model</option>
                        <option>Seasonal Model</option>
                        <option>Aggressive Expansion</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Headcount Projections (Next 12 Months)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FORECAST_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="current" name="Current Staff" stroke="#6366f1" strokeWidth={3} fillOpacity={0} />
                                    <Area type="monotone" dataKey="projected" name="Projected Need" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProjected)" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
                        <div className="text-indigo-100 font-medium mb-1">Total Projected Hires</div>
                        <div className="text-4xl font-bold mb-4">107</div>
                        <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                            <ArrowUpRight className="w-4 h-4" /> +18% Growth
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Critical Hiring Needs</h3>
                        <div className="space-y-4">
                            {HIRING_NEEDS.map((need, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div>
                                        <div className="font-bold text-sm">{need.role}</div>
                                        <div className="text-xs text-slate-500">{need.dept}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-600 dark:text-indigo-400">{need.count}</div>
                                        <div className={`text-[10px] uppercase font-bold ${need.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>{need.priority}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
