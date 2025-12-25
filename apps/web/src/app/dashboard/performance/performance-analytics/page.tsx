"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceAnalyticsService } from '../core/services';
import {
    BarChart2,
    TrendingUp,
    Download
} from 'lucide-react';

export default function PerformanceAnalyticsPage() {
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
                        <span className="text-3xl font-bold text-indigo-600">4.2</span>
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold mb-1">+0.3 vs LY</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Promotion Readiness</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-indigo-600">18%</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">High Potential</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase">Review Completion</div>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-emerald-600">92%</span>
                        <span className="text-xs text-slate-400 mb-1 font-medium">On Schedule</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-500">Performance Trend (Year over Year)</h3>
                    <p className="text-sm text-slate-400 mt-2">Chart component visualization.</p>
                </div>
            </div>
        </div>
    );
}
