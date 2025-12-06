"use client";

import React from 'react';
import {
    BrainCircuit,
    TrendingUp,
    Users,
    UserMinus,
    AlertTriangle,
    BarChart3
} from 'lucide-react';

export default function PredictiveAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                        Predictive Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Forecasts and insights driven by machine learning.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Model Confidence: 89%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Flight Risk Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <UserMinus className="w-5 h-5 text-rose-500" /> Attrition Forecast (Flight Risk)
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">Risk Score</th>
                                    <th className="p-3">Primary Factor</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { name: 'David Kim', dept: 'Engineering', score: 92, factor: 'Salary Stagnation', color: 'rose' },
                                    { name: 'Sarah Jones', dept: 'Sales', score: 78, factor: 'Low Engagement', color: 'amber' },
                                    { name: 'Mike Ross', dept: 'Marketing', score: 65, factor: 'Role Clarity', color: 'amber' },
                                    { name: 'Emily Chen', dept: 'Product', score: 45, factor: 'N/A', color: 'emerald' },
                                ].map((emp, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{emp.name}</td>
                                        <td className="p-3 text-slate-500">{emp.dept}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-12 h-2 rounded-full bg-slate-200 overflow-hidden`}>
                                                    <div className={`h-full bg-${emp.color}-500`} style={{ width: `${emp.score}%` }}></div>
                                                </div>
                                                <span className={`text-xs font-bold text-${emp.color}-600`}>{emp.score}%</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">{emp.factor}</td>
                                        <td className="p-3">
                                            <button className="text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-2 py-1 rounded">Intervene</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Other Metrics */}
                <div className="space-y-6">
                    {/* Hiring Forecast */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Hiring Success
                        </h3>
                        <div className="mb-4">
                            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Projected Time-to-Fill</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">28 Days</div>
                            <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> 12% faster than last Q
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">Insight</div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-500">
                                Candidates from <strong>LinkedIn</strong> are predicted to stay 20% longer than other sources.
                            </p>
                        </div>
                    </div>

                    {/* Sentiment Trend */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Mood Forecast
                        </h3>
                        <div className="h-32 flex items-end justify-between gap-1">
                            {[40, 50, 45, 60, 55, 70, 65, 80].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-lg relative group">
                                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-2 font-bold">Predicted 8-Week Trend</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
