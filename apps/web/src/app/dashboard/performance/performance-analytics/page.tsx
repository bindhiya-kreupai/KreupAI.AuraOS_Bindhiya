"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceAnalyticsService } from '../core/services';
import type { PerformanceStats } from '../core/types';
import {
    BarChart2,
    TrendingUp,
    Download,
    Loader2
} from 'lucide-react';

export default function PerformanceAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PerformanceStats>({
        totalReviews: 0,
        completedReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        goalAchievementRate: 0,
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await PerformanceAnalyticsService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const completionRate = stats.totalReviews > 0
        ? Math.round((stats.completedReviews / stats.totalReviews) * 100)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Performance Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Key insights into organizational performance trends.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Avg. Rating</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-indigo-600">{stats.averageRating || '0.0'}</span>
                        {stats.averageRating > 0 && (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold mb-1">
                                {stats.totalReviews} reviews
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Goal Achievement</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-indigo-600">{stats.goalAchievementRate}%</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">Completion Rate</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Review Completion</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-emerald-600">{completionRate}%</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">{stats.completedReviews}/{stats.totalReviews} Reviews</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6">Rating Distribution</h3>
                {stats.totalReviews === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-400">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold">No review data yet</p>
                        <p className="text-sm mt-1">Complete performance reviews to see analytics</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(rating => (
                            <div key={rating} className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">{stats.ratingDistribution[rating] || 0}</div>
                                <div className="text-xs text-slate-500 mt-1">Rating {rating}</div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${stats.totalReviews > 0 ? ((stats.ratingDistribution[rating] || 0) / stats.totalReviews) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
