"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Loader2
} from 'lucide-react';
import { LearningAnalyticsService } from '../services';

export default function ROIMeasurementPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await LearningAnalyticsService.getAnalytics();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const totalCourses = data?.totalCourses || 0;
    const completedEnrollments = data?.completedEnrollments || 0;
    const avgScore = data?.averageScore || 0;
    const completionRate = data?.averageCompletionRate || 0;

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        ROI Measurement
                    </h1>
                    <p className="text-slate-500 text-sm">Measure the business impact of training programs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{completionRate}%</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Completion Rate</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{completedEnrollments}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Completions</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-rose-600 mb-1">{totalCourses}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Courses</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-1">{avgScore}%</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Avg Score</div>
                </div>

                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Impact Analysis - Top Courses</h3>
                    {data?.topCourses && data.topCourses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Enrollments</th>
                                        <th className="px-6 py-4">Completion Rate</th>
                                        <th className="px-6 py-4">Avg Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.topCourses.map((course: any, i: number) => (
                                        <tr key={course.courseId || i}>
                                            <td className="px-6 py-4 font-bold">{course.courseTitle}</td>
                                            <td className="px-6 py-4">{course.enrollments}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-600">{course.completionRate}%</td>
                                            <td className="px-6 py-4 font-mono text-indigo-600">{course.averageRating || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                            <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm">No course data available for impact analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

