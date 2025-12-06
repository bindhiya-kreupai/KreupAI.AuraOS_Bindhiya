"use client";

import React from 'react';
import {
    Home,
    Calendar,
    Plus,
    Monitor,
    Coffee,
    Wifi
} from 'lucide-react';

export default function WorkFromHomePage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Home className="w-6 h-6 text-indigo-500" />
                        Work From Home
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Apply for remote work days and track your WFH balance.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Apply for WFH
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wifi className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 font-medium mb-1">Available Balance</p>
                        <h2 className="text-4xl font-bold mb-4">4 Days</h2>
                        <div className="flex gap-4 text-sm text-indigo-100">
                            <div>
                                <span className="block font-bold text-white">2</span> used this month
                            </div>
                            <div>
                                <span className="block font-bold text-white">8</span> yearly cap
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Upcoming WFH</h3>
                        <p className="text-emerald-500 font-bold">Thu, 04 Apr</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-ink-black dark:text-pearl">Pending Approval</h3>
                        <p className="text-amber-500 font-bold">Fri, 12 Apr</p>
                    </div>
                </div>

            </div>

            {/* Calendar View (Mock) */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6">
                <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" /> April 2025
                </h3>

                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="font-bold text-slate-400 py-2">{d}</div>
                    ))}
                    {/* Days Mock */}
                    {Array.from({ length: 30 }).map((_, i) => {
                        const day = i + 1;
                        let status = '';
                        if (day === 4) status = 'wfh';
                        if (day === 12) status = 'pending';
                        if (day > 30) return null;

                        return (
                            <div key={day} className={`
                                h-24 border border-slate-100 dark:border-slate-800 rounded-lg p-2 text-left relative group hover:border-indigo-200 transition-all
                                ${status === 'wfh' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
                                ${status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                            `}>
                                <span className={`font-bold ${status ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                                {status === 'wfh' && (
                                    <div className="mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">Thinking Time</div>
                                )}
                                {status === 'pending' && (
                                    <div className="mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Personal</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
