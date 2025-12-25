"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    MapPin,
    Users,
    Ticket
} from 'lucide-react';

export default function EventsReunionsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Events & Reunions
                    </h1>
                    <p className="text-slate-500 text-sm">Upcoming gatherings and networking opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { title: 'Annual Alumni Gala 2024', date: 'Dec 15, 2024', loc: 'Grand Hyatt, New York', attendees: 150, image: 'bg-indigo-500' },
                    { title: 'Tech Innovators Meetup', date: 'Jan 20, 2025', loc: 'Virtual Event', attendees: 340, image: 'bg-emerald-500' },
                    { title: 'London Chapter Drinks', date: 'Feb 05, 2025', loc: 'The Shard, London', attendees: 45, image: 'bg-rose-500' },
                ].map((event, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-32 ${event.image} flex items-center justify-center`}>
                            <CalendarDays className="w-12 h-12 text-white/50" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl mb-1">{event.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin className="w-4 h-4" /> {event.loc}
                                    </div>
                                </div>
                                <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2 min-w-[60px]">
                                    <div className="text-xs uppercase font-bold text-slate-400">{event.date.split(' ')[0]}</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{event.date.split(' ')[1].replace(',', '')}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Users className="w-4 h-4" /> {event.attendees} Going
                                </div>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                                    <Ticket className="w-4 h-4" /> RSVP
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
