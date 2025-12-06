"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ExternalLink,
    Building2,
    UserCheck,
    Filter
} from 'lucide-react';

const CHECKS = [
    { id: 1, candidate: 'David Kim', status: 'Clear', type: 'Criminal + Employment', vendor: 'Checkr', completed: '2 days ago' },
    { id: 2, candidate: 'Sarah Connor', status: 'Flagged', type: 'Education', vendor: 'Hireright', completed: 'Yesterday', flag: 'Degree discrepancy' },
    { id: 3, candidate: 'John Doe', status: 'In Progress', type: 'Full Comprehensive', vendor: 'Checkr', completed: 'Est. 2 days' },
];

export default function BackgroundCheckPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Background Verification
                    </h1>
                    <p className="text-slate-500 text-sm">Track BGV status and vendor reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <UserCheck className="w-4 h-4" /> Initiate BGV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
                        <div className="text-xs text-slate-500">Clear Rate</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">3.2 Days</div>
                        <div className="text-xs text-slate-500">Avg. Turnaround</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">2</div>
                        <div className="text-xs text-slate-500">Active Flags</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                            <tr>
                                <th className="p-4">Candidate</th>
                                <th className="p-4">Verification Type</th>
                                <th className="p-4">Vendor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Completion</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {CHECKS.map(check => (
                                <tr key={check.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{check.candidate}</td>
                                    <td className="p-4 text-slate-500">{check.type}</td>
                                    <td className="p-4 text-slate-500 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        {check.vendor}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${check.status === 'Clear' ? 'bg-emerald-100 text-emerald-600' :
                                                    check.status === 'Flagged' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-amber-100 text-amber-600'}
                                            `}>
                                                {check.status}
                                            </span>
                                            {check.status === 'Flagged' && (
                                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs">{check.completed}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1 text-xs justify-end">
                                            View Report <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
