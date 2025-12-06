"use client";

import React from 'react';
import {
    Wrench,
    Clock,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Settings
} from 'lucide-react';

export default function PlantMaintenancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-orange-500" />
                        Plant Maintenance
                    </h1>
                    <p className="text-slate-500 text-sm">Shift rosters, downtime tracking, and equipment logs.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Line A: Running
                    </div>
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Line B: Maintenance
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Shift Roster */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> 3-Shift Roster (Dec 06)
                            </h3>
                            <button className="text-sm font-bold text-indigo-600">View Full Schedule</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { shift: 'Shift A (06:00 - 14:00)', lead: 'Robert Fox', crew: 24, status: 'Completed' },
                                { shift: 'Shift B (14:00 - 22:00)', lead: 'Cody Fisher', crew: 22, status: 'Active' },
                                { shift: 'Shift C (22:00 - 06:00)', lead: 'Esther Howard', crew: 20, status: 'Scheduled' },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{s.shift}</div>
                                        <div className="text-xs text-slate-500 mt-1">Lead: {s.lead} • Crew: {s.crew} Employees</div>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${s.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                                                s.status === 'Active' ? 'bg-emerald-100 text-emerald-600 animate-pulse' :
                                                    'bg-indigo-100 text-indigo-600'}
                                        `}>
                                            {s.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Downtime Logs */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-rose-500" /> Recent Downtime
                        </h3>
                        <div className="space-y-4">
                            {[
                                { machine: 'Conveyor Belt 04', reason: 'Motor Overheat', dur: '45m', time: '10:30 AM' },
                                { machine: 'Packaging Unit 02', reason: 'Sensor Alignment', dur: '15m', time: '01:15 PM' },
                            ].map((log, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{log.machine}</div>
                                            <div className="text-xs text-slate-500">{log.reason}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-rose-600">{log.dur}</div>
                                        <div className="text-xs text-slate-400">{log.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Machine Status Sidebar */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Machine Health</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Mixer A1', health: 98, status: 'Good' },
                            { name: 'Mixer A2', health: 85, status: 'Warning' },
                            { name: 'Extruder B1', health: 92, status: 'Good' },
                            { name: 'Packager C1', health: 45, status: 'Critical' },
                        ].map((m, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold">{m.name}</span>
                                    <span className={`text-[10px] font-bold uppercase ${m.status === 'Good' ? 'text-emerald-500' :
                                            m.status === 'Warning' ? 'text-amber-500' :
                                                'text-rose-500'
                                        }`}>{m.status}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${m.health > 90 ? 'bg-emerald-500' :
                                                m.health > 60 ? 'bg-amber-500' :
                                                    'bg-rose-500'
                                            }`}
                                        style={{ width: `${m.health}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
