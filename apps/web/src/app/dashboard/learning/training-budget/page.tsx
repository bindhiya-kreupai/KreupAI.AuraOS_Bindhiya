"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    DollarSign,
    TrendingUp
} from 'lucide-react';
import { TrainingBudgetService } from '../services';

export default function TrainingBudgetPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await TrainingBudgetService.getTrainingBudgets();
                setData(result);
            } catch (error) {
            console.error('Error:', error);
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Training Budget
                    </h1>
                    <p className="text-slate-500 text-sm">Track L&D spending and allocation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Cards */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <h3 className="text-xs font-bold uppercase text-emerald-600 mb-1">Total Budget (2024)</h3>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">$250,000</div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <h3 className="text-xs font-bold uppercase text-indigo-600 mb-1">Utilized YTD</h3>
                    <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">$185,420</div>
                    <div className="text-xs text-indigo-500 font-bold mt-1">74% Utilized</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <h3 className="text-xs font-bold uppercase text-amber-600 mb-1">Remaining</h3>
                    <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">$64,580</div>
                </div>

                {/* Department Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Allocation by Department</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Engineering', amount: '$100k', pct: 60, color: 'bg-indigo-500' },
                            { name: 'Sales', amount: '$80k', pct: 45, color: 'bg-rose-500' },
                            { name: 'Marketing', amount: '$40k', pct: 25, color: 'bg-amber-500' },
                            { name: 'HR & Ops', amount: '$30k', pct: 15, color: 'bg-emerald-500' },
                        ].map((dept, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">{dept.name}</span>
                                    <span className="text-slate-500">{dept.amount}</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${dept.color}`} style={{ width: `${dept.pct}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-slate-400">
                    <PieChart className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Spend Category Breakdown</span>
                </div>
            </div>
        </div>
    );
}
