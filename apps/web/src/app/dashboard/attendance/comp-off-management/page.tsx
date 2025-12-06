"use client";

import React from 'react';
import {
    Gift,
    Plus,
    History,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function CompOffManagementPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Comp-off Management
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Manage compensatory off credits for weekend work.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Request Credit
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Credit Bank */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col justify-between h-48">
                    <div>
                        <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Comp-off Bank</h3>
                        <p className="text-xs text-silver-mist">Accumulated validity: 60 days</p>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-indigo-600 mb-1">3.0 <span className="text-lg text-slate-500">Days</span></div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-right">1.0 expiring in 12 days</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="col-span-1 lg:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                    <div className="hidden md:block">
                        <Calendar className="w-20 h-20 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Policy Reminder</h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
                            <li>Minimum 4 hours required for half-day credit.</li>
                            <li>Full day credit requires 8+ hours on weekends/holidays.</li>
                            <li>Comp-off leave must be utilized within 60 days of accrual.</li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Ledger */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/50">
                    <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Transaction Ledger
                    </h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                        <tr>
                            <th className="px-6 py-4">Date Worked</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4 text-center">Credit</th>
                            <th className="px-6 py-4 text-center">Expiry</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                        <tr>
                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">Sun, 24 Mar 2025</td>
                            <td className="px-6 py-4 text-slate-500">Project Beta Go-Live Support</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-500">+1.0</td>
                            <td className="px-6 py-4 text-center text-xs text-slate-400">23 May 2025</td>
                            <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Credited</span></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">Sat, 09 Mar 2025</td>
                            <td className="px-6 py-4 text-slate-500">Urgent Client Fixes</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-500">+1.0</td>
                            <td className="px-6 py-4 text-center text-xs text-slate-400">08 May 2025</td>
                            <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Credited</span></td>
                        </tr>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">Mon, 01 Apr 2025</td>
                            <td className="px-6 py-4 text-slate-500">Leave Utilization (Comp-off)</td>
                            <td className="px-6 py-4 text-center font-bold text-rose-500">-1.0</td>
                            <td className="px-6 py-4 text-center text-xs text-slate-400">-</td>
                            <td className="px-6 py-4 text-center"><span className="text-xs font-bold text-slate-500">Utilized</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}
