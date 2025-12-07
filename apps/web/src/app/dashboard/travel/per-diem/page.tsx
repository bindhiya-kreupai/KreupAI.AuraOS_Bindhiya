"use client";

import React, { useState } from 'react';
import { Wallet, Search, MapPin } from 'lucide-react';

const LOCATIONS = [
    { city: 'London, UK', tier: 'Tier 1', currency: 'GBP', lodging: '£250', meals: '£90', incidentals: '£20' },
    { city: 'New York, USA', tier: 'Tier 1', currency: 'USD', lodging: '$350', meals: '$110', incidentals: '$30' },
    { city: 'Dubai, UAE', tier: 'Tier 2', currency: 'AED', lodging: 'AED 800', meals: 'AED 300', incidentals: 'AED 50' },
    { city: 'Bangalore, India', tier: 'Tier 3', currency: 'INR', lodging: '₹8,000', meals: '₹2,500', incidentals: '₹500' },
];

export default function PerDiemPage() {
    const [search, setSearch] = useState('');

    const filtered = LOCATIONS.filter(l => l.city.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Wallet className="w-8 h-8 text-indigo-500" />
                        Per Diem Rates
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Approved daily allowances by location.</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search city like 'London' or 'Dubai'..."
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((loc) => (
                    <div key={loc.city} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 rounded">{loc.tier}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">{loc.city}</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">Lodging Max</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{loc.lodging}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">Meals</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{loc.meals}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2">
                                <span className="text-slate-500">Incidentals</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{loc.incidentals}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
