"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    Calendar,
    DollarSign,
    UserPlus
} from 'lucide-react';

export default function LocumManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Locum Management
                    </h1>
                    <p className="text-slate-500 text-sm">Fill temporary vacancies and manage agency staff.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Request Locum
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Open Shifts</h3>
                    <div className="space-y-4">
                        {[
                            { role: 'ER Physician', date: 'Oct 18, Night Shift', rate: '$150/hr', status: 'Unfilled' },
                            { role: 'Pediatric Nurse', date: 'Oct 19, Day Shift', rate: '$65/hr', status: 'filled' },
                            { role: 'Anesthesiologist', date: 'Oct 20, On-Call', rate: '$200/hr', status: 'Unfilled' },
                        ].map((shift, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{shift.role}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        <Calendar className="w-3 h-3" /> {shift.date}
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                        <DollarSign className="w-3 h-3" /> {shift.rate}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${shift.status === 'filled' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>{shift.status === &apos;filled' ? 'Filled' : 'Posting'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Agency Stats</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-500">Monthly Budget Usage</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">$45,000 / $60,000</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[75%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-500">Top Agency: MedStaff Pro</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">85% Fill Rate</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
