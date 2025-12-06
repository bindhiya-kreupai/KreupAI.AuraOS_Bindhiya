"use client";

import React, { useState } from 'react';
import {
    Scale,
    AlertTriangle,
    Clock,
    Gavel,
    FileText,
    Users,
    MoreHorizontal
} from 'lucide-react';

const CASES = [
    { id: 'LIT-2024-001', title: 'Smith vs Company', type: 'Labor Dispute', status: 'In Progress', court: 'District Court', nextDate: 'Dec 20, 2024' },
    { id: 'LIT-2023-015', title: 'Patent Infringement', type: 'IP', status: 'On Hold', court: 'High Court', nextDate: 'Jan 15, 2025' },
];

export default function LitigationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Litigation Tracker
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor court cases, legal notices, and hearings.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <Gavel className="w-4 h-4" /> Add Case
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Case List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Active Cases</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {CASES.map(c => (
                            <div key={c.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.title}</h4>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">{c.id}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Gavel className="w-3 h-3" /> {c.court}</span>
                                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {c.type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Next Hearing</div>
                                        <div className="font-bold text-sm text-indigo-600">{c.nextDate}</div>
                                    </div>
                                    <div className="px-3 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold uppercase">
                                        {c.status}
                                    </div>
                                    <button className="text-slate-400 hover:text-indigo-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notices & Alerts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" /> Assessment Risks
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl">
                            <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm mb-2">High Risk: Labor Compliance</h4>
                            <p className="text-xs text-rose-700 dark:text-rose-300 mb-3">
                                Recent changes in state labor laws may affect pending dispute cases in District Court.
                            </p>
                            <button className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-colors">
                                Review Impact
                            </button>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                            <h4 className="font-bold text-sm mb-3">Recent Legal Notices</h4>
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">Notice of Demand - Vendor X</div>
                                            <div className="text-xs opacity-70">Received 2 days ago</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
