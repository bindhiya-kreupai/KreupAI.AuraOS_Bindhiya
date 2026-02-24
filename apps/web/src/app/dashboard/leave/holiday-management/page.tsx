"use client";

import React, { useState, useEffect } from 'react';
import {
    Palmtree,
    Globe,
    Plus,
    Loader2
} from 'lucide-react';
import { HolidayService } from '../services';
import type { Holiday } from '../types';

export default function HolidayManagementPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const result = await HolidayService.getHolidays(new Date().getFullYear());
            setHolidays(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Palmtree className="w-6 h-6 text-indigo-500" />
                        Holiday Management
                    </h1>
                    <p className="text-slate-500 text-sm">Set up annual holiday calendars for different locations.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Holiday
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Locations</h3>
                    <div className="space-y-2">
                        {['New York HQ', 'London Office', 'Singapore Branch', 'Remote - US', 'Remote - EU'].map((loc, i) => (
                            <div key={i} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}>
                                <span className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> {loc}
                                </span>
                                {i === 0 && <span className="text-xs bg-white/50 px-2 py-0.5 rounded">Selected</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">{new Date().getFullYear()} Holidays</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading holidays...
                            </div>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No holidays configured for this year.
                            </div>
                        ) : holidays.map((h, i) => {
                            const holidayDate = new Date(h.date);
                            const monthDay = holidayDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                            const dayOfWeek = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });
                            const [month, day] = monthDay.split(' ');

                            return (
                                <div key={h.id || i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <span className="text-xs text-slate-500 uppercase font-bold">{month}</span>
                                            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{day}</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{h.name}</div>
                                            <div className="text-sm text-slate-500">{dayOfWeek}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {h.isOptional && (
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full text-xs font-bold text-amber-600">Optional</span>
                                        )}
                                        <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">{h.type}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

