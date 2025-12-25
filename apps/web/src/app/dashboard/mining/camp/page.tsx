"use client";

import React from 'react';
import {
    Home,
    Utensils,
    Wifi,
    Zap,
    Bed,
    Search
} from 'lucide-react';

export default function CampPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Home className="w-6 h-6 text-orange-500" />
                        Camp Management
                    </h1>
                    <p className="text-slate-500 text-sm">Accommodation allocation, mess hall tracking, and facility services.</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100 dark:border-orange-800/30">
                    <Bed className="w-4 h-4" /> 845 / 900 Rooms Occupied
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Filters */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Camp Layout</h3>
                    <div className="space-y-2">
                        {['Block A (Exec)', 'Block B (Sup)', 'Block C (Crew)', 'Block D (Crew)', 'Block E (Quiet)'].map(s => (
                            <button key={s} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between group">
                                {s}
                                <span className="opacity-0 group-hover:opacity-100 text-xs bg-slate-200 px-1 rounded">View</span>
                            </button>
                        ))}
                    </div>

                    <h3 className="font-bold mt-8 mb-4">Services Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Wifi className="w-4 h-4 text-emerald-500" />
                            <span className="text-slate-600 dark:text-slate-300">Site Wi-Fi: <span className="text-emerald-500 font-bold">Online</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="text-slate-600 dark:text-slate-300">Power: <span className="text-emerald-500 font-bold">Stable</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Utensils className="w-4 h-4 text-emerald-500" />
                            <span className="text-slate-600 dark:text-slate-300">Mess Hall: <span className="text-emerald-500 font-bold">Open</span></span>
                        </div>
                    </div>
                </div>

                {/* Room Grid */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex gap-4 items-center">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Find room or resident..." className="bg-transparent outline-none flex-1 text-sm font-bold" />
                    </div>

                    <h3 className="font-bold text-lg mb-4">Block C - Recent Allocations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { room: 'C-101', resident: 'Dave Lister', shift: 'Night', status: 'Occupied', clean: 'Clean' },
                            { room: 'C-102', resident: 'Arnold Rimmer', shift: 'Day', status: 'Occupied', clean: 'Dirty' },
                            { room: 'C-103', resident: '-', shift: '-', status: 'Vacant', clean: 'Clean' },
                            { room: 'C-104', resident: 'Kristine Kochanski', shift: 'Day', status: 'Occupied', clean: 'Clean' },
                            { room: 'C-105', resident: 'Cat', shift: 'Night', status: 'Occupied', clean: 'Clean' },
                            { room: 'C-106', resident: '-', shift: '-', status: 'Maintenance', clean: 'N/A' },
                        ].map((r, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg transition-all relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full 
                                    ${r.status === 'Occupied' ? 'bg-emerald-500' : r.status === 'Maintenance' ? 'bg-rose-500' : 'bg-slate-300'}
                                `}></div>
                                <div className="pl-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{r.room}</h3>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${r.clean === 'Clean' ? 'bg-indigo-100 text-indigo-600' :
                                                r.clean === 'Dirty' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-400'}
                                        `}>
                                            {r.clean}
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">{r.resident}</div>
                                    <div className="text-xs text-slate-400">{r.shift === &apos;-' ? 'No Shift' : r.shift + ' Shift'}</div>

                                    {r.status === 'Occupied' && (
                                        <button className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-lg text-xs font-bold hover:bg-slate-100">
                                            Checkout
                                        </button>
                                    )}
                                    {r.status === 'Vacant' && (
                                        <button className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">
                                            Assign
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
