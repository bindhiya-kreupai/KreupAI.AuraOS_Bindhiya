"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Banknote,
    Wallet,
    History,
    Loader2
} from 'lucide-react';
import { EncashmentService } from '../services';
import type { LeaveEncashment } from '../types';

export default function LeaveEncashmentPage() {
    const [encashments, setEncashments] = useState<LeaveEncashment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEncashments();
    }, []);

    const fetchEncashments = async () => {
        try {
            setLoading(true);
            const result = await EncashmentService.getEncashments();
            setEncashments(result);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Compute summary from encashments data
    const summary = useMemo(() => {
        const totalDaysEncashed = encashments.reduce((sum, e) => sum + (e.daysToEncash ?? 0), 0);
        const totalAmount = encashments.reduce((sum, e) => sum + (e.totalAmount ?? 0), 0);
        return { totalDaysEncashed, totalAmount };
    }, [encashments]);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-indigo-500" />
                        Leave Encashment
                    </h1>
                    <p className="text-slate-500 text-sm">Request payment for unused annual leave days.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Encashment Summary</h3>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-32 h-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-indigo-600">
                                {loading ? '...' : summary.totalDaysEncashed}
                            </span>
                            <span className="text-xs text-slate-500">Days Encashed</span>
                        </div>
                        <p className="text-center text-sm text-slate-500">
                            Total days encashed across all requests.
                        </p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                        <div className="text-xs font-bold text-indigo-600 mb-1">Total Payout</div>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            {loading ? '...' : `$${summary.totalAmount.toFixed(2)}`}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Encashment History</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading encashment history...
                            </div>
                        ) : encashments.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No encashment records found.
                            </div>
                        ) : encashments.map((req, i) => {
                            const requestDate = new Date(req.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                            return (
                                <div key={req.id || i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="font-bold text-lg">{req.financialYear} Year-End</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <History className="w-3 h-3" /> Requested on {requestDate}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-600">${(req.totalAmount ?? 0).toFixed(2)}</div>
                                        <div className="text-xs font-bold text-slate-400">{req.daysToEncash ?? 0} Days @ ${(req.ratePerDay ?? 0).toFixed(2)}/day</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

