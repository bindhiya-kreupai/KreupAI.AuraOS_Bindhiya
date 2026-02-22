"use client";

import React, { useState, useEffect } from 'react';
import {
    Banknote,
    PieChart,
    Loader2
} from 'lucide-react';
import { BudgetService, FinanceAnalyticsService } from '../../services';

export default function SalaryBudgetsPage() {
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
            } catch (error) {
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

    const totalBudgetAmount = metrics?.totalBudgetAmount ?? 0;
    const totalSpent = metrics?.totalSpent ?? 0;
    const totalRemaining = metrics?.totalRemaining ?? 0;
    const utilization = totalBudgetAmount > 0 ? ((totalSpent / totalBudgetAmount) * 100).toFixed(0) : '0';
    const remainingPercent = totalBudgetAmount > 0 ? ((totalRemaining / totalBudgetAmount) * 100).toFixed(0) : '0';

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-600" />
                        Salary Budgets
                    </h1>
                    <p className="text-slate-500 text-sm">Manage compensation budgets and merit pools.</p>
                </div>
            </div>

            {budgets.length === 0 && !metrics ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Banknote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No salary budgets found</p>
                        <p className="text-sm">Budget data will appear here once configured.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20">
                        <h3 className="font-bold text-emerald-100 mb-2">Total Salary Budget</h3>
                        <div className="text-4xl font-bold mb-4">${(totalBudgetAmount / 1000000).toFixed(1)}M</div>
                        <div className="flex gap-3 text-sm font-bold opacity-90">
                            <div>
                                <span className="block text-emerald-200 text-xs">Utilized</span>
                                ${(totalSpent / 1000000).toFixed(1)}M ({utilization}%)
                            </div>
                            <div>
                                <span className="block text-emerald-200 text-xs">Remaining</span>
                                ${(totalRemaining / 1000000).toFixed(1)}M ({remainingPercent}%)
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-2 text-slate-700 dark:text-slate-200">Active Budgets</h3>
                        <div className="text-3xl font-bold text-indigo-600 mb-4">{metrics?.activeBudgets ?? 0}</div>
                        <p className="text-sm text-slate-500">Out of {metrics?.totalBudgets ?? 0} total budgets currently tracked.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-2 text-slate-700 dark:text-slate-200">Avg Utilization</h3>
                        <div className="text-3xl font-bold text-amber-500 mb-4">{(metrics?.averageUtilization ?? 0).toFixed(1)}%</div>
                        <p className="text-sm text-slate-500">Average budget utilization across all departments.</p>
                    </div>

                    <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 min-h-[300px] flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <span className="font-bold">Budget Distribution Chart</span>
                            <p className="text-xs">Visualizing allocation across departments</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

