"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    Image as ImageIcon,
    Share2,
    Star,
    Loader2
} from 'lucide-react';
import { EventService } from '../services';

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

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

    const handleRsvp = (id: number, status: string) => {
        setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status } : ev));
    };

    const filteredEvents = filter === 'All'
        ? events
        : events.filter(ev => ev.category === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                        Events & Culture
                    </h1>
                    <p className="text-silver-mist text-sm">Stay connected with upcoming corporate and social gatherings.</p>
                </div>

                {events.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-ink-black dark:text-pearl">Next: {events[0]?.title}</span>
                        </div>
                    </div>
                )}
            </div>

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Calendar className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No events found.</p>
                    <p className="text-sm">Events will appear here once created.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                    <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                        <div className="flex gap-2 shrink-0">
                            {['All', 'Corporate', 'Social', 'Tech'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                        ${filter === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-2 pb-20">
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-sm">No events in this category.</div>
                            ) : (
                                filteredEvents.map((event: any) => (
                                    <div key={event.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden hover:shadow-lg transition-all group">
                                        <div className={`h-32 ${event.color || 'bg-indigo-600'} relative overflow-hidden flex items-center justify-center`}>
                                            <div className="text-9xl opacity-20 select-none grayscale mix-blend-overlay">{event.image || ''}</div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-6 text-white">
                                                <div className="text-xs font-bold opacity-80 uppercase tracking-wide mb-1">{event.category || 'Event'}</div>
                                                <h3 className="text-2xl font-bold">{event.title}</h3>
                                            </div>
                                            <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 text-white transition-colors">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                                <div className="md:col-span-2 space-y-4">
                                                    {event.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                                        {event.date && (
                                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                                <span className="font-bold">{event.date}</span>
                                                            </div>
                                                        )}
                                                        {event.time && (
                                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                                <Clock className="w-4 h-4 text-indigo-500" />
                                                                <span className="font-bold">{event.time}</span>
                                                            </div>
                                                        )}
                                                        {event.location && (
                                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                                                <span className="font-bold">{event.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-cloud dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                                    <div className="text-xs font-bold text-silver-mist mb-1 text-center md:text-right">
                                                        Your RSVP Status
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRsvp(event.id, 'Going')}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors
                                                                ${event.status === 'Going'
                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}
                                                            `}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Going
                                                        </button>
                                                        <button
                                                            onClick={() => handleRsvp(event.id, 'Not Going')}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors
                                                                ${event.status === 'Not Going'
                                                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}
                                                            `}
                                                        >
                                                            <XCircle className="w-4 h-4" /> No
                                                        </button>
                                                    </div>
                                                    {event.attendees !== undefined && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                                            <Users className="w-3 h-3" />
                                                            <span>{event.attendees} Attending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Calendar
                            </h3>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-silver-mist font-bold">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <div key={d} className="aspect-square flex flex-col items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50">
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-rose-500" /> Event Memories
                                </h3>
                            </div>
                            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                                Past event memories will appear here.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

