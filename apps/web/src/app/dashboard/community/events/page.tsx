"use client";

import React, { useState } from 'react';
import {
    CalendarDays,
    MapPin,
    Users,
    Clock,
    Ticket,
    Share2,
    CalendarCheck
} from 'lucide-react';

export default function AlumniEventsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-rose-500" />
                        Events & Reunions
                    </h1>
                    <p className="text-slate-500 text-sm">Upcoming meetups, webinars, and annual reunions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">Past Events</button>
                    <button className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20">Upcoming</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0 overflow-y-auto pb-20">
                {/* Featured Event */}
                <div className="lg:col-span-2 relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    {/* Placeholder Background */}
                    <div className="absolute inset-0 bg-indigo-900/50 flex items-center justify-center text-white/10 text-9xl font-black">2025</div>

                    <div className="absolute bottom-6 left-6 z-20 text-white">
                        <div className="inline-block px-3 py-1 bg-rose-500 rounded-lg text-xs font-bold uppercase mb-2">Annual Reunion</div>
                        <h2 className="text-3xl font-bold mb-2">Global Alumni Summit 2025</h2>
                        <div className="flex items-center gap-3 text-sm opacity-90 font-bold">
                            <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Dec 15, 2025</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
                        </div>
                    </div>

                    <button className="absolute bottom-6 right-6 z-20 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                        RSVP Now
                    </button>
                </div>

                {[
                    { title: 'Tech Talk: Scaling AI', date: 'Jan 12, 5:00 PM', loc: 'Zoom / Online', attendees: 142, type: 'Webinar', color: 'indigo' },
                    { title: 'NYC Chapter Drinks', date: 'Feb 05, 7:00 PM', loc: 'The Rooftop Bar, NYC', attendees: 45, type: 'Meetup', color: 'amber' },
                    { title: 'Career Pivot Workshop', date: 'Mar 10, 2:00 PM', loc: 'Online', attendees: 89, type: 'Workshop', color: 'emerald' },
                    { title: 'Founders Circle Dinner', date: 'Apr 22, 8:00 PM', loc: 'London, UK', attendees: 12, type: 'Invite Only', color: 'slate' },
                ].map((evt, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase bg-${evt.color}-100 text-${evt.color}-600`}>
                                {evt.type}
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{evt.title}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4 text-slate-400" /> {evt.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-slate-400" /> {evt.loc}
                            </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Users className="w-4 h-4" /> {evt.attendees} Going
                            </div>
                            <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                                <Ticket className="w-3 h-3" /> Get Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

