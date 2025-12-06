"use client";

import React from 'react';
import {
    Wallet,
    Plus,
    FileText,
    History,
    AlertTriangle,
    Banknote
} from 'lucide-react';

export default function PettyCashPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-indigo-500" />
                        Petty Cash Manager
                    </h1>
                    <p className="text-slate-500 text-sm">Manage small daily expenses and cash vouchers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                        <Banknote className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold text-emerald-600 uppercase">Cash on Hand</span>
                            <span className="font-black text-lg text-emerald-700 dark:text-emerald-500">$450.00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Transaction Log */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Transaction Log</h3>
                        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                            <History className="w-3 h-3" /> View History
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Requested By</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { date: 'Today, 10:30 AM', desc: 'Office Snacks', by: 'Sarah J.', amount: -25.00, status: 'Approved' },
                                    { date: 'Yesterday, 4:15 PM', desc: 'Taxi Fare', by: 'Mike R.', amount: -18.50, status: 'Approved' },
                                    { date: 'Dec 01, 9:00 AM', desc: 'Replenishment', by: 'Finance', amount: +500.00, status: 'Credit' },
                                    { date: 'Nov 30, 2:00 PM', desc: 'Client Lunch', by: 'John D.', amount: -45.00, status: 'Pending' },
                                ].map((tx, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-slate-500 text-xs">{tx.date}</td>
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{tx.desc}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{tx.by}</td>
                                        <td className={`p-4 font-mono font-bold text-right ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${tx.status === 'Credit' ? 'bg-emerald-100 text-emerald-600' :
                                                    tx.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'}
                                            `}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Voucher Side Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" /> New Cash Voucher
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Amount Needed</label>
                            <input type="number" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none focus:border-indigo-500" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                            <textarea className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none resize-none h-24" placeholder="Brief description..."></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Proof Image (Optional)</label>
                            <div className="mt-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center text-slate-400 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                Upload Receipt
                            </div>
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl flex gap-3 items-start mt-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-tight">
                                Amounts over $50 require manager approval before disbursement.
                            </p>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Create Voucher
                    </button>
                </div>
            </div>
        </div>
    );
}
