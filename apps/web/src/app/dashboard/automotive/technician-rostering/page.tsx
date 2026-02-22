"use client";

import React, { useState } from 'react';
import {
    Wrench,
    Calendar,
    Clock,
    UserCheck
} from 'lucide-react';

export default function TechnicianRosteringPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-indigo-500" />
                        Technician Rostering
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule service shifts and manage bay assignments.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button className="px-4 py-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-md text-sm font-bold text-slate-900 dark:text-slate-100">Daily</button>
                    <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-700">Weekly</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Bay Schedule (Today)</h3>
                        <div className="space-y-4">
                            {[
                                { bay: 'Bay 1 (Lifts)', tech: 'Mike Ross', job: 'Brake Service - Audi Q5', time: '08:00 - 11:00', status: 'In Progress' },
                                { bay: 'Bay 2 (Lifts)', tech: 'Harvey S.', job: 'Oil Change - BMW X5', time: '09:00 - 09:45', status: 'Completed' },
                                { bay: 'Bay 3 (Diagnostics)', tech: 'Donna P.', job: 'Engine Check - Ford F150', time: '10:00 - 12:00', status: 'Pending' },
                                { bay: 'Bay 4 (Detailing)', tech: 'Louis L.', job: 'Full Detail - Tesla Model 3', time: '08:30 - 12:30', status: 'In Progress' },
                            ].map((slot, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">{slot.bay}</div>
                                            <span className="text-slate-400">•</span>
                                            <div className="text-sm font-bold text-indigo-600">{slot.tech}</div>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">{slot.job}</div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3" /> {slot.time}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${slot.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                slot.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>{slot.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Technician Availability</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Mike Ross', skill: 'Master Tech', status: 'Busy' },
                                { name: 'Harvey Specter', skill: 'Senior Tech', status: 'Available' },
                                { name: 'Donna Paulsen', skill: 'Diagnostics', status: 'Busy' },
                                { name: 'Rachel Zane', skill: 'Apprentice', status: 'Available' },
                            ].map((tech, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                                            {tech.name.split(' ')[0][0]}{tech.name.split(' ')[1][0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{tech.name}</div>
                                            <div className="text-xs text-slate-500">{tech.skill}</div>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${tech.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

