"use client";

import React, { useState, useEffect } from 'react';
import {
    Banknote,
    Wallet,
    History,
    CheckCircle2
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
            if (result.length > 0) {
                setEncashments(result);
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
                        <Banknote className="w-6 h-6 text-indigo-500" />
                        Leave Encashment
                    </h1>
                    <p className="text-slate-500 text-sm">Request payment for unused annual leave days.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Encashable Balance</h3>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-32 h-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-indigo-600">12</span>
                            <span className="text-xs text-slate-500">Days</span>
                        </div>
                        <p className="text-center text-sm text-slate-500">
                            You can encash up to <span className="font-bold text-slate-700 dark:text-slate-300">10 days</span> this year based on company policy.
                        </p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                        <div className="text-xs font-bold text-indigo-600 mb-1">Estimated Payout</div>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">$3,450.00</div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Encashment History</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">
                                Loading encashment history...
                            </div>
                        ) : (encashments.length > 0 ? encashments : [
                            { id: '1', employeeId: 'E001', employeeName: 'Current User', year: 2023, daysEncashed: 8, amountPerDay: 350, totalAmount: 2800, requestedDate: '2023-12-15', status: 'approved' as const },
                            { id: '2', employeeId: 'E001', employeeName: 'Current User', year: 2022, daysEncashed: 5, amountPerDay: 330, totalAmount: 1650, requestedDate: '2022-12-20', status: 'approved' as const },
                        ] as LeaveEncashment[]).map((req, i) => {
                            const requestDate = new Date(req.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                            return (
                                <div key={req.id || i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="font-bold text-lg">{req.year} Year-End</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <History className="w-3 h-3" /> Requested on {requestDate}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-600">${req.totalAmount.toFixed(2)}</div>
                                        <div className="text-xs font-bold text-slate-400">{req.daysEncashed} Days Encashed</div>
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
