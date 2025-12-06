"use client";

import React from 'react';
import {
    Settings,
    MapPin,
    Globe,
    Clock,
    Shield,
    Smartphone
} from 'lucide-react';

export default function AttendanceRulesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        Attendance Configuration
                    </h1>
                    <p className="text-slate-500 text-sm">Manage punch rules, geo-fencing policies, and device restrictions.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
                    <Shield className="w-4 h-4" /> Policy Active
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                {/* Punch Rules */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" /> Time Capture Rules
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <div className="font-bold text-sm">Grace Period</div>
                                <div className="text-xs text-slate-500">Allow late entry without penalty</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">15 mins</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <div className="font-bold text-sm">Early Exit Buffer</div>
                                <div className="text-xs text-slate-500">Allowed early leave duration</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">10 mins</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <div className="font-bold text-sm">Auto-Checkout</div>
                                <div className="text-xs text-slate-500">System auto-out at shift end + buffer</div>
                            </div>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <div className="font-bold text-sm">Half-Day Threshold</div>
                                <div className="text-xs text-slate-500">Min hours to count as half day</div>
                            </div>
                            <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">4.0 hrs</span>
                        </div>
                    </div>
                </div>

                {/* Locations & Devices */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" /> Geo-Fencing & IP
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Head Quarters', type: 'Geo-Fence', value: 'Lat: 25.2048, Long: 55.2708 (Radius: 200m)', status: 'Active' },
                                { name: 'Warehouse A', type: 'Geo-Fence', value: 'Lat: 25.1111, Long: 55.3333 (Radius: 500m)', status: 'Active' },
                                { name: 'Office Network', type: 'IP Range', value: '192.168.1.0/24', status: 'Active' },
                                { name: 'Guest Wi-Fi', type: 'IP Range', value: '10.0.0.0/8', status: 'Blocked' },
                            ].map((l, i) => (
                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {l.type === 'Geo-Fence' ? <MapPin className="w-3 h-3 text-emerald-500" /> : <Globe className="w-3 h-3 text-blue-500" />}
                                            {l.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{l.value}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {l.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                            + Add New Location Policy
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-purple-500" /> Mobile Restrictions
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <div className="font-bold">Allow Mobile Punch</div>
                                <div className="text-xs text-slate-500">Only from verified devices</div>
                            </div>
                            <div className="w-10 h-5 bg-purple-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
