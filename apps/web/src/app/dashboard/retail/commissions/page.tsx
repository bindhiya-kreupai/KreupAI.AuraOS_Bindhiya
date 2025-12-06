"use client";

import React from 'react';
import {
    DollarSign,
    Target,
    Trophy,
    TrendingUp,
    Percent
} from 'lucide-react';

export default function CommissionsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Commissions & Incentives
                    </h1>
                    <p className="text-slate-500 text-sm">Sales tracking, Spiff calcs, and payout estimations.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
                    Next Payout: Dec 15
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Target className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">My Target</span>
                    </div>
                    <div className="text-2xl font-bold">$15,000</div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[82%] rounded-full"></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-indigo-600 font-bold">82% Achieved</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Est. Commission</span>
                    </div>
                    <div className="text-2xl font-bold">$1,240</div>
                    <div className="text-xs text-emerald-500 font-bold flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> On track for tier 2 bonus
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><Trophy className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500">Spiff Rewards</span>
                    </div>
                    <div className="text-2xl font-bold">$350</div>
                    <div className="text-xs text-slate-400 mt-2">From "Black Friday" contest</div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1 min-h-0 overflow-y-auto">
                <h3 className="font-bold text-lg mb-6">Commission Breakdown</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 pl-2">Product / Category</th>
                            <th className="pb-3 text-right">Sales Amount</th>
                            <th className="pb-3 text-right">Rate</th>
                            <th className="pb-3 text-right pr-2">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { item: 'Luxury Handbags', cat: 'Accessories', amt: '$4,500', rate: '5%', comm: '$225' },
                            { item: 'Footwear Q4', cat: 'Shoes', amt: '$3,200', rate: '4%', comm: '$128' },
                            { item: 'Winter Coats', cat: 'Apparel', amt: '$2,800', rate: '3%', comm: '$84' },
                            { item: 'Gift Cards', cat: 'Services', amt: '$500', rate: '1%', comm: '$5' },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-4 pl-2 font-bold text-slate-700 dark:text-slate-300">
                                    {row.item}
                                    <div className="text-xs font-normal text-slate-400">{row.cat}</div>
                                </td>
                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono">{row.amt}</td>
                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{row.rate}</span>
                                </td>
                                <td className="py-4 text-right pr-2 font-bold text-emerald-600 font-mono">{row.comm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
