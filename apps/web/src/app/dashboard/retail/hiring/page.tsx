"use client";

import React from 'react';
import {
    Users,
    Calendar,
    UserPlus,
    FileCheck,
    Truck,
    Clock
} from 'lucide-react';

export default function SeasonalHiringPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-500" />
                        Seasonal Hiring
                    </h1>
                    <p className="text-slate-500 text-sm">Mass onboarding for holiday rush and temporary staffing.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Users className="w-4 h-4" /> Bulk Hire
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Campaigns */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-lg mb-1">Holiday Rush 2024</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" /> Nov 01 - Jan 15 • 45 Temp Staff Needed
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600">32<span className="text-sm text-slate-400">/45</span></div>
                                <div className="text-xs text-slate-400">Hired</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative pt-4">
                                <div className="absolute top-0 left-6 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>
                                {[
                                    { label: 'Applications Received', count: 124, status: 'done' },
                                    { label: 'Group Interviews', count: 85, status: 'done' },
                                    { label: 'Offers Sent', count: 40, status: 'current' },
                                    { label: 'Onboarding Completed', count: 32, status: 'pending' },
                                ].map((step, i) => (
                                    <div key={i} className="relative flex items-center gap-4 mb-6 last:mb-0">
                                        <div className={`w-3 h-3 rounded-full border-2 z-10 
                                            ${step.status === 'done' ? 'bg-indigo-500 border-indigo-500' :
                                                step.status === 'current' ? 'bg-white border-indigo-500 animate-pulse' :
                                                    'bg-white border-slate-300 dark:border-slate-600'}
                                        `}></div>
                                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{step.label}</span>
                                            <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{step.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Fast-Track Onboarding</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                <FileCheck className="w-8 h-8 text-indigo-500 mb-2" />
                                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Digital Contracts</h4>
                                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                                    One-click bulk send for temp contracts.
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                <Clock className="w-8 h-8 text-emerald-500 mb-2" />
                                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">Instant Shifts</h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                                    Auto-assign first week roster upon signing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Candidate Pool */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Top Candidates</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {[
                            { name: 'Liam Neeson', exp: '2 yrs Retail', avail: 'Immediate' },
                            { name: 'Emma Stone', exp: 'Student', avail: 'Evenings' },
                            { name: 'Tom Holland', exp: 'No Exp', avail: 'Weekends' },
                            { name: 'Zendaya C.', exp: '3 yrs Sales', avail: 'Full-time' },
                        ].map((c, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group cursor-pointer hover:border-indigo-500 transition-colors">
                                <div>
                                    <div className="font-bold text-sm">{c.name}</div>
                                    <div className="text-xs text-slate-500">{c.exp}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded mb-1">{c.avail}</div>
                                    <div className="text-xs text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Hire</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-600 hover:shadow-lg transition-all">
                        View All Applicants
                    </button>
                </div>
            </div>
        </div>
    );
}
