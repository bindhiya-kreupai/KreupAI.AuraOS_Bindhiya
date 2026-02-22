"use client";

import React, { useState } from 'react';
import {
    DollarSign,
    Users,
    Wallet,
    PieChart
} from 'lucide-react';

export default function TipManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-indigo-500" />
                        Tip Management
                    </h1>
                    <p className="text-slate-500 text-sm">Distribute gratuities fairly and transparently.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Process Payout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Daily Pool (Today)</h3>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="text-5xl font-bold text-emerald-600 mb-2">$3,450.00</div>
                        <div className="text-sm text-slate-500">Collected from Cash & Card</div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Credit Card Tips</span>
                            <span className="font-bold">$2,850.00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Cash Tips Declared</span>
                            <span className="font-bold">$600.00</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Distribution Preview</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Points</th>
                                    <th className="px-4 py-3">Staff Count</th>
                                    <th className="px-4 py-3">Share %</th>
                                    <th className="px-4 py-3 text-right">Per Person</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { role: 'Server', points: 10, count: 12, share: '60%', per: '$172.50' },
                                    { role: 'Bartender', points: 8, count: 4, share: '16%', per: '$138.00' },
                                    { role: 'Busser', points: 5, count: 6, share: '15%', per: '$86.25' },
                                    { role: 'Host', points: 3, count: 3, share: '9%', per: '$51.75' },
                                ].map((group, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 font-bold">{group.role}</td>
                                        <td className="px-4 py-3">{group.points}</td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {group.count}
                                        </td>
                                        <td className="px-4 py-3">{group.share}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{group.per}</td>
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

