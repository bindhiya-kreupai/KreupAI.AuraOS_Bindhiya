"use client";

import React, { useState } from 'react';
import {
    Banknote,
    PieChart,
    BarChart3
} from 'lucide-react';

export default function SalaryBudgetsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-emerald-600" />
                        Salary Budgets
                    </h1>
                    <p className="text-slate-500 text-sm">Manage compensation budgets and merit pools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Budget Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20">
                    <h3 className="font-bold text-emerald-100 mb-2">Total Salary Budget (FY 2024)</h3>
                    <div className="text-4xl font-bold mb-4">$42,500,000</div>
                    <div className="flex gap-4 text-sm font-bold opacity-90">
                        <div>
                            <span className="block text-emerald-200 text-xs">Utilized</span>
                            $38.2M (90%)
                        </div>
                        <div>
                            <span className="block text-emerald-200 text-xs">Remaining</span>
                            $4.3M (10%)
                        </div>
                    </div>
                </div>

                {/* Merit Pool */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-2 text-slate-700 dark:text-slate-200">Merit Increase Pool</h3>
                    <div className="text-3xl font-bold text-indigo-600 mb-4">3.5%</div>
                    <p className="text-sm text-slate-500">Allocated for annual performance reviews based on market corrections.</p>
                </div>

                {/* Bonus Pool */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-2 text-slate-700 dark:text-slate-200">Bonus Pool</h3>
                    <div className="text-3xl font-bold text-amber-500 mb-4">$2.1M</div>
                    <p className="text-sm text-slate-500">Projected payout based on 95% company performance achievement.</p>
                </div>

                {/* Allocation Chart Placeholder */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 min-h-[300px] flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <span className="font-bold">Budget Distribution Chart</span>
                        <p className="text-xs">Visualizing allocation across departments</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
