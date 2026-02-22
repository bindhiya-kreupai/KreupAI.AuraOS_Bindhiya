"use client";

import React, { useState } from 'react';
import {
    Landmark,
    ArrowRightLeft,
    CreditCard,
    DollarSign
} from 'lucide-react';

export default function BankingOperationsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-indigo-500" />
                        Banking Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor core banking transactions, liquidity, and branches.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" /> New Transfer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Liquidity</div>
                    <div className="text-3xl font-bold text-indigo-600">$42.5M</div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">↑ 2.4% vs yesterday</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Loans</div>
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">$128M</div>
                    <div className="text-xs text-slate-400 mt-1">1,240 Active Accounts</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Daily Transactions</div>
                    <div className="text-3xl font-bold text-emerald-600">14.2k</div>
                    <div className="text-xs text-slate-400 mt-1">Avg Vol: $2.4M/hr</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { id: 'TXN-998234', type: 'Wire Transfer', amount: '$12,500.00', status: 'Completed', date: '2 mins ago' },
                                { id: 'TXN-998235', type: 'Loan Disbursement', amount: '$45,000.00', status: 'Processing', date: '5 mins ago' },
                                { id: 'TXN-998236', type: 'Deposit', amount: '$3,200.00', status: 'Completed', date: '12 mins ago' },
                                { id: 'TXN-998237', type: 'Intl. Transfer', amount: '$8,900.00', status: 'Flagged', date: '15 mins ago' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                                    <td className="px-6 py-4 font-bold">{row.type}</td>
                                    <td className="px-6 py-4 font-mono">{row.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                row.status === 'Flagged' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                            }`}>{row.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

