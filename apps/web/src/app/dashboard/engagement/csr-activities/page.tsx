"use client";

import React, { useState, useEffect } from 'react';
import {
    HeartHandshake,
    Calendar,
    MapPin,
    Loader2
} from 'lucide-react';
import { CSRService } from '../services';

export default function CSRActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await CSRService.getActivities();
            setActivities(Array.isArray(result) ? result : []);
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
                <div className="lg:col-span-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white shadow-lg shadow-rose-500/20 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Our Impact</h2>
                        <p className="text-rose-100 max-w-xl">Together, we contribute to local communities through volunteering and charitable initiatives.</p>
                    </div>
                    <div className="flex gap-8 mt-6 md:mt-0">
                        <div className="text-center">
                            <div className="text-4xl font-bold">{activities.length}</div>
                            <div className="text-xs font-bold uppercase opacity-75">Activities</div>
                        </div>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <div className="lg:col-span-3 flex flex-col items-center justify-center py-16 text-slate-400">
                        <HeartHandshake className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">No CSR activities yet.</p>
                        <p className="text-sm">Activities and volunteering events will appear here.</p>
                    </div>
                ) : (
                    activities.map((event: any, i: number) => (
                        <div key={event.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                            <div className="h-32 bg-emerald-100 dark:bg-emerald-900/20 relative">
                                {event.badge && (
                                    <span className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-600">
                                        {event.badge}
                                    </span>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                <div className="space-y-2 text-sm text-slate-500 mb-6">
                                    {event.date && (
                                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date}</div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</div>
                                    )}
                                </div>

                                <div className="mt-auto flex justify-between items-center">
                                    <span className="text-xs font-bold text-rose-500">{event.spots || 'Open'}</span>
                                    <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                                        Volunteer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
