"use client";

import React, { useState } from 'react';
import {
    ShieldAlert,
    UserCheck,
    Search,
    Lock
} from 'lucide-react';

export default function SecurityClearancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-indigo-500" />
                        Security Clearance
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor vetting status and access levels.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search personnel..."
                        className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Top Secret', count: 14, color: 'text-rose-500', bg: 'bg-rose-500' },
                    { label: 'Secret', count: 85, color: 'text-amber-500', bg: 'bg-amber-500' },
                    { label: 'Confidential', count: 120, color: 'text-indigo-500', bg: 'bg-indigo-500' },
                    { label: 'Pending Vetting', count: 8, color: 'text-slate-400', bg: 'bg-slate-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
                        <div className="text-sm font-bold text-slate-500 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Active Vetting Cases</h3>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { name: 'Agent Smith', level: 'Top Secret', stage: 'Background Check', updated: '2 days ago', status: 'In Progress' },
                        { name: 'Neo Anderson', level: 'Secret', stage: 'Interview', updated: 'Today', status: 'Action Required' },
                        { name: 'Trinity Moss', level: 'Top Secret', stage: 'Final Adjudication', updated: '1 week ago', status: 'Pending' },
                        { name: 'Morpheus D.', level: 'Confidential', stage: 'Submission', updated: '3 days ago', status: 'In Progress' },
                    ].map((caseItem, i) => (
                        <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">{caseItem.name}</div>
                                    <div className="text-xs text-slate-500">Target: {caseItem.level}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 mt-4 md:mt-0">
                                <div className="min-w-[150px]">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Current Stage</div>
                                    <div className="font-medium text-sm">{caseItem.stage}</div>
                                </div>
                                <div className="min-w-[100px]">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Last Update</div>
                                    <div className="text-sm text-slate-500">{caseItem.updated}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${caseItem.status === 'Action Required' ? 'bg-amber-100 text-amber-600' :
                                        caseItem.status === 'Pending' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>{caseItem.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
