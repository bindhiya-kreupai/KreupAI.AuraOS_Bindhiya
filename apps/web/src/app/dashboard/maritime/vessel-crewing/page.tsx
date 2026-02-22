"use client";

import React, { useState } from 'react';
import {
    Anchor,
    Users,
    MapPin,
    CalendarClock
} from 'lucide-react';

export default function VesselCrewingPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Anchor className="w-6 h-6 text-indigo-500" />
                        Vessel Crewing
                    </h1>
                    <p className="text-slate-500 text-sm">Assign seafarers and manage rotations.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Recruit Seafarer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { vessel: 'MV Pacific Star', type: 'Container', loc: 'Singapore', crew: '22/24', status: 'Sailing' },
                    { vessel: 'SS Northern Light', type: 'Tanker', loc: 'Rotterdam', crew: '18/18', status: 'Docked' },
                    { vessel: 'RV Ocean Explorer', type: 'Research', loc: 'Antarctica', crew: '12/12', status: 'Expedition' },
                ].map((ship, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                                <Anchor className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${ship.status === 'Sailing' ? 'bg-indigo-100 text-indigo-600' :
                                    ship.status === 'Docked' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-cyan-100 text-cyan-600'
                                }`}>{ship.status}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{ship.vessel}</h3>
                        <div className="text-sm text-slate-500 mb-4">{ship.type} Vessel</div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{ship.loc}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="font-bold">{ship.crew} Onboard</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Crew Manifest</button>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg mb-4">Rotation Schedule</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Seafarer</th>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Vessel</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sign On/Off</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Capt. A. Haddock', rank: 'Master', vessel: 'MV Pacific Star', status: 'Onboard', date: 'Sign Off: Nov 15' },
                                { name: 'Off. W. Turner', rank: 'Chief Mate', vessel: 'SS Northern Light', status: 'Leave', date: 'Sign On: Oct 30' },
                                { name: 'Eng. M. Quinn', rank: 'Chief Eng', vessel: 'RV Ocean Explorer', status: 'Onboard', date: 'Sign Off: Dec 01' },
                            ].map((person, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{person.name}</td>
                                    <td className="px-6 py-4">{person.rank}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500">{person.vessel}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${person.status === 'Onboard' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>{person.status}</span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <CalendarClock className="w-4 h-4 text-slate-400" />
                                        {person.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

