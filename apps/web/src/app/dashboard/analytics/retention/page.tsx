"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingDown,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    Loader2
} from 'lucide-react';

export default function RetentionPage() {
    const [loading, setLoading] = useState(true);
    const [overallRate, setOverallRate] = useState(0);
    const [avgTenure, setAvgTenure] = useState(0);
    const [tenureData, setTenureData] = useState<{ range: string; count: number; percentage: number }[]>([]);
    const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; separations: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [turnoverRes, diversityRes] = await Promise.all([
                fetch('/api/v1/analytics/turnover').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/diversity').then(r => r.json()).catch(() => null),
            ]);

            const turnover = turnoverRes?.data;
            const diversity = diversityRes?.data;

            if (turnover) {
                setOverallRate(turnover.overall?.turnoverRate ?? 0);
                setMonthlyTrend(
                    (turnover.monthlyTrend || []).map((m: any) => ({
                        month: m.month,
                        separations: m.separations,
                    }))
                );
            }

            if (diversity) {
                setTenureData(diversity.tenure?.distribution || []);
                const totalEmp = diversity.totalEmployees || 0;
                const dist = diversity.tenure?.distribution || [];
                if (totalEmp > 0 && dist.length > 0) {
                    let weightedSum = 0;
                    dist.forEach((d: any) => {
                        const rangeStr = d.range || '';
                        let midpoint = 0;
                        if (rangeStr.includes('<1')) midpoint = 0.5;
                        else if (rangeStr.includes('1-2')) midpoint = 1.5;
                        else if (rangeStr.includes('2-5')) midpoint = 3.5;
                        else if (rangeStr.includes('5-10')) midpoint = 7.5;
                        else if (rangeStr.includes('10+')) midpoint = 12;
                        weightedSum += midpoint * d.count;
                    });
                    setAvgTenure(Number((weightedSum / totalEmp).toFixed(1)));
                }
            }
        } catch (error) {
            console.error('Error loading retention data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const retentionRate = 100 - overallRate;

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Retention Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Tenure analysis and retention rates.</p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold">
                    <Filter className="w-4 h-4 text-slate-500" /> Filter by Dept
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Avg. Tenure</div>
                        {avgTenure > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                    </div>
                    <div className="text-3xl font-bold">{avgTenure > 0 ? `${avgTenure} Yrs` : '--'}</div>
                    <div className="text-xs text-slate-500 mt-1">Estimated from distribution</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Retention Rate</div>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">{retentionRate > 0 ? `${retentionRate.toFixed(1)}%` : '--'}</div>
                    <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Based on turnover rate
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Annual Turnover</div>
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">{overallRate > 0 ? `${overallRate}%` : '--'}</div>
                    <div className="text-xs text-slate-500 mt-1">Overall turnover rate</div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Tenure Distribution</h3>
                </div>
                <div className="overflow-x-auto flex-1 p-6">
                    {tenureData.length > 0 ? (
                        <div className="space-y-4">
                            {tenureData.map((item) => (
                                <div key={item.range} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.range}</div>
                                    <div className="flex-1 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                                        <div className="h-full bg-indigo-500 opacity-60" style={{ width: `${item.percentage}%` }}></div>
                                        <div className="absolute inset-0 flex items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {item.count} employees ({item.percentage}%)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No retention data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
