"use client";

import React, { useState, useEffect } from 'react';
import { History, MapPin, Calendar, FileText, ChevronRight } from 'lucide-react';
import { TravelRequestService } from '../services';

const PAST_TRIPS = [
    { id: 1, dest: 'Paris, France', dates: 'Sep 10 - Sep 15, 2024', purpose: 'Q3 Plannning', cost: '$3,200', reports: 'Submitted' },
    { id: 2, dest: 'Berlin, Germany', dates: 'Aug 05 - Aug 08, 2024', purpose: 'Tech Summit', cost: '$2,100', reports: 'Approved' },
    { id: 3, dest: 'Austin, USA', dates: 'Jun 20 - Jun 25, 2024', purpose: 'SXSW', cost: '$1,850', reports: 'Approved' },
];

export default function TravelHistoryPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const requests = await TravelRequestService.getRequests();
            setData(requests);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <History className="w-8 h-8 text-indigo-500" />
                        Travel History
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Archive of completed trips and reports.</p>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8">
                {PAST_TRIPS.map((trip) => (
                    <div key={trip.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-500" />

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{trip.dest}</h3>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.dates}</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">{trip.purpose}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{trip.cost}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Total Spend</div>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                        <FileText className="w-4 h-4" /> {trip.reports}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
