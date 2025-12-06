"use client";

import React from 'react';
import {
    History,
    Calendar,
    ArrowUpCircle,
    MapPin,
    Briefcase
} from 'lucide-react';

export default function EmploymentHistoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Employment History
                    </h1>
                    <p className="text-slate-500 text-sm">Timeline of role changes, promotions, and transfers.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img src="https://i.pravatar.cc/150?u=a" alt="Employee" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Alice Cooper</h2>
                        <div className="text-slate-500">EMP-0042 • Design Department</div>
                    </div>
                </div>

                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-12">
                    {[
                        { date: 'Oct 2023 - Present', role: 'Senior Product Designer', type: 'Promotion', desc: 'Promoted to Senior level. Managing a team of 2 designers.', color: 'border-emerald-500 text-emerald-600', icon: ArrowUpCircle },
                        { date: 'Jan 2022 - Sep 2023', role: 'Product Designer', type: 'Transfer', desc: 'Transferred from London to San Francisco HQ.', color: 'border-indigo-500 text-indigo-600', icon: MapPin },
                        { date: 'Jun 2020 - Dec 2021', role: 'UI/UX Designer', type: 'New Hire', desc: 'Joined the company as a mid-level designer.', color: 'border-slate-400 text-slate-500', icon: Briefcase },
                    ].map((event, i) => (
                        <div key={i} className="relative pl-8">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 ${event.color} z-10`}></div>

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{event.role}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Calendar className="w-4 h-4" /> {event.date}
                                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                        <span className={`font-bold ${event.color.split(' ')[1]}`}>{event.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {event.desc}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${event.color.split(' ')[1]}`}>
                                    <event.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
