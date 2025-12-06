"use client";

import React from 'react';
import {
    CalendarDays,
    Users,
    UserPlus,
    AlertTriangle,
    Clock,
    UserCheck
} from 'lucide-react';

export default function RosteringPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-sky-500" />
                        Nurse Rostering
                    </h1>
                    <p className="text-slate-500 text-sm">Shift planning, patient-to-nurse ratios, and float pool.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-800/30 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> ICU Unit Understaffed
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Units Grid */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-20">
                    {[
                        { unit: 'ICU (Intensive Care)', patients: 12, nurses: 4, ratio: '1:3', target: '1:2', status: 'Critical' },
                        { unit: 'Emergency (ER)', patients: 35, nurses: 8, ratio: '1:4', target: '1:4', status: 'Optimal' },
                        { unit: 'Pediatrics', patients: 18, nurses: 5, ratio: '1:3.6', target: '1:4', status: 'Good' },
                        { unit: 'Surgical Ward', patients: 24, nurses: 4, ratio: '1:6', target: '1:5', status: 'Warning' },
                    ].map((u, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{u.unit}</h3>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${u.status === 'Optimal' || u.status === 'Good' ? 'bg-emerald-100 text-emerald-600' :
                                        u.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                                            'bg-rose-100 text-rose-600'}
                                `}>
                                    {u.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="text-xs text-slate-500 mb-1">Patients</div>
                                    <div className="text-xl font-bold flex items-center gap-2">
                                        {u.patients} <Users className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="text-xs text-slate-500 mb-1">Nurses On Shift</div>
                                    <div className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                                        {u.nurses} <UserCheck className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Current Ratio: {u.ratio}</span>
                                    <span>Target: {u.target}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full w-2/3 rounded-full ${u.status === 'Critical' ? 'bg-rose-500' : u.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                </div>
                                {u.status === 'Critical' && (
                                    <button className="w-full mt-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-800 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40">
                                        Request Float Nurse
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Float Pool Sidebar */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-500" /> Float Pool
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Nurse Joy', spec: 'ICU / ER', status: 'Available' },
                            { name: 'Ben Stone', spec: 'General', status: 'On Break' },
                            { name: 'Ann Perkins', spec: 'Pediatrics', status: 'Available' },
                        ].map((n, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group cursor-pointer hover:border-indigo-500 transition-colors">
                                <div>
                                    <div className="font-bold text-sm">{n.name}</div>
                                    <div className="text-xs text-slate-500">{n.spec}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-bold uppercase ${n.status === 'Available' ? 'text-emerald-500' : 'text-amber-500'}`}>{n.status}</span>
                                    <div className="opacity-0 group-hover:opacity-100 text-xs text-indigo-500 font-bold transition-opacity">Assign</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
