'use client';

import React from 'react';
import { History, GitCommit, GitMerge, RotateCcw } from 'lucide-react';

const HISTORY = [
    { id: 'v1.4', message: 'Updated CFO approval limit', user: 'Admin User', date: '2 hours ago', active: true },
    { id: 'v1.3', message: 'Added Legal review step', user: 'Sarah Connor', date: 'Yesterday', active: false },
    { id: 'v1.2', message: 'Fixed email notification typo', user: 'Admin User', date: '3 days ago', active: false },
    { id: 'v1.1', message: 'Initial Release', user: 'System', date: '1 week ago', active: false },
];

export default function VersionControlPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-slate-500" />
                        Version Control
                    </h1>
                    <p className="text-slate-500 text-sm">Track changes and rollback to previous configurations.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-lg">Expense Approval Workflow History</h2>
                </div>

                <div className="relative p-6">
                    <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

                    <div className="space-y-8">
                        {HISTORY.map((commit, idx) => (
                            <div key={commit.id} className="relative flex items-start gap-6 group">
                                <div className={`z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900 ${commit.active ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 dark:border-slate-600 text-slate-300'}`}>
                                    <GitCommit className="w-3 h-3 fill-current" />
                                </div>

                                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold flex items-center gap-2">
                                            {commit.id}
                                            {commit.active && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Current</span>}
                                        </div>
                                        <div className="text-xs text-slate-400">{commit.date}</div>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{commit.message}</p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">By: {commit.user}</span>
                                        {!commit.active && (
                                            <button className="text-indigo-600 hover:underline flex items-center gap-1">
                                                <RotateCcw className="w-3 h-3" /> Rollback
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
