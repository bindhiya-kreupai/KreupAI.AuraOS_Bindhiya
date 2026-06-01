"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    Briefcase,
    CalendarClock,
    Loader2
} from 'lucide-react';

export default function WorkforcePlanningPage() {
    const [loading, setLoading] = useState(true);
    const [totalHC, setTotalHC] = useState(0);
    const [newHires, setNewHires] = useState(0);
    const [separations, setSeparations] = useState(0);
    const [totalPayroll, setTotalPayroll] = useState(0);
    const [avgSalary, setAvgSalary] = useState(0);
    const [deptBreakdown, setDeptBreakdown] = useState<{ department: string; count: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [headcountRes, compRes] = await Promise.all([
                fetch('/api/v1/analytics/headcount').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/compensation').then(r => r.json()).catch(() => null),
            ]);

            const hc = headcountRes?.data;
            const comp = compRes?.data;

            if (hc) {
                setTotalHC(hc.total || 0);
                setNewHires(hc.newHires?.thisMonth || 0);
                setSeparations(hc.separations?.thisMonth || 0);
                setDeptBreakdown(
                    (hc.byDepartment || []).map((d: any) => ({
                        department: d.department,
                        count: d.count,
                    }))
                );
            }

            if (comp) {
                setTotalPayroll(comp.summary?.totalPayroll ?? 0);
                setAvgSalary(comp.summary?.averageSalary ?? 0);
            }
        } catch (error: any) {
            console.error('Error loading workforce planning data:', error);
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

    const monthlyPayroll = totalPayroll > 0 ? totalPayroll / 12 : 0;
    const projectedEOY = monthlyPayroll + (newHires * avgSalary / 12);
    const newHireCost = newHires * avgSalary;

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Workforce Planning
                    </h1>
                    <p className="text-slate-500 text-sm">Headcount forecasting and cost projections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Headcount Overview
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-end gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">Current HC</div>
                                <div className="text-2xl font-bold">{totalHC}</div>
                            </div>
                            <div className="flex-1 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-indigo-500 rounded-t-xl"></div>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">New Hires</div>
                                <div className="text-2xl font-bold text-indigo-600">{newHires}</div>
                                <div className="text-xs text-emerald-500 font-bold">This month</div>
                            </div>
                            <div className="flex-1 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-emerald-400 rounded-t-xl"></div>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 pb-4">
                            <div className="w-1/4">
                                <div className="text-xs text-slate-500 uppercase">Separations</div>
                                <div className="text-2xl font-bold text-rose-600">{separations}</div>
                                <div className="text-xs text-rose-500 font-bold">This month</div>
                            </div>
                            <div className="flex-1 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-t-xl relative">
                                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-rose-400 rounded-t-xl"></div>
                            </div>
                        </div>
                    </div>

                    {deptBreakdown.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-bold mb-3">By Department</h4>
                            <div className="space-y-2">
                                {deptBreakdown.slice(0, 5).map(d => (
                                    <div key={d.department} className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">{d.department}</span>
                                        <span className="font-bold">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" /> Cost Projection
                    </h3>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex-1 text-center">
                            <div className="text-xs font-bold text-slate-500 uppercase">Total Payroll</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                ${totalPayroll > 0 ? `${(totalPayroll / 1000000).toFixed(1)}M` : '0'}
                                <span className="text-xs font-normal text-slate-400"> /yr</span>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex-1 text-center border border-emerald-100 dark:border-emerald-800">
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Monthly Run Rate</div>
                            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                ${monthlyPayroll > 0 ? `${(monthlyPayroll / 1000000).toFixed(2)}M` : '0'}
                                <span className="text-xs font-normal opacity-70"> /mo</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold">Avg Salary</div>
                            </div>
                            <div className="text-sm font-bold">
                                {avgSalary > 0 ? `$${(avgSalary / 1000).toFixed(0)}K` : '$0'}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <CalendarClock className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold">Net Growth (Month)</div>
                            </div>
                            <div className="text-sm font-bold">
                                {newHires - separations >= 0 ? '+' : ''}{newHires - separations}
                            </div>
                        </div>
                    </div>

                    {totalHC === 0 && totalPayroll === 0 && (
                        <div className="mt-6 text-center py-8">
                            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No workforce planning data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

