"use client";

import React, { useState } from 'react';
import {
    Truck,
    CalendarClock,
    Wrench,
    Plus
} from 'lucide-react';

export default function EquipmentLeasingPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-500" />
                        Equipment Leasing
                    </h1>
                    <p className="text-slate-500 text-sm">Manage heavy machinery rentals and maintenance schedules.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Rent Equipment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {[
                    { name: 'Caterpillar 320 Excavator', loc: 'Skyline Site', status: 'Active', end: 'Dec 15, 2024', cost: '$450/day' },
                    { name: 'JCB 3DX Backhoe', loc: 'Metro Station', status: 'Maintenance', end: 'Jan 10, 2025', cost: '$300/day' },
                    { name: 'Tower Crane 50T', loc: 'Skyline Site', status: 'Active', end: 'Jun 30, 2025', cost: '$1200/day' },
                    { name: 'Bobcat Skid Steer', loc: 'Riverside', status: 'Idle', end: 'Dec 31, 2024', cost: '$200/day' },
                ].map((eq, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-125 transition-transform duration-500">
                            <Truck className="w-24 h-24" />
                        </div>
                        <h3 className="font-bold text-lg w-3/4 mb-1">{eq.name}</h3>
                        <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" /> Ends: {eq.end}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${eq.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                    eq.status === 'Maintenance' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                }`}>{eq.status}</span>
                            <span className="text-xs font-bold text-slate-400">@ {eq.loc}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-indigo-600">{eq.cost}</span>
                            {eq.status === 'Maintenance' && (
                                <button className="text-xs text-rose-500 flex items-center gap-1 font-bold">
                                    <Wrench className="w-3 h-3" /> Report Issue
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

