"use client";

import React, { useState } from 'react';
import {
    ArrowRightCircle,
    Archive,
    AlertCircle
} from 'lucide-react';

export default function CarryForwardPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightCircle className="w-6 h-6 text-indigo-500" />
                        Carry Forward
                    </h1>
                    <p className="text-slate-500 text-sm">Manage annual leave balances carried over to the next year.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Year-End Processing (2024 to 2025)</h3>

                <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-6">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200">Policy Limit</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Maximum carry forward limit is <strong>10 days</strong> for Annual Leave. Any excess balance will lapse on Dec 31st.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Current Balance (2024)</th>
                                <th className="px-6 py-4">Carry Forward (2025)</th>
                                <th className="px-6 py-4">Lapsed Days</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'John Doe', bal: 15, carry: 10, lapse: 5, status: 'Pending' },
                                { name: 'Jane Smith', bal: 8, carry: 8, lapse: 0, status: 'Processed' },
                                { name: 'Mike Ross', bal: 22, carry: 10, lapse: 12, status: 'Pending' },
                            ].map((emp, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{emp.name}</td>
                                    <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">{emp.bal}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">{emp.carry}</td>
                                    <td className="px-6 py-4 font-bold text-rose-600">{emp.lapse}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${emp.status === 'Processed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                                            }`}>{emp.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Process All</button>
                </div>
            </div>
        </div>
    );
}
