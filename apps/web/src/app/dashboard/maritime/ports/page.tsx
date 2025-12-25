"use client";

import React from 'react';
import {
    Container,
    Ship,
    Truck,
    Clock,
    UserCheck,
    Anchor
} from 'lucide-react';

export default function PortOpsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Container className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        Port Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Stevedore staffing, crane operator shifts, and vessel turnaround.</p>
                </div>
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 px-4 py-2 rounded-xl text-sm font-bold border border-teal-100 dark:border-teal-800/30">
                    <Ship className="w-4 h-4" /> 3 Vessels at Berth
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Berth Plan */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Berth Activity & Staffing</h3>
                    {[
                        { berth: 'Berth 1', vessel: 'MV Eve (Maersk)', load: 'Discharging', crane: 'Crane 1 & 2', staff: 'Gang A (12 Pax)', status: 'Active' },
                        { berth: 'Berth 2', vessel: 'MV Adam (MSC)', load: 'Loading', crane: 'Crane 3', staff: 'Gang B (8 Pax)', status: 'Active' },
                        { berth: 'Berth 3', vessel: '-', load: 'Empty', crane: '-', staff: '-', status: 'Idle' },
                        { berth: 'Berth 4', vessel: 'MV Hapag (Inbound)', load: 'ETA 14:00', crane: 'Prep', staff: 'Gang C (Standby)', status: 'Planned' },
                    ].map((b, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                                    {b.berth}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{b.vessel}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{b.load}</div>
                                    <div className="text-xs text-teal-600 flex items-center gap-2 font-bold">
                                        <Truck className="w-3 h-3" /> {b.crane}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{b.staff === &apos;-' ? 'No Gang' : b.staff.split('(')[0]}</div>
                                    <div className="text-xs text-slate-400">{b.staff.includes(&apos;Pax') ? b.staff.split('(')[1].replace(')', '') : 'Unassigned'}</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${b.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                            b.status === 'Planned' ? 'bg-indigo-100 text-indigo-600' :
                                                'bg-slate-100 text-slate-400'}
                                    `}>
                                        {b.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Labor Pool */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-indigo-500" /> Labor Pool (Casuals)
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">42</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">On Site</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                <div className="text-2xl font-bold text-emerald-600">15</div>
                                <div className="text-xs text-emerald-700 font-bold uppercase">Available</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">
                                Call Gang (4 Hours)
                            </button>
                            <button className="w-full py-2 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700">
                                Release Shift
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-teal-400" /> Shift Forecast
                        </h3>
                        <div className="text-sm opacity-80 mb-4">
                            Heavy rain expected 18:00. Cranes may stop. Night shift reduced?
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
                            Send Alert to Foreman
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
