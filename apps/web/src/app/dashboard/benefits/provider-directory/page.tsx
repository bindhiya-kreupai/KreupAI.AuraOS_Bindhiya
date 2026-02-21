"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Search,
    Star,
    Phone,
    Globe,
    Loader2
} from 'lucide-react';
import { ProviderService } from '../services';

export default function ProviderDirectoryPage() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const data = await ProviderService.getProviders();
            setProviders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching providers:', error);
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const getName = (p: any) => p.name || p.providerName || 'Unknown Provider';
    const getSpecialty = (p: any) => p.specialty || p.providerType || 'General';
    const getAddress = (p: any) => {
        if (typeof p.address === 'string') return p.address;
        if (p.address && typeof p.address === 'object') {
            return [p.address.street, p.address.city, p.address.state].filter(Boolean).join(', ');
        }
        return 'Address not available';
    };
    const getRating = (p: any) => p.rating || 0;
    const isAccepting = (p: any) => p.accepting !== undefined ? p.accepting : (p.acceptingNewPatients !== undefined ? p.acceptingNewPatients : true);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                        Provider Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Find in-network doctors, hospitals, and specialists near you.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, specialty, or condition..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="w-48 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Zip Code"
                        defaultValue="94105"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700">
                    Search
                </button>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    </div>
                ) : providers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Providers Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-1">Try adjusting your search criteria or check back later.</p>
                    </div>
                ) : providers.map((provider, i) => {
                    const accepting = isAccepting(provider);
                    const rating = getRating(provider);

                    return (
                        <div key={provider.id || i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${accepting ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {accepting ? 'Accepting Patients' : 'Full'}
                                </div>
                                {rating > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                        <Star className="w-4 h-4 fill-current" /> {rating}
                                    </div>
                                )}
                            </div>

                            <h3 className="font-bold text-lg mb-1">{getName(provider)}</h3>
                            <p className="text-indigo-600 font-medium text-sm mb-4">{getSpecialty(provider)}</p>

                            <div className="space-y-2 text-sm text-slate-500 flex-1">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{getAddress(provider)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <Phone className="w-4 h-4" /> Call
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                                    <Globe className="w-4 h-4" /> Book Online
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
