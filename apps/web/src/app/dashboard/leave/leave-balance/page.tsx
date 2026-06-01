"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Search,
    Download,
    Loader2
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
            setBalances(result);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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
                            <th className="px-6 py-4 text-center">Leave Type</th>
                            <th className="px-6 py-4 text-center">Opening</th>
                            <th className="px-6 py-4 text-center">Accrued</th>
                            <th className="px-6 py-4 text-center">Availed</th>
                            <th className="px-6 py-4 text-center">Available Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading leave balances...
                                    </div>
                                </td>
                            </tr>
                        ) : balances.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No leave balances found.
                                </td>
                            </tr>
                        ) : balances.map((bal, i) => {
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
                                                <div className="text-xs text-slate-500">{bal.financialYear}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.leaveTypeName || bal.leaveTypeId}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.openingBalance ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.accrued ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                                        {bal.availed ?? 0}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold">
                                            {bal.availableBalance ?? 0} Days
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

