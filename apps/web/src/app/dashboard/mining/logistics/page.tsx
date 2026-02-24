"use client";

import React from 'react';
import {
    Plane,
    CalendarClock,
    UserCheck,
    Map,
    Briefcase,
    AlertCircle
} from 'lucide-react';

export default function FifoLogisticsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plane className="w-6 h-6 text-sky-500" />
                        FIFO Logistics
                    </h1>
                    <p className="text-slate-500 text-sm">Fly-In Fly-Out rosters, charter manifests, and travel bookings.</p>
                </div>
                <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-xl text-sm font-bold border border-sky-100 dark:border-sky-800/30">
                    <CalendarClock className="w-4 h-4" /> Swing Change: Tomorrow (0600)
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Flight Manifests */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Inbound</h3>
                                <div className="text-xs text-sky-500 font-bold">142 Arriving (QF1942)</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Outbound</h3>
                                <div className="text-xs text-slate-400 font-bold">138 Departing (QF1943)</div>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2">Upcoming Rosters</h3>
                    {[
                        { crew: 'Alpha Shift (Mining)', route: 'Perth -> Pilbara', date: 'Dec 07, 06:00', seats: '84/90', status: 'Confirmed' },
                        { crew: 'Bravo Shift (Maintenance)', route: 'Pilbara -> Perth', date: 'Dec 07, 18:30', seats: '42/50', status: 'Boarding Soon' },
                        { crew: 'Management / Geologists', route: 'Kalgoorlie -> Perth', date: 'Dec 08, 08:00', seats: '12/12', status: 'Full' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center font-bold text-sky-600">
                                    <Plane className="w-6 h-6 rotate-45" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{f.crew}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{f.route}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <CalendarClock className="w-3 h-3" /> {f.date}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{f.seats}</div>
                                    <div className="text-xs text-slate-400">Seats</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${f.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' :
                                            f.status === 'Boarding Soon' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                                                'bg-rose-100 text-rose-600'}
                                    `}>
                                        {f.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">View Manifest</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Swing Patterns */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Map className="w-5 h-5 text-indigo-500" /> Roster Patterns
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">2:1 Swing (14 On / 7 Off)</h4>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">Standard</span>
                                </div>
                                <p className="text-xs text-slate-500">Production Crew • Next Change: Mon</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">8:6 Swing (8 On / 6 Off)</h4>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">Management</span>
                                </div>
                                <p className="text-xs text-slate-500">Supervisors • Next Change: Wed</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">4:1 Swing (28 On / 7 Off)</h4>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">Construction</span>
                                </div>
                                <p className="text-xs text-slate-500">Project Staff • Next Change: Fri</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                            <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">Missed Flights</h3>
                            <p className="text-xs text-rose-800 dark:text-rose-400 mt-1">
                                3 staff missed QF1942. Needs rebooking + HR warning log.
                            </p>
                            <button className="mt-2 text-xs font-bold text-rose-700 hover:underline">Process Incident</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

