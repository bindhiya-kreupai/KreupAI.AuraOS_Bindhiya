"use client";

import React from 'react';
import { BarChart2, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PIPELINE_DATA = [
    { name: 'C-Level', readyNow: 1, readySoon: 2, empty: 0 },
    { name: 'VP Level', readyNow: 3, readySoon: 4, empty: 1 },
    { name: 'Director', readyNow: 8, readySoon: 6, empty: 2 },
    { name: 'Manager', readyNow: 15, readySoon: 10, empty: 5 },
];

export default function SuccessionAnalyticsPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <BarChart2 className="w-8 h-8 text-indigo-500" />
                        Succession Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Monitor the health and readiness of your leadership pipeline.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">68%</div>
                        <div className="text-sm font-bold text-slate-500">Bench Strength</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">2.1</div>
                        <div className="text-sm font-bold text-slate-500">Successors Ratio</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-rose-600">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">12</div>
                        <div className="text-sm font-bold text-slate-500">Critical Gaps</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-slate-100">Pipeline Coverage by Level</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={PIPELINE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend />
                            <Bar dataKey="readyNow" name="Ready Now" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="readySoon" name="Ready in 1-2 Yrs" stackId="a" fill="#fbbf24" />
                            <Bar dataKey="empty" name="No Successor" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
