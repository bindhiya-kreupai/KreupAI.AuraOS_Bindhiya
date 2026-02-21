"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Loader2
} from 'lucide-react';
import { TrainingSessionService } from '../services';

export default function TrainingCalendarPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await TrainingSessionService.getTrainingSessions();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Training Calendar
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule of upcoming training sessions and workshops.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-sm">Upcoming</span>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="annotated-calendar lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center text-slate-400 font-bold min-h-[400px]">
                        Interactive Calendar Component Placeholder
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold">Upcoming Sessions ({data.length})</h3>
                        {data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <CalendarDays className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No upcoming sessions</p>
                            </div>
                        ) : (
                            data.map((event, i) => (
                                <div key={event.id || i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-2xl text-slate-200 dark:text-slate-800 leading-none">
                                            {event.startDate ? new Date(event.startDate).getDate() : ''}
                                        </div>
                                        <span className="text-xs font-bold uppercase text-slate-400">{event.type}</span>
                                    </div>
                                    <div className="font-bold text-lg">{event.title}</div>
                                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {event.startDate ? new Date(event.startDate).toLocaleString() : ''}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {event.location || event.meetingUrl || 'TBD'}
                                        </div>
                                    </div>
                                    <button className="mt-2 w-full py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700">Register</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
