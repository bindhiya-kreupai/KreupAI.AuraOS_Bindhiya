"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Globe,
    Scale,
    ArrowUpRight,
    Loader2
} from 'lucide-react';

export default function DiversityPage() {
    const [loading, setLoading] = useState(true);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [deptBreakdown, setDeptBreakdown] = useState<{ department: string; count: number; percentage: number }[]>([]);
    const [tenureData, setTenureData] = useState<{ range: string; count: number; percentage: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/analytics/diversity');
            const json = await res.json();
            const data = json?.data;

            if (data) {
                setTotalEmployees(data.totalEmployees || 0);
                setDeptBreakdown(data.departmentBreakdown || []);
                setTenureData(data.tenure?.distribution || []);
            }
        } catch (error) {
            console.error('Error loading diversity data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Diversity & Inclusion
                    </h1>
                    <p className="text-slate-500 text-sm">Demographics, workforce composition, and equity metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-2 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Workforce</div>
                        <div className="flex items-baseline gap-3">
                            <div>
                                <div className="text-3xl font-black text-indigo-600">{totalEmployees}</div>
                                <div className="text-xs font-bold text-slate-400">Employees</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <div className="text-3xl font-black text-slate-700 dark:text-slate-300">{deptBreakdown.length}</div>
                                <div className="text-xs font-bold text-slate-400">Departments</div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
                            <ArrowUpRight className="w-3 h-3" /> From employee records
                        </div>
                    </div>

                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[12px] border-indigo-500 border-l-transparent border-b-transparent -rotate-45"></div>
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Globe className="w-8 h-8 text-emerald-500 mb-4" />
                    <div className="text-3xl font-bold mb-1">{tenureData.length}</div>
                    <div className="text-sm text-slate-500">Tenure Bands</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Scale className="w-8 h-8 text-amber-500 mb-4" />
                    <div className="text-3xl font-bold mb-1">{deptBreakdown.length}</div>
                    <div className="text-sm text-slate-500">Departments Tracked</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Workforce by Department</h3>
                    {deptBreakdown.length > 0 ? (
                        <div className="space-y-4 flex-1">
                            {deptBreakdown.map(d => (
                                <div key={d.department}>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>{d.department}</span>
                                        <span>{d.count} ({d.percentage}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div className="bg-indigo-500 h-full" style={{ width: `${d.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-sm text-slate-400">No department data available</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Tenure Distribution</h3>
                    {tenureData.length > 0 ? (
                        <div className="space-y-4 flex-1">
                            {tenureData.map(a => (
                                <div key={a.range} className="flex items-center gap-3">
                                    <div className="w-16 text-sm font-bold text-slate-500">{a.range}</div>
                                    <div className="flex-1 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                                        <div className="h-full bg-emerald-500 opacity-80" style={{ width: `${a.percentage}%` }}></div>
                                        <div className="absolute inset-0 flex items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-300">{a.count} ({a.percentage}%)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-sm text-slate-400">No tenure data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

