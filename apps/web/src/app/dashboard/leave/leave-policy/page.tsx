"use client";

import React, { useState } from 'react';
import {
    BookOpen,
    ShieldCheck,
    Users,
    Clock
} from 'lucide-react';

export default function LeavePolicyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Leave Policy
                    </h1>
                    <p className="text-slate-500 text-sm">Define accrual rules and policy assignments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { policy: 'Standard Full-Time', group: 'All Permanent', accrual: '1.5 days/month', proB: 'Confirmed Only' },
                    { policy: 'Executive Policy', group: 'Management', accrual: '2.5 days/month', proB: 'Day 1' },
                    { policy: 'Contractor Policy', group: 'Contractors', accrual: '0 days (Unpaid Only)', proB: 'N/A' },
                    { policy: 'Intern Policy', group: 'Interns', accrual: '1 day/month', proB: 'Day 1' },
                ].map((pol, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{pol.policy}</h3>
                            <button className="text-sm font-bold text-slate-500 hover:underline">Edit</button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <Users className="w-4 h-4" /> Assigned Group
                                </span>
                                <span className="font-bold text-sm">{pol.group}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <Clock className="w-4 h-4" /> Accrual Rate
                                </span>
                                <span className="font-bold text-sm">{pol.accrual}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <ShieldCheck className="w-4 h-4" /> Eligibility
                                </span>
                                <span className="font-bold text-sm">{pol.proB}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
