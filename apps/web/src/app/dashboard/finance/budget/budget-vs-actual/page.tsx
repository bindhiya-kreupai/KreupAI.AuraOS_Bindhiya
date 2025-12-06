"use client";

import React, { useState } from 'react';
import {
    Scale,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

export default function BudgetVsActualPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Budget vs Actual
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor variance and identify spending gaps.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Variance Summary */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-500 mb-1">Total Budget</h3>
                        <div className="text-2xl font-bold">$10,000,000</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-500 mb-1">Actual Spend (YTD)</h3>
                        <div className="text-2xl font-bold text-emerald-600">$9,250,500</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-500 mb-1">Variance</h3>
                        <div className="text-2xl font-bold text-indigo-600">$749,500 (7.5%)</div>
                    </div>
                </div>

                {/* Variance Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Category Variance Analysis</h3>
                    <div className="space-y-4">
                        {[
                            { cat: 'Salaries', budget: '$8.5M', actual: '$8.4M', var: '+$100k', status: 'good' },
                            { cat: 'Training', budget: '$500k', actual: '$300k', var: '+$200k', status: 'good' },
                            { cat: 'Recruitment', budget: '$200k', actual: '$250k', var: '-$50k', status: 'bad' },
                            { cat: 'Tools & Software', budget: '$800k', actual: '$800k', var: '$0', status: 'neutral' },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="font-bold w-1/4">{row.cat}</span>
                                <div className="text-sm text-slate-500">
                                    Budget: <span className="font-bold text-slate-700 dark:text-slate-300">{row.budget}</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Actual: <span className="font-bold text-slate-700 dark:text-slate-300">{row.actual}</span>
                                </div>
                                <div className={`font-bold flex items-center gap-1 ${row.status === 'good' ? 'text-emerald-500' :
                                        row.status === 'bad' ? 'text-rose-500' : 'text-slate-400'
                                    }`}>
                                    {row.var}
                                    {row.status === 'bad' && <AlertCircle className="w-4 h-4" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
