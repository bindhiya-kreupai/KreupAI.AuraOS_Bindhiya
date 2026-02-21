"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceAnalyticsService } from '../core/services';
import type { PerformanceStats } from '../core/types';
import {
    Star,
    Sliders,
    BarChart,
    Settings,
    Check,
    Loader2
} from 'lucide-react';

export default function RatingScalesPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PerformanceStats>({
        totalReviews: 0,
        completedReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        goalAchievementRate: 0,
    });

    useEffect(() => {
        async function loadData() {
            try {
                const data = await PerformanceAnalyticsService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load rating stats:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="w-6 h-6 text-amber-500" />
                        Rating Scales & Definitions
                    </h1>
                    <p className="text-slate-500 text-sm">Configure performance scoring logic, weightage, and bell curve references.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                    <Settings className="w-4 h-4" /> Global Settings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Scale Configuration */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-500" /> 5-Point Scale (Standard)
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">Currently active for all departments except Sales.</p>

                        <div className="space-y-3">
                            {[
                                { score: 5, label: 'Outstanding / Rare', desc: 'Consistently exceeds all targets and expectations.', color: 'bg-emerald-500' },
                                { score: 4, label: 'Exceeds Expectations', desc: 'Frequently exceeds targets.', color: 'bg-teal-500' },
                                { score: 3, label: 'Meets Expectations', desc: 'Consistently meets targets.', color: 'bg-blue-500' },
                                { score: 2, label: 'Needs Improvement', desc: 'Misses some targets; requires coaching.', color: 'bg-amber-500' },
                                { score: 1, label: 'Unsatisfactory', desc: 'Consistently misses targets.', color: 'bg-rose-500' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg ${s.color}`}>
                                        {s.score}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.label}</div>
                                        <div className="text-xs text-slate-500">{s.desc}</div>
                                    </div>
                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview & Weightage */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-purple-500" /> Score Weightage Logic
                        </h3>
                        <div className="space-y-4">
                            {[
                                { part: 'Goals / OKRs', weight: '60%', type: 'Objective' },
                                { part: 'Competency', weight: '30%', type: 'Subjective' },
                                { part: 'Company Values', weight: '10%', type: 'Behavioral' },
                            ].map((w, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <div>
                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{w.part}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">{w.type}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="range" className="w-24 accent-purple-500" value={parseInt(w.weight)} readOnly />
                                        <span className="font-bold text-purple-600 text-sm w-10 text-right">{w.weight}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                <span className="font-bold text-sm">Total Score Calculation</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">100%</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-indigo-600 text-white">
                        <h3 className="font-bold text-lg mb-2">Calculation Preview</h3>
                        <div className="text-sm opacity-90 mb-4">
                            Final Score = (Goal * 0.6) + (Comp * 0.3) + (Values * 0.1)
                        </div>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                            Simulate Score
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
