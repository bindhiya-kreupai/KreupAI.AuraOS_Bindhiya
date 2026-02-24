"use client";

import React from 'react';
import {
    Truck,
    MapPin,
    Calendar,
    AlertTriangle,
    Clock,
    UserCheck,
    BatteryCharging
} from 'lucide-react';

export default function DriversPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-500" />
                        Driver Management
                    </h1>
                    <p className="text-slate-500 text-sm">Fleet roster, license tracking, and route assignments.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/30 animate-pulse">
                    <Clock className="w-4 h-4" /> 5 Drivers Ending Shift Soon
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Active Drivers */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                48
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">On The Road</h3>
                                <div className="text-xs text-emerald-500 font-bold">96% On Time</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                12
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Available</h3>
                                <div className="text-xs text-slate-400 font-bold">Ready for dispatch</div>
                            </div>
                        </div>
                    </div>

                    {[
                        { name: 'Jack Burton', route: 'NY - Boston', truck: 'Volvo VNL 860', status: 'In Transit', eta: '2h 15m' },
                        { name: 'Furiosa', route: 'Wasteland Run', truck: 'War Rig', status: 'Delayed', eta: '+45m' },
                        { name: 'Dom Toretto', route: 'LA - Miami', truck: 'Charger SRT', status: 'Completed', eta: '-' },
                        { name: 'Han Solo', route: 'Kessel Run', truck: 'Falcon', status: 'In Transit', eta: '12 parsecs' },
                    ].map((d, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {d.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{d.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {d.route}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <Truck className="w-3 h-3" /> {d.truck}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{d.eta}</div>
                                    <div className="text-xs text-slate-400">ETA</div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${d.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                                            d.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-amber-100 text-amber-600'}
                                    `}>
                                        {d.status}
                                    </span>
                                    <button className="text-xs font-bold text-blue-500 hover:underline">Track Live</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compliance Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Compliance Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex gap-3">
                                <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">CDL Expiring</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">3 drivers need license renewal this month.</p>
                                </div>
                            </div>
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex gap-3">
                                <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                <div>
                                    <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300">HOS Violation</h4>
                                    <p className="text-xs text-rose-700 dark:text-rose-400">Mike T. exceeded driving hours yesterday.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BatteryCharging className="w-5 h-5 text-emerald-400" /> EV Fleet Status
                        </h3>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-400">Fleet Charged</span>
                            <span className="text-3xl font-bold">84%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[84%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">
                            12 trucks currently at charging stations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

