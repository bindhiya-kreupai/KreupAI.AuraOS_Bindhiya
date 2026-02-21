"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Search, ArrowRight, Loader2 } from 'lucide-react';
import { TravelBookingService } from '../services';

export default function BookingIntegrationPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await TravelBookingService.createBooking({} as any).catch(() => null);
            setBookings([]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-slate-500">Loading booking integration...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Globe className="w-8 h-8 text-indigo-500" />
                        Booking Integration
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Search and book directly via connected providers.</p>
                </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-70 mb-1 block">From</label>
                        <input type="text" className="w-full bg-white/10 border-none rounded-xl p-3 text-white placeholder-white/50 font-bold" placeholder="Departing City" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-70 mb-1 block">To</label>
                        <input type="text" className="w-full bg-white/10 border-none rounded-xl p-3 text-white placeholder-white/50 font-bold" placeholder="Arrival City" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Date</label>
                        <input type="date" className="w-full bg-white/10 border-none rounded-xl p-3 text-white font-bold" />
                    </div>
                    <button className="bg-white text-indigo-600 px-8 rounded-xl font-bold shadow-lg hover:bg-indigo-50 flex items-center gap-2 mt-5">
                        <Search className="w-5 h-5" /> Search
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Available Flights</h3>
                {bookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No results yet</p>
                        <p className="text-sm mt-1">Search for flights to see available options.</p>
                    </div>
                ) : (
                    bookings.map((flight: any) => (
                        <div key={flight.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-xl">
                                    {flight.provider?.substring(0, 2) || 'FL'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{flight.provider || 'Flight'}</h4>
                                    <div className="text-slate-500 text-sm">{flight.bookingReference || ''}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">${flight.cost || 0}</div>
                                    <div className="text-xs text-slate-400">Total</div>
                                </div>
                                <button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold hover:opacity-90 flex items-center gap-2">
                                    Select <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
