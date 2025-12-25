"use client";

import React from 'react';
import {
    Briefcase,
    Calendar,
    DollarSign,
    CheckCircle,
    Building,
    FileSignature
} from 'lucide-react';

export default function LocumPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                        Locum Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage agency staff, temporary shifts, and timesheets.</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                    <Calendar className="w-4 h-4" /> Book Agency Staff
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Active Locums */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Active Shifts</h3>
                    {[
                        { name: 'Dr. John Doe (Locum)', agency: 'HealthStaff Pro', shift: 'Night Shift (ER)', date: 'Dec 06 - Dec 08', rate: '$150/hr', status: 'On Shift' },
                        { name: 'Nurse Jane (Agency)', agency: 'QuickNurse', shift: 'Day Shift (ICU)', date: 'Dec 06', rate: '$65/hr', status: 'Checked In' },
                        { name: 'Dr. Emily Blunt', agency: 'MediTemps', shift: 'Weekend Coverage', date: 'Dec 09 - Dec 10', rate: '$160/hr', status: 'Scheduled' },
                    ].map((locum, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-emerald-600">
                                    LH
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{locum.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                                        <Building className="w-3 h-3" /> {locum.agency}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {locum.date} • {locum.shift}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${locum.status === 'On Shift' ? 'bg-emerald-100 text-emerald-600 animate-pulse' :
                                        locum.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-amber-100 text-amber-600'}
                                `}>
                                    {locum.status}
                                </span>
                                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{locum.rate}</div>
                            </div>
                        </div>
                    ))}

                    <h3 className="font-bold text-lg mt-8 mb-2">Pending Timesheets</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FileSignature className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Weekly Summary: Nov 27 - Dec 03</h4>
                                <div className="text-xs text-slate-500">3 Locums • Total Hours: 124</div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">Review & Sign</button>
                    </div>
                </div>

                {/* Agency Stats */}
                <div className="space-y-6">
                    <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg shadow-emerald-500/20">
                        <h3 className="font-bold text-lg mb-2">Monthly Spend</h3>
                        <div className="text-3xl font-bold mb-1">$14,250</div>
                        <p className="text-xs opacity-80 mb-4">
                            12% lower than last month. Good job optimizing roster gaps!
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Agency Performance</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'HealthStaff Pro', rating: 4.8, reliability: 'High' },
                                { name: 'MediTemps', rating: 4.2, reliability: 'Medium' },
                                { name: 'QuickNurse', rating: 3.9, reliability: 'Low' },
                            ].map((a, i) => (
                                <div key={i} className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div>
                                        <div className="font-bold text-sm">{a.name}</div>
                                        <div className="flex text-xs text-slate-400 gap-1">{[1, 2, 3, 4].map(x => &apos;⭐')} <span className="text-slate-600 font-bold">{a.rating}</span></div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800
                                        ${a.reliability === 'High' ? 'text-emerald-500' : a.reliability === 'Medium' ? 'text-amber-500' : 'text-rose-500'}
                                    `}>
                                        {a.reliability} Rel.
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
