"use client";

import React, { useState } from 'react';
import {
    PiggyBank,
    TrendingUp,
    Calculator,
    PieChart
} from 'lucide-react';

export default function PensionSchemePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-indigo-500" />
                        Pension Scheme
                    </h1>
                    <p className="text-slate-500 text-sm">Manage retirement benefits and fund performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-500">Fund Performance (YTD)</div>
                            <div className="text-2xl font-bold text-emerald-600">+8.4%</div>
                        </div>
                    </div>
                    <div className="h-32 flex items-end gap-1">
                        {[40, 45, 42, 50, 48, 55, 60, 58, 65, 70, 75, 84].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-100 dark:bg-indigo-900/20 rounded-t hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors relative group">
                                <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t" style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Total Assets</h3>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">$485.2M</div>

                    <div className="space-y-4">
                        {[
                            { label: 'Equities', val: '60%', color: 'bg-indigo-500' },
                            { label: 'Bonds', val: '30%', color: 'bg-emerald-500' },
                            { label: 'Real Estate', val: '6%', color: 'bg-amber-500' },
                            { label: 'Cash', val: '4%', color: 'bg-slate-400' },
                        ].map((asset, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{asset.label}</span>
                                    <span className="font-bold">{asset.val}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${asset.color}`} style={{ width: asset.val }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Benefit Calculator</h3>
                        <p className="text-indigo-100 text-sm mb-6">Estimate retirement benefits based on years of service and final salary.</p>
                    </div>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                        Launch Tool
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Recent Disbursements</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Beneficiary</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'Robert Paulson', id: 'RET-8842', type: 'Monthly Pension', date: 'Oct 01, 2024', amount: '$3,450.00' },
                            { name: 'Marla Singer', id: 'RET-9921', type: 'Lump Sum', date: 'Sep 28, 2024', amount: '$15,000.00' },
                            { name: 'Tyler Durden', id: 'RET-1102', type: 'Disability', date: 'Oct 01, 2024', amount: '$4,200.00' },
                        ].map((tx, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold">{tx.name}</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{tx.id}</td>
                                <td className="px-6 py-4">{tx.type}</td>
                                <td className="px-6 py-4">{tx.date}</td>
                                <td className="px-6 py-4 font-bold text-right">{tx.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

