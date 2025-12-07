"use client";

import React from 'react';
import {
    History,
    ArrowRight,
    FileText
} from 'lucide-react';

export default function PolicyUpdatesPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Policy Updates
                    </h1>
                    <p className="text-slate-500 text-sm">Track version history and changelogs.</p>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-6 space-y-12">
                {[
                    { version: 'v2.1', date: 'Oct 24, 2025', title: 'Remote Work Policy Updated', desc: 'Added clauses for international remote work and updated stipend eligibility.', author: 'HR Team' },
                    { version: 'v2.0', date: 'Sep 15, 2025', title: 'IT Security Major Overhaul', desc: 'Complete rewrite of acceptable use policy including AI usage guidelines.', author: 'IT Dept' },
                    { version: 'v1.5', date: 'Aug 01, 2025', title: 'Travel Policy Correction', desc: 'Fixed per-diem rates for NYC and London offices.', author: 'Finance' },
                ].map((update, i) => (
                    <div key={i} className="relative pl-8">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-full"></div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-xs font-bold">{update.version}</span>
                                    <span className="text-xs text-slate-400 font-bold">{update.date}</span>
                                </div>
                                <span className="text-xs text-slate-400">by {update.author}</span>
                            </div>

                            <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-indigo-100">{update.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">{update.desc}</p>

                            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
                                View Changes <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
