"use client";

import React, { useState, useEffect } from 'react';
import {
    FileBarChart,
    Download,
    TrendingUp,
    Users
} from 'lucide-react';
import { LeaveAnalyticsService } from '../services';
import type { LeaveStats } from '../types';

export default function LeaveReportsPage() {
    const [stats, setStats] = useState<LeaveStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const result = await LeaveAnalyticsService.getStats();
            if (result) {
                setStats(result);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileBarChart className="w-6 h-6 text-indigo-500" />
                        Leave Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Analyze leave trends and absenteeism.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Absenteeism Rate (Monthly)</h3>
                    <div className="h-48 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-end justify-between p-4 gap-2">
                        {[2, 3, 2.5, 4, 3.2, 1.8, 2.2, 3.5, 2.8, 2.1, 1.9, 2.4].map((val, i) => (
                            <div key={i} className="w-full bg-indigo-200 dark:bg-indigo-900 relative rounded-t-sm group">
                                <div
                                    className="absolute bottom-0 w-full bg-indigo-500 hover:bg-indigo-600 transition-all rounded-t-sm"
                                    style={{ height: `${val * 20}%` }}
                                ></div>
                                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded">
                                    {val}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                        <span>Jan</span><span>Dec</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Leave Utilization by Type</h3>
                    <div className="space-y-4">
                        {[
                            { type: 'Annual Leave', val: 75, color: 'bg-emerald-500' },
                            { type: 'Sick Leave', val: 42, color: 'bg-amber-500' },
                            { type: 'Casual Leave', val: 60, color: 'bg-indigo-500' },
                            { type: 'Unpaid Leave', val: 10, color: 'bg-rose-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">{item.type}</span>
                                    <span className="text-slate-500">{item.val}% Utilized</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-8 text-slate-500">
                        Loading statistics...
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center text-center">
                            <Users className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold">{stats?.onLeaveToday || 0}</div>
                            <div className="text-sm text-slate-500">Employees on Leave Today</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center text-center">
                            <TrendingUp className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-emerald-600">
                                {stats?.totalEmployees
                                    ? ((stats.totalEmployees - stats.onLeaveToday) / stats.totalEmployees * 100).toFixed(1)
                                    : '0'}%
                            </div>
                            <div className="text-sm text-slate-500">Attendance Rate</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center text-center">
                            <TrendingUp className="w-10 h-10 text-rose-500 mx-auto mb-2 transform rotate-180" />
                            <div className="text-3xl font-bold text-rose-600">{stats?.pendingRequests || 0}</div>
                            <div className="text-sm text-slate-500">Pending Requests</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
