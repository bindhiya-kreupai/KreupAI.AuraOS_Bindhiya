"use client";

import React, { useState, useEffect } from 'react';
import {
    Plane,
    Calendar,
    MapPin,
    Briefcase,
    PlusCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { TravelRequestService } from '../services';

export default function TripRequestsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests();
            setTrips(Array.isArray(requests) ? requests : []);
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
                <span className="ml-2 text-sm text-slate-500">Loading travel requests...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plane className="w-6 h-6 text-sky-500" />
                        Travel Requests
                    </h1>
                    <p className="text-slate-500 text-sm">Plan upcoming business trips, book flights, and request approvals.</p>
                </div>
                <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20">
                    <PlusCircle className="w-4 h-4" /> New Trip
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">My Trips</h3>
                    {trips.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No travel requests found</p>
                            <p className="text-sm mt-1">Create a new trip to get started.</p>
                        </div>
                    ) : (
                        trips.map((t: any) => (
                            <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-3 hover:shadow-lg transition-all group">
                                <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-slate-100 dark:border-slate-800 pr-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2
                                        ${t.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : t.status === 'pending' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        <Plane className={`w-6 h-6 ${t.status !== 'approved' ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase rounded px-2 py-0.5
                                        ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : t.status === 'pending' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {t.status}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            {t.destination || t.title || 'Trip'}
                                        </h3>
                                        <button className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-4">
                                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {t.purpose || 'Business'}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.departureDate || t.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center gap-1 w-full">
                                        <div className={`h-1 flex-1 rounded-full ${t.status === 'approved' || t.status === 'pending' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                        <div className={`h-1 flex-1 rounded-full ${t.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                        <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                        <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase">
                                        <span>Request</span>
                                        <span>Manager</span>
                                        <span>Booking</span>
                                        <span>Expense</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Travel Desk
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Plane className="w-4 h-4" /></div>
                                <div>
                                    <div className="text-sm font-bold">Book Flights</div>
                                    <div className="text-[10px] text-slate-400">Via Corporate Portal</div>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600"><MapPin className="w-4 h-4" /></div>
                                <div>
                                    <div className="text-sm font-bold">Hotel Booking</div>
                                    <div className="text-[10px] text-slate-400">Partner Rates Available</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

