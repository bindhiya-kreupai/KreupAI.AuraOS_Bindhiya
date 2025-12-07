"use client";

import React, { useState } from 'react';
import {
    Banknote,
    Wallet,
    History,
    CheckCircle2
} from 'lucide-react';

export default function LeaveEncashmentPage() {
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
                        {[
                            { year: '2023', date: 'Dec 15, 2023', days: 8, amount: '$2,800.00', status: 'Paid' },
                            { year: '2022', date: 'Dec 20, 2022', days: 5, amount: '$1,650.00', status: 'Paid' },
                        ].map((req, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-lg">{req.year} Year-End</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <History className="w-3 h-3" /> Requested on {req.date}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">{req.amount}</div>
                                    <div className="text-xs font-bold text-slate-400">{req.days} Days Encashed</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
