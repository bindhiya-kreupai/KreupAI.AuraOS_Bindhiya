"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalIcon,
    Users,
    MapPin,
    Video,
    Clock,
    PlusCircle,
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
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
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Calendar View</h3>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{'<'}</button>
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{'>'}</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex-1 min-h-[400px]">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-400 uppercase">
                                {d}
                            </div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const day = i - 2;
                            const sessionsOnDay = data.filter((s) => {
                                if (!s.startDate) return false;
                                const d = new Date(s.startDate).getDate();
                                return d === day;
                            });

                            return (
                                <div key={i} className={`bg-white dark:bg-slate-900 p-2 min-h-[80px] hover:bg-slate-50 dark:hover:bg-slate-800 ${day < 1 || day > 31 ? 'opacity-30' : ''}`}>
                                    <div className="text-xs font-bold text-slate-500 mb-1">{day > 0 && day <= 31 ? day : ''}</div>
                                    {sessionsOnDay.map((session, si) => (
                                        <div key={si} className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-1.5 rounded text-[10px] font-bold truncate cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/60 mb-1">
                                            {session.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg">Upcoming Sessions ({data.length})</h3>
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <CalIcon className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-sm">No upcoming sessions</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.map((e, i) => (
                                <div key={e.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-center min-w-[60px]">
                                            <div className="text-xs font-bold text-slate-500 uppercase">
                                                {e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'short' }) : ''}
                                            </div>
                                            <div className="text-xl font-bold text-indigo-600">
                                                {e.startDate ? new Date(e.startDate).getDate() : ''}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-1 rounded">{e.type}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{e.title}</h4>
                                    <div className="space-y-1 text-xs text-slate-500 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {e.startDate ? new Date(e.startDate).toLocaleTimeString() : ''} - {e.endDate ? new Date(e.endDate).toLocaleTimeString() : ''}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {e.meetingUrl ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                            {e.location || e.meetingUrl || 'TBD'}
                                        </div>
                                        {e.maxCapacity && (
                                            <div className="flex items-center gap-2 text-emerald-600"><Users className="w-3 h-3" /> {e.maxCapacity} seats</div>
                                        )}
                                    </div>
                                    <button className="w-full mt-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg">
                                        Register
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
