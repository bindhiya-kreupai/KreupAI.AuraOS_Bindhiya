"use client";

import React, { useState } from 'react';
import {
    PieChart,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Plus,
    Filter,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const DEPARTMENTS = [
    { name: 'Engineering', allocated: 1200000, utilized: 850000, variance: '+12%', status: 'On Track' },
    { name: 'Marketing', allocated: 500000, utilized: 480000, variance: '-2%', status: 'At Risk' },
    { name: 'Sales', allocated: 800000, utilized: 600000, variance: '+5%', status: 'On Track' },
    { name: 'HR & Admin', allocated: 300000, utilized: 150000, variance: '+50%', status: 'Under Utilized' },
];

export default function BudgetPlannerPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Budget Planner
                    </h1>
                    <p className="text-slate-500 text-sm">Departmental allocation, utilization tracking, and variance analysis.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm flex items-center gap-2">
                        <span className="text-slate-500">Fiscal Year:</span>
                        <span>2024-25</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" /> Allocate Budget
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                    <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Total Budget</div>
                    <div className="text-3xl font-black mb-1">$2.8M</div>
                    <div className="flex items-center gap-1 text-xs opacity-80">
                        <ArrowUpRight className="w-3 h-3" /> +15% vs Last Year
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 bordered border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Utilized</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">$2.08M</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
                        74% of Budget
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 bordered border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Projected Savings</div>
                    <div className="text-3xl font-black text-emerald-600 mb-1">$120k</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        Based on current run rate
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Department Breakdown</h3>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                            <tr>
                                <th className="p-4">Department</th>
                                <th className="p-4">Allocated</th>
                                <th className="p-4">Utilized</th>
                                <th className="p-4 w-1/3">Utilization</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {DEPARTMENTS.map(dept => {
                                const percentage = (dept.utilized / dept.allocated) * 100;
                                return (
                                    <tr key={dept.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{dept.name}</td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">${(dept.allocated / 1000).toFixed(0)}k</td>
                                        <td className="p-4 font-mono font-bold">${(dept.utilized / 1000).toFixed(0)}k</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${percentage > 90 ? 'bg-rose-500' : percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold w-12 text-right">{percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${dept.status === 'At Risk' ? 'bg-rose-100 text-rose-600' :
                                                    dept.status === 'Under Utilized' ? 'bg-indigo-100 text-indigo-600' :
                                                        'bg-emerald-100 text-emerald-600'}
                                            `}>
                                                {dept.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
