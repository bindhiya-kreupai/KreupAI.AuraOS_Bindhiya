"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    Clock,
    Truck,
    PackageCheck
} from 'lucide-react';

export default function GroundOperationsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-500" />
                        Ground Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Coordinate turnaround, baggage, and fueling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { task: 'Turnaround - QF442', gate: 'Gate 4', time: '14:20', status: 'On Track', delay: '+0m' },
                    { task: 'Baggage Load - JQ12', gate: 'Gate 12', time: '14:35', status: 'Delayed', delay: '+15m' },
                    { task: 'Fueling - QF1', gate: 'Gate 8', time: '15:00', status: 'Pending', delay: '-' },
                ].map((op, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${op.status === 'On Track' ? 'bg-emerald-500' :
                                op.status === 'Delayed' ? 'bg-rose-500' :
                                    'bg-slate-300'
                            }`}></div>
                        <div className="pl-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">{op.gate}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${op.status === 'On Track' ? 'bg-emerald-100 text-emerald-600' :
                                        op.status === 'Delayed' ? 'bg-rose-100 text-rose-600' :
                                            'bg-slate-100 text-slate-500'
                                    }`}>{op.status}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-4">{op.task}</h3>

                            <div className="flex items-center gap-8">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Scheduled</div>
                                    <div className="font-mono font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        {op.time}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 mb-1">Variance</div>
                                    <div className={`font-mono font-bold ${op.delay.includes('+15') ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'
                                        }`}>{op.delay}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Resource Allocation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { res: 'Tugs', avail: '12/15', state: 'Good' },
                            { res: 'Belt Loaders', avail: '8/10', state: 'Good' },
                            { res: 'Fuel Trucks', avail: '3/4', state: 'Tight' },
                            { res: 'Cleaning Crews', avail: '5/5', state: 'Good' },
                        ].map((res, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                <div className="text-2xl font-bold mb-1">{res.avail}</div>
                                <div className="text-xs font-bold text-slate-500 uppercase">{res.res}</div>
                                <div className={`mt-2 text-[10px] font-bold uppercase ${res.state === 'Good' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>{res.state}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
