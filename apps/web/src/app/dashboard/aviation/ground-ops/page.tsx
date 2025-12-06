"use client";

import React from 'react';
import {
    Briefcase,
    Truck,
    Clock,
    AlertTriangle,
    CheckSquare,
    Users
} from 'lucide-react';

export default function GroundOpsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-orange-500" />
                        Ground Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Ramp safety, baggage handling roster, and turnaround coordination.</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100 dark:border-orange-800/30">
                    <Clock className="w-4 h-4" /> Avg Turnaround: 42m
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Active Turnarounds */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Live Ramp Activity</h3>
                    {[
                        { flight: 'QF10', gate: 'G4', status: 'Baggage Loading', crew: 'Team Alpha', time: '15m remain' },
                        { flight: 'BA249', gate: 'G7', status: 'Pushback Prep', crew: 'Team Bravo', time: '5m remain' },
                        { flight: 'SQ221', gate: 'H1', status: 'Deboarding', crew: 'Team Charlie', time: '40m left' },
                        { flight: 'EK420', gate: 'H4', status: 'Catering', crew: 'Team Delta', time: '25m remain' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {f.flight.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{f.flight} @ {f.gate}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{f.crew}</div>
                                    <div className="text-xs text-orange-500 flex items-center gap-2 font-bold">
                                        <Truck className="w-3 h-3" /> {f.status}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{f.time}</div>
                                    <div className="text-xs text-slate-400">Time to Push</div>
                                </div>

                                <button className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-lg">
                                    Checklist
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Safety & Staffing */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> Ground Crew Roster
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-sm font-bold opacity-80">Baggage Handlers</span>
                                <span className="text-sm font-bold text-emerald-500">12 Active</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-sm font-bold opacity-80">Ramp Marshals</span>
                                <span className="text-sm font-bold text-emerald-500">4 Active</span>
                            </div>
                            <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                                <span className="text-sm font-bold opacity-80">Cleaners</span>
                                <span className="text-sm font-bold text-amber-500">6 (Low)</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">
                            Call In Casuals
                        </button>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                            <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">FOD Alert</h3>
                            <p className="text-xs text-rose-800 dark:text-rose-400 mt-1">
                                Debris reported near Gate G4 taxiway. Ramp inspection team dispatched.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
