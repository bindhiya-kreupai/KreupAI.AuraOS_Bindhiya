"use client";

import React, { useState } from 'react';
import {
    ShieldAlert,
    Activity,
    Video,
    AlertTriangle
} from 'lucide-react';

export default function FleetSafetyPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-indigo-500" />
                        Fleet Safety
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor telematics, safety scores, and incidents.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Fleet Safety Score', val: '94/100', color: 'text-emerald-500' },
                    { label: 'Harsh Braking', val: '12', color: 'text-amber-500' },
                    { label: 'Speeding Alerts', val: '5', color: 'text-rose-500' },
                    { label: 'Accident Free Days', val: '142', color: 'text-indigo-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Latest Incidents (Telematics)</h3>
                    <div className="space-y-4">
                        {[
                            { event: 'Harsh Braking', driver: 'John Doe', time: '10:42 AM', loc: 'I-95 South', severity: 'Medium' },
                            { event: 'Speeding (+15mph)', driver: 'Bob Johnson', time: '09:15 AM', loc: 'Route 66', severity: 'High' },
                            { event: 'Rapid Acceleration', driver: 'Jane Smith', time: '08:30 AM', loc: 'Warehouse District', severity: 'Low' },
                        ].map((inc, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${inc.severity === 'High' ? 'bg-rose-100 text-rose-600' :
                                            inc.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{inc.event}</div>
                                        <div className="text-sm text-slate-500">{inc.driver} • {inc.time}</div>
                                        <div className="text-xs text-slate-400 mt-1">{inc.loc}</div>
                                    </div>
                                </div>
                                <button className="mt-3 sm:mt-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50">
                                    <Video className="w-3 h-3" /> View Dashcam
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Driver Safety Rankings</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Rank</th>
                                <th className="px-4 py-3">Driver</th>
                                <th className="px-4 py-3 text-right">Score</th>
                                <th className="px-4 py-3 text-center">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Alice Brown', score: 98, trend: 'up' },
                                { name: 'Sarah Lee', score: 96, trend: 'same' },
                                { name: 'John Doe', score: 92, trend: 'down' },
                                { name: 'Tom Hardy', score: 88, trend: 'down' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-bold text-slate-400">#{i + 1}</td>
                                    <td className="px-4 py-3 font-bold">{row.name}</td>
                                    <td className={`px-4 py-3 font-bold text-right ${row.score >= 90 ? 'text-emerald-600' : 'text-amber-600'
                                        }`}>{row.score}</td>
                                    <td className="px-4 py-3 text-center">
                                        {row.trend === 'up' && <Activity className="w-4 h-4 text-emerald-500 inline" />}
                                        {row.trend === 'down' && <Activity className="w-4 h-4 text-rose-500 inline transform rotate-180" />}
                                        {row.trend === 'same' && <span className="text-slate-400">-</span>}
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
