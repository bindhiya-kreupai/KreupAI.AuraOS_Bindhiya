"use client";

import React, { useState } from 'react';
import {
    Wrench,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Settings
} from 'lucide-react';

export default function PlantMaintenancePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-indigo-500" />
                        Plant Maintenance
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule repairs and track equipment health.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule Maintenance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Equipment Status</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Hydraulic Press A1', status: 'Operational', health: 92, lastMaint: '2 weeks ago', nextMaint: 'In 1 month' },
                            { name: 'Conveyor Belt C3', status: 'Warning', health: 78, lastMaint: '1 month ago', nextMaint: 'Tomorrow' },
                            { name: 'Assembly Robot R5', status: 'Operational', health: 98, lastMaint: '3 days ago', nextMaint: 'In 3 months' },
                            { name: 'Cooling System B2', status: 'Critical', health: 45, lastMaint: '6 months ago', nextMaint: 'Overdue' },
                        ].map((machine, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${machine.status === 'Operational' ? 'bg-emerald-100 text-emerald-600' :
                                            machine.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'
                                        }`}>
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{machine.name}</div>
                                        <div className="text-xs text-slate-500">Last: {machine.lastMaint}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Health</div>
                                        <div className={`font-bold ${machine.health > 90 ? 'text-emerald-500' : machine.health > 70 ? 'text-amber-500' : 'text-rose-500'
                                            }`}>{machine.health}%</div>
                                    </div>
                                    <div className="flex flex-col items-end min-w-[100px]">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Next Service</div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{machine.nextMaint}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Upcoming Tasks</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm text-amber-700 dark:text-amber-500">Conveyor Belt C3 Service</h4>
                                    <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1">Scheduled for tomorrow at 8:00 AM. Technician assigned: Mike R.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-400">Weekly Inspection</h4>
                                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/70 mt-1">Routine check completed for Line A. Report pending approval.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
