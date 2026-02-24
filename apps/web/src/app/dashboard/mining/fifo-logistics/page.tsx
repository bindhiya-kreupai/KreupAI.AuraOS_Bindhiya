"use client";

import React, { useState } from 'react';
import {
    Plane,
    MapPin,
    Calendar,
    Users
} from 'lucide-react';

export default function FIFOLogisticsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plane className="w-6 h-6 text-indigo-500" />
                        FIFO Logistics
                    </h1>
                    <p className="text-slate-500 text-sm">Manage Fly-In Fly-Out rosters and travel.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Book Flight
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Upcoming Movements</h3>
                    <div className="space-y-4">
                        {[
                            { flight: 'QF1042', from: 'Perth', to: 'Site A', time: '06:00 AM', status: 'On Time', pax: 45 },
                            { flight: 'QF1045', from: 'Site A', to: 'Perth', time: '04:30 PM', status: 'Delayed', pax: 42 },
                            { flight: 'VA8821', from: 'Brisbane', to: 'Site B', time: '07:15 AM', status: 'On Time', pax: 38 },
                        ].map((flight, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                        <Plane className="w-6 h-6 transform -rotate-45" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{flight.flight}</div>
                                        <div className="text-xs text-slate-500">{flight.from} <span className="text-slate-300 mx-1">→</span> {flight.to}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{flight.time}</div>
                                        <div className={`text-xs font-bold ${flight.status === 'On Time' ? 'text-emerald-600' : 'text-amber-600'}`}>{flight.status}</div>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[50px]">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <div className="text-xs font-bold">{flight.pax}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Site Population</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-8 h-8 text-rose-500" />
                                <div>
                                    <div className="font-bold text-lg">Site A (Gold)</div>
                                    <div className="text-xs text-slate-500">Remote Operations Center</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">482</div>
                                <div className="text-xs text-slate-400 uppercase">Personnel on site</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Production</span>
                                    <span className="font-bold">245</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[50%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Maintenance</span>
                                    <span className="font-bold">120</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[25%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Admin & Support</span>
                                    <span className="font-bold">117</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[25%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

