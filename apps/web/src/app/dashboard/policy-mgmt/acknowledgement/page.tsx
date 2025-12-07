"use client";

import React from 'react';
import {
    CheckSquare,
    Search,
    Download,
    AlertCircle
} from 'lucide-react';

export default function AcknowledgementPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-indigo-500" />
                        Acknowledgement Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor employee signatures and compliance status.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="text-3xl font-black text-emerald-600">85%</div>
                    <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Compliant</div>
                </div>
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                    <div className="text-3xl font-black text-amber-600">12%</div>
                    <div className="text-sm font-bold text-amber-800 dark:text-amber-400">Pending > 7 Days</div>
                </div>
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <div className="text-3xl font-black text-rose-600">3%</div>
                    <div className="text-sm font-bold text-rose-800 dark:text-rose-400">Non-Compliant</div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search employee..." className="bg-transparent outline-none text-sm flex-1" />
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Policy</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Signed Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'John Doe', policy: 'Code of Conduct 2025', status: 'Signed', date: 'Oct 25, 2025' },
                            { name: 'Sarah Connor', policy: 'IT Security', status: 'Pending', date: '-' },
                            { name: 'Mike Ross', policy: 'Remote Work', status: 'Overdue', date: '-' },
                            { name: 'Harvey Specter', policy: 'Code of Conduct 2025', status: 'Signed', date: 'Oct 24, 2025' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{row.name}</td>
                                <td className="px-6 py-4 text-slate-500">{row.policy}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Signed' ? 'bg-emerald-100 text-emerald-600' :
                                            row.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                        }`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-500">{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
