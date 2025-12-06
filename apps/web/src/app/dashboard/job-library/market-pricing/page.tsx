"use client";

import React, { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    MapPin,
    Building2
} from 'lucide-react';

export default function MarketPricingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Market Pricing
                    </h1>
                    <p className="text-slate-500 text-sm">Benchmark and analyze compensation against market data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Filters */}
                <div className="lg:col-span-3 flex gap-4 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-500 text-indigo-600 rounded-full text-sm font-bold shadow-sm">
                        Region: North America
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold shadow-sm hover:border-indigo-500">
                        Industry: Technology
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold shadow-sm hover:border-indigo-500">
                        Company Size: 1000-5000
                    </button>
                </div>

                {/* Main Comp Card */}
                {[
                    { title: 'Senior Software Engineer (L4)', min: '$140k', mid: '$165k', max: '$190k', myMid: '$162k', diff: '-1.8%', market: 'High Demand' },
                    { title: 'Marketing Manager (L5)', min: '$110k', mid: '$130k', max: '$150k', myMid: '$135k', diff: '+3.8%', market: 'Stable' },
                    { title: 'HR Generalist (L2)', min: '$65k', mid: '$75k', max: '$85k', myMid: '$72k', diff: '-4.0%', market: 'Stable' },
                ].map((role, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg w-2/3">{role.title}</h3>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">{role.market}</span>
                        </div>

                        {/* Salary Range Visual */}
                        <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 mb-2">
                            <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-emerald-200 dark:bg-emerald-900/30 rounded-full"></div>
                            {/* Marker for internal avg */}
                            <div className="absolute left-[48%] top-[-4px] w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" title="Internal Avg"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-mono mb-4">
                            <span>{role.min}</span>
                            <span className="font-bold text-emerald-600">Market Mid: {role.mid}</span>
                            <span>{role.max}</span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-xs text-slate-500">Internal Median</div>
                                <div className="font-bold">{role.myMid}</div>
                            </div>
                            <div className={`text-right ${role.diff.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <div className="text-xs font-bold flex items-center justify-end gap-1">
                                    <TrendingUp className={`w-3 h-3 ${role.diff.startsWith('-') ? 'rotate-180' : ''}`} />
                                    {role.diff}
                                </div>
                                <div className="text-[10px] text-slate-400">vs Market</div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Compensation Strategy</h3>
                        <p className="text-slate-500 text-sm">We target the 65th percentile of the market for Technology roles.</p>
                    </div>
                    <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90">
                        Adjust Strategy
                    </button>
                </div>
            </div>
        </div>
    );
}
