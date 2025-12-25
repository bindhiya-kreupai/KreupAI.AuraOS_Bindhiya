"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock
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
                console.error('Error fetching training sessions:', error);
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
                    <span className="font-bold text-sm">October 2024</span>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Calendar Grid Placeholder */}
                <div className="annotated-calendar lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center text-slate-400 font-bold min-h-[400px]">
                    Interactive Calendar Component Placeholder
                </div>

                {/* Upcoming List */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-bold">Upcoming Sessions</h3>
                    {[
                        { title: 'Leadership Workshop', date: 'Oct 28', time: '10:00 AM - 12:00 PM', loc: 'Conference Room A', type: 'In-Person', color: 'border-l-ammber-500' },
                        { title: 'React Performance', date: 'Oct 29', time: '2:00 PM - 4:00 PM', loc: 'Zoom', type: 'Virtual', color: 'border-l-indigo-500' },
                        { title: 'Compliance Q&A', date: 'Oct 30', time: '11:00 AM - 11:30 AM', loc: 'Teams', type: 'Virtual', color: 'border-l-emerald-500' },
                    ].map((event, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="font-bold text-2xl text-slate-200 dark:text-slate-800 leading-none">{event.date.split(' ')[1]}</div>
                                <span className="text-xs font-bold uppercase text-slate-400">{event.type}</span>
                            </div>
                            <div className="font-bold text-lg">{event.title}</div>
                            <div className="flex flex-col gap-1 text-sm text-slate-500">
                                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {event.time}</div>
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.loc}</div>
                            </div>
                            <button className="mt-2 w-full py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700">Register</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
