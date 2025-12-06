"use client";

import React from 'react';
import {
    Clock,
    MapPin,
    AlertCircle,
    CalendarCheck,
    ArrowRight
} from 'lucide-react';

export default function AttendanceViewPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Attendance View
                    </h1>
                    <p className="text-slate-500 text-sm">Review your daily logs, punch times, and attendance status.</p>
                </div>
            </div>

            {/* Today's Status */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-2xl mb-1">Good Afternoon, Alex!</h2>
                    <p className="text-indigo-100 text-sm mb-6">You checked in at 09:15 AM today.</p>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-indigo-200 mb-1">Total Hours</span>
                            <span className="text-3xl font-bold font-mono">05:42</span>
                        </div>
                        <div className="h-10 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-indigo-200 mb-1">Status</span>
                            <span className="px-2 py-0.5 bg-white/20 rounded text-sm font-bold text-center">Present</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-64">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Check In</span>
                            <span className="font-bold">09:15 AM</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 opacity-50">
                            <span>Check Out</span>
                            <span className="font-bold">--:--</span>
                        </div>
                        <div className="pt-2 border-t border-white/10 text-xs flex items-center gap-1 opacity-75">
                            <MapPin className="w-3 h-3" /> Office (HQ) - 6th Floor
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Calendar View (Simplified) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">December 2023 Log</h3>
                    <div className="flex gap-2 text-xs font-bold">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</div>
                    </div>
                </div>

                <div className="space-y-2">
                    {[
                        { date: 'Dec 05', in: '09:00 AM', out: '06:05 PM', hours: '09:05', status: 'Present', color: 'text-emerald-500' },
                        { date: 'Dec 04', in: '09:15 AM', out: '06:10 PM', hours: '08:55', status: 'Late', color: 'text-amber-500' },
                        { date: 'Dec 03', in: '--:--', out: '--:--', hours: '00:00', status: 'Week Off', color: 'text-slate-400' },
                        { date: 'Dec 02', in: '--:--', out: '--:--', hours: '00:00', status: 'Week Off', color: 'text-slate-400' },
                        { date: 'Dec 01', in: '09:05 AM', out: '05:55 PM', hours: '08:50', status: 'Present', color: 'text-emerald-500' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 border-dashed">
                            <div className="flex items-center gap-4 w-32">
                                <CalendarCheck className={`w-4 h-4 ${log.color}`} />
                                <span className="font-bold">{log.date}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-3 text-center text-sm font-mono text-slate-600 dark:text-slate-400">
                                <span>{log.in}</span>
                                <span>{log.out}</span>
                                <span>{log.hours}</span>
                            </div>
                            <div className={`w-24 text-right text-xs font-bold uppercase ${log.color}`}>
                                {log.status}
                            </div>
                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg ml-4 text-slate-400">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-700 dark:text-amber-300">Missing an Entry?</h4>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400">If you forgot to punch in/out, submit a Regularization Request within 48 hours to avoid loss of pay.</p>
                </div>
            </div>
        </div>
    );
}
