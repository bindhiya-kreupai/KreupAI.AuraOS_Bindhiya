"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Plus,
    UserPlus,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { BudgetService, FinanceAnalyticsService } from '../../services';

export default function HeadcountPlanningPage() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [budgetData, metricsData] = await Promise.all([
                    BudgetService.getBudgets(),
                    FinanceAnalyticsService.getMetrics(),
                ]);
                setBudgets(budgetData);
                setMetrics(metricsData);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Headcount Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Forecast and plan workforce requirements for the upcoming year.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            {budgets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No headcount plans found</p>
                        <p className="text-sm">Plans will appear here once configured.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Budgets</div>
                            <div className="text-3xl font-bold">{metrics?.totalBudgets ?? 0}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Active Budgets</div>
                            <div className="text-3xl font-bold text-emerald-600">{metrics?.activeBudgets ?? 0}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg Utilization</div>
                            <div className="text-3xl font-bold text-amber-500">{(metrics?.averageUtilization ?? 0).toFixed(1)}%</div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Active Plans</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Department</th>
                                        <th className="px-4 py-3">Budget</th>
                                        <th className="px-4 py-3">Spent</th>
                                        <th className="px-4 py-3">Remaining</th>
                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {budgets.map((row: any, i: number) => (
                                        <tr key={row.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-3 font-bold">{row.name || row.department || 'Department'}</td>
                                            <td className="px-4 py-3">${((row.totalAmount || 0) / 1000000).toFixed(1)}M</td>
                                            <td className="px-4 py-3 text-indigo-600 font-bold">${((row.spentAmount || 0) / 1000000).toFixed(1)}M</td>
                                            <td className="px-4 py-3 text-emerald-600 font-bold flex items-center gap-1">
                                                ${(((row.totalAmount || 0) - (row.spentAmount || 0)) / 1000000).toFixed(1)}M
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        row.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {row.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

