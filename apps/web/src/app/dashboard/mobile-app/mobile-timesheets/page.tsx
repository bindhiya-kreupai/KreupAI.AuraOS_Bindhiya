"use client";

import React, { useState } from 'react';
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Smartphone,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Copy
} from 'lucide-react';

export default function MobileTimesheetsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Mobile Timesheets
                    </h1>
                    <p className="text-slate-500 text-sm">Review time entries submitted from mobile devices.</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-3 font-medium text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Today, Mar 15
                    </div>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Total Hours</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">142<span className="text-sm text-slate-400">h</span></div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">On-Time</div>
                    <div className="text-2xl font-bold text-emerald-600">94%</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Overtime</div>
                    <div className="text-2xl font-bold text-amber-600">12<span className="text-sm text-amber-400/80">h</span></div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Pending</div>
                    <div className="text-2xl font-bold text-indigo-600">8</div>
                </div>
            </div>

            {/* Timeline View */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="font-bold text-lg mb-6">Daily Activity Log</h2>

                <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {[
                        { name: 'Alice Johnson', role: 'Field Technician', av: 'AJ', start: '08:00 AM', end: '05:00 PM', duration: '9h', project: 'Site Maintenance A', device: 'iOS 17.2', location: 'Brooklyn, NY' },
                        { name: 'Bob Smith', role: 'Sales rep', av: 'BS', start: '08:30 AM', end: '04:30 PM', duration: '8h', project: 'Client Visits', device: 'Android 14', location: 'Jersey City, NJ' },
                        { name: 'Charlie Brown', role: 'Logistics', av: 'CB', start: '09:00 AM', end: 'Running', duration: '5h 15m', project: 'Delivery Route 4', device: 'iOS 16.5', location: 'Queens, NY' },
                    ].map((entry, i) => (
                        <div key={i} className="relative flex items-center gap-6 group">
                            <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 z-10"></div>

                            <div className="w-16 text-right text-sm font-medium text-slate-500 pt-1 shrink-0">
                                {entry.start}
                            </div>

                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            {entry.av}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{entry.name}</div>
                                            <div className="text-xs text-slate-500">{entry.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${entry.end === 'Running' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                            {entry.duration}
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {entry.start} - {entry.end}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Copy className="w-3.5 h-3.5" />
                                        {entry.project}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {entry.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Smartphone className="w-3.5 h-3.5" />
                                        {entry.device}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
