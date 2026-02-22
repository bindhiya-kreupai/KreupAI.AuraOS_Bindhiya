"use client";

import React, { useState } from 'react';
import {
    Receipt,
    Download,
    History,
    CreditCard
} from 'lucide-react';

export default function UtilityBillingPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Utility Billing
                    </h1>
                    <p className="text-slate-500 text-sm">View invoices, track payments, and analyze costs.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Make Payment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Current Due</h3>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center mb-4">
                        <div className="text-sm text-slate-500 mb-1">Total Outstanding</div>
                        <div className="text-4xl font-bold text-slate-800 dark:text-white">$12,450.00</div>
                        <div className="text-xs text-rose-500 font-bold mt-2">Due Date: Dec 15, 2024</div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex justify-between">
                            <span>Electricity</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">$8,200.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Water</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">$1,850.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Gas</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">$2,400.00</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Billing History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Invoice ID</th>
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { id: 'INV-2024-11', month: 'November 2024', amount: '$11,800.00', status: 'Paid' },
                                    { id: 'INV-2024-10', month: 'October 2024', amount: '$10,500.00', status: 'Paid' },
                                    { id: 'INV-2024-09', month: 'September 2024', amount: '$12,100.00', status: 'Paid' },
                                    { id: 'INV-2024-08', month: 'August 2024', amount: '$13,200.00', status: 'Overdue' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                                        <td className="px-6 py-4 font-bold">{row.month}</td>
                                        <td className="px-6 py-4 font-mono">{row.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    row.status === 'Overdue' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
                                                }`}>{row.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-800">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

