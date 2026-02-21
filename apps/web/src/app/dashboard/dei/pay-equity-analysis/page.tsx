"use client";

import React, { useState, useEffect } from 'react';
import {
    Scale,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { PayEquityService } from '../services';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

export default function PayEquityPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await PayEquityService.getAllAnalyses();
                setData(Array.isArray(data) ? data : []);
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

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-pink-500" />
                        Pay Equity Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze and address compensation gaps across demographics.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Overall Pay Gap</div>
                    <div className="text-3xl font-bold text-rose-500">2.4%</div>
                    <div className="text-sm text-slate-500 mt-1">Favoring Male Employees</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Adjusted Pay Gap</div>
                    <div className="text-3xl font-bold text-emerald-600">0.8%</div>
                    <div className="text-sm text-slate-500 mt-1">After accounting for role/tenure</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Budget Required</div>
                    <div className="text-3xl font-bold text-indigo-600">$142,000</div>
                    <div className="text-sm text-slate-500 mt-1">To close all identified gaps</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
                <h3 className="font-bold text-lg mb-6">Average Compensation by Level & Gender</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="role" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip
                                formatter={(val: number) => `$${val.toLocaleString()}`}
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: 12 }}
                            />
                            <Legend />
                            <Bar dataKey="male" name="Male Avg" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            <Bar dataKey="female" name="Female Avg" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" /> Recommended Actions
                </h3>
                <div className="space-y-3">
                    <div className="flex gap-4 items-start">
                        <div className="p-1 bg-white dark:bg-indigo-900/30 rounded text-indigo-600 font-bold text-sm min-w-[24px] text-center">1</div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300">
                            Conduct a market adjustment for <strong>3 Manager Level</strong> roles in the Sales department to align with industry standards.
                        </p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="p-1 bg-white dark:bg-indigo-900/30 rounded text-indigo-600 font-bold text-sm min-w-[24px] text-center">2</div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300">
                            Review starting salary policies for new hires in Engineering to ensure equitable offers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
