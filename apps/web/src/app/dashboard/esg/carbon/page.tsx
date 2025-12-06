"use client";

import React from 'react';
import {
    Leaf,
    Cloud,
    Zap,
    Truck,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Plane
} from 'lucide-react';

export default function CarbonPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-emerald-500" />
                        Carbon Footprint
                    </h1>
                    <p className="text-slate-500 text-sm">Track emissions, energy usage, and sustainability goals.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                        <Cloud className="w-5 h-5 text-emerald-600" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold text-emerald-600 uppercase">Net Zero Target</span>
                            <span className="font-black text-lg text-emerald-700 dark:text-emerald-500">2030</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Emissions (YTD)</div>
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black">124.5 <span className="text-lg opacity-50">tCO2e</span></div>
                    <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -12% vs last year
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Energy Intensity</div>
                        <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black">45 <span className="text-lg opacity-50">kWh/sqft</span></div>
                    <div className="text-xs text-slate-400 mt-1">Within efficient range</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Offset Credits</div>
                        <Leaf className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black">500</div>
                    <div className="text-xs text-slate-400 mt-1">Verified Gold Standard</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Breakdown Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Emissions by Source</h3>
                    <div className="space-y-6 flex-1">
                        {[
                            { source: 'Business Travel', icon: Plane, val: 45, color: 'rose' },
                            { source: 'Office Electricity', icon: Zap, val: 30, color: 'amber' },
                            { source: 'Server/Cloud', icon: Cloud, val: 15, color: 'indigo' },
                            { source: 'Logistics', icon: Truck, val: 10, color: 'slate' },
                        ].map(item => (
                            <div key={item.source}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <item.icon className="w-4 h-4 text-slate-400" />
                                        {item.source}
                                    </div>
                                    <div className="font-mono font-bold text-sm">{item.val}%</div>
                                </div>
                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${item.color}-500`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6">Reduction Opportunities</h3>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Zap className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Switch to LED Lighting in Warehouse B</h4>
                                    <p className="text-xs text-emerald-800 dark:text-emerald-500 mt-1">
                                        Estimated Impact: <span className="font-bold">-2.5 tons CO2e/year</span>
                                    </p>
                                    <p className="text-xs text-emerald-700/70 mt-1">ROI: 8 months</p>
                                </div>
                            </div>
                            <button className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">
                                Approve Project
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                            <h4 className="font-bold text-sm">Optimize Cloud Instance Usage</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-2">
                                Rightsizing AWS EC2 instances can reduce energy consumption by 15%.
                            </p>
                            <button className="text-indigo-600 text-xs font-bold hover:underline">
                                View IT Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
