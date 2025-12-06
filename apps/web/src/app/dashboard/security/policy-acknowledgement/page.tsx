"use client";

import React from 'react';
import {
    BookOpen,
    Users,
    CheckCircle,
    Clock,
    Send,
    FileText,
    Download
} from 'lucide-react';

export default function PolicyAcknowledgementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Policy Acknowledgement
                    </h1>
                    <p className="text-slate-500 text-sm">Track employee signatures on mandatory company policies.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Send className="w-4 h-4" /> Send Reminders
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 container mx-auto">

                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">92%</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Global Compliance</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">45</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Signatures</div>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">6</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Policies</div>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Policy List */}
                <div className="lg:col-span-3 space-y-4 overflow-y-auto pb-20">
                    {[
                        { name: 'IT Acceptable Use Policy v4.0', date: 'Jan 01, 2025', signed: 410, total: 420 },
                        { name: 'Code of Conduct & Ethics', date: 'Jan 01, 2025', signed: 418, total: 420 },
                        { name: 'Remote Work Guidelines', date: 'Mar 12, 2025', signed: 380, total: 420 },
                        { name: 'Data Privacy (GDPR) Addendum', date: 'Feb 15, 2025', signed: 405, total: 420 },
                        { name: 'Anti-Harassment Policy', date: 'Jan 01, 2025', signed: 420, total: 420 },
                    ].map((policy, i) => {
                        const percent = Math.round((policy.signed / policy.total) * 100);
                        return (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{policy.name}</h3>
                                    <p className="text-sm text-slate-500">Effective: {policy.date}</p>
                                </div>

                                <div className="flex-1 w-full md:w-auto">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500">{policy.signed} / {policy.total} Signed</span>
                                        <span className={percent === 100 ? 'text-emerald-600' : 'text-indigo-600'}>{percent}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        View Report
                                    </button>
                                    <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
