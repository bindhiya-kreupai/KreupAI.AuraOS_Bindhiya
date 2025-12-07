"use client";

import React from 'react';
import { PieChart as IconPieChart } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DEPT_SPEND = [
    { name: 'Sales', amount: 45000 },
    { name: 'Engineering', amount: 32000 },
    { name: 'Marketing', amount: 28000 },
    { name: 'Exec', amount: 15000 },
    { name: 'HR', amount: 5000 },
];

export default function TravelAnalyticsPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <IconPieChart className="w-8 h-8 text-indigo-500" />
                        Travel Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Cost analysis and spending trends.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="font-bold text-lg mb-6">Spend by Department (YTD)</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DEPT_SPEND} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm">
                        Total Travel Spend: <span className="font-bold text-slate-900 dark:text-slate-100">$125,000</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
