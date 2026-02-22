"use client";

import React from 'react';
import {
    Snowflake,
    PlayCircle,
    AlertOctagon,
    Search
} from 'lucide-react';

export default function PositionFreezePage() {
    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Snowflake className="w-6 h-6 text-indigo-500" />
                        Position Freeze
                    </h1>
                    <p className="text-slate-500 text-sm">Suspend hiring for specific roles or departments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 uppercase text-xs">Frozen Positions (5)</h3>
                    {[
                        { title: 'Junior Graphic Designer', dept: 'Marketing', reason: 'Budget Re-evaluation', date: 'Oct 01, 2025' },
                        { title: 'Sales Associate - EMEA', dept: 'Sales', reason: 'Market Slowdown', date: 'Sep 24, 2025' },
                        { title: 'Recruiter', dept: 'HR', reason: 'Hiring Goal Met', date: 'Sep 15, 2025' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-300 transition-colors">
                            <div>
                                <h4 className="font-bold">{item.title}</h4>
                                <div className="text-xs text-slate-500 mt-1">{item.dept} • Frozen since {item.date}</div>
                                <div className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3" /> {item.reason}
                                </div>
                            </div>
                            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all" title="Unfreeze">
                                <PlayCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="font-bold text-xl text-indigo-900 dark:text-indigo-100 mb-4">Freeze Hiring</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-6">Select a department or specific roles to suspend recruitment. This will remove open listings from the Job Board.</p>

                    <div className="space-y-4">
                        <select className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>Select Department...</option>
                            <option>Entire Company (Emergency)</option>
                            <option>Engineering</option>
                            <option>Sales</option>
                        </select>
                        <textarea className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24" placeholder="Reason for freeze..."></textarea>
                        <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                            Confirm Freeze
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

