"use client";

import React from 'react';
import {
    Plane,
    Users,
    Calendar,
    Globe,
    Loader2
} from 'lucide-react';
import { useAviation } from '../hooks/useAviation';

export default function CabinCrewPage() {
    const { flightAssignments, crewMembers, loading, error } = useAviation();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const standbyCrew = crewMembers.filter(m => m.dutyStatus === 'standby');
    const inAirFlights = flightAssignments.filter(f => f.status === 'in_flight');

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
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {flightAssignments.map((flight, i) => (
                            <div key={flight.assignmentId || i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                        <Plane className="w-6 h-6 transform -rotate-45" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{flight.flightNumber}</div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {flight.departure.airportCode} - {flight.arrival.airportCode}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Director</div>
                                        <div className="font-bold text-sm">{flight.crewComplement.cabinDirector}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Comp.</div>
                                        <div className="font-bold text-sm">{flight.crewComplement.totalCrew} Crew</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold w-20 text-center ${flight.status === 'in_flight' ? 'bg-emerald-100 text-emerald-600' :
                                            flight.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                                                flight.status === 'boarding' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-slate-200 text-slate-600'
                                        }`}>
                                        {flight.status.charAt(0).toUpperCase() + flight.status.slice(1).replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {flightAssignments.length === 0 && (
                            <div className="text-center py-20 text-slate-400 font-bold">No active flights recorded.</div>
                        )}
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
                            {standbyCrew.map((crew, i) => (
                                <div key={crew.crewId || i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            {crew.crewType.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold">{crew.personalInfo.firstName} {crew.personalInfo.lastName}</span>
                                    </div>
                                    <span className="text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{crew.personalInfo.homeBase}</span>
                                </div>
                            ))}
                            {standbyCrew.length === 0 && (
                                <div className="text-xs text-slate-400 py-4 text-center italic">No crew on standby.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
