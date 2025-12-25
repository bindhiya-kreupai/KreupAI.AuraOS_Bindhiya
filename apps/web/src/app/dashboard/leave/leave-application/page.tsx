"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarPlus,
    Clock,
    User,
    CheckCircle2
} from 'lucide-react';
import { LeaveRequestService } from '../services';
import type { LeaveRequest } from '../types';

export default function LeaveApplicationPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const result = await LeaveRequestService.getRequests({ status: 'pending' });
            if (result.length > 0) {
                setRequests(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarPlus className="w-6 h-6 text-indigo-500" />
                        Leave Application
                    </h1>
                    <p className="text-slate-500 text-sm">Review and approve employee time-off requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Pending Requests</h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-slate-500">
                                    Loading pending requests...
                                </div>
                            ) : (requests.length > 0 ? requests : [
                                { id: '1', employeeId: 'E001', employeeName: 'John Doe', leaveTypeId: 'AL', leaveTypeName: 'Annual Leave', fromDate: '2024-12-20', toDate: '2024-12-24', numberOfDays: 5, reason: 'Family Vacation', status: 'pending' as const },
                                { id: '2', employeeId: 'E002', employeeName: 'Jane Smith', leaveTypeId: 'SL', leaveTypeName: 'Sick Leave', fromDate: '2024-10-30', toDate: '2024-10-30', numberOfDays: 1, reason: 'Flu', status: 'pending' as const },
                                { id: '3', employeeId: 'E003', employeeName: 'Mike Ross', leaveTypeId: 'CL', leaveTypeName: 'Casual Leave', fromDate: '2024-11-15', toDate: '2024-11-15', numberOfDays: 1, reason: 'Personal', status: 'pending' as const },
                            ] as LeaveRequest[]).map((req, i) => {
                                const initials = req.employeeName?.split(' ').map(n => n[0]).join('') || 'NA';
                                const dateRange = req.fromDate === req.toDate
                                    ? new Date(req.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : `${new Date(req.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(req.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                                return (
                                    <div key={req.id || i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{req.employeeName}</div>
                                                    <div className="text-sm text-slate-500">{req.leaveTypeName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-indigo-600">{req.numberOfDays} Day(s)</div>
                                                <div className="text-xs text-slate-400">{dateRange}</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">&quot;{req.reason}&quot;</p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Approve
                                            </button>
                                            <button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-1.5 rounded-lg text-sm font-bold">Reject</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Upcoming Leaves</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold">Alice Brown</span>
                                </div>
                                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-1 rounded">Tomorrow</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold">Robert Fox</span>
                                </div>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">Nov 12-15</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold">Sarah Lee</span>
                                </div>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">Nov 20</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">12%</div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-500">Absent Today</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">8</div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-500">Pending Req</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
