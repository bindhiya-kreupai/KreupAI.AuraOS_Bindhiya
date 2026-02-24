"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    DollarSign,
    Search,
    Filter,
    Download,
    TrendingUp
} from 'lucide-react';

export default function RateCardsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-indigo-500" />
                        Vendor Rate Cards
                    </h1>
                    <p className="text-slate-500 text-sm">Standardized pricing for roles by location and experience.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                        Update Rates
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search roles or vendors..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Role / Skill</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Experience Level</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Hourly Rate ($)</th>
                                <th className="px-6 py-4 text-center">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { role: 'Senior React Developer', vendor: 'TechStaff Solutions', exp: 'Senior (5-8y)', loc: 'US (Remote)', rate: '85 - 110', trend: 'up' },
                                { role: 'UX Designer', vendor: 'Design Hive', exp: 'Mid (3-5y)', loc: 'UK (London)', rate: '60 - 80', trend: 'stable' },
                                { role: 'DevOps Engineer', vendor: 'Global Manpower', exp: 'Expert (8y+)', loc: 'US (NY)', rate: '120 - 150', trend: 'up' },
                                { role: 'QA Tester', vendor: 'Support Heroes', exp: 'Junior (1-3y)', loc: 'PH (Manila)', rate: '15 - 25', trend: 'down' },
                                { role: 'Data Scientist', vendor: 'TechStaff Solutions', exp: 'Senior (5-8y)', loc: 'US (Remote)', rate: '100 - 130', trend: 'stable' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.role}</td>
                                    <td className="px-6 py-4 text-slate-500">{row.vendor}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                                            {row.exp}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{row.loc}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">{row.rate}</td>
                                    <td className="px-6 py-4 flex justify-center">
                                        {row.trend === 'up' && <TrendingUp className="w-4 h-4 text-rose-500" />}
                                        {row.trend === 'down' && <TrendingUp className="w-4 h-4 text-emerald-500 transform rotate-180" />}
                                        {row.trend === 'stable' && <div className="w-4 h-0.5 bg-slate-300 mt-2"></div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

