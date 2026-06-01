"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Navigation,
    Globe,
    Trash2,
    Edit2
} from 'lucide-react';
import { GeoFencingService } from '../services';

interface GeoFence {
    id: number | string;
    name: string;
    address: string;
    coord: string;
    radius: number;
    active: boolean;
}

export default function GeoFencingPage() {
    const [locations, setLocations] = useState<GeoFence[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGeoFences();
    }, []);

    const fetchGeoFences = async () => {
        try {
            setLoading(true);
            const result = await GeoFencingService.getGeoFences();
            setLocations((result || []) as any);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        setLoading(true);
        try {
            await GeoFencingService.deleteGeoFence(String(id));
            await fetchGeoFences();
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Geo-Fencing
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Define valid physical locations for mobile attendance clock-in.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Add Geofence
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* Location List */}
                <div className="col-span-1 space-y-4">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No geo-fences configured</div>
                    ) : (
                    locations.map((loc) => (
                        <div key={loc.id} className={`p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group ${loc.active ? '' : 'opacity-60'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className={`w-5 h-5 ${loc.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <h3 className="font-bold text-ink-black dark:text-pearl">{loc.name}</h3>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${loc.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>

                            <p className="text-sm text-slate-500 mb-3 line-clamp-2">{loc.address}</p>

                            <div className="flex items-center justify-between text-xs text-silver-mist mb-4">
                                <span className="flex items-center gap-1 font-mono"><Navigation className="w-3 h-3" /> {loc.radius}m Radius</span>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-cloud dark:border-nebula-purple/20">
                                <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1">
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(loc.id)}
                                    disabled={loading}
                                    className="flex-1 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-1 disabled:opacity-50">
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            </div>
                        </div>
                    )))}
                </div>

                {/* Map Simulation */}
                <div className="col-span-1 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner relative overflow-hidden min-h-[400px] flex items-center justify-center group">
                    {/* Placeholder Pattern */}
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-20 bg-cover bg-center grayscale" />

                    {/* Simulated Pin & Radius */}
                    <div className="relative">
                        <div className="w-64 h-64 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center animate-pulse">
                            <div className="w-32 h-32 rounded-full bg-indigo-500/30 flex items-center justify-center">
                                <div className="absolute -top-10 bg-white dark:bg-stellar-blue px-3 py-1 rounded shadow text-xs font-bold text-indigo-600 whitespace-nowrap">
                                    500m Radius
                                </div>
                            </div>
                        </div>
                        <MapPin className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur dark:bg-stellar-blue/90 p-4 rounded-lg shadow-lg text-sm max-w-xs">
                        <h4 className="font-bold text-ink-black dark:text-pearl mb-1">Dubai HQ</h4>
                        <p className="text-silver-mist text-xs mb-2">25.2048° N, 55.2708° E</p>
                        <div className="flex items-center gap-2">
                            <input type="range" min="100" max="1000" className="w-full accent-indigo-600" />
                            <span className="font-mono text-xs font-bold w-12 text-right">500m</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

