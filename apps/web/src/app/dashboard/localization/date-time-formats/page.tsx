"use client";

import React, { useState } from 'react';
import {
    Clock,
    Calendar,
    Settings,
    Globe
} from 'lucide-react';

export default function DateTimeFormatsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Date & Time Formats
                    </h1>
                    <p className="text-slate-500 text-sm">Configure display formats for different locales.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { region: 'United States', date: 'MM/DD/YYYY', time: '12-hour (AM/PM)', example: '12/31/2024 02:30 PM' },
                    { region: 'Europe (Generic)', date: 'DD/MM/YYYY', time: '24-hour', example: '31/12/2024 14:30' },
                    { region: 'Japan', date: 'YYYY/MM/DD', time: '24-hour', example: '2024/12/31 14:30' },
                    { region: 'India', date: 'DD-MM-YYYY', time: '12-hour (AM/PM)', example: '31-12-2024 02:30 PM' },
                ].map((fmt, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="font-bold text-lg">{fmt.region}</div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-bold text-slate-500">Date Format</span>
                                <span className="font-mono font-bold">{fmt.date}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-bold text-slate-500">Time Format</span>
                                <span className="font-bold">{fmt.time}</span>
                            </div>
                            <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                                <span className="text-xs text-slate-400 block mb-1">Preview</span>
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmt.example}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
