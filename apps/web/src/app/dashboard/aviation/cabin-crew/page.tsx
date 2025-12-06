"use client";

import React, { useState } from 'react';
import {
    Plane,
    Users,
    Calendar,
    Globe
} from 'lucide-react';

export default function CabinCrewPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Cabin Crew
                    </h1>
                    <p className="text-slate-500 text-sm">Manage crew rosters and flight assignments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Flights (Today)</h3>
                    <div className="space-y-4">
                        {[
                            { flight: 'QF10', route: 'LHR - PER', crew: 14, captain: 'Cpt. J. Kirk', status: 'In Air' },
                            { flight: 'QF9', route: 'PER - LHR', crew: 14, captain: 'Cpt. J. Picard', status: 'Boarding' },
                            { flight: 'QF404', route: 'SYD - MEL', crew: 6, captain: 'Cpt. B. Sisko', status: 'Scheduled' },
                            { flight: 'QF002', route: 'LHR - SYD', crew: 16, captain: 'Cpt. K. Janeway', status: 'Delayed' },
                        ].map((flight, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                        <Plane className="w-6 h-6 transform -rotate-45" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{flight.flight}</div>
                                        <div className="text-xs text-slate-500 font-mono">{flight.route}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Captain</div>
                                        <div className="font-bold text-sm">{flight.captain}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Comp.</div>
                                        <div className="font-bold text-sm">{flight.crew} Crew</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold w-20 text-center ${flight.status === 'In Air' ? 'bg-emerald-100 text-emerald-600' :
                                            flight.status === 'Delayed' ? 'bg-rose-100 text-rose-600' :
                                                flight.status === 'Boarding' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-slate-200 text-slate-600'
                                        }`}>{flight.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Globe className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Network Status</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">98.2%</h3>
                        <p className="text-indigo-100 text-sm mb-4">Crew assignment coverage for next 48 hours.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-sm transition-colors">View Gaps (2)</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Standby Crew</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Sarah Connor', location: 'SYD', role: 'CSM' },
                                { name: 'Kyle Reese', location: 'LAX', role: 'FA' },
                                { name: 'Ellen Ripley', location: 'LHR', role: 'FA' },
                            ].map((crew, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            {crew.role}
                                        </div>
                                        <span className="font-bold">{crew.name}</span>
                                    </div>
                                    <span className="text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{crew.location}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
