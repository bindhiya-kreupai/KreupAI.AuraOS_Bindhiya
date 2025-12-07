"use client";

import React, { useState } from 'react';
import {
    Gavel,
    FileText,
    CalendarCheck,
    Briefcase
} from 'lucide-react';

export default function ArbitrationPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-indigo-500" />
                        Arbitration
                    </h1>
                    <p className="text-slate-500 text-sm">Manage cases referred to third-party arbitration.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Case Docket</h3>
                    <div className="space-y-4">
                        {[
                            { case: 'ARB-24-101', title: 'Contract Interpretation - Overtime', status: 'Scheduled', date: 'Dec 10, 2024' },
                            { case: 'ARB-24-102', title: 'Wrongful Termination Appeal', status: 'Briefs Submitted', date: 'Jan 15, 2025' },
                        ].map((c, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">{c.case}</span>
                                        <div className="font-bold">{c.title}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> {c.date}</span>
                                    </div>
                                </div>
                                <span className={`mt-2 md:mt-0 px-2 py-1 rounded text-xs font-bold ${c.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>{c.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Arbitrator Pool</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Hon. J. Smith', winRate: 'Neutral', active: 1 },
                            { name: 'Judge Judy (Ret.)', winRate: 'Company Favorable', active: 0 },
                            { name: 'M. Arbitrator', winRate: 'Union Favorable', active: 1 },
                        ].map((arb, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{arb.name}</div>
                                    <div className="text-xs text-slate-500">{arb.winRate} • {arb.active} Active Cases</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
