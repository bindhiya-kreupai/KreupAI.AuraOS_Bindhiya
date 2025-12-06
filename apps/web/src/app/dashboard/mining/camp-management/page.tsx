"use client";

import React, { useState } from 'react';
import {
    Tent,
    Utensils,
    Wifi,
    CheckCircle2
} from 'lucide-react';

export default function CampManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Tent className="w-6 h-6 text-indigo-500" />
                        Camp Management
                    </h1>
                    <p className="text-slate-500 text-sm">Oversee cleaning, catering, and utilities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Room Occupancy', value: '482/500', icon: Tent, color: 'text-indigo-500', bg: 'bg-indigo-500' },
                    { label: 'Meals Served (Today)', value: '1,240', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-500' },
                    { label: 'Network Uptime', value: '99.9%', icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} bg-opacity-10 dark:bg-opacity-20`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                ))}

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Camp Services Request Queue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { req: 'Plumbing Repair', loc: 'Block C, Unit 12', time: '2h ago', status: 'Assigned' },
                            { req: 'HVAC Check', loc: 'Dining Hall', time: '4h ago', status: 'In Progress' },
                            { req: 'Room Cleaning', loc: 'Block A (Checkout)', time: '30m ago', status: 'Pending' },
                            { req: 'WiFi Outage', loc: 'Rec Room', time: '1h ago', status: 'Resolved' },
                        ].map((req, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                                            req.status === 'Pending' ? 'bg-rose-100 text-rose-600' :
                                                'bg-indigo-100 text-indigo-600'
                                        }`}>{req.status}</span>
                                </div>
                                <div className="font-bold text-sm mb-1">{req.req}</div>
                                <div className="text-xs text-slate-500">{req.loc}</div>
                                <div className="text-xs text-slate-400 mt-2">{req.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
