'use client';

import React from 'react';
import { BarChart, BarChart2, PieChart, Activity } from 'lucide-react';

export default function WorkflowAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-blue-500" />
                        Workflow Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Insights into process efficiency and bottlenecks.</p>
                </div>
                <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm">
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                    <option>Year to Date</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards (Mock Visuals) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Executions</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">14,205</div>
                    <div className="text-xs text-emerald-500 mt-2 font-bold">↑ 12% vs last month</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Avg. Completion Time</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">1.2 Days</div>
                    <div className="text-xs text-emerald-500 mt-2 font-bold">↓ 4% faster</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Error Rate</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">0.4%</div>
                    <div className="text-xs text-red-500 mt-2 font-bold">↑ 0.1% increase</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[300px] flex items-center justify-center flex-col">
                    <h3 className="text-lg font-bold mb-4 w-full text-left">Workflow Usage Volume</h3>
                    {/* Placeholder for Chart */}
                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        [Bar Chart Placeholder]
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[300px] flex items-center justify-center flex-col">
                    <h3 className="text-lg font-bold mb-4 w-full text-left">Completion Status</h3>
                    {/* Placeholder for Chart */}
                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        [Pie Chart Placeholder]
                    </div>
                </div>
            </div>
        </div>
    );
}
