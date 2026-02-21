'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, Loader2 } from 'lucide-react';
import { WorkflowAnalyticsService } from '../services';

export default function WorkflowAnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const data = await WorkflowAnalyticsService.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

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

            {!metrics ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 mb-2">No Analytics Data</h3>
                    <p className="text-sm text-slate-400">Start running workflows to generate analytics.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-slate-500 text-sm font-medium mb-1">Total Executions</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {metrics.totalExecutions || 0}
                            </div>
                            <div className="text-xs text-emerald-500 mt-2 font-bold">
                                {metrics.successRate ? `${metrics.successRate.toFixed(1)}% success rate` : ''}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-slate-500 text-sm font-medium mb-1">Avg. Completion Time</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {metrics.averageExecutionTime ? `${(metrics.averageExecutionTime / 60).toFixed(1)} min` : '0 min'}
                            </div>
                            <div className="text-xs text-emerald-500 mt-2 font-bold">
                                {metrics.medianExecutionTime ? `Median: ${(metrics.medianExecutionTime / 60).toFixed(1)} min` : ''}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-slate-500 text-sm font-medium mb-1">Failed Executions</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {metrics.failedExecutions || 0}
                            </div>
                            <div className="text-xs text-red-500 mt-2 font-bold">
                                {metrics.totalExecutions ? `${((metrics.failedExecutions / metrics.totalExecutions) * 100).toFixed(1)}% failure rate` : ''}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[300px] flex items-center justify-center flex-col">
                            <h3 className="text-lg font-bold mb-4 w-full text-left">Workflow Usage Volume</h3>
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                {metrics.runningExecutions > 0
                                    ? `${metrics.runningExecutions} currently running`
                                    : '[Bar Chart Placeholder]'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[300px] flex items-center justify-center flex-col">
                            <h3 className="text-lg font-bold mb-4 w-full text-left">Completion Status</h3>
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
                                <div>Completed: {metrics.successfulExecutions || 0}</div>
                                <div>Failed: {metrics.failedExecutions || 0}</div>
                                <div>Cancelled: {metrics.cancelledExecutions || 0}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
