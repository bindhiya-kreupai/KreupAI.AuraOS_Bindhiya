"use client";

import React, { useState, useEffect } from 'react';
import { History, MapPin, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { TravelRequestService } from '../services';

export default function TravelHistoryPage() {
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
                <span className="ml-2 text-sm text-slate-500">Loading travel history...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <History className="w-8 h-8 text-indigo-500" />
                        Travel History
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Archive of completed trips and reports.</p>
                </div>
            </div>

            {trips.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">No travel history found</p>
                    <p className="text-sm mt-2">Your completed trips will appear here.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8">
                    {trips.map((trip: any) => (
                        <div key={trip.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-500" />

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-5 h-5 text-indigo-500" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{trip.destination || trip.title || 'Trip'}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(trip.departureDate || trip.createdAt).toLocaleDateString()}</span>
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">{trip.purpose || 'Business'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">${trip.estimatedCost || trip.amount || 0}</div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Total Spend</div>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                            <FileText className="w-4 h-4" /> {trip.status}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

