"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    Smartphone,
    Users,
    Zap,
    ArrowUp,
    ArrowDown,
    Activity,
    AlertOctagon,
    PieChart
} from 'lucide-react';
import { MobileAnalyticsService } from '../services';

export default function MobileAnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await MobileAnalyticsService.getAnalytics();
            if (result) {
                setAnalytics(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Mobile Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Insights into mobile app adoption, usage, and performance.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-medium">Last 30 Days</button>
                    <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-sm text-slate-500">Last Quarter</button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Daily Active Users', value: '1.2k', change: '+12%', up: true, icon: Users, color: 'text-indigo-500' },
                    { label: 'Avg. Session', value: '4m 32s', change: '+5%', up: true, icon: Activity, color: 'text-emerald-500' },
                    { label: 'Crash Rate', value: '0.12%', change: '-0.04%', up: false, icon: AlertOctagon, color: 'text-rose-500', trendGood: true }, // down is good here
                    { label: 'Total Installs', value: '4.5k', change: '+85', up: true, icon: Smartphone, color: 'text-sky-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendGood !== undefined ? (stat.trendGood ? 'text-emerald-600' : 'text-rose-600') : (stat.up ? 'text-emerald-600' : 'text-rose-600')}`}>
                                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Feature Usage Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-6">Feature Usage Intensity</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Punch In/Out', users: '98%', count: '24k', color: 'bg-indigo-600' },
                            { name: 'Leave Requests', users: '45%', count: '1.2k', color: 'bg-indigo-500' },
                            { name: 'Pay Slip View', users: '82%', count: '3.5k', color: 'bg-indigo-400' },
                            { name: 'Expense Claims', users: '30%', count: '800', color: 'bg-indigo-300' },
                            { name: 'Directory Search', users: '15%', count: '450', color: 'bg-indigo-200' },
                        ].map((feat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{feat.name}</span>
                                    <span className="text-slate-500">{feat.count} interactions</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${feat.color}`} style={{ width: feat.users }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-slate-400" /> OS Distribution
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8">
                        {/* CSS-only Donut Chart Mockup */}
                        <div className="relative w-40 h-40 rounded-full border-[16px] border-emerald-500 border-r-indigo-500 border-b-indigo-500 border-l-slate-200 rotate-45 transform">
                        </div>
                        <div className="absolute mt-2 text-center">
                            <div className="text-3xl font-bold">4.5k</div>
                            <div className="text-xs text-slate-500">Devices</div>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                <span>iOS (17.0+)</span>
                            </div>
                            <span className="font-bold">52%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span>Android (13+)</span>
                            </div>
                            <span className="font-bold">45%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                                <span>Legacy / Other</span>
                            </div>
                            <span className="font-bold">3%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
