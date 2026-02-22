"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    Users,
    CheckSquare,
    Clock
} from 'lucide-react';

export default function EventStaffingPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Event Staffing
                    </h1>
                    <p className="text-slate-500 text-sm">Roster staff for upcoming banquets and functions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { event: 'Smith Wedding', date: 'Oct 25', time: '4:00 PM - 12:00 AM', guests: 150, required: 15, filled: 15, status: 'Ready' },
                    { event: 'Tech Corp Gala', date: 'Oct 28', time: '6:00 PM - 10:00 PM', guests: 300, required: 25, filled: 20, status: 'Short Staffed' },
                    { event: 'Charity Auction', date: 'Nov 02', time: '5:00 PM - 11:00 PM', guests: 200, required: 18, filled: 18, status: 'Ready' },
                ].map((evt, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase">Banquet</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${evt.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>{evt.status}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{evt.event}</h3>
                        <div className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                            <CalendarDays className="w-4 h-4" /> {evt.date} • {evt.time}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Staffing Level</span>
                                <span className="font-bold">{evt.filled}/{evt.required}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${evt.filled >= evt.required ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${(evt.filled / evt.required) * 100}%` }}
                                ></div>
                            </div>
                            <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Manage Roster</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

