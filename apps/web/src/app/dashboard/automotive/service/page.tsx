"use client";

import React from 'react';
import {
    Wrench,
    Clock,
    Car,
    Activity,
    Settings,
    CheckCircle2
} from 'lucide-react';

export default function ServicePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        Service Center Management
                    </h1>
                    <p className="text-slate-500 text-sm">Technician checks, service bay allocation, and efficiency tracking.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                    <Car className="w-4 h-4" /> 22 Vehicles In Service
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                {/* Bay Status */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="font-bold mb-4">Service Bays</h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Bay 1 (Lift)', status: 'Occupied', car: 'Ford F-150', tech: 'Mike R.' },
                            { name: 'Bay 2 (Lift)', status: 'Occupied', car: 'Toyota Camry', tech: 'Sarah L.' },
                            { name: 'Bay 3 (Diagnostics)', status: 'Available', car: '-', tech: '-' },
                            { name: 'Bay 4 (Alignment)', status: 'Maintenance', car: '-', tech: '-' },
                            { name: 'Bay 5 (Quick Lube)', status: 'Occupied', car: 'Honda Civic', tech: 'Davie B.' },
                        ].map((b, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{b.name}</span>
                                    <div className={`w-2 h-2 rounded-full ${b.status === 'Occupied' ? 'bg-emerald-500' : b.status === 'Maintenance' ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="text-xs text-slate-500 font-bold">{b.status}</div>
                                {b.status === 'Occupied' && (
                                    <div className="text-xs text-indigo-500 mt-1">{b.car} • {b.tech}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technician Roster */}
                <div className="lg:col-span-3 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-4">Technician Efficiency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Mike Ross', level: 'Master Tech', efficiency: '115%', hours: '38.5', status: 'Working' },
                            { name: 'Sarah Lance', level: 'Senior Tech', efficiency: '98%', hours: '35.0', status: 'Working' },
                            { name: 'Davie Bowie', level: 'Lube Tech', efficiency: '102%', hours: '20.0', status: 'Break' },
                            { name: 'John Diggle', level: 'Diagnostic', efficiency: '88%', hours: '36.0', status: 'Working' },
                            { name: 'Thea Queen', level: 'Apprentice', efficiency: '92%', hours: '40.0', status: 'Training' },
                            { name: 'Roy Harper', level: 'Senior Tech', efficiency: '105%', hours: '37.5', status: 'Off' },
                        ].map((t, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all relative overflow-hidden group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.name}</h3>
                                        <div className="text-xs font-bold text-slate-500">{t.level}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                        <div className="text-xs text-slate-400 uppercase font-bold">Efficiency</div>
                                        <div className={`text-lg font-bold ${parseInt(t.efficiency) >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{t.efficiency}</div>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                                        <div className="text-xs text-slate-400 uppercase font-bold">Hours</div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{t.hours}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${t.status === 'Working' ? 'bg-emerald-100 text-emerald-600' :
                                            t.status === 'Break' ? 'bg-amber-100 text-amber-600' :
                                                t.status === 'Training' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-slate-100 text-slate-400'}
                                    `}>
                                        {t.status}
                                    </span>
                                    <button className="text-xs font-bold text-indigo-500 group-hover:underline">View Jobs</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6 flex items-start gap-4">
                        <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Tool Calibration Due</h3>
                            <p className="text-xs text-indigo-800 dark:text-indigo-400 mt-1">
                                Torque wrenches in Bay 2 and 4 require annual certification by Monday.
                            </p>
                            <button className="mt-2 text-xs font-bold text-indigo-700 hover:underline">Schedule Vendor</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
