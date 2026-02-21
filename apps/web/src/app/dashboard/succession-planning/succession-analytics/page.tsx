"use client";

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, ShieldAlert, Loader2 } from 'lucide-react';
import { SuccessionAnalyticsService } from '../services';

export default function SuccessionAnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await SuccessionAnalyticsService.getMetrics();
                setMetrics(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const benchStrength = metrics?.benchStrength || 0;
    const successorRatio = metrics?.averageSuccessorsPerPosition || 0;
    const criticalGaps = metrics?.criticalPositionsWithoutSuccessors || 0;

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <BarChart2 className="w-8 h-8 text-indigo-500" />
                        Succession Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Monitor the health and readiness of your leadership pipeline.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{benchStrength}%</div>
                        <div className="text-sm font-bold text-slate-500">Bench Strength</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{successorRatio}</div>
                        <div className="text-sm font-bold text-slate-500">Successors Ratio</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-rose-600">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{criticalGaps}</div>
                        <div className="text-sm font-bold text-slate-500">Critical Gaps</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-slate-100">Pipeline Coverage by Level</h3>
                <div className="space-y-4">
                    {(metrics?.pipelineByLevel || [
                        { name: 'C-Level', readyNow: 0, readySoon: 0, empty: 0 },
                        { name: 'VP Level', readyNow: 0, readySoon: 0, empty: 0 },
                        { name: 'Director', readyNow: 0, readySoon: 0, empty: 0 },
                        { name: 'Manager', readyNow: 0, readySoon: 0, empty: 0 },
                    ]).map((level: any, i: number) => {
                        const total = (level.readyNow || 0) + (level.readySoon || 0) + (level.empty || 0);
                        return (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-bold text-slate-600 dark:text-slate-400">{level.name}</div>
                                <div className="flex-1 flex h-6 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    {total > 0 ? (
                                        <>
                                            <div className="bg-emerald-500 h-full" style={{ width: `${(level.readyNow / total) * 100}%` }} title={`Ready Now: ${level.readyNow}`}></div>
                                            <div className="bg-amber-400 h-full" style={{ width: `${(level.readySoon / total) * 100}%` }} title={`Ready Soon: ${level.readySoon}`}></div>
                                            <div className="bg-rose-400 h-full" style={{ width: `${(level.empty / total) * 100}%` }} title={`No Successor: ${level.empty}`}></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No data</div>
                                    )}
                                </div>
                                <div className="w-16 text-right text-xs font-bold text-slate-500">{total} roles</div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 rounded bg-emerald-500"></div> Ready Now</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 rounded bg-amber-400"></div> Ready in 1-2 Yrs</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-3 h-3 rounded bg-rose-400"></div> No Successor</div>
                </div>
            </div>
        </div>
    );
}
