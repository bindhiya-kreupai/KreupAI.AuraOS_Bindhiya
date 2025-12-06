"use client";

import React from 'react';
import {
    Package,
    Users,
    Calendar,
    ArrowUpRight,
    Search,
    BarChart3
} from 'lucide-react';

export default function WarehousePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        Warehouse Staffing
                    </h1>
                    <p className="text-slate-500 text-sm">Peak season scaling, shift bidding, and productivity metrics.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <ArrowUpRight className="w-4 h-4" /> Peak Season Active
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Staff List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg">Shift Bidding Open</h3>
                            <p className="text-sm opacity-80">Night Shift (Dec 12 - Dec 18) has 15 open slots +$2/hr bonus.</p>
                        </div>
                        <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                            Manage Bids
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Find warehouse associate..." className="flex-1 bg-transparent outline-none text-sm font-bold" />
                    </div>

                    {[
                        { name: 'Darryl Philbin', role: 'Foreman', shift: 'Day (06:00 - 14:00)', status: 'Active', perf: '98%' },
                        { name: 'Roy Anderson', role: 'Forklift Op', shift: 'Day (06:00 - 14:00)', status: 'On Break', perf: '85%' },
                        { name: 'Val Johnson', role: 'Packer', shift: 'Swing (14:00 - 22:00)', status: 'Scheduled', perf: '95%' },
                        { name: 'Hidetoshi Hasagawa', role: 'Picker', shift: 'Night (22:00 - 06:00)', status: 'Scheduled', perf: '100% 👍' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {s.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{s.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{s.role}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {s.shift}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-emerald-600">{s.perf}</div>
                                    <div className="text-xs text-slate-400">Pick Rate</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            s.status === 'On Break' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'}
                                    `}>
                                        {s.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">Change Shift</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Productivity Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Output Today
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Packages Shipped</div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">2,450</div>
                                <div className="text-[10px] text-emerald-500 font-bold mt-1">+5% vs target</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Receiving Dock</div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">120 <span className="text-sm font-normal text-slate-400">pallets</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Staffing Gaps</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg">
                                <span className="font-bold text-rose-700 dark:text-rose-400">Packers (Night)</span>
                                <span className="text-xs font-bold bg-white dark:bg-rose-950 px-2 py-1 rounded text-rose-600">-4 People</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                                <span className="font-bold text-amber-700 dark:text-amber-400">Forklift (Swing)</span>
                                <span className="text-xs font-bold bg-white dark:bg-amber-950 px-2 py-1 rounded text-amber-600">-1 Person</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">
                            Call-in Temp Staff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
