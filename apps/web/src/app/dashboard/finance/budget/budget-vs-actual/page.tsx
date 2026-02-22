"use client";

import React, { useState, useEffect } from 'react';
import {
    Scale,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { BudgetVarianceService, FinanceAnalyticsService } from '../../services';

export default function BudgetVsActualPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [reportsData, metricsData] = await Promise.all([
                    BudgetVarianceService.getReports(),
                    FinanceAnalyticsService.getMetrics(),
                ]);
                setReports(reportsData);
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

    const totalBudget = metrics?.totalBudgetAmount ?? 0;
    const totalSpent = metrics?.totalSpent ?? 0;
    const variance = totalBudget - totalSpent;
    const variancePct = totalBudget > 0 ? ((variance / totalBudget) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Budget vs Actual
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor variance and identify spending gaps.</p>
                </div>
            </div>

            {reports.length === 0 && !metrics ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-bold">No variance reports found</p>
                        <p className="text-sm">Reports will appear here once generated.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Total Budget</h3>
                            <div className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(1)}M</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Actual Spend (YTD)</h3>
                            <div className="text-2xl font-bold text-emerald-600">${(totalSpent / 1000000).toFixed(1)}M</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Variance</h3>
                            <div className="text-2xl font-bold text-indigo-600">${(variance / 1000000).toFixed(1)}M ({variancePct}%)</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Variance Reports</h3>
                        {reports.length === 0 ? (
                            <div className="text-center text-slate-400 py-8">
                                <p className="font-bold">No detailed variance reports available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map((row: any, i: number) => {
                                    const rowVariance = (row.budgetAmount || 0) - (row.actualAmount || 0);
                                    const status = rowVariance > 0 ? 'good' : rowVariance < 0 ? 'bad' : 'neutral';
                                    return (
                                        <div key={row.id || i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <span className="font-bold w-1/4">{row.budgetName || row.category || 'Category'}</span>
                                            <div className="text-sm text-slate-500">
                                                Budget: <span className="font-bold text-slate-700 dark:text-slate-300">${((row.budgetAmount || 0) / 1000000).toFixed(1)}M</span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Actual: <span className="font-bold text-slate-700 dark:text-slate-300">${((row.actualAmount || 0) / 1000000).toFixed(1)}M</span>
                                            </div>
                                            <div className={`font-bold flex items-center gap-1 ${status === 'good' ? 'text-emerald-500' :
                                                    status === 'bad' ? 'text-rose-500' : 'text-slate-400'
                                                }`}>
                                                {rowVariance > 0 ? '+' : ''}${(rowVariance / 1000).toFixed(0)}k
                                                {status === 'bad' && <AlertCircle className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

