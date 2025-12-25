"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import { HolidayService, LeaveRequestService } from '../services';
import type { Holiday, LeaveRequest } from '../types';

export default function LeaveCalendarPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const [holidaysData, leavesData] = await Promise.all([
                HolidayService.getHolidays(2024),
                LeaveRequestService.getRequests({ status: 'approved' })
            ]);
            if (holidaysData.length > 0) {
                setHolidays(holidaysData);
            }
            if (leavesData.length > 0) {
                setLeaves(leavesData);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-indigo-500" />
                        Leave Calendar
                    </h1>
                    <p className="text-slate-500 text-sm">Company-wide view of leaves and holidays.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="flex items-center font-bold px-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        November 2024
                    </span>
                    <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-bold text-slate-400 uppercase">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 35 }).map((_, i) => {
                        const day = i - 2; // Offset for month start
                        return (
                            <div key={i} className={`min-h-[100px] border border-slate-100 dark:border-slate-800 rounded-xl p-2 ${day > 0 && day <= 30 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'
                                }`}>
                                {day > 0 && day <= 30 && (
                                    <>
                                        <div className="text-sm font-bold mb-2">{day}</div>
                                        {day === 12 && (
                                            <div className="text-xs bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded mb-1 truncate font-medium">
                                                Alice - AL
                                            </div>
                                        )}
                                        {day === 15 && (
                                            <div className="text-xs bg-rose-100 text-rose-600 px-1 py-0.5 rounded mb-1 truncate font-medium">
                                                John - SL
                                            </div>
                                        )}
                                        {day === 24 && (
                                            <div className="text-xs bg-emerald-100 text-emerald-600 px-1 py-0.5 rounded mb-1 truncate font-medium">
                                                Thanksgiving
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-4 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-indigo-500"></div> Annual Leave
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rose-500"></div> Sick Leave
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div> Holiday
                </div>
            </div>
        </div>
    );
}
