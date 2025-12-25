"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentAnalyticsService } from '../services';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Calendar
} from 'lucide-react';

export default function HiringAnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await RecruitmentAnalyticsService.getStats();
            if (data) {
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                        Hiring Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Insights into your recruitment pipeline and performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-sm font-bold">
                        <Calendar className="w-4 h-4 text-slate-500" /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-slate-500">Total Hires</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            <ArrowDownRight className="w-3 h-3" /> -2 days
                        </span>
                    </div>
                    <div className="text-2xl font-bold">18 Days</div>
                    <div className="text-sm text-slate-500">Time to Hire</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3 h-3" /> +5%
                        </span>
                    </div>
                    <div className="text-2xl font-bold">15%</div>
                    <div className="text-sm text-slate-500">Offer Rejection Rate</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">88%</div>
                    <div className="text-sm text-slate-500">Offer Acceptance</div>
                </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Recruitment Funnel</h3>

                    <div className="flex-1 space-y-4">
                        {[
                            { label: 'Applications', count: 1250, width: '100%', color: 'bg-indigo-500' },
                            { label: 'Screening', count: 450, width: '75%', color: 'bg-indigo-400' },
                            { label: 'Interviews', count: 120, width: '50%', color: 'bg-indigo-300' },
                            { label: 'Offers Sent', count: 55, width: '30%', color: 'bg-emerald-400' },
                            { label: 'Hired', count: 45, width: '25%', color: 'bg-emerald-500' },
                        ].map((stage, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-bold text-slate-500 text-right">{stage.label}</div>
                                <div className="flex-1 h-10 bg-slate-50 dark:bg-slate-800 rounded-r-xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div
                                        className={`h-full ${stage.color} rounded-r-xl flex items-center px-4 text-white font-bold text-sm transition-all duration-500`}
                                        style={{ width: stage.width }}
                                    >
                                        {stage.count}
                                    </div>
                                </div>
                                <div className="w-12 text-xs text-slate-400">
                                    {idx > 0 && '35%'} {/* Mock conversion rate */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Source Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Source of Hire</h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { source: 'LinkedIn', percent: 45, color: 'bg-blue-600' },
                            { source: 'Referrals', percent: 30, color: 'bg-emerald-500' },
                            { source: 'Careers Page', percent: 15, color: 'bg-indigo-500' },
                            { source: 'Agencies', percent: 10, color: 'bg-amber-500' },
                        ].map(src => (
                            <div key={src.source}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{src.source}</span>
                                    <span className="text-slate-500">{src.percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${src.color}`} style={{ width: `${src.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-sm">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">Analysis:</span>
                        <p className="text-indigo-600 dark:text-indigo-400 mt-1">
                            Referrals have the highest offer acceptance rate (95%) and shortest time-to-hire (12 days).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
