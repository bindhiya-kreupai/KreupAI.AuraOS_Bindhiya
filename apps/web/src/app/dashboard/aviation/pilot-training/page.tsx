"use client";

import React, { useState } from 'react';
import {
    Award,
    CalendarCheck,
    AlertCircle,
    BookOpen
} from 'lucide-react';

export default function PilotTrainingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-indigo-500" />
                        Pilot Training
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor certifications, sim hours, and recurrency.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'A380 Type Rating', count: 142, status: 'Active' },
                    { label: 'B787 Type Rating', count: 95, status: 'Active' },
                    { label: 'Recurrency Due', count: 8, status: 'Warning' },
                    { label: 'Sim Sessions', count: 12, status: 'Scheduled' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-500 text-sm uppercase">{stat.label}</h3>
                            {stat.status === 'Warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.count}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Training Compliance Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Pilot</th>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Fleet</th>
                                <th className="px-6 py-4">Sim Check</th>
                                <th className="px-6 py-4">Medical</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Maverick M.', rank: 'Captain', fleet: 'F-18 (sim)', sim: 'Valid until Dec', med: 'Valid until Mar', status: 'Clear' },
                                { name: 'Iceman K.', rank: 'Captain', fleet: 'F-18 (sim)', sim: 'Valid until Nov', med: 'Valid until Jan', status: 'Clear' },
                                { name: 'Goose B.', rank: 'FO', fleet: 'F-14', sim: 'Expiring in 14d', med: 'Valid until Jun', status: 'Warning' },
                                { name: 'Viper M.', rank: 'Check Capt', fleet: 'A4', sim: 'Valid until Oct', med: 'Expired yesterday', status: 'Grounded' },
                            ].map((pilot, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold">{pilot.name}</td>
                                    <td className="px-6 py-4">{pilot.rank}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500">{pilot.fleet}</td>
                                    <td className={`px-6 py-4 ${pilot.sim.includes('Expiring') ? 'text-amber-600 font-bold' : ''}`}>{pilot.sim}</td>
                                    <td className={`px-6 py-4 ${pilot.med.includes('Expired') ? 'text-rose-600 font-bold' : ''}`}>{pilot.med}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${pilot.status === 'Clear' ? 'bg-emerald-100 text-emerald-600' :
                                                pilot.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-rose-100 text-rose-600'
                                            }`}>{pilot.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
