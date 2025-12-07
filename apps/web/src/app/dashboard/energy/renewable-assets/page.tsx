"use client";

import React, { useState } from 'react';
import {
    Sun,
    Wind,
    Battery,
    ArrowUpRight
} from 'lucide-react';

export default function RenewableAssetsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sun className="w-6 h-6 text-indigo-500" />
                        Renewable Assets
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor solar panels, wind turbines, and storage batteries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Solar */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sun className="w-32 h-32 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                            <Sun className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">Solar Array A</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">1.2 MW</div>
                    <div className="text-sm text-emerald-500 font-bold mb-6 flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" /> Generating at 85% cap
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                            <div className="text-slate-500 text-xs">Irradiance</div>
                            <div className="font-bold">850 W/m²</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                            <div className="text-slate-500 text-xs">Efficiency</div>
                            <div className="font-bold">22.5%</div>
                        </div>
                    </div>
                </div>

                {/* Wind */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wind className="w-32 h-32 text-cyan-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 rounded-lg">
                            <Wind className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">Wind Farm North</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">0.8 MW</div>
                    <div className="text-sm text-slate-500 font-bold mb-6 flex items-center gap-1">
                        Low wind speeds detected
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                            <div className="text-slate-500 text-xs">Wind Speed</div>
                            <div className="font-bold">4.2 m/s</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                            <div className="text-slate-500 text-xs">Turbines</div>
                            <div className="font-bold">3/5 Active</div>
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Battery className="w-32 h-32 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                            <Battery className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">BESS Storage</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">82%</div>
                    <div className="text-sm text-indigo-500 font-bold mb-6 flex items-center gap-1">
                        Charging (124 kW)
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '82%' }}></div>
                    </div>
                    <div className="text-center mt-3 text-xs text-slate-500">2.4 MWh stored / 3.0 MWh capacity</div>
                </div>
            </div>
        </div>
    );
}
