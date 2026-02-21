"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    Coffee,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { LeaveApplicationService } from '../services';

export default function LeaveApplicationPage() {
    const [leaveType, setLeaveType] = useState('Privilege');
    const [fetching, setFetching] = useState(true);
    const [balances, setBalances] = useState<any[]>([]);
    const [recentLeaves, setRecentLeaves] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes] = await Promise.allSettled([
                    LeaveApplicationService.getBalances('me'),
                ]);

                if (balanceRes.status === 'fulfilled' && balanceRes.value?.success) {
                    const raw = balanceRes.value.data;
                    if (Array.isArray(raw)) {
                        setBalances(raw);
                    } else if (raw?.balances) {
                        setBalances(raw.balances);
                    }
                }

                const requestsRes = await LeaveApplicationService.getRequests().catch(() => null);
                if (requestsRes?.success && Array.isArray(requestsRes.data)) {
                    setRecentLeaves(requestsRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch leave data:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return CheckCircle2;
            case 'rejected': return XCircle;
            default: return Clock;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'rejected': return 'bg-rose-100 text-rose-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const privilegeBalance = balances.find(b => b.leaveType === 'Privilege' || b.leaveType === 'PL' || b.type === 'Privilege');
    const usedDays = privilegeBalance?.used || 0;
    const availableDays = privilegeBalance?.available || privilegeBalance?.balance || 0;
    const pieData = [
        { name: 'Used', value: usedDays || 8, color: '#f59e0b' },
        { name: 'Available', value: availableDays || 12, color: '#10b981' },
    ];

    const sickBalance = balances.find(b => b.leaveType === 'Sick' || b.leaveType === 'SL' || b.type === 'Sick');
    const compOffBalance = balances.find(b => b.leaveType === 'Comp Off' || b.leaveType === 'CO' || b.type === 'Comp Off');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Leave Application
                    </h1>
                    <p className="text-slate-500 text-sm">Apply for time off and check your leave balances.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Apply Leave
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Privilege Leave</h3>
                    <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={40}
                                    outerRadius={60}
                                    stroke="none"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold">{availableDays || 12}</span>
                            <span className="text-xs text-slate-400">Available</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Sick Leave</h3>
                    <div className="text-4xl font-bold text-emerald-500 mb-2">{String(sickBalance?.available || sickBalance?.balance || 5).padStart(2, '0')}</div>
                    <div className="text-xs text-slate-400">Days Available</div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Comp Off</h3>
                    <div className="text-4xl font-bold text-indigo-500 mb-2">{String(compOffBalance?.available || compOffBalance?.balance || 1).padStart(2, '0')}</div>
                    <div className="text-xs text-slate-400">Credit Available</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Recent Applications</h3>
                {recentLeaves.length > 0 ? (
                    <div className="space-y-4">
                        {recentLeaves.map((leave: any, i: number) => {
                            const StatusIcon = getStatusIcon(leave.status);
                            return (
                                <div key={leave.id || i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-indigo-500">
                                            <Coffee className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{leave.leaveType || leave.type || 'Leave'}</h4>
                                            <p className="text-xs text-slate-500">
                                                {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : ''} - {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : ''} {leave.totalDays ? `\u2022 ${leave.totalDays} Days` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusBadge(leave.status)}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {leave.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No recent leave applications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
