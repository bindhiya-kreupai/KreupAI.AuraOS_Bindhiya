"use client";

import React from 'react';
import {
    Home,
    Bed,
    ClipboardCheck,
    AlertCircle,
    Users,
    Droplets
} from 'lucide-react';

export default function HousingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Home className="w-6 h-6 text-indigo-500" />
                        Housing Managment (H-2A)
                    </h1>
                    <p className="text-slate-500 text-sm">Dormitory allocation, health inspections, and utility tracking.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <Bed className="w-4 h-4" /> 92% Occupancy
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Dorm List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Inspections</h3>
                                <div className="text-xs text-emerald-500 font-bold">All Passed (Oct)</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Maintenance</h3>
                                <div className="text-xs text-rose-500 font-bold">2 Open Tickets</div>
                            </div>
                        </div>
                    </div>

                    {[
                        { name: 'Dormitory Alpha', caps: '40/40', status: 'Full', type: 'Male', steward: 'M. Johnson' },
                        { name: 'Dormitory Beta', caps: '32/40', status: 'Available', type: 'Male', steward: 'J. Doe' },
                        { name: 'Dormitory Gamma', caps: '30/30', status: 'Full', type: 'Female', steward: 'S. Smith' },
                        { name: 'Family Units', caps: '8/12', status: 'Available', type: 'Family', steward: 'R. Roe' },
                    ].map((d, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                                    {d.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{d.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">Steward: {d.steward}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Users className="w-3 h-3" /> {d.type} Housing
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{d.caps}</div>
                                    <div className="text-xs text-slate-400">Beds Occupied</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${d.status === 'Available' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-slate-100 text-slate-600'}
                                    `}>
                                        {d.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">View Roster</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Maintenance Log */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-sky-500" /> Maintenance & Safety
                    </h3>
                    <div className="space-y-4">
                        {[
                            { issue: 'Leaking Faucet - Dorm B', priority: 'Low', date: 'Today' },
                            { issue: 'Heater Malfunction - Alpha', priority: 'High', date: 'Yesterday' },
                            { issue: 'Weekly Fire Alarm Test', priority: 'Routine', date: 'Scheduled Dec 10' },
                        ].map((m, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">{m.issue}</h4>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                        ${m.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                                            m.priority === 'Routine' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-slate-200 text-slate-600'}
                                    `}>
                                        {m.priority}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{m.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
