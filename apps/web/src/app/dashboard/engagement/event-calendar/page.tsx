"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    ChevronLeft,
    ChevronRight,
    Plus,
    Loader2
} from 'lucide-react';
import { EventService } from '../services';

export default function EventCalendarPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const eventsData = await EventService.getEvents();
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Event Calendar
                    </h1>
                    <p className="text-slate-500 text-sm">Stay updated with upcoming company events and workshops.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Calendar</h3>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }).map((_, i) => {
                            const day = i + 1;
                            return (
                                <div key={i} className="h-24 rounded-xl border border-slate-100 dark:border-slate-800 p-2 flex flex-col justify-between hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <span className="text-sm font-bold text-slate-500">{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Upcoming Events</h3>
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <CalendarDays className="w-10 h-10 mb-3 opacity-50" />
                            <p className="text-sm font-medium">No upcoming events.</p>
                        </div>
                    ) : (
                        events.map((event: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-12 rounded-lg bg-indigo-500 text-white flex flex-col items-center justify-center font-bold text-xs leading-none shadow-lg shadow-indigo-500/20">
                                        <span>{(event.date || '').split(' ')[0]}</span>
                                        <span className="text-lg">{(event.date || '').split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{event.type || 'Event'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500 mb-4">
                                    {event.time && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {event.time}
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </div>
                                    )}
                                    {event.attendees !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3" /> {event.attendees} Attending
                                        </div>
                                    )}
                                </div>

                                <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    RSVP Now
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

