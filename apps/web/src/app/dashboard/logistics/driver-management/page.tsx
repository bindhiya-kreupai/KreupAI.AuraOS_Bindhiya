"use client";

import React, { useState } from 'react';
import {
    Truck,
    User,
    MapPin,
    Clock
} from 'lucide-react';

export default function DriverManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-500" />
                        Driver Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track driver schedules, licenses, and assignments.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                    Add Driver
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Active Assignments</h3>
                        <div className="space-y-4">
                            {[
                                { driver: 'John Doe', route: 'NY - NJ Express', vehicle: 'Trk-8821', status: 'In Transit', eta: '14:30' },
                                { driver: 'Jane Smith', route: 'West Coast Haul', vehicle: 'Trk-9912', status: 'Rest Break', eta: '18:00' },
                                { driver: 'Bob Johnson', route: 'City Delivery', vehicle: 'Van-4421', status: 'In Transit', eta: '12:15' },
                                { driver: 'Alice Brown', route: 'Midwest Connector', vehicle: 'Trk-5510', status: 'Delayed', eta: '20:45' },
                            ].map((trip, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            {trip.driver.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold">{trip.driver}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <Truck className="w-3 h-3" /> {trip.vehicle} • {trip.route}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">ETA</div>
                                            <div className="font-bold text-sm">{trip.eta}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold w-24 text-center ${trip.status === 'In Transit' ? 'bg-indigo-100 text-indigo-600' :
                                                trip.status === 'Rest Break' ? 'bg-amber-100 text-amber-600' :
                                                    trip.status === 'Delayed' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-slate-200 text-slate-600'
                                            }`}>{trip.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">License Expirations</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Mike Wilson', type: 'CDL Class A', exp: '12 Days', urgent: true },
                                { name: 'Sarah Lee', type: 'CDL Class B', exp: '45 Days', urgent: false },
                                { name: 'Tom Hardy', type: 'Hazmat', exp: '3 Days', urgent: true },
                            ].map((lic, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div>
                                        <div className="font-bold text-sm">{lic.name}</div>
                                        <div className="text-xs text-slate-500">{lic.type}</div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${lic.urgent ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                        }`}>{lic.exp}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Driver Availability</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-500">Available Now</span>
                            <span className="text-lg font-bold text-emerald-600">8</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-500">On Leave</span>
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">3</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">Rest Period</span>
                            <span className="text-lg font-bold text-indigo-600">12</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
