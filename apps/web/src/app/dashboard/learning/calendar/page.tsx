"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalIcon,
    Users,
    MapPin,
    Video,
    Clock,
    PlusCircle
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
            } catch {
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalIcon className="w-6 h-6 text-indigo-500" />
                        Training Calendar
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule for upcoming workshops, webinars, and classroom sessions.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <PlusCircle className="w-4 h-4" /> Nominate Trainee
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Calendar Grid (Mock) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">December 2025</h3>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{&apos;<'}</button>
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{&apos;>'}</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex-1 min-h-[400px]">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-400 uppercase">
                                {d}
                            </div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const day = i - 2; // Offset for mock
                            const hasEvent = day === 5 || day === 12 || day === 18 || day === 24;
                            return (
                                <div key={i} className={`bg-white dark:bg-slate-900 p-2 min-h-[80px] hover:bg-slate-50 dark:hover:bg-slate-800 ${day < 1 || day > 31 ? 'opacity-30' : ''}`}>
                                    <div className="text-xs font-bold text-slate-500 mb-1">{day > 0 && day <= 31 ? day : &apos;'}</div>
                                    {hasEvent && day > 0 && day <= 31 && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-1.5 rounded text-[10px] font-bold truncate cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/60">
                                            {day === 5 ? 'React Workshop' : day === 12 ? 'Leadership Summit' : day === 18 ? 'Security Brief' : 'Town Hall'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events Detail */}
                <div className="space-y-6 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg">Upcoming Sessions</h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Advanced React Patterns', date: 'Dec 05', time: '10:00 AM - 4:00 PM', type: 'Workshop', loc: 'Room 304', seats: '5 Left' },
                            { title: 'Q4 Leadership Summit', date: 'Dec 12', time: '09:00 AM - 5:00 PM', type: 'Conference', loc: 'Auditorium', seats: 'Open' },
                            { title: 'Cyber Security Briefing', date: 'Dec 18', time: '2:00 PM - 3:00 PM', type: 'Webinar', loc: 'Zoom', seats: 'Unlimited' },
                        ].map((e, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-center min-w-[60px]">
                                        <div className="text-xs font-bold text-slate-500 uppercase">{e.date.split(&apos; ')[0]}</div>
                                        <div className="text-xl font-bold text-indigo-600">{e.date.split(&apos; ')[1]}</div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-1 rounded">{e.type}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{e.title}</h4>
                                <div className="space-y-1 text-xs text-slate-500 font-bold">
                                    <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {e.time}</div>
                                    <div className="flex items-center gap-2">
                                        {e.loc === 'Zoom' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {e.loc}
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600"><Users className="w-3 h-3" /> {e.seats}</div>
                                </div>
                                <button className="w-full mt-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg">
                                    Format
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
