"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceAnalyticsService } from '../core/services';
import type { PerformanceStats } from '../core/types';
import {
    Activity,
    Info,
    Loader2
} from 'lucide-react';

export default function BellCurvePage() {
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
            } catch (error: any) {
                console.error('Failed to load bell curve data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const total = stats.totalReviews || 1;
    const distribution = [
        { label: 'Top Performers (5)', target: '10%', actual: `${Math.round(((stats.ratingDistribution[5] || 0) / total) * 100)}%`, color: 'bg-emerald-500' },
        { label: 'High Performers (4)', target: '20%', actual: `${Math.round(((stats.ratingDistribution[4] || 0) / total) * 100)}%`, color: 'bg-teal-500' },
        { label: 'Meet Expectations (3)', target: '40%', actual: `${Math.round(((stats.ratingDistribution[3] || 0) / total) * 100)}%`, color: 'bg-indigo-500' },
        { label: 'Needs Improvement (2)', target: '20%', actual: `${Math.round(((stats.ratingDistribution[2] || 0) / total) * 100)}%`, color: 'bg-amber-500' },
        { label: 'Unsatisfactory (1)', target: '10%', actual: `${Math.round(((stats.ratingDistribution[1] || 0) / total) * 100)}%`, color: 'bg-rose-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Bell Curve
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize performance distribution across the organization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4">Distribution Targets</h3>
                        <div className="space-y-4">
                            {distribution.map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1 font-bold">
                                        <span>{item.label}</span>
                                        <span className={
                                            parseInt(item.actual) > parseInt(item.target) ? 'text-rose-500' : 'text-slate-500'
                                        }>{item.actual} / {item.target}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.actual }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {stats.totalReviews > 0 ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl flex gap-3 text-sm text-indigo-800 dark:text-indigo-200">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Based on {stats.totalReviews} reviews with an average rating of {stats.averageRating}.</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl flex gap-3 text-sm text-slate-500">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>No review data available yet. Complete performance reviews to populate the bell curve.</p>
                        </div>
                    )}
                </div>

                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-500">Normal Distribution Chart</h3>
                        <p className="text-sm text-slate-400 mt-2">
                            {stats.totalReviews > 0
                                ? `Showing distribution of ${stats.totalReviews} reviews`
                                : 'Interactive visualization will populate with review data'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

