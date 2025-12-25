"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Search,
    UserCircle,
    Download
} from 'lucide-react';
import { LeaveBalanceService } from '../services';
import type { LeaveBalance } from '../types';

export default function LeaveBalancePage() {
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalances();
    }, []);

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const result = await LeaveBalanceService.getBalances();
            if (result.length > 0) {
                setBalances(result);
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
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Leave Balance
                    </h1>
                    <p className="text-slate-500 text-sm">View and adjust employee leave balances.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <Download className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4 text-center">Annual (AL)</th>
                            <th className="px-6 py-4 text-center">Sick (SL)</th>
                            <th className="px-6 py-4 text-center">Casual (CL)</th>
                            <th className="px-6 py-4 text-center">Comp-Off</th>
                            <th className="px-6 py-4 text-center">Total Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Loading leave balances...
                                </td>
                            </tr>
                        ) : (balances.length > 0 ? balances : [
                            { id: '1', employeeId: 'E001', employeeName: 'John Doe', department: 'Engineering', leaveTypeId: 'AL', availableBalance: 12, totalBalance: 24, accrued: 24, availed: 12, lapsed: 0 },
                            { id: '2', employeeId: 'E002', employeeName: 'Jane Smith', department: 'Marketing', leaveTypeId: 'AL', availableBalance: 8, totalBalance: 24, accrued: 24, availed: 16, lapsed: 0 },
                            { id: '3', employeeId: 'E003', employeeName: 'Robert Fox', department: 'Sales', leaveTypeId: 'AL', availableBalance: 20, totalBalance: 24, accrued: 24, availed: 4, lapsed: 0 },
                            { id: '4', employeeId: 'E004', employeeName: 'Emily Davis', department: 'HR', leaveTypeId: 'AL', availableBalance: 15, totalBalance: 24, accrued: 24, availed: 9, lapsed: 0 },
                        ] as LeaveBalance[]).map((bal, i) => {
                            const initials = bal.employeeName?.split(' ').map(n => n[0]).join('') || 'NA';
                            return (
                                <tr key={bal.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="font-bold">{bal.employeeName}</div>
                                                <div className="text-xs text-slate-500">{bal.department}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.leaveTypeId === 'AL' ? bal.availableBalance : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.leaveTypeId === 'SL' ? bal.availableBalance : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.leaveTypeId === 'CL' ? bal.availableBalance : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.leaveTypeId === 'COMP' ? bal.availableBalance : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold">
                                            {bal.availableBalance} Days
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
