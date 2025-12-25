"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingDown,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Layers
} from 'lucide-react';
import { StandardReportService } from '../services';

const COHORTS = [
    { month: 'Jan 2024', joined: 45, m1: '100%', m2: '98%', m3: '95%', m4: '92%', m5: '90%', m6: '88%' },
    { month: 'Feb 2024', joined: 32, m1: '100%', m2: '97%', m3: '94%', m4: '91%', m5: '89%', m6: '-' },
    { month: 'Mar 2024', joined: 50, m1: '100%', m2: '96%', m3: '92%', m4: '90%', m5: '-', m6: '-' },
    { month: 'Apr 2024', joined: 28, m1: '100%', m2: '95%', m3: '93%', m4: '-', m5: '-', m6: '-' },
    { month: 'May 2024', joined: 40, m1: '100%', m2: '98%', m3: '-', m4: '-', m5: '-', m6: '-' },
];

export default function RetentionPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await StandardReportService.getAllReports();
            setReports(data);
        } catch {
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
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Retention Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Cohort analysis and survival rates.</p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold">
                    <Filter className="w-4 h-4 text-slate-500" /> Filter by Dept
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Avg. Tenure</div>
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold">2.4 Yrs</div>
                    <div className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -0.2 years vs last Q
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">90-Day Retention</div>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">94%</div>
                    <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +2% vs last Q
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Annual Turnover</div>
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">12%</div>
                    <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -1.5% (Good)
                    </div>
                </div>
            </div>

            {/* Cohort Analysis */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Retention Cohorts (2024)</h3>
                </div>
                <div className="overflow-x-auto flex-1 p-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left font-bold text-slate-500 pb-4">Cohort</th>
                                <th className="text-left font-bold text-slate-500 pb-4">Joined</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 1</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 2</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 3</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 4</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 5</th>
                                <th className="text-center font-bold text-slate-500 pb-4">Month 6</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {COHORTS.map((row, i) => (
                                <tr key={i}>
                                    <td className="py-4 font-bold text-indigo-600 dark:text-indigo-400">{row.month}</td>
                                    <td className="py-4 font-bold">{row.joined}</td>
                                    {['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map(m => (
                                        <td key={m} className="py-4 text-center">
                                            {/* @ts-ignore */}
                                            {row[m] !== '-' ? (
                                                <div className={`
                                                    inline-block px-3 py-1 rounded-lg text-xs font-bold min-w-[50px]
                                                    ${/* @ts-ignore */
                                                    parseInt(row[m]) >= 95 ? 'bg-emerald-100 text-emerald-800' :
                                                        /* @ts-ignore */
                                                        parseInt(row[m]) >= 90 ? 'bg-indigo-100 text-indigo-800' :
                                                            'bg-rose-100 text-rose-800'}
                                                `}>
                                                    {/* @ts-ignore */}
                                                    {row[m]}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
