"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    MapPin,
    AlertCircle,
    CalendarCheck,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { AttendanceViewService } from '../services';

export default function AttendanceViewPage() {
    const [fetching, setFetching] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [todayRecord, setTodayRecord] = useState<any>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await AttendanceViewService.getRecords();
                if (res?.success && Array.isArray(res.data)) {
                    setRecords(res.data);
                    const today = new Date().toISOString().split('T')[0];
                    const todayRec = res.data.find((r: any) => {
                        const recDate = (r.date || r.punchDate || r.createdAt || '').split('T')[0];
                        return recDate === today;
                    });
                    setTodayRecord(todayRec || null);
                } else if (res?.data?.records && Array.isArray(res.data.records)) {
                    setRecords(res.data.records);
                }
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchAttendance();
    }, []);

    const formatTime = (time: string | null | undefined) => {
        if (!time) return '--:--';
        try {
            return new Date(time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return time;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'text-emerald-500';
            case 'absent': return 'text-rose-500';
            case 'late': return 'text-amber-500';
            default: return 'text-slate-400';
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const checkInTime = todayRecord?.checkIn || todayRecord?.punchIn || todayRecord?.clockIn;
    const checkOutTime = todayRecord?.checkOut || todayRecord?.punchOut || todayRecord?.clockOut;
    const totalHours = todayRecord?.totalHours || todayRecord?.hoursWorked || '--:--';
    const todayStatus = todayRecord?.status || 'Present';

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Attendance View
                    </h1>
                    <p className="text-slate-500 text-sm">Review your daily logs, punch times, and attendance status.</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-2xl mb-1">
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}!
                    </h2>
                    <p className="text-indigo-100 text-sm mb-6">
                        {checkInTime ? `You checked in at ${formatTime(checkInTime)} today.` : 'No check-in recorded for today.'}
                    </p>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-indigo-200 mb-1">Total Hours</span>
                            <span className="text-3xl font-bold font-mono">{typeof totalHours === 'number' ? `${Math.floor(totalHours)}:${String(Math.round((totalHours % 1) * 60)).padStart(2, '0')}` : totalHours}</span>
                        </div>
                        <div className="h-10 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold text-indigo-200 mb-1">Status</span>
                            <span className="px-2 py-0.5 bg-white/20 rounded text-sm font-bold text-center">{todayStatus}</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-64">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Check In</span>
                            <span className="font-bold">{formatTime(checkInTime)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 opacity-50">
                            <span>Check Out</span>
                            <span className="font-bold">{formatTime(checkOutTime)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10 text-xs flex items-center gap-1 opacity-75">
                            <MapPin className="w-3 h-3" /> {todayRecord?.location || 'Office'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Attendance Log</h3>
                    <div className="flex gap-2 text-xs font-bold">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</div>
                    </div>
                </div>

                {records.length > 0 ? (
                    <div className="space-y-2">
                        {records.slice(0, 10).map((log: any, i: number) => {
                            const logDate = log.date || log.punchDate || log.createdAt;
                            const logIn = log.checkIn || log.punchIn || log.clockIn;
                            const logOut = log.checkOut || log.punchOut || log.clockOut;
                            const logHours = log.totalHours || log.hoursWorked || '00:00';
                            const logStatus = log.status || 'Present';

                            return (
                                <div key={log.id || i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 border-dashed">
                                    <div className="flex items-center gap-3 w-32">
                                        <CalendarCheck className={`w-4 h-4 ${getStatusColor(logStatus)}`} />
                                        <span className="font-bold">{logDate ? new Date(logDate).toLocaleDateString('en', { month: 'short', day: '2-digit' }) : `Day ${i + 1}`}</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-3 text-center text-sm font-mono text-slate-600 dark:text-slate-400">
                                        <span>{formatTime(logIn)}</span>
                                        <span>{formatTime(logOut)}</span>
                                        <span>{typeof logHours === 'number' ? `${Math.floor(logHours)}:${String(Math.round((logHours % 1) * 60)).padStart(2, '0')}` : logHours}</span>
                                    </div>
                                    <div className={`w-24 text-right text-xs font-bold uppercase ${getStatusColor(logStatus)}`}>
                                        {logStatus}
                                    </div>
                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg ml-4 text-slate-400">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No attendance records found</p>
                    </div>
                )}
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

