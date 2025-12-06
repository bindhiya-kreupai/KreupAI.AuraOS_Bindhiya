"use client";

import React, { useState } from 'react';
import {
    LineChart,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function CostProjectionsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LineChart className="w-6 h-6 text-indigo-500" />
                        Cost Projections
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze future labor costs and financial trends.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-sm">Q1</button>
                    <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-bold text-sm text-slate-500">Q2</button>
                    <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-bold text-sm text-slate-500">Q3</button>
                    <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-bold text-sm text-slate-500">Q4</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projection Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Projected Costs (Q1 2025)</h3>
                    <div className="space-y-3">
                        {[
                            { item: 'Base Salaries', current: '$3.5M', projected: '$3.6M', trend: '+2.8%' },
                            { item: 'Employee Benefits', current: '$850k', projected: '$900k', trend: '+5.8%' },
                            { item: 'Recruitment', current: '$120k', projected: '$150k', trend: '+25%' },
                            { item: 'Training', current: '$50k', projected: '$50k', trend: '0%' },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="font-bold text-sm w-1/3">{row.item}</span>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-slate-500">{row.current}</span>
                                    <ArrowRight className="w-4 h-4 text-slate-300" />
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{row.projected}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${parseFloat(row.trend) > 10 ? 'bg-rose-100 text-rose-700' :
                                        parseFloat(row.trend) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {row.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-slate-400">
                    <LineChart className="w-16 h-16 opacity-20 mb-4" />
                    <span className="font-bold">Cost Trend Graph</span>
                    <p className="text-xs text-center max-w-xs">Visualization of cost trajectory over the fiscal year, accounting for seasonal variances.</p>
                </div>
            </div>
        </div>
    );
}
