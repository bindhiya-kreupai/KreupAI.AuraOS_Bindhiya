"use client";

import React, { useState, useEffect } from 'react';
import {
    ScrollText,
    ShieldAlert,
    Info,
    Plane,
    Hotel,
    Car,
    Coffee,
    Loader2
} from 'lucide-react';
import { TravelSettingsService } from '../services';

export default function TravelPolicyPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const settings = await TravelSettingsService.getSettings();
            setData(settings);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading policy...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ScrollText className="w-6 h-6 text-indigo-500" />
                        Policy & Per Diems
                    </h1>
                    <p className="text-slate-500 text-sm">Review travel eligibility, daily allowances, and spending limits.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <Info className="w-4 h-4" /> {data?.audit?.updatedAt ? `Updated: ${new Date(data.audit.updatedAt).toLocaleDateString()}` : 'Current Policy'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4">Categories</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'Flights', icon: <Plane className="w-4 h-4" />, active: true },
                                { name: 'Accommodation', icon: <Hotel className="w-4 h-4" />, active: false },
                                { name: 'Ground Transport', icon: <Car className="w-4 h-4" />, active: false },
                                { name: 'Meals (Per Diem)', icon: <Coffee className="w-4 h-4" />, active: false },
                            ].map((c, i) => (
                                <button key={i} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm font-bold ${c.active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    {c.icon} {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center text-sky-600">
                                <Plane className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Flight Policy</h2>
                                <p className="text-xs text-slate-500">Rules regarding class of travel and booking windows.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Domestic Travel</h4>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    All employees must travel <strong>{data?.policies?.domesticFlightClass || 'Economy'} Class</strong> for domestic flights under 4 hours.
                                    Flights over 4 hours may be upgraded to Premium Economy subject to VP approval.
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">International Travel</h4>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li><strong>Directors & Above:</strong> Business Class permitted for flights {'>'} {data?.policies?.businessClassThreshold || 6} hours.</li>
                                        <li><strong>Others:</strong> {data?.policies?.internationalFlightClass || 'Economy'} Class. Premium Economy for flights {'>'} 8 hours.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl">
                                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="text-xs text-amber-800 dark:text-amber-400">
                                    <strong>Advance Booking:</strong> All non-emergency travel must be booked at least {data?.policies?.advanceBookingDays || 14} days in advance. Late bookings require justification.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

