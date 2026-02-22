"use client";

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Calendar,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { BudgetService, FinanceAnalyticsService } from '../../services';

export default function CostProjectionsPage() {
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

    const trends = metrics?.spendingTrends || [];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LineChart className="w-6 h-6 text-indigo-500" />
                        Cost Projections
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze future labor costs and financial trends.</p>
                </div>
            </div>

            {budgets.length === 0 && trends.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No projection data available</p>
                        <p className="text-sm">Cost projections will appear here once budget data is available.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Budget Projections</h3>
                        <div className="space-y-3">
                            {budgets.slice(0, 6).map((row: any, i: number) => {
                                const current = row.spentAmount || 0;
                                const projected = row.totalAmount || 0;
                                const trendPct = projected > 0 ? (((projected - current) / projected) * 100).toFixed(1) : '0';
                                return (
                                    <div key={row.id || i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <span className="font-bold text-sm w-1/3">{row.name || 'Budget Item'}</span>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-500">${(current / 1000000).toFixed(1)}M</span>
                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                            <span className="font-bold text-slate-900 dark:text-slate-100">${(projected / 1000000).toFixed(1)}M</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${parseFloat(trendPct) > 10 ? 'bg-rose-100 text-rose-700' :
                                                parseFloat(trendPct) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {trendPct}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-slate-400">
                        <LineChart className="w-16 h-16 opacity-20 mb-4" />
                        <span className="font-bold">Cost Trend Graph</span>
                        <p className="text-xs text-center max-w-xs">Visualization of cost trajectory over the fiscal year, accounting for seasonal variances.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

