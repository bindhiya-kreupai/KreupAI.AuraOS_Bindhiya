"use client";

import React, { useState } from 'react';
import {
    LayoutGrid,
    Users,
    Maximize,
    MapPin,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';

export default function SpaceManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-indigo-500" />
                        Space Management
                    </h1>
                    <p className="text-slate-500 text-sm">Floor plans, seat allocation, and occupancy tracking.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                        <option>Headquarters - Floor 1</option>
                        <option>Headquarters - Floor 2</option>
                        <option>Innovation Hub - Floor A</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Floor Plan Visualizer (Mock) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Occupied</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Reserved</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Maintenance</div>
                        </div>
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                            <Maximize className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Visual Mock of Floor Plan */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 p-10 relative overflow-auto">
                        <div className="w-[800px] h-[500px] border-4 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 mx-auto rounded-lg relative shadow-xl">
                            {/* Rooms */}
                            <div className="absolute top-4 left-4 w-32 h-24 border-2 border-slate-400 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Conf Room A
                            </div>
                            <div className="absolute bottom-4 right-4 w-40 h-32 border-2 border-slate-400 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-700/50">
                                Cafeteria
                            </div>

                            {/* Desks */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-4 gap-3">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className={`
                                        w-12 h-12 rounded-lg border flex items-center justify-center text-[10px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm
                                        ${i % 5 === 0 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                                            i % 3 === 0 ? 'bg-amber-100 border-amber-300 text-amber-700' :
                                                'bg-rose-100 border-rose-300 text-rose-700'}
                                    `}>
                                        {100 + i}
                                    </div>
                                ))}
                            </div>

                            <div className="absolute top-10 right-20 grid grid-cols-2 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="w-12 h-12 bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 cursor-not-allowed" title="Under Maintenance">
                                        M-{i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Controls & Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Seat Details
                    </h3>

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-xl font-bold text-rose-600">
                                103
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Current Occupant</div>
                                <div className="font-bold text-lg">Sarah Jenkins</div>
                                <div className="text-xs text-indigo-600">Product Design</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Allocated</div>
                                <div className="text-sm font-bold">Jan 12, 2024</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Shift</div>
                                <div className="text-sm font-bold">General</div>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors">
                            De-allocate Seat
                        </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="font-bold text-sm mb-3">Quick Allocation</h4>
                        <div className="flex gap-2 mb-3">
                            <input type="text" placeholder="Search Employee..." className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none" />
                            <button className="bg-indigo-500 text-white p-2 rounded-lg">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {['John Doe', 'Mike Ross'].map(name => (
                                <div key={name} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group">
                                    <div className="text-xs font-bold">{name}</div>
                                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

