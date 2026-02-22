"use client";

import React from 'react';
import {
    Calculator,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

export default function BudgetVsActualPage() {
    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Budget vs Actual
                    </h1>
                    <p className="text-slate-500 text-sm">Financial analysis of headcount spending vs forecast.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Planned (YTD)</div>
                    <div className="text-3xl font-black">$4,250,000</div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 text-xs font-bold uppercase mb-1">Actual Spend (YTD)</div>
                    <div className="text-3xl font-black">$3,980,000</div>
                </div>
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase mb-1">Variance</div>
                    <div className="text-3xl font-black text-emerald-600 flex items-center gap-2">
                        +$270k <TrendingDown className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4 text-right">Budget</th>
                            <th className="px-6 py-4 text-right">Actual</th>
                            <th className="px-6 py-4 text-right">Variance</th>
                            <th className="px-6 py-4 text-right">% Utilized</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { dept: 'Engineering', budget: 1500000, actual: 1420000, variance: 80000, util: 94 },
                            { dept: 'Sales', budget: 1200000, actual: 1250000, variance: -50000, util: 104 },
                            { dept: 'Marketing', budget: 600000, actual: 480000, variance: 120000, util: 80 },
                            { dept: 'HR & Admin', budget: 450000, actual: 445000, variance: 5000, util: 99 },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{row.dept}</td>
                                <td className="px-6 py-4 text-right text-slate-500">${(row.budget / 1000).toFixed(0)}k</td>
                                <td className="px-6 py-4 text-right font-mono">${(row.actual / 1000).toFixed(0)}k</td>
                                <td className={`px-6 py-4 text-right font-bold ${row.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {row.variance >= 0 ? '+' : '-'}${Math.abs(row.variance / 1000).toFixed(0)}k
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.util > 100 ? 'bg-rose-100 text-rose-600' :
                                            row.util < 85 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {row.util}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

