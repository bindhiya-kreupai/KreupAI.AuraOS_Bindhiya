"use client";

import React, { useState } from 'react';
import {
    Package,
    Home,
    Truck,
    DollarSign
} from 'lucide-react';

export default function RelocationPackagesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        Relocation Packages
                    </h1>
                    <p className="text-slate-500 text-sm">Manage relocation benefits and tiers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Tier 1: Executive', items: ['Full Packing & Moving', 'Temp Housing (3 months)', 'School Search', 'Spousal Support', 'Lump Sum $10k'], color: 'border-t-purple-500' },
                    { title: 'Tier 2: Senior Mgmt', items: ['Packing & Moving', 'Temp Housing (1 month)', 'Home Finding', 'Lump Sum $5k'], color: 'border-t-indigo-500' },
                    { title: 'Tier 3: Individual', items: ['Moving Allowance', 'Temp Housing (2 weeks)', 'Lump Sum $2k'], color: 'border-t-emerald-500' },
                ].map((tier, i) => (
                    <div key={i} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 ${tier.color}`}>
                        <h3 className="font-bold text-xl mb-6">{tier.title}</h3>
                        <ul className="space-y-3 mb-8">
                            {tier.items.map((item, k) => (
                                <li key={k} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                            View Policy Details
                        </button>
                    </div>
                ))}

                <div className="md:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">Active Relocations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { emp: 'Sarah Connor', from: 'London', to: 'New York', tier: 'Tier 1', status: 'In Transit' },
                            { emp: 'James Bond', from: 'London', to: 'Shanghai', tier: 'Tier 2', status: 'Housing Search' },
                            { emp: 'Indiana Jones', from: 'Princeton', to: 'Cairo', tier: 'Tier 3', status: 'Initiated' },
                        ].map((reloc, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="font-bold text-sm mb-1">{reloc.emp}</div>
                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    {reloc.from} <span className="text-slate-300">→</span> {reloc.to}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">{reloc.tier}</span>
                                    <span className="font-bold text-indigo-600">{reloc.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
