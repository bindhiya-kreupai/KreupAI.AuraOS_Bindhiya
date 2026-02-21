"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Scale,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

interface DeptComp {
    department: string;
    avgSalary: number;
    headcount: number;
}

export default function EquityPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ averageSalary: 0, medianSalary: 0 });
    const [deptData, setDeptData] = useState<DeptComp[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/analytics/compensation');
            const json = await res.json();
            const data = json?.data;

            if (data) {
                setSummary({
                    averageSalary: data.summary?.averageSalary ?? 0,
                    medianSalary: data.summary?.medianSalary ?? 0,
                });
                setDeptData(
                    (data.byDepartment || []).map((d: any) => ({
                        department: d.department,
                        avgSalary: d.avgSalary,
                        headcount: d.headcount,
                    }))
                );
            }
        } catch (error) {
            console.error('Error loading equity data:', error);
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

    const compaRatio = summary.medianSalary > 0 && summary.averageSalary > 0
        ? (summary.averageSalary / summary.medianSalary).toFixed(2)
        : '0.00';

    const maxSalary = Math.max(...deptData.map(d => d.avgSalary), 1);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Compensation Equity
                    </h1>
                    <p className="text-slate-500 text-sm">Pay gap analysis and salary band deviations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Avg Salary</div>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">
                        {summary.averageSalary > 0 ? `$${(summary.averageSalary / 1000).toFixed(0)}K` : '$0'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Median: ${summary.medianSalary > 0 ? `${(summary.medianSalary / 1000).toFixed(0)}K` : '0'}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Compa-Ratio</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">{compaRatio}</div>
                    <div className="text-xs text-slate-500 mt-1">Avg / Median</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Departments</div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold">{deptData.length}</div>
                    <div className="text-xs text-slate-500 mt-1">With salary data</div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-0 overflow-y-auto">
                <h3 className="font-bold text-lg mb-6">Salary Distribution by Department</h3>
                {deptData.length > 0 ? (
                    <div className="space-y-6">
                        {deptData.map(dept => {
                            const pct = (dept.avgSalary / maxSalary) * 100;
                            return (
                                <div key={dept.department}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-sm">{dept.department}</span>
                                        <span className="text-xs font-mono text-slate-500">
                                            Avg: ${(dept.avgSalary / 1000).toFixed(0)}K | {dept.headcount} employees
                                        </span>
                                    </div>
                                    <div className="relative h-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div
                                            className="absolute top-2 bottom-2 rounded bg-indigo-500 opacity-30"
                                            style={{ left: '0%', width: `${pct}%` }}
                                        ></div>
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-slate-100 border-l border-dashed z-10"
                                            style={{ left: `${pct}%` }}
                                        >
                                            <div className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                                                ${(dept.avgSalary / 1000).toFixed(0)}K
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No compensation data available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
