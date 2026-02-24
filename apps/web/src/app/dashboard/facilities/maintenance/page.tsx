"use client";

import React from 'react';
import {
    Activity,
    Calendar,
    Settings,
    CheckCircle,
    AlertTriangle,
    History
} from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Asset Maintenance
                    </h1>
                    <p className="text-slate-500 text-sm">Preventive care schedules and service history logs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Upcoming Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Service Schedule
                    </h3>

                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {[
                            { asset: 'Central HVAC Unit 1', task: 'Filter Replacement & Inspection', date: 'Tomorrow', type: 'Preventive', status: 'Pending' },
                            { asset: 'Elevator Bank A', task: 'Safety Certification', date: 'Dec 12, 2024', type: 'Compliance', status: 'Scheduled' },
                            { asset: 'Fire Alarm System', task: 'Battery Check & Drill', date: 'Dec 20, 2024', type: 'Safety', status: 'Scheduled' },
                            { asset: 'Generator Backup', task: 'Fuel Refill & Test Run', date: 'Dec 25, 2024', type: 'Routine', status: 'Scheduled' },
                        ].map((job, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 shrink-0">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{job.asset}</div>
                                        <div className="text-sm text-slate-500 mb-1">{job.task}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded">{job.type}</span>
                                            {job.status === 'Pending' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase"><AlertTriangle className="w-3 h-3" /> Due Soon</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <div className="flex items-center justify-end gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4 text-indigo-500" /> {job.date}
                                    </div>
                                    <button className="mt-2 text-xs font-bold text-indigo-600 hover:underline">
                                        Reschedule
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Health & History */}
                <div className="flex flex-col gap-3">
                    {/* Health Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2 font-bold mb-4 opacity-90">
                            <Activity className="w-5 h-5" /> Overall Asset Health
                        </div>
                        <div className="text-4xl font-black mb-1">98.2%</div>
                        <div className="text-sm opacity-80 mb-6">Operational Uptime</div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold opacity-70">
                                <span>Risk Level</span>
                                <span>Low</span>
                            </div>
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[15%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-500" /> Completed Logs
                        </h3>
                        <div className="space-y-4 overflow-y-auto flex-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">Coffee Machine #4 Repaired</div>
                                        <div className="text-xs text-slate-400">Yesterday by Vendor Tech</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

