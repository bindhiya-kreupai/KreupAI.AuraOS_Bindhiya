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
    Calendar,
    Loader2
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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const totalHires = analytics?.hires || analytics?.overview?.totalHires || 0;
    const timeToHire = analytics?.averageTimeToHire || analytics?.pipelineMetrics?.averageTimeToHire || 0;
    const offerAcceptance = analytics?.offerAcceptanceRate || analytics?.pipelineMetrics?.offerAcceptanceRate || 0;
    const totalApplications = analytics?.totalApplications || analytics?.overview?.totalApplications || 0;
    const interviewsScheduled = analytics?.interviewsScheduled || analytics?.overview?.interviewsScheduled || 0;
    const offersExtended = analytics?.offersExtended || analytics?.overview?.totalOffers || 0;

    // Build funnel stages from analytics
    const funnelStages = [
        { label: 'Applications', count: totalApplications, color: 'bg-indigo-500' },
        { label: 'Interviews', count: interviewsScheduled, color: 'bg-indigo-300' },
        { label: 'Offers Sent', count: offersExtended, color: 'bg-emerald-400' },
        { label: 'Hired', count: totalHires, color: 'bg-emerald-500' },
    ];

    const maxCount = Math.max(...funnelStages.map(s => s.count), 1);

    // Build source data from analytics
    const sources = analytics?.sourceAnalytics?.sources || [];
    const sourcesByApplications = Object.entries(analytics?.applicationsBySource || {}).map(([name, count]) => ({
        source: name,
        count: count as number,
    }));
    const totalSourceApplications = sourcesByApplications.reduce((sum, s) => sum + s.count, 0) || 1;

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
                    </div>
                    <div className="text-2xl font-bold">{totalHires}</div>
                    <div className="text-sm text-slate-500">Total Hires</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{timeToHire} Days</div>
                    <div className="text-sm text-slate-500">Time to Hire</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <div className="text-sm text-slate-500">Total Applications</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{offerAcceptance}%</div>
                    <div className="text-sm text-slate-500">Offer Acceptance</div>
                </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Recruitment Funnel</h3>

                    <div className="flex-1 space-y-4">
                        {funnelStages.map((stage, idx) => {
                            const widthPercent = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 5) : 5;
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-bold text-slate-500 text-right">{stage.label}</div>
                                    <div className="flex-1 h-10 bg-slate-50 dark:bg-slate-800 rounded-r-xl relative overflow-hidden group hover:shadow-md transition-all">
                                        <div
                                            className={`h-full ${stage.color} rounded-r-xl flex items-center px-4 text-white font-bold text-sm transition-all duration-500`}
                                            style={{ width: `${widthPercent}%` }}
                                        >
                                            {stage.count}
                                        </div>
                                    </div>
                                    <div className="w-12 text-xs text-slate-400">
                                        {idx > 0 && funnelStages[idx - 1].count > 0 && (
                                            `${Math.round((stage.count / funnelStages[idx - 1].count) * 100)}%`
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Source Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Source of Hire</h3>
                    <div className="space-y-4 flex-1">
                        {sourcesByApplications.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No source data available yet.
                            </div>
                        )}
                        {sourcesByApplications.map(src => {
                            const percent = Math.round((src.count / totalSourceApplications) * 100);
                            const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500'];
                            const colorIdx = sourcesByApplications.indexOf(src) % colors.length;

                            return (
                                <div key={src.source}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{src.source}</span>
                                        <span className="text-slate-500">{percent}% ({src.count})</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${colors[colorIdx]}`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
