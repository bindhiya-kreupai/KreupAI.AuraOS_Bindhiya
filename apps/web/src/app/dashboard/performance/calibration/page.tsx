"use client";

import React, { useState, useEffect } from 'react';
import { CalibrationService, PerformanceReviewService } from '../core/services';
import {
    Scale,
    AlertTriangle,
    CheckCircle2,
    Users,
    TrendingUp,
    MoreHorizontal,
    ArrowRight,
    ArrowLeft,
    Save,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    LineChart,
    Line,
    CartesianGrid
} from 'recharts';

const DEFAULT_DISTRIBUTION = [
    { rating: '1 - Needs Imp.', ideal: 10, actual: 0, employees: 0 },
    { rating: '2 - Developing', ideal: 15, actual: 0, employees: 0 },
    { rating: '3 - Meets Exp.', ideal: 50, actual: 0, employees: 0 },
    { rating: '4 - Exceeds', ideal: 15, actual: 0, employees: 0 },
    { rating: '5 - Outstanding', ideal: 10, actual: 0, employees: 0 },
];

export default function CalibrationPage() {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const reviewData = await PerformanceReviewService.getReviews();
                setReviews(reviewData);
            } catch (error) {
                console.error('Failed to load calibration data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Build distribution from real review data
    const ratedReviews = reviews.filter(r => r.finalRating !== null && r.finalRating !== undefined);
    const totalRated = ratedReviews.length;

    const distributionData = totalRated > 0
        ? [
            { rating: '1 - Needs Imp.', ideal: 10, actual: Math.round((ratedReviews.filter(r => Math.round(r.finalRating) === 1).length / totalRated) * 100), employees: ratedReviews.filter(r => Math.round(r.finalRating) === 1).length },
            { rating: '2 - Developing', ideal: 15, actual: Math.round((ratedReviews.filter(r => Math.round(r.finalRating) === 2).length / totalRated) * 100), employees: ratedReviews.filter(r => Math.round(r.finalRating) === 2).length },
            { rating: '3 - Meets Exp.', ideal: 50, actual: Math.round((ratedReviews.filter(r => Math.round(r.finalRating) === 3).length / totalRated) * 100), employees: ratedReviews.filter(r => Math.round(r.finalRating) === 3).length },
            { rating: '4 - Exceeds', ideal: 15, actual: Math.round((ratedReviews.filter(r => Math.round(r.finalRating) === 4).length / totalRated) * 100), employees: ratedReviews.filter(r => Math.round(r.finalRating) === 4).length },
            { rating: '5 - Outstanding', ideal: 10, actual: Math.round((ratedReviews.filter(r => Math.round(r.finalRating) === 5).length / totalRated) * 100), employees: ratedReviews.filter(r => Math.round(r.finalRating) === 5).length },
        ]
        : DEFAULT_DISTRIBUTION;

    // Build employee buckets from reviews
    const employees = reviews.map(r => ({
        id: r.id,
        name: `Employee ${r.employeeId?.slice(-4) || r.id?.slice(-4)}`,
        role: r.reviewType || 'Review',
        rating: r.finalRating ? Math.round(r.finalRating) : 3,
        avatar: (r.employeeId?.slice(-2) || 'EE').toUpperCase(),
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Scale className="w-6 h-6 text-celestial-indigo" />
                        Team Calibration
                    </h1>
                    <p className="text-silver-mist text-sm">Review and normalize performance ratings to ensure fairness.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500">{reviews.length} Reviews</span>
                    <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                        <Save className="w-4 h-4" /> Finalize Ratings
                    </button>
                </div>
            </div>

            {/* Alerts & Bell Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-500" />
                            Distribution Curve
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-slate-200 rounded-sm"></div> Ideal
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-celestial-indigo rounded-sm"></div> Actual
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="rating" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                <Bar dataKey="ideal" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                    {totalRated === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 text-center">No rated reviews yet. Complete reviews to see calibration alerts.</p>
                        </div>
                    ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <h4 className="font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2 mb-2 text-sm">
                                <AlertTriangle className="w-4 h-4" /> Calibration Alert
                            </h4>
                            <p className="text-xs text-amber-800 dark:text-amber-400 mb-2 leading-relaxed">
                                Review the distribution curve to ensure ratings align with organizational guidelines.
                            </p>
                            <button className="text-xs font-bold text-amber-700 dark:text-amber-500 underline">View Suggestions</button>
                        </div>
                    )}

                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="text-xs font-bold text-silver-mist uppercase mb-2">Team Size</div>
                        <div className="text-3xl font-bold text-ink-black dark:text-pearl mb-1">{reviews.length}</div>
                        <div className="text-xs text-slate-500">Employees included in this cycle</div>
                    </div>
                </div>
            </div>

            {/* Rating Buckets */}
            {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Scale className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No employees to calibrate</p>
                    <p className="text-xs mt-1">Reviews with ratings will appear here for calibration</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-4">
                    {[5, 4, 3, 2, 1].map(bucketRating => {
                        const bucketEmployees = employees.filter(e => e.rating === bucketRating);
                        const bucketLabel =
                            bucketRating === 5 ? 'Outstanding' :
                                bucketRating === 4 ? 'Exceeds Exp.' :
                                    bucketRating === 3 ? 'Meets Exp.' :
                                        bucketRating === 2 ? 'Developing' : 'Needs Imp.';

                        const bucketColor =
                            bucketRating >= 4 ? 'border-emerald-200 bg-emerald-50/50' :
                                bucketRating === 3 ? 'border-blue-200 bg-blue-50/50' :
                                    'border-amber-200 bg-amber-50/50';

                        return (
                            <div key={bucketRating} className={`min-w-[200px] bg-white dark:bg-stellar-blue rounded-xl border ${bucketColor} dark:border-white/5 flex flex-col h-full`}>
                                <div className="p-3 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 rounded-t-xl">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-ink-black dark:text-pearl">{bucketRating}. {bucketLabel}</span>
                                        <span className="bg-white dark:bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold shadow-sm">{bucketEmployees.length}</span>
                                    </div>
                                </div>

                                <div className="p-2 space-y-2 flex-1">
                                    {bucketEmployees.map(emp => (
                                        <div key={emp.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-celestial-indigo flex items-center justify-center text-xs font-bold shrink-0">
                                                    {emp.avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-ink-black dark:text-pearl truncate">{emp.name}</div>
                                                    <div className="text-[10px] text-silver-mist truncate">{emp.role}</div>
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute inset-x-0 bottom-0 top-0 bg-white/90 dark:bg-slate-800/90 hidden group-hover:flex items-center justify-center gap-2 rounded-lg backdrop-blur-[1px]">
                                                <button className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 text-slate-600" title="Move Down">
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 text-slate-600" title="Move Up">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {bucketEmployees.length === 0 && (
                                        <div className="h-20 flex items-center justify-center text-xs text-slate-400 italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                                            Drop here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

