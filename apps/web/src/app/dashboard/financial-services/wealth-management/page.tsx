"use client";

import React, { useState } from 'react';
import {
    Briefcase,
    TrendingUp,
    PieChart,
    ArrowUpRight
} from 'lucide-react';

export default function WealthManagementPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Wealth Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage client portfolios and investment strategies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Portfolio Performance</h3>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                            <TrendingUp className="w-4 h-4" /> +12.4% YTD
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-1 px-4">
                        {[40, 42, 45, 43, 48, 52, 55, 53, 58, 62, 65, 68].map((val, i) => (
                            <div key={i} className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm relative group">
                                <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400" style={{ height: `${val}%` }}></div>
                                <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded z-10 font-bold whitespace-nowrap">
                                    ${val}0k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2 px-4">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-xs font-bold opacity-80 uppercase mb-1">Total AUM</div>
                            <div className="text-3xl font-bold">$1.2B</div>
                            <div className="text-xs opacity-80 mt-4 pt-4 border-t border-indigo-500">
                                482 High Net Worth Clients
                            </div>
                        </div>
                        <PieChart className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 text-white" />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-sm mb-4 uppercase text-slate-500">Asset Allocation</h3>
                        <div className="space-y-3">
                            {[
                                { class: 'Equities', val: '65%', color: 'bg-indigo-500' },
                                { class: 'Fixed Income', val: '20%', color: 'bg-emerald-500' },
                                { class: 'Alternatives', val: '10%', color: 'bg-amber-500' },
                                { class: 'Cash', val: '5%', color: 'bg-slate-500' },
                            ].map((asset, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>{asset.class}</span>
                                        <span>{asset.val}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full ${asset.color}`} style={{ width: asset.val }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

