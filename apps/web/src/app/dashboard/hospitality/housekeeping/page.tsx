"use client";

import React, { useState } from 'react';
import {
    BedDouble,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function HousekeepingPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BedDouble className="w-6 h-6 text-indigo-500" />
                        Housekeeping
                    </h1>
                    <p className="text-slate-500 text-sm">Track room status and cleaning assignments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Clean', count: 145, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                    { label: 'Dirty', count: 42, color: 'text-rose-500', bg: 'bg-rose-500' },
                    { label: 'Inspecting', count: 12, color: 'text-amber-500', bg: 'bg-amber-500' },
                    { label: 'Do Not Disturb', count: 8, color: 'text-slate-400', bg: 'bg-slate-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
                        <div className="text-sm font-bold text-slate-500 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Priority List</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { room: 'Room 402', type: 'VIP Suite', status: 'Dirty - Priority', assigned: 'Maria R.', time: 'Vacated 1h ago' },
                        { room: 'Room 305', type: 'Double Queen', status: 'Inspection Required', assigned: 'Sup. John', time: 'Cleaned 10m ago' },
                        { room: 'Room 512', type: 'King Deluxe', status: 'Dirty', assigned: 'Sarah L.', time: 'Vacated 2h ago' },
                    ].map((room, i) => (
                        <div key={i} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-600">
                                    {room.room.split(' ')[1]}
                                </div>
                                <div>
                                    <div className="font-bold">{room.room} <span className="text-slate-400 font-normal">• {room.type}</span></div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {room.time}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 md:mt-0">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Assigned To</div>
                                    <div className="font-bold text-sm">{room.assigned}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.status.includes('Priority') ? 'bg-rose-100 text-rose-600' :
                                        room.status.includes('Inspection') ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-200 text-slate-600'
                                    }`}>{room.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

