"use client";

import React, { useState } from 'react';
import {
    PieChart,
    Search,
    UserCircle,
    Download
} from 'lucide-react';

export default function LeaveBalancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Leave Balance
                    </h1>
                    <p className="text-slate-500 text-sm">View and adjust employee leave balances.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <Download className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4 text-center">Annual (AL)</th>
                            <th className="px-6 py-4 text-center">Sick (SL)</th>
                            <th className="px-6 py-4 text-center">Casual (CL)</th>
                            <th className="px-6 py-4 text-center">Comp-Off</th>
                            <th className="px-6 py-4 text-center">Total Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'John Doe', dept: 'Engineering', img: 'JD', al: 12, sl: 5, cl: 2, comp: 0, total: 19 },
                            { name: 'Jane Smith', dept: 'Marketing', img: 'JS', al: 8, sl: 8, cl: 4, comp: 1, total: 21 },
                            { name: 'Robert Fox', dept: 'Sales', img: 'RF', al: 20, sl: 2, cl: 0, comp: 5, total: 27 },
                            { name: 'Emily Davis', dept: 'HR', img: 'ED', al: 15, sl: 6, cl: 1, comp: 0, total: 22 },
                        ].map((emp, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {emp.img}
                                        </div>
                                        <div>
                                            <div className="font-bold">{emp.name}</div>
                                            <div className="text-xs text-slate-500">{emp.dept}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{emp.al}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{emp.sl}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{emp.cl}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{emp.comp}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold">
                                        {emp.total} Days
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
