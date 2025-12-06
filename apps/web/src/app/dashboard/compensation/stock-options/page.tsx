"use client";

import React from 'react';
import {
    PieChart,
    TrendingUp,
    FileText,
    Clock,
    Award
} from 'lucide-react';
import {
    Pie,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart
} from 'recharts';

export default function StockOptionsPage() {
    const data = [
        { name: 'Vested', value: 35000, color: '#10b981' },
        { name: 'Unvested', value: 65000, color: '#6366f1' },
        { name: 'Exercised', value: 12000, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Stock Options (ESOP)
                    </h1>
                    <p className="text-slate-500 text-sm">Track grant lifecycle, vesting schedules, and cap table impact.</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                    Stock Price: $42.50 <span className="text-emerald-500 text-xs ml-1">▲ 1.2%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
                    <div className="w-48 h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold">112k</span>
                            <span className="text-xs text-slate-400 uppercase">Total Units</span>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6 text-xs">
                        {data.map((d, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                                <span>{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grants Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Your Grants</h3>
                    <div className="overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Grant ID</th>
                                    <th className="px-4 py-3">Units</th>
                                    <th className="px-4 py-3">Strike Price</th>
                                    <th className="px-4 py-3">Vesting Start</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { id: 'ESOP-001', units: '50,000', price: '$2.50', start: 'Jan 01, 2021', status: 'Partially Vested' },
                                    { id: 'ESOP-024', units: '25,000', price: '$12.00', start: 'Jun 15, 2022', status: 'Vesting' },
                                    { id: 'RSU-105', units: '10,000', price: '$0.00', start: 'Jan 01, 2024', status: 'Granted' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" /> {row.id}
                                        </td>
                                        <td className="px-4 py-3 font-mono">{row.units}</td>
                                        <td className="px-4 py-3 font-mono">{row.price}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.start}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
