"use client";

import React, { useState } from 'react';
import {
    Container,
    Ship,
    Clock,
    AlertTriangle
} from 'lucide-react';

export default function PortOperationsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Container className="w-6 h-6 text-indigo-500" />
                        Port Operations
                    </h1>
                    <p className="text-slate-500 text-sm">Coordinate container handling and berth scheduling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Berth Schedule</h3>
                    <div className="space-y-4">
                        {[
                            { berth: 'Berth 1', ship: 'MV Pacific Star', eta: 'Arrived', etd: '18:00 Today', status: 'Unloading' },
                            { berth: 'Berth 2', ship: 'NYK Eagle', eta: '14:00 Today', etd: '06:00 Tomorrow', status: 'Inbound' },
                            { berth: 'Berth 3', ship: 'Empty', eta: '-', etd: '-', status: 'Available' },
                        ].map((berth, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                        <Ship className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{berth.berth}</div>
                                        <div className="text-sm text-slate-500">{berth.ship}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">ETD</div>
                                        <div className="font-bold text-sm">{berth.etd}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold w-24 text-center ${berth.status === 'Unloading' ? 'bg-amber-100 text-amber-600' :
                                            berth.status === 'Available' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-indigo-100 text-indigo-600'
                                        }`}>{berth.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Turnaround Metrics</h3>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">18.5h</div>
                            <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">-2.1h vs Avg</div>
                        </div>
                        <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70">Average dwell time per vessel this week.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Yard Analytics</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Utilization</span>
                                    <span className="font-bold">82%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[82%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Reefer Plugs</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[45%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

