"use client";

import React from 'react';
import {
    Archive,
    RotateCcw,
    Trash,
    Calendar,
    Save
} from 'lucide-react';

export default function DataRetentionPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Archive className="w-6 h-6 text-indigo-500" />
                        Data Retention Policies
                    </h1>
                    <p className="text-slate-500 text-sm">Define how long historical data is stored before auto-archiving or deletion.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Save className="w-4 h-4" /> Update Policies
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 container mx-auto">
                <div className="lg:col-span-2 overflow-y-auto pb-20 space-y-4">
                    {[
                        { module: 'Employee Records (Terminated)', retention: '7 Years', action: 'Archive to Cold Storage' },
                        { module: 'Payroll History', retention: '10 Years', action: 'Archive to Cold Storage' },
                        { module: 'Audit Logs', retention: '1 Year', action: 'Permanent Delete' },
                        { module: 'Chat Logs', retention: '90 Days', action: 'Permanent Delete' },
                        { module: 'Candidate Profiles (Rejected)', retention: '6 Months', action: 'Anonymize' },
                        { module: 'Leave Requests', retention: '3 Years', action: 'Archive to Cold Storage' },
                    ].map((policy, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{policy.module}</h3>
                                <p className="text-sm text-slate-500">Current Policy</p>
                            </div>

                            <div className="flex items-center gap-4 flex-1 w-full relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-center min-w-[100px] z-10">
                                    <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Retain For</span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{policy.retention}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-center min-w-[140px] z-10">
                                    <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Then</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{policy.action}</span>
                                </div>
                            </div>

                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-2">Storage Usage</h3>
                        <div className="w-full bg-white dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-indigo-500 w-[72%] rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-300">
                            <span>720 GB Used</span>
                            <span>1 TB Limit</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">Scheduled Cleanups</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                    <Trash className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Audit Log Purge</div>
                                    <div className="text-xs text-slate-500">Scheduled: Oct 01, 2025</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                    <Archive className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Annual Archive</div>
                                    <div className="text-xs text-slate-500">Scheduled: Dec 31, 2025</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
