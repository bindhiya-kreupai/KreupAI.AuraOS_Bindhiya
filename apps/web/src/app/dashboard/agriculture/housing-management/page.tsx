"use client";

import React, { useState } from 'react';
import {
    Home,
    Users,
    Bed,
    AlertCircle
} from 'lucide-react';

export default function HousingManagementPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Home className="w-6 h-6 text-indigo-500" />
                        Housing Management
                    </h1>
                    <p className="text-slate-500 text-sm">Assign beds and manage worker accommodation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { unit: 'Bunkhouse A', capacity: '18/20', status: 'Good', type: 'Dormitory' },
                    { unit: 'Bunkhouse B', capacity: '20/20', status: 'Good', type: 'Dormitory' },
                    { unit: 'Cabin 1', capacity: '4/4', status: 'Maintenance', type: 'Private' },
                    { unit: 'Cabin 2', capacity: '0/4', status: 'Vacant', type: 'Private' },
                    { unit: 'Trailer Park', capacity: '12/15', status: 'Good', type: 'Mixed' },
                    { unit: 'Overflow Tent', capacity: '0/10', status: 'Closed', type: 'Temporary' },
                ].map((house, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                                <Home className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${house.status === 'Good' ? 'bg-emerald-100 text-emerald-600' :
                                    house.status === 'Vacant' ? 'bg-slate-100 text-slate-500' :
                                        house.status === 'Closed' ? 'bg-slate-200 text-slate-400' :
                                            'bg-amber-100 text-amber-600'
                                }`}>{house.status}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{house.unit}</h3>
                        <p className="text-sm text-slate-500 mb-4">{house.type}</p>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Bed className="w-4 h-4 text-slate-400" />
                            <span>{house.capacity} Beds Occupied</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                                className={`h-full ${house.status === 'Vacant' || house.status === 'Closed' ? 'bg-transparent' : 'bg-indigo-500'}`}
                                style={{ width: `${(parseInt(house.capacity.split('/')[0]) / parseInt(house.capacity.split('/')[1])) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-bold">Inspection Required:</span> Cabin 1 is due for HVAC maintenance before re-occupancy.
                </p>
            </div>
        </div>
    );
}
