"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Plane,
    Thermometer,
    Briefcase,
    MoreHorizontal,
    Users,
    Loader2
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { LeaveRequestService, LeaveBalanceService } from '../services';
import type { LeaveRequest as LeaveRequestType, LeaveBalance as LeaveBalanceType } from '../types';

function getLeaveIcon(leaveTypeId: string) {
    switch (leaveTypeId) {
        case 'AL': return Plane;
        case 'SL': return Thermometer;
        default: return Briefcase;
    }
}

function getLeaveColor(leaveTypeId: string): string {
    switch (leaveTypeId) {
        case 'AL': return '#10b981';
        case 'SL': return '#ef4444';
        default: return '#f59e0b';
    }
}

export default function MyLeavesPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestType[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceType[]>([]);
    const [loading, setLoading] = useState(true);

    // Note: In a real app, you'd get the current user's ID from auth context
    const currentUserId = 'current-user-id';

    useEffect(() => {
        fetchMyLeaves();
    }, []);

    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const [requestsData, balancesData] = await Promise.all([
                LeaveRequestService.getRequests({ employeeId: currentUserId }),
                LeaveBalanceService.getBalances(currentUserId)
            ]);
            setLeaveRequests(requestsData);
            setLeaveBalances(balancesData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Transform API balances to UI format
    const BALANCES = leaveBalances.map(bal => ({
        type: bal.leaveTypeName || bal.leaveTypeId,
        total: (bal.openingBalance ?? 0) + (bal.accrued ?? 0),
        used: bal.availed ?? 0,
        balance: bal.availableBalance ?? 0,
        color: getLeaveColor(bal.leaveTypeId),
        icon: getLeaveIcon(bal.leaveTypeId),
    }));

    // Transform API requests to UI format
    const HISTORY = leaveRequests.slice(0, 3).map(req => ({
        id: req.id,
        type: req.leaveTypeName || req.leaveTypeId,
        startDate: new Date(req.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endDate: new Date(req.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        days: req.totalDays,
        status: req.status === 'approved' ? 'Approved' as const : req.status === 'rejected' ? 'Rejected' as const : 'Pending' as const,
        approver: req.approvals?.find(a => a.status === 'approved')?.approverName || req.currentApprover || 'Pending',
        appliedOn: req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    }));

    // Derive team away from approved leave requests (those covering today)
    const today = new Date().toISOString().split('T')[0];
    const teamAway = leaveRequests
        .filter(r => r.status === 'approved' && r.fromDate <= today && r.toDate >= today)
        .map(r => ({
            name: r.employeeName,
            date: 'Today',
            avatar: r.employeeName?.split(' ').map(n => n[0]).join('') || 'NA',
        }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
                    <p className="text-silver-mist text-sm">Loading your leave data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-celestial-indigo" />
                        My Leaves
                    </h1>
                    <p className="text-silver-mist text-sm">Manage time off, check balances, and plan your holidays.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Apply for Leave
                </button>
            </div>

            {/* Leave Balances */}
            {BALANCES.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {BALANCES.map((bal, idx) => {
                        const data = [
                            { name: 'Balance', value: bal.balance, color: bal.color },
                            { name: 'Used', value: bal.used, color: '#e2e8f0' },
                        ];
                        return (
                            <div key={idx} className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden group hover:border-celestial-indigo/30 transition-all">
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500`}>
                                                <bal.icon className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-ink-black dark:text-pearl">{bal.type}</h3>
                                        </div>
                                        <div className="text-3xl font-bold text-ink-black dark:text-pearl mb-1">{bal.balance}</div>
                                        <div className="text-xs text-silver-mist">Days Available</div>
                                    </div>
                                    <div className="h-16 w-16 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data}
                                                    innerRadius={25}
                                                    outerRadius={32}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    startAngle={90}
                                                    endAngle={-270}
                                                >
                                                    {data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/20 flex justify-between text-xs text-slate-500">
                                    <span>Used: {bal.used}</span>
                                    <span>Total: {bal.total}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm text-center">
                    <p className="text-silver-mist text-sm">No leave balances found.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: History & Calendar */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Requests */}
                    <div>
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-celestial-indigo" />
                            Recent Requests
                        </h3>
                        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                            {HISTORY.length > 0 ? (
                                <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                    {HISTORY.map(req => (
                                        <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {req.status === 'Approved' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                    {req.status === 'Pending' && <Clock className="w-5 h-5 text-amber-500" />}
                                                    {req.status === 'Rejected' && <XCircle className="w-5 h-5 text-rose-500" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-ink-black dark:text-pearl text-sm">{req.type}</h4>
                                                    <div className="text-xs text-silver-mist mt-0.5">{req.startDate} - {req.endDate} &bull; {req.days} Days</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xs font-bold text-ink-black dark:text-pearl">{req.status}</div>
                                                    <div className="text-[10px] text-silver-mist">By {req.approver}</div>
                                                </div>
                                                <button className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-silver-mist text-sm">
                                    No leave requests found.
                                </div>
                            )}
                            <button className="w-full py-3 text-xs font-bold text-silver-mist hover:text-celestial-indigo border-t border-cloud dark:border-nebula-purple/20 transition-colors">
                                View Full History
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Public Holidays */}
                    <div>
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Upcoming Holidays</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                                <div className="text-xs font-medium opacity-80 mb-1">Dec 25, 2024</div>
                                <div className="font-bold text-lg">Christmas Day</div>
                                <div className="mt-4 text-xs bg-white/20 inline-block px-2 py-1 rounded">Wednesday</div>
                            </div>
                            <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-slate-800 h-12 w-12 rounded-lg flex flex-col items-center justify-center text-ink-black dark:text-pearl border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Jan</span>
                                    <span className="text-lg font-bold">01</span>
                                </div>
                                <div>
                                    <div className="font-bold text-ink-black dark:text-pearl">New Year&apos;s Day</div>
                                    <div className="text-xs text-silver-mist">Wednesday</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Team Availability */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                Who&apos;s Away
                            </h3>
                            <button className="text-[10px] font-bold text-celestial-indigo hover:underline">View Calendar</button>
                        </div>
                        <div className="space-y-4">
                            {teamAway.length > 0 ? (
                                teamAway.map((person, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {person.avatar}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{person.name}</div>
                                            <div className="text-xs text-rose-500 font-medium">Out {person.date}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-silver-mist italic">Everyone is working today.</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Apply Widget */}
                    <div className="bg-gradient-to-br from-celestial-indigo to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Need a break?</h3>
                        <p className="text-indigo-100 text-xs mb-6">Plan your holidays early to ensure approval.</p>

                        <div className="space-y-3">
                            <div className="bg-white/10 rounded-lg p-3 text-sm flex justify-between items-center cursor-pointer hover:bg-white/20 transition-colors">
                                <span>Select Dates</span>
                                <Calendar className="w-4 h-4 text-indigo-200" />
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 text-sm flex justify-between items-center cursor-pointer hover:bg-white/20 transition-colors">
                                <span>Leave Type</span>
                                <ChevronDown className="w-4 h-4 text-indigo-200" />
                            </div>
                            <button className="w-full py-2 bg-white text-celestial-indigo font-bold text-sm rounded-lg shadow-sm hover:bg-indigo-50 transition-colors">
                                Request Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
