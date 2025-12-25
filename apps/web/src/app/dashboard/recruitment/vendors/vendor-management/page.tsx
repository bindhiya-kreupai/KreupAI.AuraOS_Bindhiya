"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    Building2,
    Users,
    MapPin,
    Star,
    Plus,
    MoreVertical
} from 'lucide-react';

export default function VendorManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-500" />
                        Vendor Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage staffing agencies and external partners.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Onboard Vendor
                </button>
            </div>

            {/* Vendor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'TechStaff Solutions', type: 'IT Services', location: 'San Francisco, CA', rating: 4.8, active: 12 },
                    { name: 'Global Manpower', type: 'General Staffing', location: 'New York, NY', rating: 4.2, active: 45 },
                    { name: 'Design Hive', type: 'Creative Agency', location: 'London, UK', rating: 4.9, active: 5 },
                    { name: 'CodeWorks Inc.', type: 'Software Development', location: 'Remote', rating: 4.5, active: 8 },
                    { name: 'Support Heroes', type: 'Customer Support', location: 'Manila, PH', rating: 4.0, active: 30 },
                ].map((vendor, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                {vendor.name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{vendor.name}</h3>
                                <div className="text-xs text-slate-500">{vendor.type}</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {vendor.location}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                {vendor.rating} / 5.0 Rating
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold">{vendor.active} Active Contractors</span>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
