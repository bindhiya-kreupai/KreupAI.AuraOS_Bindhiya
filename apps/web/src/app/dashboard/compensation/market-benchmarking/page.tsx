"use client";

import React, { useState, useEffect } from 'react';
import {
    Globe,
    BarChart3,
    ArrowRight,
    Search
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
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    const data = [
        { name: 'L1: Junior', internal: 60, market: 65 },
        { name: 'L2: Mid', internal: 95, market: 100 },
        { name: 'L3: Senior', internal: 130, market: 140 },
        { name: 'L4: Lead', internal: 170, market: 165 },
        { name: 'L5: Manager', internal: 210, market: 220 },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold mb-6">Engineering: Software Developer vs. Market (P50)</h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `$${val}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                <Legend />
                                <Bar dataKey="internal" name="Internal Avg" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="market" name="Market Median" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Compa-Ratio Analysis</h3>
                        <div className="text-4xl font-bold text-indigo-600 mb-1">0.94</div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">Overall, we are paying 6% below market median.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4">Data Sources</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs">R</div>
                                <div>
                                    <div className="text-sm font-bold">Radford Global</div>
                                    <div className="text-[10px] text-slate-500">Tech Sector, 2024</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs">M</div>
                                <div>
                                    <div className="text-sm font-bold">Mercer High Tech</div>
                                    <div className="text-[10px] text-slate-500">Software, 2023 Q4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
