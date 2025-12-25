"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Users,
    Globe,
    Scale,
    ArrowUpRight,
    Map
} from 'lucide-react';
import { StandardReportService } from '../services';

export default function DiversityPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await StandardReportService.getAllReports();
            setReports(data);
        } catch (error) {
            console.error('Error fetching diversity reports:', error);
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
                        <Users className="w-6 h-6 text-indigo-500" />
                        Diversity & Inclusion
                    </h1>
                    <p className="text-slate-500 text-sm">Demographics, gender ratio, and equity metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                {/* Gender Ratio */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-2 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Gender Ratio (Global)</div>
                        <div className="flex items-baseline gap-4">
                            <div>
                                <div className="text-3xl font-black text-indigo-600">42%</div>
                                <div className="text-xs font-bold text-slate-400">Female</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <div className="text-3xl font-black text-slate-700 dark:text-slate-300">58%</div>
                                <div className="text-xs font-bold text-slate-400">Male</div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
                            <ArrowUpRight className="w-3 h-3" /> +3% Female Hires (YoY)
                        </div>
                    </div>

                    {/* Visual Donut Mock */}
                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-l-transparent border-b-transparent -rotate-45"></div>
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                </div>

                {/* Other Cards */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Globe className="w-8 h-8 text-emerald-500 mb-4" />
                    <div className="text-3xl font-bold mb-1">12</div>
                    <div className="text-sm text-slate-500">Nationalities</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Scale className="w-8 h-8 text-amber-500 mb-4" />
                    <div className="text-3xl font-bold mb-1">35%</div>
                    <div className="text-sm text-slate-500">Women in Leadership</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Departmental Diversity */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Diversity by Department</h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { dept: 'HR & Admin', f: 75 },
                            { dept: 'Marketing', f: 60 },
                            { dept: 'Product', f: 45 },
                            { dept: 'Engineering', f: 22 },
                            { dept: 'Sales', f: 30 },
                        ].map(d => (
                            <div key={d.dept}>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>{d.dept}</span>
                                    <span>{d.f}% Female</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div className="bg-indigo-500 h-full" style={{ width: `${d.f}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Age Distribution</h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { range: '20-30', count: 45 },
                            { range: '30-40', count: 35 },
                            { range: '40-50', count: 15 },
                            { range: '50+', count: 5 },
                        ].map(a => (
                            <div key={a.range} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-bold text-slate-500">{a.range}</div>
                                <div className="flex-1 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                                    <div className="h-full bg-emerald-500 opacity-80" style={{ width: `${a.count}%` }}></div>
                                    <div className="absolute inset-0 flex items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-300">{a.count}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
