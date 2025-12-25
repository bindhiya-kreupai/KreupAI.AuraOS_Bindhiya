"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Navigation,
    LocateFixed,
    Scan,
    UserCheck,
    Clock,
    AlertTriangle,
    Plus,
    Users
} from 'lucide-react';
import { GPSAttendanceService } from '../services';

export default function GlobalPositioningPage() {
    const [config, setConfig] = useState<any>(null);
    const [checkIns, setCheckIns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, checkInsData] = await Promise.all([
                GPSAttendanceService.getConfig(),
                GPSAttendanceService.getAllCheckIns()
            ]);
            if (configData) setConfig(configData);
            if (checkInsData.length > 0) setCheckIns(checkInsData);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                        GPS Attendance
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor field staff locations and manage geofencing rules.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <LocateFixed className="w-4 h-4" /> Live Tracking
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Geofence
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map View Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 h-[500px] relative overflow-hidden group">

                        {/* Mock Map Background */}
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-0.1278,51.5074,10,0/800x600?access_token=Pk.mock')] bg-cover bg-center opacity-50 dark:opacity-20 grayscale hover:grayscale-0 transition-all duration-700"></div>

                        {/* Overlay Text when image fails to load or mock */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                                <Navigation className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                                <div className="font-bold text-slate-900 dark:text-slate-100">Interactive Map View</div>
                                <div className="text-xs text-slate-500">Showing 14 active employees</div>
                            </div>
                        </div>

                        {/* Mock Pins */}
                        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300">
                            <div className="relative">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg z-10 relative">
                                    <span className="text-xs font-bold">JD</span>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 blur-[2px] rounded-[100%]"></div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    John Doe • 2m ago
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300">
                            <div className="relative">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg z-10 relative">
                                    <span className="text-xs font-bold">SC</span>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 blur-[2px] rounded-[100%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Active Punches Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                            Recent Location Tags
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { user: 'Sarah Connor', location: 'Headquarters, NY', time: '09:00 AM', status: 'On-site', valid: true },
                                { user: 'Mike Ross', location: 'Client Site B', time: '09:15 AM', status: 'On-site', valid: true },
                                { user: 'John Doe', location: 'Unknown Region', time: '09:45 AM', status: 'Out of Bounds', valid: false },
                            ].map((row, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${row.valid ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{row.user}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {row.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">{row.time}</div>
                                        <div className={`text-xs font-medium ${row.valid ? 'text-emerald-600' : 'text-rose-600'}`}>{row.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Geofence Rules */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Scan className="w-4 h-4 text-indigo-500" /> Geofence Configuration
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'HQ Perimeter', radius: '500m', staff: 124, active: true },
                                { name: 'Warehouse A', radius: '200m', staff: 45, active: true },
                                { name: 'Sales Region East', radius: '5km', staff: 12, active: true },
                                { name: 'Construction Site B', radius: '100m', staff: 8, active: false },
                            ].map((zone, i) => (
                                <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm">{zone.name}</div>
                                        <div className={`w-2 h-2 rounded-full ${zone.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1 group-hover:text-indigo-600"><AlertTriangle className="w-3 h-3" /> {zone.radius}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {zone.staff}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Import KML / Map Data
                        </button>
                    </div>

                    <div className="bg-indigo-900 rounded-2xl p-6 text-white text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Navigation className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold mb-1">Field Force Tracking</h3>
                        <p className="text-indigo-200 text-xs mb-4">Enable real-time breadcrumbs for delivery and logistics teams.</p>
                        <button className="px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold w-full">Enable Tracking</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
