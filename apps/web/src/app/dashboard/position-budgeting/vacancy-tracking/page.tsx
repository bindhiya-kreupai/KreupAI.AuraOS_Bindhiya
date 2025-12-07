"use client";

import React from 'react';
import {
    Users,
    Clock,
    AlertTriangle,
    Search
} from 'lucide-react';

export default function VacancyTrackingPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Vacancy Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor open positions and time-to-fill metrics.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-3xl font-black text-indigo-600">14</div>
                    <div className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Open Positions</div>
                </div>
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                    <div className="text-3xl font-black text-amber-600">42 Days</div>
                    <div className="text-sm font-bold text-amber-800 dark:text-amber-400">Avg Time to Fill</div>
                </div>
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <div className="text-3xl font-black text-rose-600">5</div>
                    <div className="text-sm font-bold text-rose-800 dark:text-rose-400">Critical Vacancies (&gt;60 Days)</div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search vacancies..." className="bg-transparent outline-none text-sm flex-1" />
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Position Title</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Days Open</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Candidates</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { title: 'Senior Backend Engineer', dept: 'Engineering', days: 65, status: 'Critical', candidates: 12 },
                            { title: 'Product Manager', dept: 'Product', days: 24, status: 'Active', candidates: 45 },
                            { title: 'HR Coordinator', dept: 'People Ops', days: 5, status: 'Fresh', candidates: 18 },
                            { title: 'Sales Director', dept: 'Sales', days: 89, status: 'Critical', candidates: 4 },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{row.title}</td>
                                <td className="px-6 py-4 text-slate-500">{row.dept}</td>
                                <td className="px-6 py-4 font-mono">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {row.days}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${row.status === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                        row.status === 'Active' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {row.status === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-400">{row.candidates}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
