"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    Briefcase,
    CalendarClock
} from 'lucide-react';
import { PredictiveAnalyticsService } from '../services';

export default function WorkforcePlanningPage() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const data = await PredictiveAnalyticsService.getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching predictive analytics:', error);
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
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Workforce Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Headcount forecasting and cost projections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {/* Current vs Planned */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Headcount Forecast (2024)
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-end gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">Q1 Actual</div>
                                <div className="text-2xl font-bold">145</div>
                            </div>
                            <div className="flex-1 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-indigo-500 rounded-t-xl"></div>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">Q2 Planned</div>
                                <div className="text-2xl font-bold text-indigo-600">160</div>
                                <div className="text-xs text-emerald-500 font-bold">+15 Hires</div>
                            </div>
                            <div className="flex-1 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-indigo-400 border border-dashed border-indigo-600 rounded-t-xl opacity-60"></div>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">Q3 Planned</div>
                                <div className="text-2xl font-bold text-indigo-600">185</div>
                                <div className="text-xs text-emerald-500 font-bold">+25 Hires</div>
                            </div>
                            <div className="flex-1 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[90%] bg-indigo-300 border border-dashed border-indigo-600 rounded-t-xl opacity-40"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Projection */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" /> Cost Projection
                    </h3>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex-1 text-center">
                            <div className="text-xs font-bold text-slate-500 uppercase">Current Run Rate</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">$1.2M <span className="text-xs font-normal text-slate-400">/mo</span></div>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex-1 text-center border border-emerald-100 dark:border-emerald-800">
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Projected EOY</div>
                            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">$1.6M <span className="text-xs font-normal opacity-70">/mo</span></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold">New Hires Salary</div>
                            </div>
                            <div className="text-sm font-bold">+$250k</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <CalendarClock className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold">Annual Increments</div>
                            </div>
                            <div className="text-sm font-bold">+$120k</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
