"use client";

import React, { useState } from 'react';
import {
    BarChart,
    PieChart,
    TrendingUp,
    Download
} from 'lucide-react';

export default function HelpdeskAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart className="w-6 h-6 text-indigo-500" />
                        Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Deep dive into helpdesk performance metrics.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Placeholder 1 */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col items-center justify-center text-slate-400">
                    <PieChart className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Ticket Volume by Category</span>
                </div>

                {/* Chart Placeholder 2 */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Avg Resolution Time Trend</span>
                </div>

                {/* Detailed Metrics Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Agent Performance</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Agent Name</th>
                                <th className="px-6 py-4">Tickets Closed</th>
                                <th className="px-6 py-4">Avg Resolution Time</th>
                                <th className="px-6 py-4">CSAT Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Mike Smith', closed: 145, time: '3.2h', csat: '4.8/5' },
                                { name: 'Sarah Connor', closed: 120, time: '2.8h', csat: '4.9/5' },
                                { name: 'John Doe', closed: 98, time: '5.1h', csat: '4.2/5' },
                            ].map((agent, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 font-bold">{agent.name}</td>
                                    <td className="px-6 py-4">{agent.closed}</td>
                                    <td className="px-6 py-4">{agent.time}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">{agent.csat}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
