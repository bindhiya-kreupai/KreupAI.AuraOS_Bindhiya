"use client";

import React from 'react';
import {
    HardHat,
    MapPin,
    Users,
    Calendar,
    ArrowRightCircle,
    Truck
} from 'lucide-react';

export default function StaffingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Project Staffing
                    </h1>
                    <p className="text-slate-500 text-sm">Allocate crews to sites, manage labor budget, and transport.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <Calendar className="w-4 h-4" /> Week 42 Allocation
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { project: 'Skyline Tower (Phase 2)', loc: 'Downtown', crew: 45, type: 'Concrete & Steel', budget: '82%', status: 'Active' },
                    { project: 'River Bridge Repair', loc: 'Westside', crew: 12, type: 'Maintenance', budget: '50%', status: 'Active' },
                    { project: 'Mall Extension', loc: 'Suburbs', crew: 28, type: 'Interiors', budget: '15%', status: 'Starting Soon' },
                ].map((p, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{p.project}</h3>
                                <div className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {p.loc}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-indigo-100 text-indigo-600'}
                            `}>
                                {p.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Crew Size</div>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    {p.crew} <HardHat className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="text-xs text-slate-500 font-bold uppercase mb-1">Work Type</div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.type}</div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span>Labor Budget Used</span>
                                <span>{p.budget}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: p.budget }}></div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">
                                    Manage Roster
                                </button>
                                <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                                    <Truck className="w-4 h-4 group-hover:text-indigo-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Unassigned Labor Pool */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Wait Bench</h3>
                    <p className="text-sm text-slate-500 mb-6">12 Certified Electricians • 8 General Laborers awaiting assignment.</p>
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-2 rounded-xl text-sm font-bold shadow hover:shadow-md transition-all text-indigo-600 border border-slate-100 dark:border-slate-700">
                        View Available Staff <ArrowRightCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
