"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Image as ImageIcon,
    Share2,
    Heart,
    ChevronRight,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventService } from '../services';

// --- MOCK DATA ---

const UPCOMING_EVENTS = [
    {
        id: 1,
        title: 'Annual Town Hall 2024',
        date: 'Dec 15, 2024',
        time: '10:00 AM - 12:00 PM',
        location: 'Grand Auditorium & Zoom',
        attendees: 450,
        image: '🎤',
        color: 'bg-indigo-600',
        category: 'Corporate',
        description: 'Join us for the end-of-year review and vision setting for 2025. CEO keynote and awards ceremony.',
        status: 'Going'
    },
    {
        id: 2,
        title: 'Holiday Office Party',
        date: 'Dec 20, 2024',
        time: '04:00 PM - 08:00 PM',
        location: 'Rooftop Lounge',
        attendees: 210,
        image: '🎉',
        color: 'bg-rose-500',
        category: 'Social',
        description: 'Celebrate the season with food, drinks, and music. Ugly sweater theme!',
        status: 'Pending'
    },
    {
        id: 3,
        title: 'Q1 Hackathon Kickoff',
        date: 'Jan 10, 2025',
        time: '09:00 AM - 10:00 AM',
        location: 'Innovation Lab',
        attendees: 85,
        image: '💻',
        color: 'bg-emerald-600',
        category: 'Tech',
        description: 'Theme announcement and team formation for our quarterly hackathon.',
        status: 'Not Going'
    }
];

const PAST_EVENTS = [
    { id: 101, title: 'Diwali Celebration', date: 'Nov 12', photos: 124, cover: 'bg-orange-500' },
    { id: 102, title: 'Team Outing - Trek', date: 'Oct 05', photos: 45, cover: 'bg-green-600' },
    { id: 103, title: 'Product Launch v2.0', date: 'Sep 15', photos: 82, cover: 'bg-blue-600' },
];

export default function EventsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState(UPCOMING_EVENTS);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const eventsData = await EventService.getEvents();
            if (eventsData.length > 0) {
                setEvents(eventsData);
                setData(eventsData);
            }
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

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                        Events & Culture
                    </h1>
                    <p className="text-silver-mist text-sm">Stay connected with upcoming corporate and social gatherings.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">Next: Town Hall (Dec 15)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Event Feed */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Filter Tabs */}
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

                    {/* Events List */}
                    <div className="overflow-y-auto space-y-6 pr-2 pb-20">
                        {filteredEvents.map(event => (
                            <div key={event.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden hover:shadow-lg transition-all group">
                                <div className={`h-32 ${event.color} relative overflow-hidden flex items-center justify-center`}>
                                    <div className="text-9xl opacity-20 select-none grayscale mix-blend-overlay">{event.image}</div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-6 text-white">
                                        <div className="text-xs font-bold opacity-80 uppercase tracking-wide mb-1">{event.category}</div>
                                        <h3 className="text-2xl font-bold">{event.title}</h3>
                                    </div>
                                    <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 text-white transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="md:col-span-2 space-y-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {event.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                                    <span className="font-bold">{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                    <Clock className="w-4 h-4 text-indigo-500" />
                                                    <span className="font-bold">{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg">
                                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                                    <span className="font-bold">{event.location}</span>
                                                </div>
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

                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                                <Users className="w-3 h-3" />
                                                <span>{event.attendees} Attending</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Memories & Calendar */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Calendar Widget (Simplified) */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> December 2024
                        </h3>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-silver-mist font-bold">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                                const hasEvent = [15, 20].includes(d);
                                return (
                                    <div
                                        key={d}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg relative
                                            ${d === 5 ? 'bg-indigo-500 text-white font-bold' :
                                                hasEvent ? 'bg-indigo-50 text-indigo-600 font-bold cursor-pointer hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-50'}
                                        `}
                                    >
                                        {d}
                                        {hasEvent && <div className="w-1 h-1 rounded-full bg-indigo-500 absolute bottom-1"></div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Past Events / Memories */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-rose-500" /> Event Memories
                            </h3>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {PAST_EVENTS.map(ev => (
                                <div key={ev.id} className="group cursor-pointer">
                                    <div className={`h-24 ${ev.cover} rounded-xl mb-2 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                        <div className="absolute bottom-2 left-3 text-white">
                                            <div className="font-bold text-sm shadow-black drop-shadow-md">{ev.title}</div>
                                            <div className="text-[10px] opacity-90">{ev.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500 overflow-hidden">
                                                    <div className="w-full h-full bg-slate-200"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-indigo-500 group-hover:underline flex items-center gap-1">
                                            VIEW {ev.photos} PHOTOS <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
