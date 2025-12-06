"use client";

import React, { useState } from 'react';
import {
    LineChart,
    TrendingUp,
    DollarSign,
    Target
} from 'lucide-react';

export default function ROIMeasurementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        ROI Measurement
                    </h1>
                    <p className="text-slate-500 text-sm">Measure the business impact of training programs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">250%</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Overall ROI (YTD)</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">$450k</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Value Generated</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-rose-600 mb-1">$180k</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Training Investment</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-1">15%</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Productivity Incr.</div>
                </div>

                {/* Case Studies */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Impact Analysis by Program</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Program Name</th>
                                    <th className="px-6 py-4">Investment</th>
                                    <th className="px-6 py-4">Business Metric</th>
                                    <th className="px-6 py-4">Improvement</th>
                                    <th className="px-6 py-4">Estimated Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'Sales Solution Selling', cost: '$25,000', metric: 'Close Rate', imp: '+12%', val: '$150,000' },
                                    { name: 'Customer Service Empathy', cost: '$10,000', metric: 'CSAT Score', imp: '+8 pts', val: '$50,000' },
                                    { name: 'Developer DevOps Training', cost: '$40,000', metric: 'Deploy Frequency', imp: '+200%', val: '$200,000' },
                                ].map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 font-bold">{row.name}</td>
                                        <td className="px-6 py-4 font-mono text-rose-600">{row.cost}</td>
                                        <td className="px-6 py-4">{row.metric}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">{row.imp}</td>
                                        <td className="px-6 py-4 font-mono text-indigo-600">{row.val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
