"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Camera,
    History,
    LogIn,
    LogOut,
    Coffee,
    Wifi
} from 'lucide-react';

export default function TimeCapturePage() {
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState<'OUT' | 'IN' | 'BREAK'>('OUT');

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

            {/* Clock & Action Panel */}
            <div className="flex flex-col gap-6">

                {/* Main Card */}
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                    <div className="mb-2 text-slate-500 dark:text-slate-400 font-medium">
                        {formatDate(time)}
                    </div>
                    <div className="text-6xl font-bold text-ink-black dark:text-pearl font-mono tracking-wider mb-8">
                        {formatTime(time)}
                    </div>

                    <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-700">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Dubai Office HQ</span>
                        <span className="text-xs text-emerald-500 ml-2 font-mono flex items-center gap-1">
                            <Wifi className="w-3 h-3" /> GPS Stable
                        </span>
                    </div>

                    <div className="flex gap-4 w-full">
                        {status === 'OUT' ? (
                            <button
                                onClick={() => setStatus('IN')}
                                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-emerald-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                            >
                                <LogIn className="w-6 h-6" /> Clock In
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setStatus('OUT')}
                                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-lg shadow-rose-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                                >
                                    <LogOut className="w-6 h-6" /> Clock Out
                                </button>
                                {status !== 'BREAK' && (
                                    <button
                                        onClick={() => setStatus('BREAK')}
                                        className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-amber-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Coffee className="w-6 h-6" /> Break
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Selfie Mock */}
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <Camera className="w-4 h-4" /> Selfie Verification Required
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <p className="text-xs text-silver-mist uppercase font-bold">Today's Hours</p>
                        <h3 className="text-2xl font-bold text-indigo-600">04:32</h3>
                        <p className="text-xs text-slate-400">Target: 09:00</p>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <p className="text-xs text-silver-mist uppercase font-bold">Shift End</p>
                        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">06:00 PM</h3>
                        <p className="text-xs text-emerald-500">On Time</p>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <p className="text-xs text-silver-mist uppercase font-bold">Overtime</p>
                        <h3 className="text-2xl font-bold text-amber-500">00:00</h3>
                        <p className="text-xs text-slate-400">Weekly Cap: 5h</p>
                    </div>
                    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <p className="text-xs text-silver-mist uppercase font-bold">Week Total</p>
                        <h3 className="text-2xl font-bold text-purple-500">32.5h</h3>
                    </div>
                </div>

            </div>

            {/* History & Map Panel */}
            <div className="flex flex-col gap-6">

                {/* Recent Activity */}
                <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col">
                    <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-500" /> Recent Activity
                        </h3>
                        <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                    </div>
                    <div className="p-4 space-y-4">
                        {[
                            { action: 'Punch In', time: '09:02 AM', location: 'Dubai HQ', icon: LogIn, color: 'text-emerald-500 bg-emerald-50' },
                            { action: 'Break Start', time: '01:05 PM', location: 'Canteen', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
                            { action: 'Break End', time: '01:45 PM', location: 'Dubai HQ', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 pl-4 ml-2">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${log.color} flex items-center justify-center`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{log.action}</span>
                                        <span className="text-xs font-mono text-slate-500">{log.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-silver-mist mt-1">
                                        <MapPin className="w-3 h-3" /> {log.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulated Map */}
                <div className="bg-slate-100 rounded-xl h-64 border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] opacity-10 bg-cover bg-center" />
                    <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Location Detected
                    </div>
                </div>

            </div>

        </div>
    );
}
