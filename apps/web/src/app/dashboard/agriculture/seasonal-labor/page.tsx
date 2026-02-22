"use client";

import React, { useState } from 'react';
import {
    Users,
    Tractor,
    Calendar,
    Globe
} from 'lucide-react';

export default function SeasonalLaborPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Tractor className="w-6 h-6 text-indigo-500" />
                        Seasonal Labor
                    </h1>
                    <p className="text-slate-500 text-sm">Recruit and manage harvest crews.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Recruit Crew
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Active Crews</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Alpha Harvest Team', location: 'Orchard Block A', size: 24, origin: 'H-2A Visa', status: 'Active' },
                            { name: 'Beta Picking Crew', location: 'Vineyard South', size: 18, origin: 'Local', status: 'Active' },
                            { name: 'Gamma Sorting', location: 'Packing House', size: 12, origin: 'Mixed', status: 'Break' },
                            { name: 'Delta Field Prep', location: 'Field 4', size: 8, origin: 'Local', status: 'Finished' },
                        ].map((crew, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-slate-800 dark:text-slate-100">{crew.name}</div>
                                        {crew.origin === 'H-2A Visa' && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1"><Globe className="w-3 h-3" /> Visa</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{crew.location} • {crew.size} workers</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 md:mt-0 w-fit ${crew.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                        crew.status === 'Break' ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-200 text-slate-600'
                                    }`}>{crew.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Total Headcount</h3>
                        <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">62</div>
                        <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70">Peak harvest capacity: 85%</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Compliance Checks</h3>
                        <div className="space-y-3">
                            {[
                                { check: 'I-9 Verification', status: '1 Pending' },
                                { check: 'Safety Training', status: 'All Clear' },
                                { check: 'Heat Stress Protocol', status: 'Active' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">{item.check}</span>
                                    <span className={`font-bold ${item.status === 'All Clear' || item.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

