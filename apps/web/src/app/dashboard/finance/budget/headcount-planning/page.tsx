"use client";

import React from 'react';
import {
    Users,
    TrendingUp,
    Plus,
    UserPlus,
    ArrowUpRight
} from 'lucide-react';

export default function HeadcountPlanningPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Headcount Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Forecast and plan workforce requirements for the upcoming year.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Current Headcount</div>
                        <div className="text-3xl font-bold">1,245</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Planned Hires (Q1)</div>
                        <div className="text-3xl font-bold text-emerald-600">+45</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Attrition Rate</div>
                        <div className="text-3xl font-bold text-amber-500">8.2%</div>
                    </div>
                </div>

                {/* Plan List */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Plans</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Department</th>
                                    <th className="px-4 py-3">Current</th>
                                    <th className="px-4 py-3">Planned</th>
                                    <th className="px-4 py-3">Growth</th>
                                    <th className="px-4 py-3">Budget Impact</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { dept: 'Engineering', curr: 450, plan: 485, growth: '+35', cost: '$4.2M', status: 'Approved' },
                                    { dept: 'Sales', curr: 210, plan: 240, growth: '+30', cost: '$2.8M', status: 'Pending' },
                                    { dept: 'Marketing', curr: 85, plan: 90, growth: '+5', cost: '$0.5M', status: 'Draft' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-bold">{row.dept}</td>
                                        <td className="px-4 py-3">{row.curr}</td>
                                        <td className="px-4 py-3 text-indigo-600 font-bold">{row.plan}</td>
                                        <td className="px-4 py-3 text-emerald-600 font-bold flex items-center gap-1">
                                            {row.growth} <ArrowUpRight className="w-3 h-3" />
                                        </td>
                                        <td className="px-4 py-3">{row.cost}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
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
