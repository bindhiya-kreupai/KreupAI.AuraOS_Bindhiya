"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    DollarSign,
    Loader2
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

    const totalBudget = data.reduce((s, b) => s + (b.totalBudget || 0), 0);
    const totalSpent = data.reduce((s, b) => s + (b.spentAmount || 0), 0);
    const remaining = totalBudget - totalSpent;
    const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <h3 className="text-xs font-bold uppercase text-emerald-600 mb-1">Total Budget</h3>
                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">${totalBudget.toLocaleString()}</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <h3 className="text-xs font-bold uppercase text-indigo-600 mb-1">Utilized</h3>
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">${totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-indigo-500 font-bold mt-1">{utilization}% Utilized</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <h3 className="text-xs font-bold uppercase text-amber-600 mb-1">Remaining</h3>
                        <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">${remaining.toLocaleString()}</div>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Allocation by Department</h3>
                        {data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                                <DollarSign className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No budget data available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.map((dept, i) => {
                                    const pct = dept.totalBudget > 0 ? Math.round((dept.spentAmount / dept.totalBudget) * 100) : 0;
                                    const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

                                    return (
                                        <div key={dept.id || i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold">{dept.departmentName || `Budget ${i + 1}`}</span>
                                                <span className="text-slate-500">${(dept.totalBudget || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-slate-400">
                        <PieChart className="w-16 h-16 opacity-20 mb-4" />
                        <span className="font-bold">Spend Category Breakdown</span>
                    </div>
                </div>
            )}
        </div>
    );
}
