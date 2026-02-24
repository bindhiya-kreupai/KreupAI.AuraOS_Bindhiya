'use client';

import React from 'react';
import { DollarSign, PieChart, TrendingDown } from 'lucide-react';

const COST_BREAKDOWN = [
    { category: 'Base Salaries', amount: 8500000, percentage: 65, color: 'bg-blue-500' },
    { category: 'Benefits & Perks', amount: 2000000, percentage: 15, color: 'bg-emerald-500' },
    { category: 'Bonuses & Comm.', amount: 1500000, percentage: 12, color: 'bg-amber-500' },
    { category: 'Training & Dev', amount: 500000, percentage: 4, color: 'bg-purple-500' },
    { category: 'Recruitment', amount: 600000, percentage: 4, color: 'bg-rose-500' },
];

export default function WorkforceCostsPage() {
    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Workforce Costs
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor and optimize personnel expenses.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> 2% under budget
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Cost Breakdown (YTD)</h3>
                        <div className="space-y-4">
                            {COST_BREAKDOWN.map(item => (
                                <div key={item.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{item.category}</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-300">
                                            ${(item.amount / 1000000).toFixed(1)}M ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <div className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-bold">Total Annual Spend</div>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$13.1M</div>
                        <div className="text-xs text-slate-400">vs $13.5M Budget</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <div className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-bold">Cost Per Employee</div>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$10,916</div>
                        <div className="text-xs text-slate-400">Monthly Avg</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

