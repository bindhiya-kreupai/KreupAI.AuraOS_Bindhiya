"use client";

import React from 'react';
import {
    BarChart2,
    Users,
    MapPin,
    Briefcase
} from 'lucide-react';

export default function PositionAnalyticsPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Position Analytics
                    </h1>
                    <p className="text-slate-500 text-sm">Deep dive into workforce composition and trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> Headcount by Location</h3>
                    <div className="space-y-4">
                        {[
                            { loc: 'New York (HQ)', count: 420, pct: '55%' },
                            { loc: 'London', count: 180, pct: '24%' },
                            { loc: 'Remote', count: 120, pct: '16%' },
                            { loc: 'Singapore', count: 45, pct: '5%' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-bold mb-1">
                                    <span>{item.loc}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: item.pct }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500" /> Hiring Velocity</h3>
                    <div className="h-48 flex items-end gap-2 justify-between px-2">
                        {[4, 6, 8, 5, 9, 12, 15, 10, 8, 14, 18, 20].map((h, i) => (
                            <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-t-lg relative group">
                                <div className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${h * 4}%` }}></div>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold bg-black text-white px-2 py-1 rounded transition-opacity">{h}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold uppercase">
                        <span>Jan</span>
                        <span>Dec</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
