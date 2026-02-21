"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { HolidayService, LeaveRequestService } from '../services';
import type { Holiday, LeaveRequest } from '../types';

export default function LeaveCalendarPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        fetchCalendarData();
    }, [currentYear]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const [holidaysData, leavesData] = await Promise.all([
                HolidayService.getHolidays(currentYear),
                LeaveRequestService.getRequests({ status: 'approved' })
            ]);
            setHolidays(holidaysData);
            setLeaves(leavesData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Calculate calendar grid
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    // Build lookup for holidays and leaves on each day
    const dayEntries = useMemo(() => {
        const entries: Record<number, { holidays: Holiday[]; leaves: LeaveRequest[] }> = {};
        for (let d = 1; d <= daysInMonth; d++) {
            entries[d] = { holidays: [], leaves: [] };
        }

        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const yearStr = String(currentYear);

        holidays.forEach(h => {
            const hDate = new Date(h.date);
            if (hDate.getFullYear() === currentYear && hDate.getMonth() === currentMonth) {
                const day = hDate.getDate();
                if (entries[day]) {
                    entries[day].holidays.push(h);
                }
            }
        });

        leaves.forEach(l => {
            const from = new Date(l.fromDate);
            const to = new Date(l.toDate);
            for (let d = 1; d <= daysInMonth; d++) {
                const cellDate = new Date(currentYear, currentMonth, d);
                if (cellDate >= from && cellDate <= to) {
                    if (entries[d]) {
                        entries[d].leaves.push(l);
                    }
                }
            }
        });

        return entries;
    }, [holidays, leaves, currentMonth, currentYear, daysInMonth]);

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
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="flex items-center font-bold px-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        {monthName}
                    </span>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading calendar data...
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-xs font-bold text-slate-400 uppercase">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {Array.from({ length: totalCells }).map((_, i) => {
                            const day = i - firstDayOfMonth + 1;
                            const isValidDay = day > 0 && day <= daysInMonth;
                            const entry = isValidDay ? dayEntries[day] : null;

                            return (
                                <div key={i} className={`min-h-[100px] border border-slate-100 dark:border-slate-800 rounded-xl p-2 ${isValidDay ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'
                                    }`}>
                                    {isValidDay && (
                                        <>
                                            <div className="text-sm font-bold mb-2">{day}</div>
                                            {entry?.holidays.map((h, hi) => (
                                                <div key={`h-${hi}`} className="text-xs bg-emerald-100 text-emerald-600 px-1 py-0.5 rounded mb-1 truncate font-medium">
                                                    {h.name}
                                                </div>
                                            ))}
                                            {entry?.leaves.map((l, li) => {
                                                const bgClass = l.leaveTypeId === 'SL'
                                                    ? 'bg-rose-100 text-rose-600'
                                                    : 'bg-indigo-100 text-indigo-600';
                                                const firstName = l.employeeName?.split(' ')[0] || 'Employee';
                                                return (
                                                    <div key={`l-${li}`} className={`text-xs ${bgClass} px-1 py-0.5 rounded mb-1 truncate font-medium`}>
                                                        {firstName} - {l.leaveTypeName || l.leaveTypeId}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
