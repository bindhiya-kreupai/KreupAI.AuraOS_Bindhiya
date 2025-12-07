"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    Moon,
    Sun,
    Settings
} from 'lucide-react';

export default function CalendarTypesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Calendar Types
                    </h1>
                    <p className="text-slate-500 text-sm">Support for non-Gregorian calendar systems.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {[
                        { name: 'Gregorian', type: 'Primary', desc: 'Standard business calendar.', active: true, icon: Sun },
                        { name: 'Hijri (Islamic)', type: 'Secondary', desc: 'Used for religious holidays in MENA.', active: true, icon: Moon },
                        { name: 'Japanese Imperial', type: 'Secondary', desc: 'Used for official Japanese documents.', active: false, icon: CalendarDays },
                        { name: 'Persian (Solar Hijri)', type: 'Secondary', desc: 'Used in Iran and Afghanistan.', active: false, icon: Sun },
                    ].map((cal, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cal.active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                    <cal.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{cal.name}</div>
                                    <div className="text-sm text-slate-500">{cal.desc}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${cal.type === 'Primary' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                    }`}>{cal.type}</span>
                                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${cal.active ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${cal.active ? 'translate-x-6' : 'translate-x-0'
                                        }`}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-lg mb-4">Calendar Shift Rules</h3>
                    <p className="text-indigo-100 text-sm mb-6">
                        Configure how holidays shift when they fall on weekends for different calendar systems.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-xl">
                            <div className="font-bold text-sm">Gregorian (Standard)</div>
                            <div className="text-xs text-indigo-200 mt-1">Holidays on Sun move to Mon</div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl">
                            <div className="font-bold text-sm">Hijri</div>
                            <div className="text-xs text-indigo-200 mt-1">Subject to Moon Sighting (+/- 1 Day)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
