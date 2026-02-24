"use client";

import React, { useState, useEffect } from 'react';
import {
    Globe,
    BarChart3,
    ArrowRight,
    Search,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { MarketBenchmarkService } from '../services';

export default function MarketBenchmarkingPage() {
    const [benchmarks, setBenchmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await MarketBenchmarkService.getBenchmarks();
            setBenchmarks(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Build chart data from benchmarks
    const chartData = benchmarks.length > 0
        ? benchmarks.map((b: any) => ({
            name: b.jobTitle || b.benchmarkName || b.gradeEquivalent || '--',
            internal: b.baseSalary50thPercentile ? Math.round(Number(b.baseSalary50thPercentile) / 1000) : 0,
            market: b.totalComp50thPercentile ? Math.round(Number(b.totalComp50thPercentile) / 1000) : (b.percentile50 ? Math.round(Number(b.percentile50) / 1000) : 0),
        }))
        : [];

    // Compute average compa-ratio
    const avgCompaRatio = benchmarks.length > 0
        ? benchmarks.reduce((sum: number, b: any) => {
            const internal = Number(b.baseSalary50thPercentile) || 0;
            const market = Number(b.totalComp50thPercentile) || Number(b.percentile50) || 0;
            return sum + (market > 0 ? internal / market : 1);
        }, 0) / benchmarks.length
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Market Benchmarking
                    </h1>
                    <p className="text-slate-500 text-sm">Compare internal pay ranges against industry standards.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search Role..." className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
                </div>
            </div>

            {benchmarks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                    <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No market benchmark data available.</p>
                    <p className="text-xs text-slate-300 mt-1">Import benchmark data to compare your compensation against market rates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                        <h3 className="font-bold mb-6">Compensation vs. Market (in $K)</h3>
                        {chartData.length > 0 ? (
                            <div className="flex-1 w-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(val) => `$${val}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                        <Legend />
                                        <Bar dataKey="internal" name="Internal" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="market" name="Market Median" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 py-4">No chart data available.</p>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl">
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Compa-Ratio Analysis</h3>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">
                                {avgCompaRatio > 0 ? avgCompaRatio.toFixed(2) : '--'}
                            </div>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                {avgCompaRatio > 0
                                    ? avgCompaRatio < 1
                                        ? `Paying ${Math.round((1 - avgCompaRatio) * 100)}% below market median.`
                                        : `Paying ${Math.round((avgCompaRatio - 1) * 100)}% above market median.`
                                    : 'No data to compute ratio.'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-sm mb-4">Benchmark Sources</h3>
                            <div className="space-y-3">
                                {benchmarks.slice(0, 3).map((b: any, i: number) => (
                                    <div key={b.id || i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs">
                                            {(b.source || b.sourceName || 'S')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{b.sourceName || b.source || 'Survey'}</div>
                                            <div className="text-[10px] text-slate-500">{b.industry || '--'}, {b.geography || b.region || '--'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

