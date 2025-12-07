'use client';

import React from 'react';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';

export default function WorkforceAnalyticsDashboard() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-blue-600" />
                        Workforce Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Comprehensive dashboard for all workforce metrics.</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                        <span className="font-bold text-slate-500 text-sm">Headcount</span>
                    </div>
                    <div className="text-3xl font-bold">1,245</div>
                    <div className="text-xs text-emerald-500 mt-1 font-bold">↑ 5% MoM</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                        <span className="font-bold text-slate-500 text-sm">Attrition</span>
                    </div>
                    <div className="text-3xl font-bold">12.4%</div>
                    <div className="text-xs text-red-500 mt-1 font-bold">↑ 0.5% vs Industry Avg</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                        <span className="font-bold text-slate-500 text-sm">Time to Hire</span>
                    </div>
                    <div className="text-3xl font-bold">24 Days</div>
                    <div className="text-xs text-emerald-500 mt-1 font-bold">↓ 2 days faster</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                    [Chart: Headcount Trend by Dept]
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                    [Chart: Diversity & Inclusion Stats]
                </div>
            </div>
        </div>
    );
}
