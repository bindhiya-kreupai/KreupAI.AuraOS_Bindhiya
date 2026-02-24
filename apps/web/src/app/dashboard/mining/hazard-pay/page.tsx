"use client";

import React, { useState } from 'react';
import {
    AlertTriangle,
    DollarSign,
    HardHat,
    FileText
} from 'lucide-react';

export default function HazardPayPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-indigo-500" />
                        Hazard Pay
                    </h1>
                    <p className="text-slate-500 text-sm">Calculate allowances for high-risk zones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Zone / Activity</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">Rate Multiplier</th>
                                <th className="px-6 py-4">Active Personnel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { zone: 'Underground Shaft A', level: 'High', rate: '1.5x', active: 45 },
                                { zone: 'Processing Plant', level: 'Medium', rate: '1.25x', active: 32 },
                                { zone: 'Open Pit', level: 'Medium', rate: '1.2x', active: 68 },
                                { zone: 'Explosives Testing', level: 'Critical', rate: '2.0x', active: 4 },
                            ].map((zone, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                                        <HardHat className="w-4 h-4 text-slate-400" />
                                        {zone.zone}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${zone.level === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                                zone.level === 'High' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>{zone.level}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{zone.rate}</td>
                                    <td className="px-6 py-4 font-bold">{zone.active}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Estimated Payout</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">$450k</h3>
                        <p className="text-indigo-100 text-sm mb-6">Projected hazard allowances for current pay cycle.</p>
                        <div className="flex items-center gap-2 text-xs bg-indigo-700/50 p-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-300" />
                            <span>Increase of 12% from last month due to expanded underground ops.</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Allowance Policies</h3>
                        <div className="space-y-2">
                            <a href="#" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-bold">
                                <FileText className="w-4 h-4" /> Underground Allowance Guide
                            </a>
                            <a href="#" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-bold">
                                <FileText className="w-4 h-4" /> Heat Stress Bonus Terms
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

