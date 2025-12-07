"use client";

import React from 'react';
import { Globe, Search, ArrowRight, Star } from 'lucide-react';

const FLIGHTS = [
    { id: 1, airline: 'United Airlines', logo: 'UA', time: '08:00 AM - 11:30 AM', duration: '5h 30m', price: '$450', type: 'Non-stop' },
    { id: 2, airline: 'British Airways', logo: 'BA', time: '14:00 PM - 06:00 AM (+1)', duration: '10h 00m', price: '$890', type: '1 Stop' },
    { id: 3, airline: 'Emirates', logo: 'EK', time: '20:00 PM - 18:00 PM (+1)', duration: '14h 00m', price: '$1,200', type: 'Non-stop' },
];

export default function BookingIntegrationPage() {
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

            {/* Search Bar */}
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-70 mb-1 block">From</label>
                        <input type="text" className="w-full bg-white/10 border-none rounded-xl p-3 text-white placeholder-white/50 font-bold" placeholder="Departing City" defaultValue="New York (JFK)" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold uppercase opacity-70 mb-1 block">To</label>
                        <input type="text" className="w-full bg-white/10 border-none rounded-xl p-3 text-white placeholder-white/50 font-bold" placeholder="Arrival City" defaultValue="London (LHR)" />
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

            {/* Results */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Available Flights</h3>
                {FLIGHTS.map((flight) => (
                    <div key={flight.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 text-xl">
                                {flight.logo}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{flight.airline}</h4>
                                <div className="text-slate-500 text-sm">{flight.time}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="font-bold text-slate-700 dark:text-slate-300">{flight.duration}</div>
                                <div className="text-xs text-slate-400">{flight.type}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600">{flight.price}</div>
                                <div className="text-xs text-slate-400">Total</div>
                            </div>
                            <button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold hover:opacity-90 flex items-center gap-2">
                                Select <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
