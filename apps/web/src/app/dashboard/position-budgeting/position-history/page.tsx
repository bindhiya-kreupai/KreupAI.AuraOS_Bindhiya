"use client";

import React from 'react';
import {
    History,
    ArrowRight,
    UserPlus,
    UserMinus,
    GitCommit
} from 'lucide-react';

export default function PositionHistoryPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Position History
                    </h1>
                    <p className="text-slate-500 text-sm">Audit trail of all position changes and modifications.</p>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-6 space-y-12">
                {[
                    { type: 'created', title: 'Data Scientist II Created', dept: 'Analytics', date: 'Oct 24, 2025 10:30 AM', user: 'Alex Admin' },
                    { type: 'frozen', title: 'Sales Rep Hiring Frozen', dept: 'Sales', date: 'Oct 23, 2025 04:15 PM', user: 'CFO Office' },
                    { type: 'modified', title: 'Senior Dev Budget Increased', dept: 'Engineering', date: 'Oct 22, 2025 09:00 AM', user: 'Finance Team', details: 'Budget increased from $120k to $135k to match market rate.' },
                    { type: 'closed', title: 'Marketing Intern Position Closed', dept: 'Marketing', date: 'Oct 20, 2025 02:45 PM', user: 'Sarah Manager' },
                ].map((item, i) => (
                    <div key={i} className="relative pl-8">
                        {/* Dot */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${item.type === 'created' ? 'bg-emerald-500' :
                                item.type === 'frozen' ? 'bg-rose-500' :
                                    item.type === 'modified' ? 'bg-amber-500' : 'bg-slate-400'
                            }`}></div>

                        <div className="flex items-start justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${item.type === 'created' ? 'bg-emerald-100 text-emerald-600' :
                                            item.type === 'frozen' ? 'bg-rose-100 text-rose-600' :
                                                item.type === 'modified' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                        }`}>{item.type}</span>
                                    <span className="text-xs text-slate-400 font-bold">{item.date}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{item.title}</h3>
                                {item.details && <p className="text-sm text-slate-500 mt-2 italic">"{item.details}"</p>}
                                <div className="flex gap-4 mt-4 text-xs font-bold text-slate-500">
                                    <span>Dept: {item.dept}</span>
                                    <span>By: {item.user}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
