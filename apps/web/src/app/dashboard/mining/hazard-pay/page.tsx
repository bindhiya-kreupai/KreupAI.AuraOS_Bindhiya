"use client";

import React from 'react';
import {
    CircleDollarSign,
    AlertTriangle,
    Activity,
    HardHat,
    ArrowUpRight
} from 'lucide-react';

export default function HazardPayPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Hazard Pay & Allowances
                    </h1>
                    <p className="text-slate-500 text-sm">Underground depth tracking, risk allowances, and exposure logs.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <Activity className="w-4 h-4" /> Log Exposure Incident
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Allowance Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600"><CircleDollarSign className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">$124,500</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Hazard Pay (MTD)</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500"><HardHat className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">342</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Staff Underground</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500"><Activity className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Health Checks Due</div>
                        </div>
                    </div>
                </div>

                {/* Allowance Categories & Rates */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4">Current Rates (Per Shift)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-sm font-bold text-slate-300">Underground (Standard)</span>
                                <span className="text-lg font-bold text-emerald-400">+$45.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-sm font-bold text-slate-300">Deep Shaft (>1km)</span>
                                <span className="text-lg font-bold text-emerald-400">+$85.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-sm font-bold text-slate-300">Explosives Handling</span>
                                <span className="text-lg font-bold text-emerald-400">+$120.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-sm font-bold text-slate-300">High Temp Zone</span>
                                <span className="text-lg font-bold text-emerald-400">+$30.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Log */}
                <div className="lg:col-span-2 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Daily Exposure Log</h3>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-3 pl-2">Employee</th>
                                    <th className="pb-3">Zone / Activity</th>
                                    <th className="pb-3">Duration</th>
                                    <th className="pb-3 text-right pr-2">Allowance</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { name: 'Sam Bell', zone: 'Sector 4 (Deep)', duration: '12h Shift', amount: '+$85.00' },
                                    { name: 'Ellen Ripley', zone: 'Loader Ops', duration: '12h Shift', amount: '+$45.00' },
                                    { name: 'C. Kane', zone: 'Explosives Setup', duration: '4h Task', amount: '+$120.00' },
                                    { name: 'Dallas Arthur', zone: 'Sector 4 (Deep)', duration: '12h Shift', amount: '+$85.00' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                        <td className="py-4 text-slate-600 dark:text-slate-400">{row.zone}</td>
                                        <td className="py-4 text-slate-500 font-mono text-xs">{row.duration}</td>
                                        <td className="py-4 text-right pr-2 font-bold text-emerald-600 font-mono">{row.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">
                            Load More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
