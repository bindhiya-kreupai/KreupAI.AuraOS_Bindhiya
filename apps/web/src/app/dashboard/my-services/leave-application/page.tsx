"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    Coffee,
    Plus,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

export default function LeaveApplicationPage() {
    const [leaveType, setLeaveType] = useState('Privilege');

    // Mock Allowance Data
    const data = [
        { name: 'Used', value: 8, color: '#f59e0b' },
        { name: 'Available', value: 12, color: '#10b981' },
    ];

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
                {/* Balance Cards */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Privilege Leave</h3>
                    <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={40}
                                    outerRadius={60}
                                    stroke="none"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold">12</span>
                            <span className="text-xs text-slate-400">Available</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Sick Leave</h3>
                    <div className="text-4xl font-bold text-emerald-500 mb-2">05</div>
                    <div className="text-xs text-slate-400">Days Available</div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Comp Off</h3>
                    <div className="text-4xl font-bold text-indigo-500 mb-2">01</div>
                    <div className="text-xs text-slate-400">Credit Available</div>
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Recent Applications</h3>
                <div className="space-y-4">
                    {[
                        { type: 'Sick Leave', range: 'Dec 01 - Dec 02', days: 2, status: 'Approved', badge: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
                        { type: 'Privilege Leave', range: 'Nov 15 - Nov 15', days: 1, status: 'Rejected', badge: 'bg-rose-100 text-rose-700', icon: XCircle },
                        { type: 'Privilege Leave', range: 'Jan 02 - Jan 05', days: 4, status: 'Pending', badge: 'bg-amber-100 text-amber-700', icon: Clock },
                    ].map((leave, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg text-indigo-500">
                                    <Coffee className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">{leave.type}</h4>
                                    <p className="text-xs text-slate-500">{leave.range} • {leave.days} Days</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${leave.badge}`}>
                                <leave.icon className="w-3 h-3" />
                                {leave.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
