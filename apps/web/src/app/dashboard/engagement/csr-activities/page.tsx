"use client";

import React, { useState, useEffect } from 'react';
import {
    HeartHandshake,
    Calendar,
    MapPin,
    Users,
    Clock,
    Check
} from 'lucide-react';
import { CSRService } from '../services';

export default function CSRActivitiesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const activities = await CSRService.getActivities();
            setData(activities);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HeartHandshake className="w-6 h-6 text-rose-500" />
                        CSR & Volunteering
                    </h1>
                    <p className="text-slate-500 text-sm">Join us in giving back to the community.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Impact Card */}
                <div className="lg:col-span-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white shadow-lg shadow-rose-500/20 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Our 2023 Impact</h2>
                        <p className="text-rose-100 max-w-xl">Together, we've contributed over 5,000 hours to local communities and raised $50k for charity.</p>
                    </div>
                    <div className="flex gap-8 mt-6 md:mt-0">
                        <div className="text-center">
                            <div className="text-4xl font-bold">50+</div>
                            <div className="text-xs font-bold uppercase opacity-75">Events</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">1.2k</div>
                            <div className="text-xs font-bold uppercase opacity-75">Volunteers</div>
                        </div>
                    </div>
                </div>

                {/* Events */}
                {[
                    { title: 'Beach Cleanup Drive', date: 'Dec 12, 08:00 AM', loc: 'Sunny Beach', spots: '5 spots left', badge: 'Environment', img: 'bg-emerald-100' },
                    { title: 'Food Bank Packing', date: 'Dec 18, 10:00 AM', loc: 'Downtown Shelter', spots: 'Full', badge: 'Community', img: 'bg-amber-100' },
                    { title: 'Tech Mentorship for Kids', date: 'Jan 05, 04:00 PM', loc: 'City Library', spots: 'Open', badge: 'Education', img: 'bg-indigo-100' },
                ].map((event, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className={`h-32 ${event.img} relative`}>
                            <span className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-600">
                                {event.badge}
                            </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                            <div className="space-y-2 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date}</div>
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.loc}</div>
                            </div>

                            <div className="mt-auto flex justify-between items-center">
                                <span className="text-xs font-bold text-rose-500">{event.spots}</span>
                                <button disabled={event.spots === 'Full'} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                                    {event.spots === 'Full' ? 'Closed' : 'Volunteer'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
