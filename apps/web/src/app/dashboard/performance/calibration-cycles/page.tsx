"use client";

import React, { useState, useEffect } from 'react';
import { CalibrationService, PerformanceAnalyticsService } from '../core/services';
import type { PerformanceStats } from '../core/types';
import {
    Scale,
    BarChart2,
    Users,
    Settings,
    ChevronRight,
    AlertTriangle,
    Save,
    Loader2
} from 'lucide-react';

export default function CalibrationCyclesPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PerformanceStats>({
        totalReviews: 0,
        completedReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        goalAchievementRate: 0,
    });
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, sessionsData] = await Promise.all([
                    PerformanceAnalyticsService.getStats(),
                    CalibrationService.getSessions(),
                ]);
                setStats(statsData);
                setSessions(sessionsData);
            } catch (error) {
                console.error('Failed to load calibration data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const total = stats.totalReviews || 1;
    const distribution = [
        { label: 'Unsatisfactory', target: 5, current: Math.round(((stats.ratingDistribution[1] || 0) / total) * 100), h: 'h-10' },
        { label: 'Needs Imp.', target: 10, current: Math.round(((stats.ratingDistribution[2] || 0) / total) * 100), h: 'h-24' },
        { label: 'Meets Exp.', target: 60, current: Math.round(((stats.ratingDistribution[3] || 0) / total) * 100), h: 'h-64' },
        { label: 'Exceeds', target: 20, current: Math.round(((stats.ratingDistribution[4] || 0) / total) * 100), h: 'h-40' },
        { label: 'Outstanding', target: 5, current: Math.round(((stats.ratingDistribution[5] || 0) / total) * 100), h: 'h-16' },
    ];

    // Derive department info from calibration sessions
    const departments = sessions.length > 0
        ? sessions.map((s: any) => ({
            name: s.department || s.sessionName || 'Department',
            status: s.status === 'completed' ? 'Calibrated' : s.status === 'in_progress' ? 'In Progress' : 'Pending',
            deviation: '0%',
        }))
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
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
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Performance Calibration
                    </h1>
                    <p className="text-slate-500 text-sm">Normalize ratings across departments and enforce bell curves.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" /> Finalize Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Bell Curve Config */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Rating Distribution
                    </h3>

                    <div className="flex-1 flex items-end justify-between px-10 gap-2 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {distribution.map((bucket, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full group">
                                <div className="text-xs font-bold text-slate-500 mb-1">{bucket.current}%</div>
                                <div className={`w-full max-w-[80px] ${bucket.h} bg-indigo-100 dark:bg-indigo-900/30 rounded-t-xl relative overflow-hidden`}>
                                    <div className="absolute bottom-0 w-full bg-indigo-500 transition-all hover:bg-indigo-600 cursor-pointer" style={{ height: `${(bucket.current / bucket.target) * 100}%`, maxHeight: '100%' }}></div>
                                </div>
                                <div className={`w-full h-1 rounded-full mt-2 ${Math.abs(bucket.current - bucket.target) > 2 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">{bucket.label}</div>
                                <div className="text-[10px] text-slate-400">Target: {bucket.target}%</div>
                            </div>
                        ))}
                    </div>

                    {distribution.some(d => Math.abs(d.current - d.target) > 2) ? (
                        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-500 text-sm">Distribution Alert</h4>
                                <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                                    Some rating categories deviate from target distribution. Please review and calibrate accordingly.
                                </p>
                            </div>
                        </div>
                    ) : stats.totalReviews === 0 ? (
                        <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Scale className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-slate-600 dark:text-slate-400 text-sm">No Data</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Complete performance reviews to populate the distribution chart.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Department List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Departments
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {departments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <Users className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-sm">No department calibration data</p>
                                <p className="text-xs mt-1">Run calibration sessions to see results</p>
                            </div>
                        ) : departments.map((dept: any) => (
                            <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                <div>
                                    <div className="font-bold text-sm">{dept.name}</div>
                                    <div className="text-xs text-slate-500">{dept.status}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-sm ${dept.deviation === '0%' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {dept.deviation}
                                    </div>
                                    <div className="text-[10px] text-slate-400">Deviation</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

